# TRD-06 — Test Architecture, Quality Gates & Observability Proof

No code task is 'done' without deterministic test evidence. See [`../requirements/REQ-09-SCENARIOS.md`](../requirements/REQ-09-SCENARIOS.md) and [`../qa/ACCEPTANCE-MATRIX.md`](../qa/ACCEPTANCE-MATRIX.md).

## 1. Test pyramid and environments

| Layer | Target checks | Environment |
|---|---|---|
| Pure unit Vitest | integer money, ledger invariants, periods, parser, budget math, state transitions | local/CI |
| Component Testing Library | form validation, disabled states, focus, ARIA, ID/EN, light/dark | jsdom/browser runner |
| Contract (Hono + Zod) | request/response schema; status codes; auth/tenant; idempotent replay | mocked services + staging |
| PostgreSQL integration | RLS `auth.user_id()`, FK cross-tenant, atomic events, migrations, rollback, unique keys | Neon staging test project/branch |
| Storage integration | R2 upload/download delete, TTL, no public access, corrupt image, quota | test R2 bucket |
| WA fake adapter | GOWA state+webhook contract, HMAC invalid/replay, pairing/STOP/sessions | deterministic simulation |
| GOWA live smoke | real QR/pairing/connection controlled accounts, no bulk traffic, multi-device restart | operator-consented isolated staging only |
| AI/OCR fixtures | provider openAI/Anthropic compatible, actual vision forwarding, OCR fallback, recheck conflict | pinned fixture and selected upstream |
| PWA Playwright | mobile/desktop, offline, IndexedDB, installed PWA/share-target where supported, demo isolation | Chromium, plus selected Firefox/WebKit |
| Security tests | IDOR, CSRF, XSS, access scopes, consent, resource enumeration, rate abuse | CI + staging |
| Load / resource bench | worker CPU <=10ms free, request/day, Neon sleep, Armbian session RAM, queue backlogs | controlled staging |
| Restore test | encrypted backup, full restore, financial invariant check, no secrets leak | isolated restore DB |

## 2. Golden datasets (synthetic)

- Finance fixture: opening Tunai Rp75.000, Bank Rp450.000, E-wallet Rp125.000; income Rp1.200.000; posted expense Rp920.000; provisional Rp18.000. This is **reference demo scenario**, not universal default; distinguish cash starting from income events so double counting never occurs.
- Image fixture: at least 100 diversified Indonesian payment/receipt images with **verified ground truth**, nominal 1..10.000.000, blur/dark/reflection, merchant variations, refund/transfer proof, QR display without nominal, multiple line-item/total amount variants.
- WA fixture: 2 tenants with verified numbers, 1 shared bot + 2 personal slots, group message, forbidden sender, edited/deleted message, duplicate webhook, restart and reassigned JIDs.
- Calendar fixture: leap/nonleap years, month boundary, timezone change, recurring at local 20.30, users with varying first day of budget cycle.
- Security fixture: A and B identically named wallets/categories, arbitrary valid UUIDs, Admin and Superuser without consent, upload intent/token expired, account deletion pending.

## 3. Non-functional pass criteria

| Test ID | Pass/fail condition |
|---|---|
| `QT-01` isolation | 0 successful cross-user reads/writes across private routes, R2, WA, support, exports |
| `QT-02` ledger atomicity | 0 unbalanced postings, money drift, duplicate posting under 100 simultaneous retries |
| `QT-03` budget accuracy | 100% pure golden tests across transfers, refunds, split, 28–31-day budget |
| `QT-04` offline durability | local draft survives refresh and syncs once when network returns; explicit conflict choice |
| `QT-05` API | non-AI p95 <=1.5s in documented staging sample; if cold start included report separately |
| `QT-06` web vitals | p75 LCP <=2.5s under documented mobile conditions and sample size; report actual |
| `QT-07` UI | no overflow at 360/390/768/1024/1440/1920; light/dark + EN + zoom 200%; target WCAG 2.2 AA |
| `QT-08` OCR/vision | >=90% correct total amount on held-out fixture; all material conflicting results lead review; **never silently modify posted** |
| `QT-09` outage | PWA manual online works when Armbian/9router/GOWA offline; no data loss from queued uploads |
| `QT-10` security | zero high/critical unresolved issues, CSP & CSRF/IDOR tests pass, secrets scan clean |
| `QT-11` recovery | restore to isolated env succeeds with verified ledger invariants; rollback app preserves data |
| `QT-12` quota | no uncontrolled R2 overage/cloud runaway in scripted abusive tests; manual still works when optional quota exceeded |
| `QT-13` WA consent | STOP immediate, quiet hours honored, unauthorized chat never reaches AI/app logs, no cross-session controls |
| `QT-14` release | all 191 PRD IDs mapped (177 requirements+14 decisions), all user-visible screens reviewed against original bitmap references |
| `QT-15` ledger audit | void + reversal + restore idempotent, original postings retained without net double reversal; debt principal impacts liability and optional cicilan envelope but not consumption expense |

## 4. Agent deliverable after each task

Every completed task contains: test IDs, environment and version pinned, relevant screenshot IDs or API paths, actual command output (redacted), negative path proof, QA status. Do not say `passed` because code compiled; show reproducible evidence.

## 5. Production launch gates vs developer completion

- Developer completion = tests pass on staging/fake integrations.
- **Production private beta** = identity email verification works, RLS verified, backup restore passes, manual ledger/consent/UI tested, 9router+GOWA isolated test sessions stable.
- **Public launch** additionally requires legal privacy text signed off, deliverable SMTP/auth hardening, WhatsApp policy decision (personal link feature gated by default), capacity and billing alerts, vulnerabilities resolved and full UX/accessibility audit.

Documents reflect targets and plans; no part of this package claims tests have already run on deployment.
