# TASKS-P10 — Production hardening, performance and go/no-go

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P10-001 — Production threat model and penetration test

- **Status awal:** `todo`; **tujuan tunggal:** Execute OWASP/RLS/access/WA/AI adversarial tests in staging
- **Dependensi:** `P9-002`, `P8-004`, `P7-004`.
- **Rujukan:** [`TRD-06-TEST-STRATEGY.md`](../architecture/TRD-06-TEST-STRATEGY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** No unresolved critical or high security finding.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-002 — Performance and quota load test

- **Status awal:** `todo`; **tujuan tunggal:** Verify browser/API speed and Armbian sustained sessions under measured load
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Performance evidence with actual hardware and risk limits.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-003 — Visual QA full 90 x 2

- **Status awal:** `todo`; **tujuan tunggal:** Pixel-aware review of 180 original screens at responsive widths/dark/ID-EN
- **Dependensi:** `P4-004`, `P8-004`, `P9-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Before/after screenshots with approved deviations for all 90 screen IDs.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-004 — Recoverability release rehearsal

- **Status awal:** `todo`; **tujuan tunggal:** Rehearse failed deploy, rollback, DB restore, GOWA/tunnel outage
- **Dependensi:** `P6-006`, `P10-001`.
- **Rujukan:** [`TRD-05-DEPLOY-OPERATIONS.md`](../architecture/TRD-05-DEPLOY-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Actual restore and rollback reports with objective assertions.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-005 — Review public legal/policy and permission gates

- **Status awal:** `todo`; **tujuan tunggal:** Verify Terms, privacy, contact, consent, sender policies and legal approval
- **Dependensi:** `P7-004`, `P5-005`.
- **Rujukan:** [`DECISION-LOG.md`](../research/DECISION-LOG.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Explicit approval/NO GO; no unchecked public registration.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-006 — Production launch decision checkpoint

- **Status awal:** `todo`; **tujuan tunggal:** Check 177 AC IDs, 90 screens, QA evidence and owner authorization
- **Dependensi:** `P10-002`, `P10-003`, `P10-004`, `P10-005`.
- **Rujukan:** [`ACCEPTANCE-MATRIX.md`](../qa/ACCEPTANCE-MATRIX.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Gate sheet signed, no unresolved P0 blockers, launch only with permission.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-PROD-001 — Dapat digunakan banyak pengguna terdaftar dengan isolasi data yang ketat

- **Status awal:** `todo`; **tujuan tunggal:** Dapat digunakan banyak pengguna terdaftar dengan isolasi data yang ketat. Perilaku persis mengikuti PROD-001 (bukan ilustrasi statis).
- **Dependensi:** `P10-005`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#prod-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Dapat digunakan banyak pengguna terdaftar dengan isolasi data yang ketat" dari PROD-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-PROD-001-A dan AC-PROD-001-B yang relevan: **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Dapat digunakan banyak pengguna terdaftar dengan isolasi data yang ketat.", **maka** Semua objek privat scoped terhadap pemiliknya; uji lintas akun 100% ditolak. Negative/boundary: Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-PROD-002 — Pengeluaran/pemasukan mudah dicatat dengan teks, nominal, foto, atau WA

- **Status awal:** `todo`; **tujuan tunggal:** Pengeluaran/pemasukan mudah dicatat dengan teks, nominal, foto, atau WA. Perilaku persis mengikuti PROD-002 (bukan ilustrasi statis).
- **Dependensi:** `P10-005`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#prod-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengeluaran/pemasukan mudah dicatat dengan teks, nominal, foto, atau WA" dari PROD-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-PROD-002-A dan AC-PROD-002-B yang relevan: **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Pengeluaran/pemasukan mudah dicatat dengan teks, nominal, foto, atau WA.", **maka** Pengguna baru dapat membuat transaksi manual sah tanpa AI/WA dalam <=30 detik setelah login. Negative/boundary: Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-PROD-003 — Anggaran secara real-time menunjukkan sisa kategori, keseluruhan, dan tren

- **Status awal:** `todo`; **tujuan tunggal:** Anggaran secara real-time menunjukkan sisa kategori, keseluruhan, dan tren. Perilaku persis mengikuti PROD-003 (bukan ilustrasi statis).
- **Dependensi:** `P10-005`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#prod-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Anggaran secara real-time menunjukkan sisa kategori, keseluruhan, dan tren" dari PROD-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-PROD-003-A dan AC-PROD-003-B yang relevan: **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Anggaran secara real-time menunjukkan sisa kategori, keseluruhan, dan tren.", **maka** Setiap perubahan transaksi terkonfirmasi langsung tercermin di sisa anggaran dan laporan. Negative/boundary: Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-PROD-004 — Pengingat mendorong kebiasaan tanpa mempermalukan

- **Status awal:** `todo`; **tujuan tunggal:** Pengingat mendorong kebiasaan tanpa mempermalukan. Perilaku persis mengikuti PROD-004 (bukan ilustrasi statis).
- **Dependensi:** `P10-005`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#prod-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengingat mendorong kebiasaan tanpa mempermalukan" dari PROD-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-PROD-004-A dan AC-PROD-004-B yang relevan: **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Pengingat mendorong kebiasaan tanpa mempermalukan.", **maka** Semua notifikasi non-keamanan opt-in/konfigurabel; dapat dijeda/dimatikan. Negative/boundary: Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-PROD-005 — AI tidak boleh merusak pembukuan

- **Status awal:** `todo`; **tujuan tunggal:** AI tidak boleh merusak pembukuan. Perilaku persis mengikuti PROD-005 (bukan ilustrasi statis).
- **Dependensi:** `P10-005`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#prod-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "AI tidak boleh merusak pembukuan" dari PROD-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-PROD-005-A dan AC-PROD-005-B yang relevan: **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "AI tidak boleh merusak pembukuan.", **maka** Hasil ambigu/provisional tetap dapat dikoreksi; tidak ada perubahan nominal diam-diam. Negative/boundary: Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-PROD-006 — Produk tetap berguna selama gangguan integrasi

- **Status awal:** `todo`; **tujuan tunggal:** Produk tetap berguna selama gangguan integrasi. Perilaku persis mengikuti PROD-006 (bukan ilustrasi statis).
- **Dependensi:** `P10-005`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#prod-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Produk tetap berguna selama gangguan integrasi" dari PROD-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-PROD-006-A dan AC-PROD-006-B yang relevan: **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Produk tetap berguna selama gangguan integrasi.", **maka** Pencatatan manual online tersedia walau WA/AI offline; draft offline antre tanpa hilang. Negative/boundary: Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-PROD-007 — Platform siap untuk demo/lomba, namun dapat dioperasikan sebagai produk publik

- **Status awal:** `todo`; **tujuan tunggal:** Platform siap untuk demo/lomba, namun dapat dioperasikan sebagai produk publik. Perilaku persis mengikuti PROD-007 (bukan ilustrasi statis).
- **Dependensi:** `P10-005`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#prod-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Platform siap untuk demo/lomba, namun dapat dioperasikan sebagai produk publik" dari PROD-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-PROD-007-A dan AC-PROD-007-B yang relevan: **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Platform siap untuk demo/lomba, namun dapat dioperasikan sebagai produk publik.", **maka** Landing page, onboarding, panel admin, kebijakan privasi, ekspor data, audit, dan pengujian rilis terpenuhi. Negative/boundary: Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-001 — Keamanan isolasi tenant

- **Status awal:** `todo`; **tujuan tunggal:** Keamanan isolasi tenant. Perilaku persis mengikuti QUAL-001 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Keamanan isolasi tenant" dari QUAL-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-001-A dan AC-QUAL-001-B yang relevan: 0 pelanggaran pada suite uji lintas user, berbagai ID, gambar, dan device WA. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-002 — Tidak ada pengeluaran dobel dari retry

- **Status awal:** `todo`; **tujuan tunggal:** Tidak ada pengeluaran dobel dari retry. Perilaku persis mengikuti QUAL-002 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Tidak ada pengeluaran dobel dari retry" dari QUAL-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-002-A dan AC-QUAL-002-B yang relevan: 0 duplicate posting untuk input yang sama dari webhook, upload ulang dan pemulihan job. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-003 — Konsistensi perhitungan uang

- **Status awal:** `todo`; **tujuan tunggal:** Konsistensi perhitungan uang. Perilaku persis mengikuti QUAL-003 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Konsistensi perhitungan uang" dari QUAL-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-003-A dan AC-QUAL-003-B yang relevan: 100% pada tes invariant: transfer, split, refund, utang, dan budget periodik. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-004 — Tersedia fallback manual saat WA/AI gangguan

- **Status awal:** `todo`; **tujuan tunggal:** Tersedia fallback manual saat WA/AI gangguan. Perilaku persis mengikuti QUAL-004 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Tersedia fallback manual saat WA/AI gangguan" dari QUAL-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-004-A dan AC-QUAL-004-B yang relevan: 100% skenario fault injection tetap bisa mencatat manual online; draft offline dapat dibuat lokal. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-005 — Kecepatan input manual

- **Status awal:** `todo`; **tujuan tunggal:** Kecepatan input manual. Perilaku persis mengikuti QUAL-005 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kecepatan input manual" dari QUAL-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-005-A dan AC-QUAL-005-B yang relevan: Alur pengguna normal <=10 detik setelah kategori/dompet awal disiapkan (sasaran usability, diuji nyata). Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-006 — Kinerja web pada jaringan mobile rata-rata

- **Status awal:** `todo`; **tujuan tunggal:** Kinerja web pada jaringan mobile rata-rata. Perilaku persis mengikuti QUAL-006 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kinerja web pada jaringan mobile rata-rata" dari QUAL-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-006-A dan AC-QUAL-006-B yang relevan: LCP halaman utama <=2.5 detik p75 untuk kondisi uji yang terdokumentasi; jika infra free-tier menjadikan target belum realistis, dokumentasikan deviasi dan perbaikan. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-007 — Latensi API non-AI

- **Status awal:** `todo`; **tujuan tunggal:** Latensi API non-AI. Perilaku persis mengikuti QUAL-007 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Latensi API non-AI" dari QUAL-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-007-A dan AC-QUAL-007-B yang relevan: Target p95 <=1.5 detik pada beban dan lokasi tes yang jelas, termasuk respons Neon; cold-start dihitung terpisah. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-008 — Keandalan web/API

- **Status awal:** `todo`; **tujuan tunggal:** Keandalan web/API. Perilaku persis mengikuti QUAL-008 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Keandalan web/API" dari QUAL-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-008-A dan AC-QUAL-008-B yang relevan: Target operasional >=99.0% bulanan untuk fitur inti, bukan SLA kontraktual dengan pengguna pada infrastruktur gratis. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-009 — Akurasi ekstraksi bukti

- **Status awal:** `todo`; **tujuan tunggal:** Akurasi ekstraksi bukti. Perilaku persis mengikuti QUAL-009 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Akurasi ekstraksi bukti" dari QUAL-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-009-A dan AC-QUAL-009-B yang relevan: Dataset struk/QRIS representatif; target >=90% total nominal benar, 100% conflict material masuk review. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-010 — Transparansi perubahan final

- **Status awal:** `todo`; **tujuan tunggal:** Transparansi perubahan final. Perilaku persis mengikuti QUAL-010 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Transparansi perubahan final" dari QUAL-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-010-A dan AC-QUAL-010-B yang relevan: Tidak ada nominal/jenis transaksi final yang diganti oleh AI tanpa konfirmasi/rekam audit. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-011 — Responsivitas web & aksesibilitas

- **Status awal:** `todo`; **tujuan tunggal:** Responsivitas web & aksesibilitas. Perilaku persis mengikuti QUAL-011 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Responsivitas web & aksesibilitas" dari QUAL-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-011-A dan AC-QUAL-011-B yang relevan: Uji mobile kecil/tablet/desktop, navigasi keyboard, target WCAG 2.2 AA. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-012 — Perilaku offline sinkron

- **Status awal:** `todo`; **tujuan tunggal:** Perilaku offline sinkron. Perilaku persis mengikuti QUAL-012 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Perilaku offline sinkron" dari QUAL-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-012-A dan AC-QUAL-012-B yang relevan: Input manual offline survives refresh dan tersinkron satu kali setelah online, atau muncul konflik yang dapat diselesaikan. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-013 — Keamanan kredensial

- **Status awal:** `todo`; **tujuan tunggal:** Keamanan kredensial. Perilaku persis mengikuti QUAL-013 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Keamanan kredensial" dari QUAL-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-013-A dan AC-QUAL-013-B yang relevan: Tidak ada secret pada client bundle, public repo, error log, R2 public, atau URL aksi GOWA. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-014 — Retensi/hak data berfungsi

- **Status awal:** `todo`; **tujuan tunggal:** Retensi/hak data berfungsi. Perilaku persis mengikuti QUAL-014 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-014), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Retensi/hak data berfungsi" dari QUAL-014; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-014-A dan AC-QUAL-014-B yang relevan: Export, revoke consent, penghapusan, dan audit lifecycle lolos tes sistem. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-015 — Ketahanan job & WA

- **Status awal:** `todo`; **tujuan tunggal:** Ketahanan job & WA. Perilaku persis mengikuti QUAL-015 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Ketahanan job & WA" dari QUAL-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-015-A dan AC-QUAL-015-B yang relevan: Reconnect, retry, idempotency, queue recovery diuji sesudah restart GOWA/Worker/Armbian. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-016 — Batas pemakaian platform

- **Status awal:** `todo`; **tujuan tunggal:** Batas pemakaian platform. Perilaku persis mengikuti QUAL-016 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-016), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Batas pemakaian platform" dari QUAL-016; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-016-A dan AC-QUAL-016-B yang relevan: Penggunaan Workers/Neon/R2/AI terpantau, ada peringatan sebelum melampaui free tier. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-017 — Pengelolaan rilis/rollback

- **Status awal:** `todo`; **tujuan tunggal:** Pengelolaan rilis/rollback. Perilaku persis mengikuti QUAL-017 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-017), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengelolaan rilis/rollback" dari QUAL-017; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-017-A dan AC-QUAL-017-B yang relevan: Perubahan release bermasalah bisa ditarik tanpa kehilangan ledger, dengan migrasi aman. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-018 — Pemulihan data

- **Status awal:** `todo`; **tujuan tunggal:** Pemulihan data. Perilaku persis mengikuti QUAL-018 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-018), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pemulihan data" dari QUAL-018; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-018-A dan AC-QUAL-018-B yang relevan: Backup terenkripsi, recovery procedure didokumentasi, restore diuji pada lingkungan terisolasi secara berkala. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-019 — Keamanan admin/superuser

- **Status awal:** `todo`; **tujuan tunggal:** Keamanan admin/superuser. Perilaku persis mengikuti QUAL-019 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-019), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Keamanan admin/superuser" dari QUAL-019; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-019-A dan AC-QUAL-019-B yang relevan: MFA, step-up, audit sensitive events, permission test wajib sebelum publik. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-020 — Perbedaan status hari

- **Status awal:** `todo`; **tujuan tunggal:** Perbedaan status hari. Perilaku persis mengikuti QUAL-020 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-020), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Perbedaan status hari" dari QUAL-020; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-020-A dan AC-QUAL-020-B yang relevan: Hari tidak dilaporkan, nihil, sebagian dicatat, dan selesai bisa dibedakan pada semua kanal. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-021 — Perlindungan dari salah kategori AI

- **Status awal:** `todo`; **tujuan tunggal:** Perlindungan dari salah kategori AI. Perilaku persis mengikuti QUAL-021 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-021), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Perlindungan dari salah kategori AI" dari QUAL-021; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-021-A dan AC-QUAL-021-B yang relevan: User dapat memperbaiki kategori tanpa mengubah nominal kecuali sengaja; data training adaptif tidak membocorkan preferensi user lain. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-022 — Keamanan integrasi provider

- **Status awal:** `todo`; **tujuan tunggal:** Keamanan integrasi provider. Perilaku persis mengikuti QUAL-022 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-022), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Keamanan integrasi provider" dari QUAL-022; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-022-A dan AC-QUAL-022-B yang relevan: HTTP 429, 500, timeout, schema invalid, loss of vision forwarding tidak menyebabkan hang atau data silang. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-023 — Kejelasan pemasaran

- **Status awal:** `todo`; **tujuan tunggal:** Kejelasan pemasaran. Perilaku persis mengikuti QUAL-023 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-023), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kejelasan pemasaran" dari QUAL-023; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-023-A dan AC-QUAL-023-B yang relevan: Landing, terms dan UX tidak mengklaim bank integration, blokir QRIS, atau WhatsApp API resmi. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P10-QUAL-024 — Privasi operasional

- **Status awal:** `todo`; **tujuan tunggal:** Privasi operasional. Perilaku persis mengikuti QUAL-024 (bukan ilustrasi statis).
- **Dependensi:** `P10-001`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md#qual-024), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Privasi operasional" dari QUAL-024; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-QUAL-024-A dan AC-QUAL-024-B yang relevan: Telemetry/dashboard platform menunjukkan agregat, bukan raw isi transaksi/chat. Negative/boundary: Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

