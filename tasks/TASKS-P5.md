# TASKS-P5 — Offline, privacy, import/export and object storage

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P5-001 — Implement offline queue data contracts

- **Status awal:** `todo`; **tujuan tunggal:** Create Dexie scoped per user/device, stable mutation id and sync states
- **Dependensi:** `P1-006`, `P2-002`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Offline create then reload retains queued mutation.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-002 — Implement sync replay idempotency + conflict

- **Status awal:** `todo`; **tujuan tunggal:** Sync mutation stable id, server uniqueness and per-version conflict UX
- **Dependensi:** `P5-001`, `P3-002`.
- **Rujukan:** [`TRD-02-API-CONTRACTS.md`](../architecture/TRD-02-API-CONTRACTS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Airplane→online replay posts once; 409 conflict view resolvable.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-003 — Implement R2 private proof flow

- **Status awal:** `todo`; **tujuan tunggal:** Signed upload and read with owner authorization, file integrity and expiry
- **Dependensi:** `P2-003`, `P0-008`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** User B cannot access user A object; rejected large/MIME spoof.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-004 — Implement export jobs and download

- **Status awal:** `todo`; **tujuan tunggal:** Export owner CSV/JSON including schema versions + secure download
- **Dependensi:** `P3-003`, `P5-003`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Re-importable export, no cross tenant, expiry enforced.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-005 — Implement delete request workflow

- **Status awal:** `todo`; **tujuan tunggal:** Reauth user, revoke session/integrations, lifecycle-delete objects, report progress
- **Dependensi:** `P2-002`, `P5-004`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Timebound request status; deletion and backup retention documented.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-006 — Implement privacy consent lifecycle

- **Status awal:** `todo`; **tujuan tunggal:** Opt-in change, revoke blocked processing, proof retention ownership
- **Dependensi:** `P2-002`, `P5-003`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Consent revoke blocks pending processing and future sends.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-UX-007 — 'Share to PWA' dari aplikasi lain pada browser yang mendukung

- **Status awal:** `todo`; **tujuan tunggal:** 'Share to PWA' dari aplikasi lain pada browser yang mendukung. Perilaku persis mengikuti UX-007 (bukan ilustrasi statis).
- **Dependensi:** `P5-002`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "'Share to PWA' dari aplikasi lain pada browser yang mendukung" dari UX-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-007-A dan AC-UX-007-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "'Share to PWA' dari aplikasi lain pada browser yang mendukung.", **maka** Jika browser tidak mendukung Share Target, upload file biasa tetap bekerja. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-UX-009-01 — Draft offline dapat disimpan

- **Status awal:** `todo`; **tujuan tunggal:** Draft offline dapat disimpan. Perilaku persis mengikuti UX-009 (bukan ilustrasi statis).
- **Dependensi:** `P5-002`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Draft offline dapat disimpan" dari UX-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-009-A dan AC-UX-009-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Sinkronisasi offline-first untuk input manual dan draft perubahan.", **maka** Antrean punya status offline, syncing, synced, conflict; no silent data loss. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-UX-009-02 — Status sinkron dan resolusi konflik

- **Status awal:** `todo`; **tujuan tunggal:** Status sinkron dan resolusi konflik. Perilaku persis mengikuti UX-009 (bukan ilustrasi statis).
- **Dependensi:** `P5-UX-009-01`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Status sinkron dan resolusi konflik" dari UX-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-009-A dan AC-UX-009-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Sinkronisasi offline-first untuk input manual dan draft perubahan.", **maka** Antrean punya status offline, syncing, synced, conflict; no silent data loss. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-UX-015-01 — Unduh ekspor milik sendiri

- **Status awal:** `todo`; **tujuan tunggal:** Unduh ekspor milik sendiri. Perilaku persis mengikuti UX-015 (bukan ilustrasi statis).
- **Dependensi:** `P5-002`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Unduh ekspor milik sendiri" dari UX-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-015-A dan AC-UX-015-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Ekspor laporan, impor terverifikasi, unduh bukti, dan permintaan hapus akun.", **maka** Tindakan mudah ditemukan di menu data dan privasi. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-UX-015-02 — Impor melalui review

- **Status awal:** `todo`; **tujuan tunggal:** Impor melalui review. Perilaku persis mengikuti UX-015 (bukan ilustrasi statis).
- **Dependensi:** `P5-UX-015-01`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Impor melalui review" dari UX-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-015-A dan AC-UX-015-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Ekspor laporan, impor terverifikasi, unduh bukti, dan permintaan hapus akun.", **maka** Tindakan mudah ditemukan di menu data dan privasi. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-UX-015-03 — Hapus akun dan status

- **Status awal:** `todo`; **tujuan tunggal:** Hapus akun dan status. Perilaku persis mengikuti UX-015 (bukan ilustrasi statis).
- **Dependensi:** `P5-UX-015-02`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Hapus akun dan status" dari UX-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-015-A dan AC-UX-015-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Ekspor laporan, impor terverifikasi, unduh bukti, dan permintaan hapus akun.", **maka** Tindakan mudah ditemukan di menu data dan privasi. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-TRUST-003 — R2 storage private; file hanya tersedia kepada pemilik dengan autorisasi dan masa akses terbatas

- **Status awal:** `todo`; **tujuan tunggal:** R2 storage private; file hanya tersedia kepada pemilik dengan autorisasi dan masa akses terbatas. Perilaku persis mengikuti TRUST-003 (bukan ilustrasi statis).
- **Dependensi:** `P5-002`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "R2 storage private; file hanya tersedia kepada pemilik dengan autorisasi dan masa akses terbatas" dari TRUST-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-003-A dan AC-TRUST-003-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "R2 storage private; file hanya tersedia kepada pemilik dengan autorisasi dan masa akses terbatas.", **maka** Tidak ada bucket public untuk struk atau QR pribadi. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-TRUST-006-01 — Consent WA per mode dan chat scope

- **Status awal:** `todo`; **tujuan tunggal:** Consent WA per mode dan chat scope. Perilaku persis mengikuti TRUST-006 (bukan ilustrasi statis).
- **Dependensi:** `P5-006`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Consent WA per mode dan chat scope" dari TRUST-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-006-A dan AC-TRUST-006-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Consent terpisah untuk koneksi WhatsApp, reminder, unggah bukti, dan pengiriman data ke provider Vision upstream.", **maka** User dapat menolak tiap modul tanpa kehilangan pencatatan manual. Negative/boundary: Cabut consent AI saat job pending mencegah pemrosesan berikutnya dan membatalkan antrean yang masih dapat dibatalkan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-TRUST-006-02 — Consent gambar/provider AI

- **Status awal:** `todo`; **tujuan tunggal:** Consent gambar/provider AI. Perilaku persis mengikuti TRUST-006 (bukan ilustrasi statis).
- **Dependensi:** `P5-TRUST-006-01`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Consent gambar/provider AI" dari TRUST-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-006-A dan AC-TRUST-006-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Consent terpisah untuk koneksi WhatsApp, reminder, unggah bukti, dan pengiriman data ke provider Vision upstream.", **maka** User dapat menolak tiap modul tanpa kehilangan pencatatan manual. Negative/boundary: Cabut consent AI saat job pending mencegah pemrosesan berikutnya dan membatalkan antrean yang masih dapat dibatalkan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-TRUST-006-03 — Consent pengingat/notification

- **Status awal:** `todo`; **tujuan tunggal:** Consent pengingat/notification. Perilaku persis mengikuti TRUST-006 (bukan ilustrasi statis).
- **Dependensi:** `P5-TRUST-006-02`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Consent pengingat/notification" dari TRUST-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-006-A dan AC-TRUST-006-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Consent terpisah untuk koneksi WhatsApp, reminder, unggah bukti, dan pengiriman data ke provider Vision upstream.", **maka** User dapat menolak tiap modul tanpa kehilangan pencatatan manual. Negative/boundary: Cabut consent AI saat job pending mencegah pemrosesan berikutnya dan membatalkan antrean yang masih dapat dibatalkan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-TRUST-009 — Data minimization & retention

- **Status awal:** `todo`; **tujuan tunggal:** Data minimization & retention. Perilaku persis mengikuti TRUST-009 (bukan ilustrasi statis).
- **Dependensi:** `P5-006`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Data minimization & retention" dari TRUST-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-009-A dan AC-TRUST-009-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Data minimization & retention.", **maka** Hanya simpan field yang dibutuhkan; ada masa retensi dan penghapusan file bukti/log. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-TRUST-010-01 — Hak akses/koreksi/unduh data

- **Status awal:** `todo`; **tujuan tunggal:** Hak akses/koreksi/unduh data. Perilaku persis mengikuti TRUST-010 (bukan ilustrasi statis).
- **Dependensi:** `P5-006`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Hak akses/koreksi/unduh data" dari TRUST-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-010-A dan AC-TRUST-010-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Hak melihat, koreksi, unduh, portabilitas, hapus, dan tarik izin.", **maka** Permintaan mandiri tersedia di PWA, dengan status pemrosesan. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-TRUST-010-02 — Permintaan hapus dan cabut izin

- **Status awal:** `todo`; **tujuan tunggal:** Permintaan hapus dan cabut izin. Perilaku persis mengikuti TRUST-010 (bukan ilustrasi statis).
- **Dependensi:** `P5-TRUST-010-01`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Permintaan hapus dan cabut izin" dari TRUST-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-010-A dan AC-TRUST-010-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Hak melihat, koreksi, unduh, portabilitas, hapus, dan tarik izin.", **maka** Permintaan mandiri tersedia di PWA, dengan status pemrosesan. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-TRUST-018 — Proteksi privasi offline cache/perangkat bersama

- **Status awal:** `todo`; **tujuan tunggal:** Proteksi privasi offline cache/perangkat bersama. Perilaku persis mengikuti TRUST-018 (bukan ilustrasi statis).
- **Dependensi:** `P5-006`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-018), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Proteksi privasi offline cache/perangkat bersama" dari TRUST-018; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-018-A dan AC-TRUST-018-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Proteksi privasi offline cache/perangkat bersama.", **maka** Logout/ganti akun membersihkan data pribadi user sebelumnya dari tampilan/caches yang relevan. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-007 — Connect import/export UI with real API

- **Status awal:** `todo`; **tujuan tunggal:** SET-12/13/14 and status/progress linked to export/import API
- **Dependensi:** `P5-004`, `P5-005`, `P4-SCREEN-SET-12`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Interactive audit fixture, no demo data shown live.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P5-008 — Close offline UI status loop

- **Status awal:** `todo`; **tujuan tunggal:** SET-18 and transaction creation show local/synced/failed separately
- **Dependensi:** `P5-002`, `P4-SCREEN-SET-18`.
- **Rujukan:** [`DESIGN-03-INTERACTIONS-RESPONSIVE.md`](../design/DESIGN-03-INTERACTIONS-RESPONSIVE.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Airplane mode and conflict session verified on mobile browser.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

