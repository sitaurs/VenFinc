#!/usr/bin/env python3
"""Fresh snapshot clone, never commits to the user's repository."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
env = {**os.environ, 'PATH': str(ROOT / '.tools/node/bin') + os.pathsep + os.environ['PATH']}
def run(args, cwd):
    return subprocess.run(args, cwd=cwd, env=env, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

started = time.time()
with tempfile.TemporaryDirectory(prefix='venfinance-frozen-') as tmp:
    snapshot = Path(tmp) / 'snapshot'
    snapshot.mkdir()
    listed = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=ROOT).split(b'\0')
    for name in listed:
        if not name:
            continue
        relative = Path(os.fsdecode(name))
        source, target = ROOT / relative, snapshot / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.is_symlink():
            target.symlink_to(os.readlink(source))
        elif source.is_file():
            shutil.copy2(source, target)
    for args in [
        ['git', 'init', '-b', 'main'], ['git', 'add', '.'],
        ['git', '-c', 'user.name=Local verification', '-c', 'user.email=verification@invalid', '-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'Isolated verification snapshot'],
    ]:
        result = run(args, snapshot)
        if result.returncode:
            raise RuntimeError(result.stdout)
    clone = Path(tmp) / 'clone'
    result = run(['git', 'clone', '--no-hardlinks', str(snapshot), str(clone)], Path(tmp))
    if result.returncode:
        raise RuntimeError(result.stdout)
    before = hashlib.sha256((clone / 'pnpm-lock.yaml').read_bytes()).hexdigest()
    result = run(['corepack', 'pnpm', 'install', '--frozen-lockfile'], clone)
    after = hashlib.sha256((clone / 'pnpm-lock.yaml').read_bytes()).hexdigest()
    report = {'check': 'P1-001 fresh isolated snapshot clone + frozen install', 'status': 'PASS' if result.returncode == 0 and before == after else 'FAIL', 'node': run(['node', '--version'], clone).stdout.strip(), 'pnpm': run(['corepack', 'pnpm', '--version'], clone).stdout.strip(), 'exitCode': result.returncode, 'lockfileUnchanged': before == after, 'lockfileSha256': after, 'elapsedSeconds': round(time.time() - started, 2), 'output': result.stdout, 'sourceRepositoryCommitted': False, 'externalProductionResourcesUsed': False}
    (ROOT / 'qa/frozen-install-evidence.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'output'}, indent=2))
    raise SystemExit(0 if report['status'] == 'PASS' else 1)
