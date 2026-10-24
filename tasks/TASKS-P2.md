# TASKS-P2 — Identity, RBAC, cross-tenant security and registration

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P2-001 — Schema profil dan role

- **Status awal:** `todo`; **tujuan tunggal:** Buat profiles, role grants, unique owner and DB constraints tanpa modifikasi neon_auth schema
- **Dependensi:** `P1-007`.
- **Rujukan:** [`TRD-01-DATA-MODEL.md`](../architecture/TRD-01-DATA-MODEL.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Migration tests and zero public superuser assignments.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-002 — Middleware autentikasi sesi di Edge

- **Status awal:** `todo`; **tujuan tunggal:** Sesi terverifikasi + revoked session denied untuk semua /api private
- **Dependensi:** `P1-005`, `P0-005`, `P2-001`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Anonymous, expired, invalid user impersonation rejected.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-003 — Enforce tenant RLS from trusted auth

- **Status awal:** `todo`; **tujuan tunggal:** RLS default-deny pada DB runtime credential, same-user FK guards
- **Dependensi:** `P2-002`.
- **Rujukan:** [`TRD-01-DATA-MODEL.md`](../architecture/TRD-01-DATA-MODEL.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Two-user hostile SQL/API tests no cross-tenant read/write.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-004 — Middleware role RBAC default deny

- **Status awal:** `todo`; **tujuan tunggal:** Authorized scopes by role across API and design-specific admin/system routes
- **Dependensi:** `P2-002`, `P2-003`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** User cannot elevate role or access /admin,/system; admin cannot access ledger user.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-005 — Secure superuser bootstrap + operator MFA

- **Status awal:** `todo`; **tujuan tunggal:** Create first superuser via one-time setup and enforced MFA for privileged operations
- **Dependensi:** `P2-001`, `P2-002`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** No public self-promotion; MFA required for elevated actions.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-006 — Login abuse/security middleware

- **Status awal:** `todo`; **tujuan tunggal:** Turnstile check, throttling, CSRF/origin guards and enumerations
- **Dependensi:** `P2-002`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Negative cases automated for brute force/session/cross origin.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-001 — Daftar publik dengan email dan password, disertai verifikasi email

- **Status awal:** `todo`; **tujuan tunggal:** Daftar publik dengan email dan password, disertai verifikasi email. Perilaku persis mengikuti IAM-001 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Daftar publik dengan email dan password, disertai verifikasi email" dari IAM-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-001-A dan AC-IAM-001-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Daftar publik dengan email dan password, disertai verifikasi email.", **maka** Akun baru selalu `user`, status belum terverifikasi dibatasi, password disimpan oleh provider auth tepercaya. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-002 — Login, logout, lupa password, reset password, ganti email, verifikasi ulang email

- **Status awal:** `todo`; **tujuan tunggal:** Login, logout, lupa password, reset password, ganti email, verifikasi ulang email. Perilaku persis mengikuti IAM-002 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Login, logout, lupa password, reset password, ganti email, verifikasi ulang email" dari IAM-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-002-A dan AC-IAM-002-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Login, logout, lupa password, reset password, ganti email, verifikasi ulang email.", **maka** Sesi lama yang relevan dapat dicabut setelah tindakan keamanan kritis. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-003 — Pilihan login federasi Google jika konfigurasi OAuth diaktifkan

- **Status awal:** `todo`; **tujuan tunggal:** Pilihan login federasi Google jika konfigurasi OAuth diaktifkan. Perilaku persis mengikuti IAM-003 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pilihan login federasi Google jika konfigurasi OAuth diaktifkan" dari IAM-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-003-A dan AC-IAM-003-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Pilihan login federasi Google jika konfigurasi OAuth diaktifkan.", **maka** Akun dapat ditautkan tanpa duplikasi identitas; konflik email ditangani aman. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-004 — Session management mandiri: daftar perangkat aktif, revoke sesi, logout semua perangkat

- **Status awal:** `todo`; **tujuan tunggal:** Session management mandiri: daftar perangkat aktif, revoke sesi, logout semua perangkat. Perilaku persis mengikuti IAM-004 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Session management mandiri: daftar perangkat aktif, revoke sesi, logout semua perangkat" dari IAM-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-004-A dan AC-IAM-004-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Session management mandiri: daftar perangkat aktif, revoke sesi, logout semua perangkat.", **maka** Operasi tidak membocorkan token atau rincian autentikasi. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-005 — Perlindungan pendaftaran/login: rate limit, Turnstile bila perlu, pencegahan enumerasi email

- **Status awal:** `todo`; **tujuan tunggal:** Perlindungan pendaftaran/login: rate limit, Turnstile bila perlu, pencegahan enumerasi email. Perilaku persis mengikuti IAM-005 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Perlindungan pendaftaran/login: rate limit, Turnstile bila perlu, pencegahan enumerasi email" dari IAM-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-005-A dan AC-IAM-005-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Perlindungan pendaftaran/login: rate limit, Turnstile bila perlu, pencegahan enumerasi email.", **maka** Pesan kesalahan tidak memberitahu penyerang apakah alamat email telah terdaftar. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-006 — Onboarding: zona waktu, mata uang dasar, nama panggilan, siklus keuangan, preferensi AI/WA, budget awal

- **Status awal:** `todo`; **tujuan tunggal:** Onboarding: zona waktu, mata uang dasar, nama panggilan, siklus keuangan, preferensi AI/WA, budget awal. Perilaku persis mengikuti IAM-006 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Onboarding: zona waktu, mata uang dasar, nama panggilan, siklus keuangan, preferensi AI/WA, budget awal" dari IAM-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-006-A dan AC-IAM-006-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Onboarding: zona waktu, mata uang dasar, nama panggilan, siklus keuangan, preferensi AI/WA, budget awal.", **maka** Semua pilihan dapat diubah kemudian; jangan memaksa input sensitif selain yang diperlukan. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-007 — Pengelolaan profil: nama tampilan, foto opsional, bahasa, tema, zona waktu, notifikasi

- **Status awal:** `todo`; **tujuan tunggal:** Pengelolaan profil: nama tampilan, foto opsional, bahasa, tema, zona waktu, notifikasi. Perilaku persis mengikuti IAM-007 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengelolaan profil: nama tampilan, foto opsional, bahasa, tema, zona waktu, notifikasi" dari IAM-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-007-A dan AC-IAM-007-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Pengelolaan profil: nama tampilan, foto opsional, bahasa, tema, zona waktu, notifikasi.", **maka** Perubahan tersimpan dan tidak mengubah kepemilikan transaksi. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-008 — Peran akses platform 3 tingkat; otorisasi server-side untuk tiap operasi

- **Status awal:** `todo`; **tujuan tunggal:** Peran akses platform 3 tingkat; otorisasi server-side untuk tiap operasi. Perilaku persis mengikuti IAM-008 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Peran akses platform 3 tingkat; otorisasi server-side untuk tiap operasi" dari IAM-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-008-A dan AC-IAM-008-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Peran akses platform 3 tingkat; otorisasi server-side untuk tiap operasi.", **maka** Default-deny, bukan sekadar sembunyi menu UI. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-009 — Hanya Superuser dapat mengangkat/menurunkan Admin; role Superuser tidak bisa diperoleh melalui register/API publik

- **Status awal:** `todo`; **tujuan tunggal:** Hanya Superuser dapat mengangkat/menurunkan Admin; role Superuser tidak bisa diperoleh melalui register/API publik. Perilaku persis mengikuti IAM-009 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Hanya Superuser dapat mengangkat/menurunkan Admin; role Superuser tidak bisa diperoleh melalui register/API publik" dari IAM-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-009-A dan AC-IAM-009-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Hanya Superuser dapat mengangkat/menurunkan Admin; role Superuser tidak bisa diperoleh melalui register/API publik.", **maka** Kenaikan role membutuhkan autentikasi ulang dan audit. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-010 — Superuser pertama dibuat melalui bootstrap terkontrol dengan kredensial aman

- **Status awal:** `todo`; **tujuan tunggal:** Superuser pertama dibuat melalui bootstrap terkontrol dengan kredensial aman. Perilaku persis mengikuti IAM-010 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Superuser pertama dibuat melalui bootstrap terkontrol dengan kredensial aman" dari IAM-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-010-A dan AC-IAM-010-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Superuser pertama dibuat melalui bootstrap terkontrol dengan kredensial aman.", **maka** Tidak ada akun default/password hard-coded publik. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-011 — Suspensi, penonaktifan, pemulihan status akun dengan alasan dan jalur keberatan

- **Status awal:** `todo`; **tujuan tunggal:** Suspensi, penonaktifan, pemulihan status akun dengan alasan dan jalur keberatan. Perilaku persis mengikuti IAM-011 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Suspensi, penonaktifan, pemulihan status akun dengan alasan dan jalur keberatan" dari IAM-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-011-A dan AC-IAM-011-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Suspensi, penonaktifan, pemulihan status akun dengan alasan dan jalur keberatan.", **maka** Admin dapat menangani kebijakan, tetapi tidak menghapus ledger tanpa dasar/prosedur. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-012 — Identitas WhatsApp melalui proses pengikatan dan pembuktian kendali nomor/sesi

- **Status awal:** `todo`; **tujuan tunggal:** Identitas WhatsApp melalui proses pengikatan dan pembuktian kendali nomor/sesi. Perilaku persis mengikuti IAM-012 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Identitas WhatsApp melalui proses pengikatan dan pembuktian kendali nomor/sesi" dari IAM-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-012-A dan AC-IAM-012-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Identitas WhatsApp melalui proses pengikatan dan pembuktian kendali nomor/sesi.", **maka** Nomor tidak dapat diam-diam ditautkan ke dua akun aktif tanpa penyelesaian konflik aman. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-IAM-013 — Permintaan export/delete akun dan seluruh datanya secara mandiri

- **Status awal:** `todo`; **tujuan tunggal:** Permintaan export/delete akun dan seluruh datanya secara mandiri. Perilaku persis mengikuti IAM-013 (bukan ilustrasi statis).
- **Dependensi:** `P2-002`.
- **Rujukan:** [`REQ-01-PRODUCT-IAM.md`](../requirements/REQ-01-PRODUCT-IAM.md#iam-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Permintaan export/delete akun dan seluruh datanya secara mandiri" dari IAM-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-IAM-013-A dan AC-IAM-013-B yang relevan: **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Permintaan export/delete akun dan seluruh datanya secara mandiri.", **maka** Harus dibuktikan oleh user login dan melewati konfirmasi risiko tindakan. Negative/boundary: Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-TRUST-001 — Pemisahan tenant/user pada semua catatan, object storage, job AI dan WA

- **Status awal:** `todo`; **tujuan tunggal:** Pemisahan tenant/user pada semua catatan, object storage, job AI dan WA. Perilaku persis mengikuti TRUST-001 (bukan ilustrasi statis).
- **Dependensi:** `P2-004`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pemisahan tenant/user pada semua catatan, object storage, job AI dan WA" dari TRUST-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-001-A dan AC-TRUST-001-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Pemisahan tenant/user pada semua catatan, object storage, job AI dan WA.", **maka** Akses lintas pemilik ditolak pada server dan lapisan data. Negative/boundary: A mengakses ID transaksi atau object R2 B → selalu ditolak, termasuk ketika file URL lama atau role operator dipakai. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-TRUST-002 — Pengelolaan identitas dan RBAC default-deny

- **Status awal:** `todo`; **tujuan tunggal:** Pengelolaan identitas dan RBAC default-deny. Perilaku persis mengikuti TRUST-002 (bukan ilustrasi statis).
- **Dependensi:** `P2-004`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengelolaan identitas dan RBAC default-deny" dari TRUST-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-002-A dan AC-TRUST-002-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Pengelolaan identitas dan RBAC default-deny.", **maka** Privilege platform tidak memberi akses otomatis ke ledger personal. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-TRUST-004 — Secret server-only untuk GOWA, 9router, Neon dan Cloudflare Access

- **Status awal:** `todo`; **tujuan tunggal:** Secret server-only untuk GOWA, 9router, Neon dan Cloudflare Access. Perilaku persis mengikuti TRUST-004 (bukan ilustrasi statis).
- **Dependensi:** `P2-004`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Secret server-only untuk GOWA, 9router, Neon dan Cloudflare Access" dari TRUST-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-004-A dan AC-TRUST-004-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Secret server-only untuk GOWA, 9router, Neon dan Cloudflare Access.", **maka** API key/token tidak dimasukkan ke PWA, URL publik, log, atau repository. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-TRUST-011 — Keamanan autentikasi, MFA admin, revocation session, dan catatan login

- **Status awal:** `todo`; **tujuan tunggal:** Keamanan autentikasi, MFA admin, revocation session, dan catatan login. Perilaku persis mengikuti TRUST-011 (bukan ilustrasi statis).
- **Dependensi:** `P2-004`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Keamanan autentikasi, MFA admin, revocation session, dan catatan login" dari TRUST-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-011-A dan AC-TRUST-011-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Keamanan autentikasi, MFA admin, revocation session, dan catatan login.", **maka** Penyerang tidak bisa memulihkan akun hanya dari nomor WA. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P2-TRUST-012 — Anti-enumeration, rate limit, upload validation, bot protection

- **Status awal:** `todo`; **tujuan tunggal:** Anti-enumeration, rate limit, upload validation, bot protection. Perilaku persis mengikuti TRUST-012 (bukan ilustrasi statis).
- **Dependensi:** `P2-004`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Anti-enumeration, rate limit, upload validation, bot protection" dari TRUST-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-012-A dan AC-TRUST-012-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Anti-enumeration, rate limit, upload validation, bot protection.", **maka** Daftar publik tidak menjadi saluran spam/penyebaran malware. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

