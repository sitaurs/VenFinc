#!/usr/bin/env python3
"""Inventory only; does not certify UI visual acceptance."""
import hashlib
import json
from pathlib import Path
import struct
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'reference-design/full/VenFinance_UIUX_ImageGen'
results, failures, pairs = [], [], defaultdict(set)
for manifest in ['screen_manifest.json', 'asset_manifest.json']:
    for entry in json.loads((ROOT / 'reference-design/guides' / manifest).read_text()):
        data = (source / entry['file']).read_bytes()
        sha = hashlib.sha256(data).hexdigest()
        dimensions = struct.unpack('>II', data[16:24])
        passed = sha == entry['sha256'] and dimensions == (entry['width'], entry['height'])
        if not passed:
            failures.append(entry['file'])
        results.append({'file': entry['file'], 'sha256': sha, 'dimensions': dimensions, 'passed': passed})
        if 'id' in entry:
            pairs[entry['id']].add(entry['surface'])
for screen, surfaces in pairs.items():
    if surfaces != {'mobile', 'web'}:
        failures.append(screen)
fonts = []
for name in ['inter', 'plus-jakarta-sans']:
    package = ROOT / 'apps/web/node_modules/@fontsource-variable' / name
    metadata = json.loads((package / 'package.json').read_text())
    license_text = (package / 'LICENSE').read_text()
    fonts.append({'package': metadata['name'], 'version': metadata['version'], 'license': metadata['license'], 'licenseSha256': hashlib.sha256(license_text.encode()).hexdigest(), 'distributionNotice': f'apps/web/public/licenses/{name}.txt'})
    if metadata['license'] != 'OFL-1.1' or 'SIL OPEN FONT LICENSE Version 1.1' not in license_text:
        failures.append(metadata['name'])
report = {'status': 'PASS' if not failures and len(pairs) == 90 else 'FAIL', 'scope': 'Source hashes, dimensions, 90 mobile/web pairs and bundled font licenses only', 'screens': 180, 'assets': len(results) - 180, 'pairs': len(pairs), 'failures': failures, 'fonts': fonts, 'sourceProvenance': 'Original user-provided design package. No stock assets or unlicensed external font binary added.', 'visualAcceptance': 'NOT COMPLETE: all implemented route/state pairs require original-image comparison and approved deviations.', 'results': results}
(ROOT / 'qa/visual-source-evidence.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({k: v for k, v in report.items() if k != 'results'}, indent=2))
raise SystemExit(0 if report['status'] == 'PASS' else 1)
