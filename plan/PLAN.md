# PLAN — VenFinance Production Delivery (tanpa pemangkasan MVP)

**Baseline:** 23 Oktober 2026 · **Dokumen induk:** [`../docs/prd/PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md) · **Pelaksana:** AI coding agent dengan pengawasan pemilik proyek.  
**Status:** rencana target, tidak menunjukkan kode sudah dibuat atau layanan sudah dideploy.

## 1. Prinsip dan definisi selesai

Produk ditargetkan **seluruh ruang lingkup PRD production**: registrasi dan autentikasi aman; `user/admin/superuser`; akuntansi uang yang benar; PWA offline; 90 screen IDs responsif yang dipetakan ke routes/states; WA bot bersama dan opsi sesi pribadi (gated), pairing/QR/status/logout/delete; model Vision AI melalui 9router; OCR dan recheck; operator consoles; keamanan, privasi dan ekspor/hapus data; monitoring, backup dan release. Fase adalah urutan dependensi, **bukan** izin meluncurkan produk parsial sebagai production.

Persyaratan fungsional teramati ada di [`../requirements/REQ-00-INDEX.md`](../requirements/REQ-00-INDEX.md), implementasi teknis dikunci pada [`../architecture/TRD-00-OVERVIEW.md`](../architecture/TRD-00-OVERVIEW.md), perilaku layar di [`../design/DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md). Semua task di [`../tasks/TASKS-INDEX.md`](../tasks/TASKS-INDEX.md).

## 2. Urutan kerja production

| Phase | Milestone | Outcome demonstrable | Exit gate |
|---|---|---|---|
| **P0** | Validasi asumsi & feasibility | Matrix kemampuan GOWA/9router/Neon Auth/RLS/R2/Workers ARM64, audit hardware, PoC keamanan | Evidence lulus kontrak, atau blocker + ADR dengan approval |
| **P1** | Workspace & platform foundation | Monorepo, TypeScript strict, lint/test/build, Wrangler, Docker, fixtures, validation CI | Clean install; `lint`, `typecheck`, `test`, `build` lulus |
| **P2** | Identity, isolation, security | signup email, verify, login, MFA operator, bootstrap superuser, 3-role RBAC, rate-limit, RLS | Account A/B hostile tests dan role escalation tes lulus |
| **P3** | Financial engine | wallet ledger, transfer, budget, savings, debt, bills, recurring, reports, corrections | Invariants money/rounding/idempotency & property-based tests lulus |
| **P4** | Full PWA/design UI | semua 90 screen ID sebagai routes+states, tokens/assets, navigation responsive, ID/EN, dark, visual snapshots; integrasi belum tersedia memakai **fixture sintetis terisolasi** | Semua screen ID dan state UI ter-cover secara visual/interaksi lokal; backend nyata P5/P7/P8/P9 dibuktikan pada P10, bukan diklaim lulus di P4 |
| **P5** | Offline, import/export, data rights | local queue, sync conflicts, offline guard, import CSV, export, delete, retention, proof access | Offline/replay/dedup, privacy reauth, export/delete verified |
| **P6** | Armbian worker/integration base | Docker services, CF Tunnel/Access, durable inbox/outbox, job leases/scheduler, backup/recovery | Restart & tunnel outage simulation recover safely |
| **P7** | WhatsApp end-to-end | shared bot, optional personal slots, QR/pairing code, status/reconnect/logout/delete, reminders, consent | Multiuser signed webhook replay test & privacy gates; GOWA public policy reviewed |
| **P8** | AI Vision/OCR/reconciliation | OpenAI/Anthropic-compatible 9router, attachment intake, OCR fallback, recheck, conflict UI | Golden fixtures, outage recovery, never duplicate or silently alter ledger |
| **P9** | Operator/public system | admin & superuser consoles, feature flags, quotas, abuse, incidents, support, public policies | Least privilege, operator MFA, redaction and audit tests |
| **P10** | Hardening / production release | end-to-end UAT, accessibility, perf/load, restore drill, release runbook, rollback | All PRD/NFR gates and legal/ToS/SMTP/multi-device gates signed off |

**Parallelisme aman:** setelah kontrak P1 stabil, visual shell/states P4 dapat dibangun memakai fixtures sedangkan domain finance P3 dibangun terpisah; jangan menggabungkan fitur tanpa kontrak P2/P3. P6 adapter mocks juga bisa dikembangkan lebih awal, tetapi sesi WA nyata hanya setelah safety gates. P9 UI scaffolding bisa dibuat sejak P4, API/admin security setelah P2/P6.

## 3. Blocker prioritas sebelum public launch

1. **Neon Managed Auth:** uji Workers integration, custom SMTP/deliverability, password reset, revocation, operator MFA dan Postgres RLS token propagation. Bila provider free tidak layak production, ini masalah keputusan bisnis/platform, bukan izin menonaktifkan verifikasi.
2. **GOWA unofficial WhatsApp:** evaluasi aturan platform, consent untuk link WA pribadi, kapabilitas endpoint sesuai versi yang dipin, dampak crash lintas sesi, kebijakan publik/opt-in. Jika gagal gate, **tahan fitur WA publik** dan jangan mengklaim seluruh produk production.
3. **Vision via 9router:** tes end-to-end benar-benar meneruskan gambar dan menghasilkan nominal pada gambar yang tidak ada di prompt, untuk tiap adapter/model. Jika gagal gunakan OCR sementara dan tuntaskan fitur sebelum rilis lengkap.
4. **Cloudflare Free + Neon/R2:** verifikasi limits terkini, desain tidak boleh menjanjikan $0 bila email custom, domain, listrik atau object overage berbayar. Perlu budget alert & rate/usage caps.
5. **Hardware Armbian:** ukur RAM/CPU/IO selama GOWA multi-device, 9router, OCR, 30-day sessions; tanpa benchmark tidak ada klaim kapasitas user yang valid.
6. **Indonesia UU PDP, retention dan Terms:** dokumen kebijakan final/disclosure dan persetujuan pemilik harus diuji saat launch, bukan ditampilkan sebagai kepastian hukum.

Status tiap blocker ada di [`../research/DECISION-LOG.md`](../research/DECISION-LOG.md). Tidak boleh memberi label production-ready dengan blocker kritis terbuka.

## 4. Kontrak milestone dan evidence

Setiap phase menghasilkan 5 artefak: (a) fitur sesuai task ID, (b) unit/integration/browser test, (c) bukti hasil command dan video/screenshot bila UI, (d) regresi QA lulus, (e) entry changelog dan keputusan bila perlu. Task baru dapat diberi status `done` setelah lulus **acceptance criteria** terkait. `blocked` tidak sama dengan `done`.

**Template phase handoff (untuk eksekusi agent):**

```text
Phase P#:
- Completed task IDs and commit references:
- PRD/REQ IDs covered and test IDs:
- Commands run (real stdout/exit code):
- Screenshot comparisons against original PNG:
- Security/performance findings:
- Blockers, ADRs, assumption changes:
- Rollback/restore notes:
- Next eligible tasks and dependencies:
```

## 5. Definition of Done production

- 177 functional/NFR identifiers mendapat test/bukti (atau explicit waivered with owner consent untuk noncritical—**critical not waivable**); 14 decision IDs punya owner/status.
- Semua 90 desain punya route/state manifest, browser snapshots untuk dua target asal, state empty/error/loading, responsive, ID/EN, light/dark; target WCAG 2.2 AA termasuk keyboard.
- Functional tests meliputi 3 role, isolation dua tenant, stale JWT/RLS, no cross-user WA session, replay messages/AI and offline posts idempotent, exact integer money.
- Feature set lengkap dan layanan produksi diukur; privacy policy, consent, export/delete, access log, backup **restore tested**, incident/rollback tested.
- Tests tidak hanya mocked: GOWA pinned endpoint smoke, 9router vision proof and OCR parity, R2 real private authorization, Neon scale-to-zero/posting semantics, CF Access service authentication tested in staging.
- **Zero unresolved security P0/critical, release blocker, or unreviewed public WA compliance issue**. Tidak melakukan deploy produksi tanpa approval eksplisit pengguna.

## 6. Planning change control

Urutan `PRD > Requirements > TRD > Design > Plan > Task`: bila terjadi konflik, tandai issue, jangan diam-diam memaksakan satu artefak. UI screenshot adalah authority visual; jika menampilkan data demo yang bertentangan dengan akuntansi, gunakan domain correctness PRD/TRD, catat deviation. Perubahan requirement melalui ADR dengan PRD/REQ/TEST updates sebelum code.

Durasi fase **tidak dijanjikan** sebelum hardware, sesi provider, dan kemampuan agent tervalidasi. Lacak kemajuan dengan completion/evidence, bukan perkiraan hari.
