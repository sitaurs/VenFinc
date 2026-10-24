# TASKS-P1 — Monorepo, toolchain, tests and platform foundation

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P1-001 — Bootstrap pnpm monorepo

- **Status awal:** `todo`; **tujuan tunggal:** Tata repo ke apps/web,edge,finance-worker dan packages/contracts,domain,db,ui
- **Dependensi:** `P0-001`.
- **Rujukan:** [`TRD-00-OVERVIEW.md`](../architecture/TRD-00-OVERVIEW.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Fresh clone + frozen install di Node 24 berhasil.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-002 — Konfigurasi tsconfig strict dan lint

- **Status awal:** `todo`; **tujuan tunggal:** Tetapkan strict TS, eslint dan lint styling lint script
- **Dependensi:** `P1-001`.
- **Rujukan:** [`AGENTS.md`](../AGENTS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** pnpm lint dan pnpm typecheck lulus clean.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-003 — Setup test harness Vitest

- **Status awal:** `todo`; **tujuan tunggal:** Buat unit test runner dan example deterministic fixtures tanpa data pengguna
- **Dependensi:** `P1-001`.
- **Rujukan:** [`TRD-06-TEST-STRATEGY.md`](../architecture/TRD-06-TEST-STRATEGY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** pnpm test berjalan dan gagal secara sengaja pada broken fixture.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-004 — Setup Playwright visual/e2e

- **Status awal:** `todo`; **tujuan tunggal:** Buat browser suite mobile/desktop dan screenshot fixtures
- **Dependensi:** `P1-001`.
- **Rujukan:** [`TRD-06-TEST-STRATEGY.md`](../architecture/TRD-06-TEST-STRATEGY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** pnpm test:e2e dan test:visual dapat dieksekusi.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-005 — Setup Wrangler Workers assets+Hono

- **Status awal:** `todo`; **tujuan tunggal:** Konfigurasi satu Worker, routing /api/v1, build static PWA assets
- **Dependensi:** `P1-001`.
- **Rujukan:** [`TRD-00-OVERVIEW.md`](../architecture/TRD-00-OVERVIEW.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Local dev returns static app + /api/v1/health; no secrets in bundle.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-006 — Buat shared contract Zod

- **Status awal:** `todo`; **tujuan tunggal:** Skema error envelope, currency exact strings, timezone dan pagination
- **Dependensi:** `P1-001`.
- **Rujukan:** [`TRD-02-API-CONTRACTS.md`](../architecture/TRD-02-API-CONTRACTS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Contracts versioned and tests reject malformed amounts.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-007 — Provision migrasi Drizzle

- **Status awal:** `todo`; **tujuan tunggal:** Migrations history dan disposable staging DB, no direct prod credentials in CI
- **Dependensi:** `P1-001`, `P0-008`.
- **Rujukan:** [`TRD-01-DATA-MODEL.md`](../architecture/TRD-01-DATA-MODEL.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Fresh migrate/rollback simulation lulus.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-008 — Setup docker ARM service baseline

- **Status awal:** `todo`; **tujuan tunggal:** Compose terpisah Finance Worker/GOWA/9router, healthchecks, no plaintext secrets
- **Dependensi:** `P1-001`, `P0-002`.
- **Rujukan:** [`TRD-05-DEPLOY-OPERATIONS.md`](../architecture/TRD-05-DEPLOY-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** ARM compose validates and restart policies tested.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-009 — Buat CI minimal quality gates

- **Status awal:** `todo`; **tujuan tunggal:** Run lint,typecheck,test,build dan security scan pada PR trusted
- **Dependensi:** `P1-002`, `P1-003`, `P1-005`.
- **Rujukan:** [`AGENTS.md`](../AGENTS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Pipeline fail when test/lint fails.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-010 — Kontrak fake external adapters

- **Status awal:** `todo`; **tujuan tunggal:** Fake GOWA, 9router, Neon/R2 fixtures for reproducible tests
- **Dependensi:** `P1-003`, `P1-006`.
- **Rujukan:** [`TRD-06-TEST-STRATEGY.md`](../architecture/TRD-06-TEST-STRATEGY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** No live secrets/network needed for unit/contracts.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-011 — Implementasi state health observability dasar

- **Status awal:** `todo`; **tujuan tunggal:** Per-request correlation ID, redacted errors, health heartbeat schema
- **Dependensi:** `P1-005`, `P1-006`.
- **Rujukan:** [`TRD-05-DEPLOY-OPERATIONS.md`](../architecture/TRD-05-DEPLOY-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Secret, PII, image, raw WA payload absent from logs.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P1-012 — Commit manifest sumber visual

- **Status awal:** `todo`; **tujuan tunggal:** Include guides/previews and automated source ID inventory scripts
- **Dependensi:** `P0-010`, `P1-001`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** All screen IDs paired with original mobile/web references.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

