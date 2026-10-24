# TASKS-P6 — Armbian Finance Worker, durable queue, access and recovery

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P6-001 — Finance Worker ARM runtime

- **Status awal:** `todo`; **tujuan tunggal:** Deploy Node24 entrypoint, healthcheck, startup/restart and shutdown hooks
- **Dependensi:** `P1-008`, `P1-006`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Health/restart tested; no in-memory-only critical job.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P6-002 — Durable jobs / leases and outbox

- **Status awal:** `todo`; **tujuan tunggal:** Persist job state, claim leases, retries, dedup and crash recovery
- **Dependensi:** `P6-001`, `P3-001`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Kill worker mid-job; restart processes exactly once side effect.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P6-003 — Cloudflare Access bridge client

- **Status awal:** `todo`; **tujuan tunggal:** Edge to Armbian Finance Worker via authenticated `gowa.venlab.tech/internal/v1/jobs/notify` path ingress + Access + HMAC + replay guard; negative path-bypass tests
- **Dependensi:** `P6-001`, `P0-007`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** 403 bad service token, happy path and replay rejected.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P6-004 — GOWA local signed webhook receiver

- **Status awal:** `todo`; **tujuan tunggal:** HMAC signature verified, durable inbox and source session owner mapping
- **Dependensi:** `P6-001`, `P6-002`, `P0-003`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Invalid sig discarded; replay produces one inbox item.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P6-005 — Build event driven scheduler

- **Status awal:** `todo`; **tujuan tunggal:** Timezone-aware next delivery and quiet hours; missed schedules recovered
- **Dependensi:** `P6-002`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Restart before reminder sends once, quiet hours honored.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P6-006 — Backups and restore rehearsal

- **Status awal:** `todo`; **tujuan tunggal:** Neon/R2/Worker secrets session backup encrypted and restore on isolated test env
- **Dependensi:** `P6-001`, `P5-003`.
- **Rujukan:** [`TRD-05-DEPLOY-OPERATIONS.md`](../architecture/TRD-05-DEPLOY-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Restore tests with balance/hash invariants and no production overwrite.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P6-TRUST-005 — Semua komunikasi internet dengan HTTPS dan autentikasi server-to-server

- **Status awal:** `todo`; **tujuan tunggal:** Semua komunikasi internet dengan HTTPS dan autentikasi server-to-server. Perilaku persis mengikuti TRUST-005 (bukan ilustrasi statis).
- **Dependensi:** `P6-002`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Semua komunikasi internet dengan HTTPS dan autentikasi server-to-server" dari TRUST-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-005-A dan AC-TRUST-005-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Semua komunikasi internet dengan HTTPS dan autentikasi server-to-server.", **maka** Tunnel bukan pengganti kontrol akses aplikasi. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P6-TRUST-014 — Backup & restore terenkripsi, diuji, dan mengikuti lifecycle penghapusan

- **Status awal:** `todo`; **tujuan tunggal:** Backup & restore terenkripsi, diuji, dan mengikuti lifecycle penghapusan. Perilaku persis mengikuti TRUST-014 (bukan ilustrasi statis).
- **Dependensi:** `P6-006`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-014), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Backup & restore terenkripsi, diuji, dan mengikuti lifecycle penghapusan" dari TRUST-014; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-014-A dan AC-TRUST-014-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Backup & restore terenkripsi, diuji, dan mengikuti lifecycle penghapusan.", **maka** Recovery tidak menghidupkan kembali data user terhapus secara tidak sah. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

