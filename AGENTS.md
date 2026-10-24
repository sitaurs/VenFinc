# AGENTS.md — VenFinance Agent Constitution

> **Mandatory:** berlaku bagi coding agent, QA agent, reviewer, dan automation. Baca sebelum melakukan apa pun. Ini spesifikasi proyek target **belum** repo kode yang terimplementasi. Tidak mengklaim bahwa perintah atau lingkungan sudah berjalan.

## 0. Purpose / authority

VenFinance: multiuser personal finance PWA untuk Indonesia dengan akun `user`, `admin`, `superuser`; CF Workers/Hono + Neon/Postgres + private R2, GOWA dan 9router/Finance Worker Node Armbian. **FULL production scope** sesuai semua PRD, bukan MVP atau template demo. Domain baseline **hanya** `finance.venlab.tech`, `gowa.venlab.tech`, `9r.venlab.tech`; jalur worker internal diproksi oleh **path ingress terbatas** `gowa.venlab.tech/internal/v1/*` (lihat TRD-05). Hostname keempat tidak boleh ditambahkan diam-diam tanpa ADR. Target free services bukan janji biaya gratis absolut.

**Read in this order:**
1. [`docs/prd/PRD-00-INDEX.md`](./docs/prd/PRD-00-INDEX.md) → all PRDs as needed, not just summaries.
2. [`requirements/REQ-00-INDEX.md`](./requirements/REQ-00-INDEX.md) → exact user stories/AC and [`REQ-09-SCENARIOS.md`](./requirements/REQ-09-SCENARIOS.md).
3. [`architecture/TRD-00-OVERVIEW.md`](./architecture/TRD-00-OVERVIEW.md) → all TRD corresponding to task.
4. [`design/DESIGN-00-FOUNDATIONS.md`](./design/DESIGN-00-FOUNDATIONS.md) → [`DESIGN-01-SCREEN-MAP.md`](./design/DESIGN-01-SCREEN-MAP.md) and original screenshots.
5. [`plan/PLAN.md`](./plan/PLAN.md) → [`tasks/TASKS-INDEX.md`](./tasks/TASKS-INDEX.md) → selected task file.
6. [`research/DECISION-LOG.md`](./research/DECISION-LOG.md) for unresolved gates; [`qa/ACCEPTANCE-MATRIX.md`](./qa/ACCEPTANCE-MATRIX.md) before signoff.

**Conflict precedence:** external legal/security requirement > explicit current user instruction > PRD approved decisions > requirements observable AC > locked TRD technical decisions > design UI visual+behavior > plan > tasks. If any conflict materially changes privacy/money/WA/reliability, **stop affected task and request explicit product decision / ADR**; do not silently revise.

## 1. Prohibited shortcuts / invariants

- **Never change stack by habit** (e.g. Next.js, Prisma, Supabase, Firebase, Express as replacements) without approved ADR. Locked: React+TS+Vite, 1 CF Worker+Hono, TanStack Query, Tailwind/shadcn tokenized, Neon Managed Better Auth candidate confirmed after P0, Drizzle/Postgres, private R2, Node24 ARM Finance Worker, GOWA pinned OpenAPI, 9router AI, Sharp/Tesseract.
- **Never store money as floating JS numbers**. Use integer minor units (for IDR: whole rupiah) backed by PostgreSQL BIGINT; transport exact **decimal string** in JSON, format display with locale. Posting balanced and idempotent; transfers/savings not expenses; refunds/reversals traceable.
- **Never count tentative AI/OCR as posted**. Vision may lie; OCR may misread. User/review gates protect final ledger; recheck never alters posted transaction without owner action; stale data not shown as confirmed.
- **Never trust browser user ID or role**, route params, claimed WhatsApp `device_id`, upload URL or arbitrary webhook: authenticate, authorize each object, enforce DB RLS and dedup. Two-tenant hostile tests mandatory.
- **Never put credentials** (Neon, 9router, Access, GOWA, R2, signing keys) in frontend, demo fixtures, client bundle, repository, logs, screenshots or markdown. Use protected environment stores; redact logs. Never ask user to paste secrets into chat.
- **Never expose GOWA/9router admin REST to browser**. The only user-facing API is same-origin `/api/v1` via Hono session/RBAC. Cloudflare Access + application auth + HMAC/nonce for service calls; GOWA device header mandatory.
- **Never present unofficial WhatsApp tooling as official**. Shared bot requires opt-in; personal account requires explicit consent with disclosure, gated public release, single-owner session isolation; no chat harvesting/group scanning/bulk spam. Support STOP and reconnection failure.
- **Never assume provider Vision support** from OpenAI-compatible interface alone. Version test actual `9router` path with novel receipt image. Fallback OCR local, manual review if ambiguous; provider circuits throttled.
- **Never fake testing**, dashboards, security audit, release readiness, screenshots, deployment, webhook status, or AI extraction accuracy.
- **Never hardcode demo balances, policy text, email, role assignments, price plans, reminders** in production data path; fixtures isolated from live DB.
- **Never deploy to production/migrate/delete user's live data** without explicit deployment approval and confirmed account scope; write ops must follow migration/backup plan. Never use `latest` tag in deployment.

## 2. Repository layout — authoritative target

```text
apps/web/               React PWA client (Vite + React Router)
apps/edge/              Hono routes, auth, DB scoped calls, R2, bridge adapter
apps/finance-worker/    ARM Node scheduled/webhook/AI/OCR worker
packages/contracts/     shared Zod schemas, API envelopes, event contracts
packages/domain/        pure logic money/date/budget/session state
packages/ui/            tokens/components/a11y implementations
packages/db/            Drizzle schema/migrations/atomic PG functions/RLS
infra/                  Wrangler, Docker Compose, cloud Access/tunnel docs, backups
qa/                     test datasets, fixtures, visual comparisons, reports
docs/                   decision records, operator/deploy/runbooks
```

Docs in this package may initially sit at repo root. Maintain stable relative links or update references when moving docs.

## 3. Package manager and commands (CONTRACT, not verified yet)

- Runtime: **Node 24 LTS**, package manager **pnpm via Corepack**, pin `packageManager` exact version in root `package.json` during P1.
- Required root scripts, implemented/tested in P1: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm test:visual`, `pnpm test:security`, `pnpm test:contracts`, `pnpm db:check`, `pnpm infra:smoke`.
- CI PR gate: `corepack enable && pnpm install --frozen-lockfile`, then `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Integration needs disposable Neon branch/db and R2 fixtures; API/WA provider secrets never run on untrusted forks.
- **IMPORTANT:** no repo/project currently exists in handoff, so command definitions are milestones rather than shell commands already proven. Before running detect OS/node/package manager and actual package.json, then execute only scripts that actually exist. Record installed versions and exit codes. Do not claim success for absent scripts.
- Tests: Vitest (units), Testing Library (components), Playwright (routes/states, screenshot compare), test harness for PostgreSQL RLS/money, fake GOWA/9router adapters in CI; live GOWA/AI smoke only with approved test accounts.

## 4. Per-task execution protocol

1. Open exact `tasks/TASKS-P*.md` task, verify all dependencies `done` with evidence, mark `in_progress` in task tracker (after code repository exists).
2. Read referenced PRD IDs, requirement AC, TRD contract, screen ID mobile/web and state variants. Ask for 4 original ZIP screenshots if not present—contact sheets only cannot authorize visual-completion claim.
3. Implement smallest bounded change; include schema migrations with rollback plan; do not change public API without contracts+version+tests.
4. Add positive, negative, concurrency/idempotency and two-tenant checks as relevant. Prefer safe reusable shared code; client-side auth checks **never** substitute server authorization.
5. Run applicable scripts (record exact command, environment, versions and actual outputs). For UI route capture mobile/web and state screens, compare with user original, log explained deviations.
6. Verify no hardcoded real data, secrets, banned APIs, regressions, missing consent/accessibility; update traceability/task status only if evidence passes.
7. Produce concise handoff with files changed, task IDs, REQ/AC IDs, tests and result, security concern, unresolved blockers, next dependency. Never label partially passing task `done`.

## 5. Finance-specific rules

- Each posted `finance_event` composed of balanced postings in one PostgreSQL transaction, one domain-level idempotency key. `transaction_drafts` and `extraction_candidates` have no ledger entries. A payable/receivable opening must be balanced; principal repayment impacts cashflow and optional Cicilan envelope but is **not** a second consumption expense. Distinguish wallet/account from virtual budget category. Synthetic demo never changes prod wallet balances.
- Canonical state variants: `LOCAL_DRAFT` (IndexedDB), `SYNCING` (client queue), `SERVER_DRAFT` (`transaction_drafts`), `CANDIDATE_PROVISIONAL`/`NEEDS_REVIEW` (`extraction_candidates`), `POSTED`/`VOIDED` (`finance_events`) are not interchangeable. `RESTORED_EVENT` is a UI lineage label for compensating event, **not a database status**. Offline mutation stable identifier, conflict resolution, retry/dedup. No auto-post for a raw screenshot or uncertain parsed text.
- Periods and reminders use user's explicit timezone/calendar. `Tidak dilaporkan` ≠ `nihil` ≠ `sebagian` ≠ `selesai`. Deadline/recurrence never invents completed payment.
- Budget warning is a **virtual guard**, not a block on real QRIS/bank. Show debt/goal effects with preview; user chooses and confirms.
- Money calculations and property tests cover months 28/29/30/31, concurrent posts, transfer/refund/split, zero/negative boundaries, large IDR values.

## 6. Design governance

- **User's design is authority**, see `reference-design/guides/design_tokens.json` + `Design_System.md` + 180 PNG refs; do not use generic autogenerated dashboards. 90 screen IDs map to routes/states as in `DESIGN-01`.
- Semantic tokens from observed sources (violet/light neutrals, rounded cards, proper brand marks); default ID plus EN. Style from screenshots does not override a11y, money semantics, privacy, or actual status.
- Mobile bottom tabs Beranda/Transaksi/Catat/Anggaran/Lainnya, desktop sidebar, independent ADM/SYS shells, night mode applied across app, not only 2 samples.
- Each component has idle/loading/empty/error/success/offline where applicable, focus, hover, disabled and keyboard/screen reader controls. Respect prefers-reduced-motion. Target WCAG2.2 AA and responsive 320–1920.
- External font binaries/assets **may not be redistributed unless license verified**. Use user-provided image assets and licensed font packages or OS fallback.

## 7. Security/operations release conditions

- Private R2 with owner-checked signed access, virus/MIME/image bounds, short TTL, retention; no public evidence URL. Postgres RLS auth propagation verified in **actual worker** and worker service account; failure blocks launch.
- Operator MFA, role escalation restricted, role change reauth+audit; admin metrics aggregate only. Support access consent-bound/time-limited, no raw user transaction view by default.
- Observability redacted; health/heartbeat freshness accurate, alarms on provider down, DB/storage usage alert, robust restart backup restore. Financial behavior unaffected by WA/GOWA/9router outage; Armbian heavy processing never in CF Free CPU request.
- Ingress GOWA webhook HMAC verified and dedup before ACK, one user per sender link, content whitelisted, STOP immediate. GOWA instance can access sensitive WA data: explicit consent, scoped processing and retention, a legal/ToS public gate.
- Release gates are [`research/DECISION-LOG.md`](./research/DECISION-LOG.md) and [`qa/ACCEPTANCE-MATRIX.md`](./qa/ACCEPTANCE-MATRIX.md): pass does not mean merely coding complete. Production requires owner's explicit go-live approval.

## 8. No silent agent autonomy

You may research docs, draft ADRs, build mock adapters and staging assets within approved scope. You may **not** register or verify WhatsApp numbers, send unsolicited messages, publish real policies, incur charges, access other users' private data, or deploy live without explicit approval. Mark `BLOCKED` when external legal, payment, auth SMTP, real test credentials, Armbian hardware or GOWA policy are missing. Do not evade missing information with invented values.

## 9. Scope akses infrastruktur dari pemilik — 24 Oktober 2026

- Pemilik mengizinkan akses Cloudflare dan Neon melalui MCP untuk analisis konfigurasi dan kesiapan eksekusi VenFinance. Verifikasi akses dan resource aktual; jangan menganggap semua gate operasional sudah lulus karena konektor tersedia.
- **R2 VenFinance menggunakan bucket `ven`. Bucket `sap` milik proyek lain dan di luar scope:** jangan membaca isi, memakai binding, mengubah konfigurasi, menulis, atau menghapus objek pada bucket `sap`.
- Batasi inspeksi pada resource yang teridentifikasi terkait VenFinance. Jangan memilih database, branch, Worker, atau resource proyek lain hanya karena kredensial dapat mengaksesnya.
- Izin analisis ini tidak menggantikan persetujuan deployment produksi, migrasi, penghapusan data, atau biaya yang diwajibkan bagian sebelumnya. Jangan mencatat nilai secret dalam hasil analisis.

## 10. Preferensi pelaksanaan dari pemilik

- **Jangan menggunakan subagen.** Seluruh implementasi dan pemeriksaan lanjutan dikerjakan oleh agent utama sesuai instruksi pemilik pada 24 Oktober 2026.

## 11. State implementasi lokal — 24 Oktober 2026

- Pernyataan "belum ada repo/kode" pada baseline handoff menggambarkan keadaan awal. Monorepo dan package.json sekarang tersedia; gunakan versi, script, README, dan bukti QA aktual, bukan asumsi baseline.
- Build dan demo lokal tidak meluluskan identitas, RLS, uang produksi, integrasi, atau release gates. Data contoh hanya boleh berada dalam modul `/demo` yang terpisah; endpoint privat tetap tertutup sampai adapter nyata terverifikasi.
- Setelah rebuild, restart proses preview sebelum menguji artifact hasil build; preview memuat manifest aset saat startup. Dev/preview selalu loopback dan tidak menggantikan persetujuan deployment.
- Status atomik dicatat dalam `tasks/execution-status.json`. Bukti lengkap dan batas pengujian ada dalam laporan QA; jangan mengubah blocked menjadi done hanya karena scaffold tersedia.

## 12. Git workflow — preferensi pemilik

- Buat commit kecil setelah setiap milestone yang sudah diperiksa agar perubahan mudah dipulihkan; push secara berkala ke remote VenFinance yang diberikan pemilik selama branch dan tujuan push sudah diverifikasi.
- Sebelum commit/push, periksa branch, remote, staged diff, file generated, dan kemungkinan secret. Jangan pernah commit credential, `.env`, output build lokal, atau cache.
- Jangan force-push atau menimpa pekerjaan remote. Jika remote memiliki commit yang belum ada lokal, periksa dan integrasikan secara aman sebelum push.
- Jika autentikasi atau jaringan menghalangi push, pertahankan commit lokal dan laporkan hambatannya dengan jelas; jangan mengklaim sudah tersimpan di GitHub.

**Final principle:** correctness of money + privacy + auditability + consistency with designs outrank speed or appearance.
