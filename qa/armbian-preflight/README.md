# Armbian preflight evidence

`tools/armbian_preflight.py` prepares P0-002's host resource baseline. Its default run is read-only: it reports architecture, kernel/OS, CPU model/count, uptime/load, physical and cgroup memory, filesystem capacity, and locally installed Node/Docker client versions. It does not emit hostname, network addresses, environment variables, secrets, or application data, and it does not call the network or Docker daemon.

Run the read-only collector on the owner-controlled ARM64 device:

```sh
python3 tools/armbian_preflight.py
```

For reproducible CPU and storage measurements, use a maintenance window on a disposable test device and choose an existing scratch directory on the filesystem being measured:

```sh
python3 tools/armbian_preflight.py \
  --benchmark \
  --benchmark-seconds 1 \
  --benchmark-size-mib 8 \
  --storage-path /tmp/venfinance-benchmark
```

Benchmark mode runs SHA-256 for at most ten seconds and writes a uniquely named 0600 temporary file of 1–64 MiB, fsyncs and reads it back, verifies the checksum, then removes the file. It requires twice the requested size to be available. The default command never writes; benchmark mode must not be run against a live production volume without an approved maintenance window.

The report is a hardware/capacity snapshot, not proof that GOWA, 9router, Docker services, or the Finance Worker are installed or healthy. Attach a report only after the owner confirms the device is the VenFinance ARM64 target; redact host-specific details before sharing outside the project. A run on a developer workstation validates the collector only and does **not** satisfy P0-002.

Local code validation:

```sh
python3 tools/test_armbian_preflight.py
```

P0-002 remains blocked until the owner-controlled ARM64 device and reproducible target-device measurements are available.
