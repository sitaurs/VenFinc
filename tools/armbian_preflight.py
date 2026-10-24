#!/usr/bin/env python3
"""Collect a redacted, read-only Armbian resource baseline.

The default invocation does not write files, inspect environment variables,
contact the network, or read application data. Disk benchmarking is opt-in and
requires an explicit disposable scratch directory.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile
import time
from typing import Any


INSTALL_ROOT = Path("/opt/venfinance")
MIB = 1024 * 1024


def _read_text(path: Path, limit: int = 1024 * 1024) -> str | None:
    try:
        with path.open("rb") as stream:
            content = stream.read(limit + 1)
        if len(content) > limit:
            return None
        return content.decode("utf-8", errors="replace")
    except OSError:
        return None


def parse_meminfo(text: str | None) -> dict[str, int]:
    values: dict[str, int] = {}
    if not text:
        return values
    for line in text.splitlines():
        key, separator, raw = line.partition(":")
        if not separator:
            continue
        fields = raw.strip().split()
        if not fields or not fields[0].isdigit():
            continue
        value = int(fields[0])
        if len(fields) > 1 and fields[1].lower() == "kb":
            value *= 1024
        values[key] = value
    return values


def _positive_int(path: Path) -> int | None:
    raw = _read_text(path, limit=128)
    if not raw:
        return None
    try:
        value = int(raw.strip())
    except ValueError:
        return None
    return value if value > 0 else None


def _unlimited(value: int | None, physical_memory: int | None) -> int | None:
    if value is None or value >= 2**60:
        return None
    if physical_memory and value > physical_memory * 4:
        return None
    return value


def _cgroup_resources(physical_memory: int | None) -> dict[str, int | float | None]:
    memory_limit = _read_text(Path("/sys/fs/cgroup/memory.max"), limit=128)
    memory_current = _positive_int(Path("/sys/fs/cgroup/memory.current"))
    cpu_max = _read_text(Path("/sys/fs/cgroup/cpu.max"), limit=128)

    if memory_limit:
        memory_limit_value = None if memory_limit.strip() == "max" else _unlimited(
            _parse_int(memory_limit), physical_memory
        )
    else:
        memory_limit_value = _unlimited(
            _positive_int(Path("/sys/fs/cgroup/memory/memory.limit_in_bytes")),
            physical_memory,
        )
        if memory_current is None:
            memory_current = _positive_int(Path("/sys/fs/cgroup/memory/memory.usage_in_bytes"))

    cpu_limit: float | None = None
    if cpu_max:
        fields = cpu_max.strip().split()
        if len(fields) == 2 and fields[0] != "max":
            quota = _parse_int(fields[0])
            period = _parse_int(fields[1])
            if quota and period and quota > 0 and period > 0:
                cpu_limit = round(quota / period, 3)
    if cpu_limit is None:
        quota = _positive_int(Path("/sys/fs/cgroup/cpu/cpu.cfs_quota_us"))
        period = _positive_int(Path("/sys/fs/cgroup/cpu/cpu.cfs_period_us"))
        if quota and period:
            cpu_limit = round(quota / period, 3)

    return {
        "memoryLimitBytes": memory_limit_value,
        "memoryCurrentBytes": memory_current,
        "cpuLimitCores": cpu_limit,
    }


def _parse_int(raw: str | None) -> int | None:
    if raw is None:
        return None
    try:
        return int(raw.strip())
    except (ValueError, TypeError):
        return None


def _disk_capacity(path: Path) -> dict[str, int | bool | None]:
    try:
        stat = os.statvfs(path)
    except OSError:
        return {"available": False, "totalBytes": None, "freeBytes": None, "availableBytes": None}
    total = stat.f_blocks * stat.f_frsize
    free = stat.f_bfree * stat.f_frsize
    available = stat.f_bavail * stat.f_frsize
    return {
        "available": True,
        "totalBytes": total,
        "freeBytes": free,
        "availableBytes": available,
    }


def _version(command: list[str]) -> str | None:
    if not shutil.which(command[0]):
        return None
    try:
        result = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            timeout=3,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    output = (result.stdout or result.stderr).strip().splitlines()
    return output[0][:128] if output else None


def _cpu_model() -> str | None:
    model = _read_text(Path("/proc/device-tree/model"), limit=4096)
    if model:
        cleaned = model.replace("\x00", " ").strip()
        if cleaned:
            return cleaned[:160]
    cpuinfo = _read_text(Path("/proc/cpuinfo"))
    if not cpuinfo:
        return None
    for line in cpuinfo.splitlines():
        key, separator, value = line.partition(":")
        if separator and key.strip().lower() in {"model name", "hardware", "processor"}:
            cleaned = value.strip()
            if cleaned and not cleaned.isdigit():
                return cleaned[:160]
    return None


def _os_name() -> str | None:
    text = _read_text(Path("/etc/os-release"), limit=16 * 1024)
    if not text:
        return None
    for line in text.splitlines():
        if line.startswith("PRETTY_NAME="):
            return line.partition("=")[2].strip().strip('"')[:160]
    return None


def collect_report(install_root: Path = INSTALL_ROOT) -> dict[str, Any]:
    memory = parse_meminfo(_read_text(Path("/proc/meminfo")))
    uptime_text = _read_text(Path("/proc/uptime"), limit=128)
    try:
        uptime_seconds = round(float(uptime_text.split()[0]), 1) if uptime_text else None
    except (ValueError, IndexError):
        uptime_seconds = None
    try:
        load_average = [round(value, 2) for value in os.getloadavg()]
    except (AttributeError, OSError):
        load_average = None

    physical_memory = memory.get("MemTotal")
    try:
        canonical_install_root = install_root.resolve(strict=True)
        install_root_exists = canonical_install_root.is_dir()
    except OSError:
        canonical_install_root = install_root
        install_root_exists = False

    cpu_model = _cpu_model()
    report: dict[str, Any] = {
        "schemaVersion": 1,
        "capturedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "system": {
            "os": _os_name(),
            "architecture": platform.machine(),
            "kernel": platform.release(),
            "cpuModel": cpu_model,
            "onlineCpuCount": os.cpu_count(),
            "loadAverage1m5m15m": load_average,
            "uptimeSeconds": uptime_seconds,
        },
        "memory": {
            "totalBytes": memory.get("MemTotal"),
            "availableBytes": memory.get("MemAvailable"),
            "swapTotalBytes": memory.get("SwapTotal"),
            "swapFreeBytes": memory.get("SwapFree"),
        },
        "cgroup": _cgroup_resources(physical_memory),
        "storage": {
            "rootFilesystem": _disk_capacity(Path("/")),
            "venfinanceInstallRootPresent": install_root_exists,
            "venfinanceInstallRootFilesystem": (
                _disk_capacity(canonical_install_root) if install_root_exists else None
            ),
        },
        "software": {
            "python": platform.python_version(),
            "node": _version(["node", "--version"]),
            "dockerClient": _version(["docker", "--version"]),
            "dockerComposeClient": _version(["docker", "compose", "version", "--short"]),
        },
        "networkAccessed": False,
        "applicationDataRead": False,
    }
    return report


def benchmark_cpu(seconds: float) -> dict[str, float | int]:
    block = bytes(MIB)
    started = time.perf_counter()
    iterations = 0
    digest = b""
    while time.perf_counter() - started < seconds:
        digest = hashlib.sha256(block).digest()
        iterations += 1
    elapsed = max(time.perf_counter() - started, 0.001)
    return {
        "durationSeconds": round(elapsed, 3),
        "iterations": iterations,
        "sha256MiBPerSecond": round(iterations / elapsed, 2),
        "resultDigestPrefix": digest.hex()[:12],
    }


def benchmark_storage(directory: Path, size_mib: int) -> dict[str, float | int]:
    target_dir = directory.resolve(strict=True)
    if not target_dir.is_dir() or target_dir == Path("/"):
        raise ValueError("benchmark directory must be an existing non-root directory")
    requested_bytes = size_mib * MIB
    capacity = os.statvfs(target_dir)
    if capacity.f_bavail * capacity.f_frsize < requested_bytes * 2:
        raise ValueError("benchmark directory needs at least twice the requested size available")

    fd, temp_path = tempfile.mkstemp(prefix=".venfinance-bench-", dir=target_dir)
    open_fd = fd
    try:
        os.fchmod(open_fd, 0o600)
        stream = os.fdopen(open_fd, "wb")
        open_fd = -1
        chunk = bytes([0xA5]) * MIB
        remaining = requested_bytes
        expected_hash = hashlib.sha256()
        write_started = time.perf_counter()
        with stream:
            while remaining:
                part = chunk[: min(remaining, len(chunk))]
                stream.write(part)
                expected_hash.update(part)
                remaining -= len(part)
            stream.flush()
            os.fsync(stream.fileno())
        write_seconds = max(time.perf_counter() - write_started, 0.001)

        read_hash = hashlib.sha256()
        read_started = time.perf_counter()
        with open(temp_path, "rb") as stream:
            while data := stream.read(MIB):
                read_hash.update(data)
        read_seconds = max(time.perf_counter() - read_started, 0.001)
        if read_hash.digest() != expected_hash.digest():
            raise OSError("benchmark read-back checksum mismatch")
    finally:
        if open_fd >= 0:
            os.close(open_fd)
        try:
            os.unlink(temp_path)
        except FileNotFoundError:
            pass

    return {
        "sizeMiB": size_mib,
        "writeMiBPerSecond": round(size_mib / write_seconds, 2),
        "readMiBPerSecond": round(size_mib / read_seconds, 2),
        "readBackChecksumVerified": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--install-root", type=Path, default=INSTALL_ROOT)
    parser.add_argument(
        "--benchmark",
        action="store_true",
        help="Run a short CPU benchmark and a temporary file read/write benchmark.",
    )
    parser.add_argument(
        "--storage-path",
        type=Path,
        help="Existing disposable scratch directory on the filesystem to measure; required with --benchmark.",
    )
    parser.add_argument("--benchmark-seconds", type=float, default=1.0)
    parser.add_argument("--benchmark-size-mib", type=int, default=8)
    args = parser.parse_args()

    if args.benchmark and args.storage_path is None:
        parser.error("--benchmark requires an explicit --storage-path scratch directory")
    if not 0.1 <= args.benchmark_seconds <= 10:
        parser.error("--benchmark-seconds must be between 0.1 and 10")
    if not 1 <= args.benchmark_size_mib <= 64:
        parser.error("--benchmark-size-mib must be between 1 and 64")

    report = collect_report(args.install_root)
    if args.benchmark:
        try:
            report["benchmark"] = {
                "cpu": benchmark_cpu(args.benchmark_seconds),
                "storage": benchmark_storage(args.storage_path, args.benchmark_size_mib),
                "scratchDirectoryProvided": True,
            }
        except (OSError, ValueError) as error:
            print(json.dumps({"status": "error", "reason": str(error)}), file=sys.stderr)
            return 2
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
