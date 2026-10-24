#!/usr/bin/env python3
"""Prove broken fixtures fail the actual test/lint commands, then remove them."""
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
env = {**os.environ, 'PATH': str(ROOT / '.tools/node/bin') + os.pathsep + os.environ['PATH']}
checks = []
fixtures = [
    ('packages/domain/src/negative-harness.test.ts', "import { it, expect } from 'vitest';\nit('intentionally broken gate fixture', () => expect(1).toBe(2));\n", ['corepack', 'pnpm', 'test'], 'intentionally broken gate fixture'),
    ('apps/edge/src/lint-negative-harness.ts', 'export {};\nconst deliberatelyUnused = 1;\n', ['corepack', 'pnpm', 'lint'], 'deliberatelyUnused'),
]
for name, content, command, expected in fixtures:
    path = ROOT / name
    if path.exists():
        raise RuntimeError(f'Refusing to overwrite {name}')
    try:
        path.write_text(content)
        result = subprocess.run(command, cwd=ROOT, env=env, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=120)
        checks.append({'command': ' '.join(command), 'expected': 'nonzero on deliberately broken fixture', 'exitCode': result.returncode, 'verified': result.returncode != 0 and expected in result.stdout, 'output': result.stdout})
    finally:
        path.unlink(missing_ok=True)
report = {'status': 'PASS' if all(c['verified'] for c in checks) else 'FAIL', 'scope': 'Local failure behavior of the exact CI test/lint commands. GitHub-hosted execution has not run.', 'fixturesRemoved': all(not (ROOT / f[0]).exists() for f in fixtures), 'checks': checks}
(ROOT / 'qa/negative-gate-evidence.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({**report, 'checks': [{k: v for k, v in c.items() if k != 'output'} for c in checks]}, indent=2))
raise SystemExit(0 if report['status'] == 'PASS' else 1)
