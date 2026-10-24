#!/usr/bin/env python3
"""Offline structural consistency checker for VenFinance spec handoff.

Usage:
  python tools/validate_handoff.py
  python tools/validate_handoff.py --allow-lite
  python tools/validate_handoff.py --json qa/consistency-report.json

This checks docs and supplied source raster SHA-256 only; it does NOT
verify a deployed app, legal compliance, third-party APIs or actual AI output.
"""
from __future__ import annotations
import argparse, collections, hashlib, json, re, unicodedata
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PREF=('PROD','IAM','FIN','UX','WA','AI','OPS','TRUST','QUAL')
ID_RE=re.compile(r'\b(?:'+ '|'.join(PREF) +r')-\d{3}\b')
TASK_RE=re.compile(r'^###\s+(P\d+-(?:SCREEN-[A-Z0-9-]+|[A-Z]+-\d{3}(?:-\d{2})?|\d{3}))\b',re.M)
LINK_RE=re.compile(r'(?<!!)\[[^\]]*\]\(([^)]+)\)')
FULL_PREFIX='reference-design/full/'

def slug(h):
    h=unicodedata.normalize('NFKC',h).strip().lower()
    h=re.sub(r'<[^>]+>','',h)
    h=re.sub(r'[^\w\s-]','',h)
    return re.sub(r'\s+','-',h)

def hsha(p):
    d=hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):d.update(chunk)
    return d.hexdigest()

def audit(lite=False):
    problems=[]; metrics={}
    def fail(tag, msg):problems.append({'tag':tag,'detail':str(msg)})
    excluded={'node_modules', '.git', '.tools', '.wrangler', 'dist', 'test-results', 'playwright-report', 'VenFinance_Production_Handoff'}
    md=[p for p in ROOT.rglob('*.md') if not (excluded & set(p.relative_to(ROOT).parts)) and '/reference-design/guides/' not in str(p)]
    counts=collections.Counter();missing_full=set()
    cache={}
    for p in md:
        s=p.read_text('utf-8')
        if re.search(r'^<{7}|^={7}|^>{7}',s,re.M):fail('merge_conflict',p.relative_to(ROOT))
        for raw in LINK_RE.findall(s):
            target=raw.split(' ')[0].strip('"<>')
            if target.startswith(('http:','https:','mailto:','data:','app:')):continue
            rel,_,anchor=target.partition('#')
            q=(p.parent/rel).resolve() if rel else p
            counts['internal_links']+=1
            if not q.exists():
                try:name=q.relative_to(ROOT).as_posix()
                except ValueError:name=str(q)
                if lite and name.startswith(FULL_PREFIX):missing_full.add(name);continue
                fail('broken_file',f'{p.relative_to(ROOT)} -> {target}');continue
            if anchor and q.suffix=='.md':
                if q not in cache:
                    txt=q.read_text('utf-8')
                    headings=re.findall(r'^#+\s+(.*)$',txt,re.M)
                    anchors={slug(h) for h in headings}
                    anchors.update(re.findall(r'<a\s+id="([^"]+)"\s*>',txt))
                    cache[q]=anchors
                if anchor not in cache[q]:fail('broken_anchor',f'{p.relative_to(ROOT)} -> {target}')
    metrics['markdown_files']=len(md)
    metrics['internal_links_checked']=counts['internal_links']
    metrics['lite_missing_image_paths_waived']=len(missing_full)

    prd_files=sorted((ROOT/'docs/prd').glob('PRD-*.md'))
    prd='\n'.join(p.read_text('utf-8') for p in prd_files)
    reqfiles=sorted((ROOT/'requirements').glob('REQ-0[1-8]-*.md'))
    req='\n'.join(p.read_text('utf-8') for p in reqfiles)
    # Source PRD IDs from actual requirement rows / headings, not traceability references
    prdids=set(re.findall(r'^\|\s*`((?:'+ '|'.join(PREF) +r')-\d{3})`\s*\|',prd,re.M))
    reqheads=re.findall(r'^###\s+((?:'+ '|'.join(PREF) +r')-\d{3})\s+—',req,re.M)
    reqids=set(reqheads)
    if len(reqheads)!=len(reqids):fail('duplicate_requirement',collections.Counter(reqheads))
    if prdids != reqids:fail('prd_req_mismatch',f'PRD only={sorted(prdids-reqids)}, Req only={sorted(reqids-prdids)}')
    for item in sorted(reqids):
        if f'<a id="{item.lower()}"></a>' not in req:fail('missing_stable_req_anchor',item)
        for typ in ('US','AC'):
            # Non-functional quality measures are NFRs with measurable AC, not narrative user stories.
            if typ == 'US' and item.startswith('QUAL-'):
                continue
            if f'{typ}-{item}' not in req:fail('missing_user_story_ac',item+':'+typ)
    for item in sorted(reqids):
        if f'AC-{item}-A' not in req or f'AC-{item}-B' not in req:fail('missing_ac_boundary',item)
    metrics['prd_requirement_ids']=len(prdids)
    metrics['requirement_heading_ids']=len(reqids)

    trace=(ROOT/'requirements/REQ-10-TRACEABILITY.md').read_text('utf-8')
    traced=set(re.findall(r'^\|\s*`((?:'+ '|'.join(PREF) +r')-\d{3})`\s*\|',trace,re.M))
    if traced!=reqids:fail('traceability_mismatch',f'missing {sorted(reqids-traced)} extra {sorted(traced-reqids)}')
    qa=(ROOT/'qa/ACCEPTANCE-MATRIX.md').read_text('utf-8')
    qareq=set(re.findall(r'^\|\s*`((?:'+ '|'.join(PREF) +r')-\d{3})`\s*\|',qa,re.M))
    if qareq!=reqids:fail('qa_req_mismatch',f'missing {sorted(reqids-qareq)} extra {sorted(qareq-reqids)}')
    metrics['qa_req_ids']=len(qareq)

    prd_decisions=(ROOT/'docs/prd/PRD-10-RESEARCH-DECISIONS.md').read_text('utf-8')
    decision_log=(ROOT/'research/DECISION-LOG.md').read_text('utf-8')
    dsource=set(re.findall(r'^\|\s*`(DEC-\d{3})`\s*\|',prd_decisions,re.M))
    dregister=set(re.findall(r'^\|\s*`(DEC-\d{3})`\s*\|',decision_log,re.M))
    if dsource != dregister or len(dregister)!=14:
        fail('decision_register_mismatch',f'PRD={sorted(dsource)} LOG={sorted(dregister)}')
    metrics['decision_ids']=len(dregister)

    tasks={};dep={}; counts_phase=collections.Counter()
    for p in (ROOT/'tasks').glob('TASKS-P[0-9]*.md'):
        s=p.read_text('utf-8');matches=list(TASK_RE.finditer(s))
        for i,m in enumerate(matches):
            tid=m.group(1);body=s[m.end():matches[i+1].start() if i+1<len(matches) else len(s)]
            if tid in tasks:fail('duplicate_task',tid)
            tasks[tid]=p.relative_to(ROOT).as_posix()
            counts_phase[tid.split('-')[0]]+=1
            d=re.search(r'^- \*\*Dependensi:\*\*\s*(.*)',body,re.M)
            if not d:fail('task_missing_dependency',tid);dep[tid]=[]
            else:
                dep[tid]=[] if 'Tidak ada' in d.group(1) else re.findall(r'`(P\d+-[A-Z0-9-]+)`',d.group(1))
    for t,ds in dep.items():
        for d in ds:
            if d not in tasks:fail('unknown_task_dependency',t+' -> '+d)
            elif int(d.split('-')[0][1:])>int(t.split('-')[0][1:]):fail('forward_phase_dependency',t+' -> '+d)
            elif d==t:fail('self_dependency',t)
    st={}
    def visit(t,stack):
        if st.get(t)==1:fail('cyclic_task_dependency',' -> '.join(stack+[t]));return
        if st.get(t)==2:return
        st[t]=1
        for d in dep.get(t,[]):
            if d in tasks:visit(d,stack+[t])
        st[t]=2
    for t in tasks:visit(t,[])
    covered={rid for rid in reqids if any(task.endswith(rid) or ('-'+rid+'-') in task for task in tasks)}
    if covered!=reqids:fail('uncovered_requirement',sorted(reqids-covered))
    # QA requirement task mapping must target real task IDs, not prose labels or stale references.
    qa_rows=[line for line in qa.splitlines() if re.match(r'^\|\s*`(?:'+'|'.join(PREF)+r')-\d{3}`\s*\|',line)]
    qa_task_refs=set()
    for row in qa_rows:
        ids=re.findall(r'`(P\d+-[A-Z0-9-]+)`',row)
        if not ids:fail('qa_row_without_task',row[:85])
        for tid in ids:
            qa_task_refs.add(tid)
            if tid not in tasks:fail('unknown_qa_task',tid)
    metrics['qa_task_refs']=len(qa_task_refs)
    metrics['task_count']=len(tasks)
    metrics['tasks_per_phase']=dict(sorted(counts_phase.items(),key=lambda z:int(z[0][1:])))
    metrics['task_covered_req_ids']=len(covered)

    manifest=json.loads((ROOT/'reference-design/guides/screen_manifest.json').read_text('utf-8'))
    aid=json.loads((ROOT/'reference-design/guides/asset_manifest.json').read_text('utf-8'))
    sm=collections.defaultdict(set)
    base=ROOT/'reference-design/full/VenFinance_UIUX_ImageGen'
    for e in manifest:
        sm[e['id']].add(e['surface'])
        p=base/e['file']
        if p.exists():
            if hsha(p)!=e['sha256']:fail('screen_sha_mismatch',e['file'])
            counts['screen_images_verified']+=1
        elif not lite:fail('missing_screen',e['file'])
    if len(sm)!=90 or any(v!={'mobile','web'} for v in sm.values()):fail('screen_pairs',f'{len(sm)} IDs, unpaired={[k for k,v in sm.items() if v!={"mobile","web"}]}')
    for e in aid:
        p=base/e['file']
        if p.exists():
            if hsha(p)!=e['sha256']:fail('asset_sha_mismatch',e['file'])
            counts['asset_images_verified']+=1
        elif not lite:fail('missing_asset',e['file'])
    if len(aid)!=59:fail('asset_manifest_count',len(aid))
    screenmap=(ROOT/'design/DESIGN-01-SCREEN-MAP.md').read_text('utf-8')
    smapped=set(re.findall(r'^\|\s*`((?:PUB|AUTH|ONB|FIN-UI|REV|SET|ADM|SYS|FLOW|STATE|DARK)-\d{2})`',screenmap,re.M))
    # There are alternate tabular representation styles; fallback all backticked IDs unique in map
    if smapped != set(sm):
        allids=set(re.findall(r'`((?:PUB|AUTH|ONB|FIN-UI|REV|SET|ADM|SYS|FLOW|STATE|DARK)-\d{2})`',screenmap))
        if allids != set(sm):fail('design_screen_map',f'missing={sorted(set(sm)-allids)} extra={sorted(allids-set(sm))}')
    qatasks=set(re.findall(r'^\|\s*`((?:PUB|AUTH|ONB|FIN-UI|REV|SET|ADM|SYS|FLOW|STATE|DARK)-\d{2})`\s*\|',qa,re.M))
    if qatasks!=set(sm):fail('qa_screen_ids',f'missing={sorted(set(sm)-qatasks)} extra={sorted(qatasks-set(sm))}')
    for screen in sm:
        if 'P4-SCREEN-'+screen not in tasks:fail('unimplemented_screen_task',screen)
    metrics['screen_ids']=len(sm)
    metrics['screens_sha256_verified']=counts['screen_images_verified']
    metrics['assets_sha256_verified']=counts['asset_images_verified']
    metrics['qa_screen_ids']=len(qatasks)

    files_to_check=['AGENTS.md','architecture/TRD-00-OVERVIEW.md','architecture/TRD-02-API-CONTRACTS.md','architecture/TRD-03-INTEGRATIONS-JOBS.md','architecture/TRD-05-DEPLOY-OPERATIONS.md','tasks/TASKS-P6.md']
    for filename in files_to_check:
        s=(ROOT/filename).read_text('utf-8')
        if 'bridge.venlab.tech' in s:fail('unapproved_fourth_hostname',filename)
    for stale in ['DRAFT_LOCAL','PENDING_SERVER']:
        for p in [ROOT/'AGENTS.md',ROOT/'architecture/TRD-01-DATA-MODEL.md',ROOT/'design/DESIGN-02-COMPONENTS-STATES.md',ROOT/'design/DESIGN-05-COPY-A11Y-I18N.md']:
            if re.search(r'\b'+stale+r'\b',p.read_text('utf-8')):fail('outdated_state',p.relative_to(ROOT).as_posix()+':'+stale)
    return {'result':'PASS' if not problems else 'FAIL', 'metrics':metrics, 'issues':problems}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--allow-lite',action='store_true');ap.add_argument('--json',default='');args=ap.parse_args()
    result=audit(args.allow_lite)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    if args.json:
        out=ROOT/args.json;out.parent.mkdir(exist_ok=True,parents=True);out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    raise SystemExit(0 if result['result']=='PASS' else 1)
