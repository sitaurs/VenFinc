#!/usr/bin/env python3
"""Check task statuses and the decision register without provider access."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def audit():
    tracker = json.loads((ROOT / 'tasks/execution-status.json').read_text())
    register = json.loads((ROOT / 'research/execution-decisions.json').read_text())
    tasks = tracker['tasks']
    ids = {t['id'] for t in tasks}
    issues = []
    if len(tasks) != 373 or len(ids) != 373:
        issues.append('Expected 373 unique tasks')
    by_id = {t['id']: t for t in tasks}
    for task in tasks:
        if task['status'] not in tracker['status_values']:
            issues.append(f"Invalid status: {task['id']}")
        if not (ROOT / task['source']).is_file():
            issues.append(f"Missing task source: {task['id']}")
        for dep in task['dependencies']:
            if dep not in ids:
                issues.append(f"Missing dependency {task['id']} -> {dep}")
            elif task['status'] in ('in_progress', 'done') and by_id[dep]['status'] != 'done':
                issues.append(f"Unproven dependency {task['id']} -> {dep}")
        if task['status'] == 'done' and not task['evidence']:
            issues.append(f"Missing evidence: {task['id']}")
        if task['status'] == 'done':
            for artifact in task['evidence']:
                if not isinstance(artifact, str) or not (ROOT / artifact).is_file():
                    issues.append(f"Missing evidence artifact: {task['id']} -> {artifact}")
    if {d['id'] for d in register['decisions']} != {f'DEC-{i:03}' for i in range(1, 15)}:
        issues.append('Decision register must include all 14 decisions')
    for item in register['decisions'] + register['gates']:
        if not item.get('owner') or not item.get('status'):
            issues.append(f"Missing owner/status: {item['id']}")
    return {'result': 'FAIL' if issues else 'PASS', 'task_count': len(tasks),
            'decision_count': len(register['decisions']), 'gate_count': len(register['gates']),
            'issues': issues, 'production_ready': False}


if __name__ == '__main__':
    result = audit()
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result['result'] == 'PASS' else 1)
