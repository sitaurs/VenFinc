# TASKS-P9 — Admin, superuser, policies and operational visibility

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P9-001 — Operator data projections

- **Status awal:** `todo`; **tujuan tunggal:** Aggregate non-PII metrics, health and job metadata from permitted events
- **Dependensi:** `P6-002`, `P2-004`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Admin cannot access raw user ledger or image/chat payload.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-002 — Policy/config change audit

- **Status awal:** `todo`; **tujuan tunggal:** Append-only operational audit, feature flag changes owner review & rollback
- **Dependensi:** `P9-001`, `P2-005`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Audited dangerous operator actions with step-up.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-001 — Dashboard kesehatan: jumlah pengguna aktif, rate error, status gateway, antrean AI, status worker, pemakaian kuota

- **Status awal:** `todo`; **tujuan tunggal:** Dashboard kesehatan: jumlah pengguna aktif, rate error, status gateway, antrean AI, status worker, pemakaian kuota. Perilaku persis mengikuti OPS-001 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Dashboard kesehatan: jumlah pengguna aktif, rate error, status gateway, antrean AI, status worker, pemakaian kuota" dari OPS-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-001-A dan AC-OPS-001-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Dashboard kesehatan: jumlah pengguna aktif, rate error, status gateway, antrean AI, status worker, pemakaian kuota.", **maka** Metrik agregat, tanpa transaksi/struk/chat raw. Negative/boundary: Dashboard admin hanya memperlihatkan jumlah akun, job, dan kesehatan; tidak dapat membuka saldo, struk, atau chat pengguna. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-002 — Daftar akun dan status dengan pencarian terbatas

- **Status awal:** `todo`; **tujuan tunggal:** Daftar akun dan status dengan pencarian terbatas. Perilaku persis mengikuti OPS-002 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Daftar akun dan status dengan pencarian terbatas" dari OPS-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-002-A dan AC-OPS-002-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Daftar akun dan status dengan pencarian terbatas.", **maka** Email disamarkan bila mungkin, alasan akses dicatat, tidak membuka ledger. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-003 — Moderasi: warn, suspend, unsuspend, tangani banding

- **Status awal:** `todo`; **tujuan tunggal:** Moderasi: warn, suspend, unsuspend, tangani banding. Perilaku persis mengikuti OPS-003 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Moderasi: warn, suspend, unsuspend, tangani banding" dari OPS-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-003-A dan AC-OPS-003-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Moderasi: warn, suspend, unsuspend, tangani banding.", **maka** Jejak alasan, actor, waktu dan status; tidak berlaku diam-diam. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-004 — Tiket support/bug report yang dibuat user

- **Status awal:** `todo`; **tujuan tunggal:** Tiket support/bug report yang dibuat user. Perilaku persis mengikuti OPS-004 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Tiket support/bug report yang dibuat user" dari OPS-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-004-A dan AC-OPS-004-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Tiket support/bug report yang dibuat user.", **maka** Hanya lampiran yang user pilih secara sengaja; ada masa akses dan penghapusan. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-005-01 — Kuota per akun dan per role

- **Status awal:** `todo`; **tujuan tunggal:** Kuota per akun dan per role. Perilaku persis mengikuti OPS-005 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kuota per akun dan per role" dari OPS-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-005-A dan AC-OPS-005-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Kuota per user/role global: ukuran file, AI/day, penyimpanan, WA session, reminder.", **maka** Menolak penggunaan di atas kuota secara ramah dengan fallback manual; role admin tidak bebas mengganti limit sistem. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-005-02 — Kuota global anti abuse

- **Status awal:** `todo`; **tujuan tunggal:** Kuota global anti abuse. Perilaku persis mengikuti OPS-005 (bukan ilustrasi statis).
- **Dependensi:** `P9-OPS-005-01`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kuota global anti abuse" dari OPS-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-005-A dan AC-OPS-005-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Kuota per user/role global: ukuran file, AI/day, penyimpanan, WA session, reminder.", **maka** Menolak penggunaan di atas kuota secara ramah dengan fallback manual; role admin tidak bebas mengganti limit sistem. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-006 — Superuser mengubah feature flags untuk integrasi bermasalah

- **Status awal:** `todo`; **tujuan tunggal:** Superuser mengubah feature flags untuk integrasi bermasalah. Perilaku persis mengikuti OPS-006 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Superuser mengubah feature flags untuk integrasi bermasalah" dari OPS-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-006-A dan AC-OPS-006-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Superuser mengubah feature flags untuk integrasi bermasalah.", **maka** Dapat mematikan personal WA, shared bot, ekstraksi AI, upload saat incident tanpa mematikan pencatatan manual. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-007 — Monitor kesehatan integrasi GOWA, 9router, Cloudflare Tunnel, Neon, R2, Finance Worker

- **Status awal:** `todo`; **tujuan tunggal:** Monitor kesehatan integrasi GOWA, 9router, Cloudflare Tunnel, Neon, R2, Finance Worker. Perilaku persis mengikuti OPS-007 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Monitor kesehatan integrasi GOWA, 9router, Cloudflare Tunnel, Neon, R2, Finance Worker" dari OPS-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-007-A dan AC-OPS-007-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Monitor kesehatan integrasi GOWA, 9router, Cloudflare Tunnel, Neon, R2, Finance Worker.", **maka** Hanya status dan timestamp; tidak menampilkan secret. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-008 — Rotasi kredensial layanan dan rekam jejak perubahan

- **Status awal:** `todo`; **tujuan tunggal:** Rotasi kredensial layanan dan rekam jejak perubahan. Perilaku persis mengikuti OPS-008 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Rotasi kredensial layanan dan rekam jejak perubahan" dari OPS-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-008-A dan AC-OPS-008-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Rotasi kredensial layanan dan rekam jejak perubahan.", **maka** Tindakan superuser dengan MFA/reauth, log audit, no secret display after save. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-009 — Pengaturan reminder global & anti-spam, termasuk emergency stop

- **Status awal:** `todo`; **tujuan tunggal:** Pengaturan reminder global & anti-spam, termasuk emergency stop. Perilaku persis mengikuti OPS-009 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengaturan reminder global & anti-spam, termasuk emergency stop" dari OPS-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-009-A dan AC-OPS-009-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Pengaturan reminder global & anti-spam, termasuk emergency stop.", **maka** Opt-out user tidak dapat dipaksa lewat kembali, bahkan oleh admin. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-010 — Kontrol risiko biaya: pemakaian Workers/Neon/R2/model dan threshold

- **Status awal:** `todo`; **tujuan tunggal:** Kontrol risiko biaya: pemakaian Workers/Neon/R2/model dan threshold. Perilaku persis mengikuti OPS-010 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kontrol risiko biaya: pemakaian Workers/Neon/R2/model dan threshold" dari OPS-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-010-A dan AC-OPS-010-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Kontrol risiko biaya: pemakaian Workers/Neon/R2/model dan threshold.", **maka** Ketika mendekati batas, operator mendapat peringatan dan fitur mahal dapat diperlambat/dibatasi. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-011 — Pengaturan pengumuman maintenance & banner gangguan layanan

- **Status awal:** `todo`; **tujuan tunggal:** Pengaturan pengumuman maintenance & banner gangguan layanan. Perilaku persis mengikuti OPS-011 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengaturan pengumuman maintenance & banner gangguan layanan" dari OPS-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-011-A dan AC-OPS-011-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Pengaturan pengumuman maintenance & banner gangguan layanan.", **maka** PWA menampilkan dampak dan jalur alternatif; tidak mengklaim integrasi aktif saat down. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-012 — Statistik kinerja produk untuk lomba/demo

- **Status awal:** `todo`; **tujuan tunggal:** Statistik kinerja produk untuk lomba/demo. Perilaku persis mengikuti OPS-012 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Statistik kinerja produk untuk lomba/demo" dari OPS-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-012-A dan AC-OPS-012-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Statistik kinerja produk untuk lomba/demo.", **maka** Data diaggregasi, anonymized secukupnya; demo dataset sintetis terpisah. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-013-01 — Audit log dengan masa retensi

- **Status awal:** `todo`; **tujuan tunggal:** Audit log dengan masa retensi. Perilaku persis mengikuti OPS-013 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Audit log dengan masa retensi" dari OPS-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-013-A dan AC-OPS-013-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Retensi log, audit, serta permintaan penghapusan/ekspor.", **maka** Admin melihat progres pemrosesan permintaan tanpa akses isi keuangan. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-013-02 — Data request lifecycle dan status

- **Status awal:** `todo`; **tujuan tunggal:** Data request lifecycle dan status. Perilaku persis mengikuti OPS-013 (bukan ilustrasi statis).
- **Dependensi:** `P9-OPS-013-01`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Data request lifecycle dan status" dari OPS-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-013-A dan AC-OPS-013-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Retensi log, audit, serta permintaan penghapusan/ekspor.", **maka** Admin melihat progres pemrosesan permintaan tanpa akses isi keuangan. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-014 — Perbaikan data operasional melalui job retry/cancel

- **Status awal:** `todo`; **tujuan tunggal:** Perbaikan data operasional melalui job retry/cancel. Perilaku persis mengikuti OPS-014 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-014), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Perbaikan data operasional melalui job retry/cancel" dari OPS-014; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-014-A dan AC-OPS-014-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Perbaikan data operasional melalui job retry/cancel.", **maka** Retry idempotent; operator tidak boleh mengubah nominal transaksi user atas nama sistem. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-015 — Kebijakan moderasi & konfigurasi izin WhatsApp

- **Status awal:** `todo`; **tujuan tunggal:** Kebijakan moderasi & konfigurasi izin WhatsApp. Perilaku persis mengikuti OPS-015 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kebijakan moderasi & konfigurasi izin WhatsApp" dari OPS-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-015-A dan AC-OPS-015-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Kebijakan moderasi & konfigurasi izin WhatsApp.", **maka** Persetujuan publik yang jelas; opsi koneksi WA pribadi dapat dihentikan secara global. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-016 — Pengaturan konten publik: FAQ, terms, privacy policy, pengumuman versi, changelog

- **Status awal:** `todo`; **tujuan tunggal:** Pengaturan konten publik: FAQ, terms, privacy policy, pengumuman versi, changelog. Perilaku persis mengikuti OPS-016 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-016), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengaturan konten publik: FAQ, terms, privacy policy, pengumuman versi, changelog" dari OPS-016; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-016-A dan AC-OPS-016-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Pengaturan konten publik: FAQ, terms, privacy policy, pengumuman versi, changelog.", **maka** Perubahan dokumen hukum dikontrol dan ada jejak versi. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-017 — Monitoring backup/restore, penggunaan storage, dan pemeriksaan restore terjadwal

- **Status awal:** `todo`; **tujuan tunggal:** Monitoring backup/restore, penggunaan storage, dan pemeriksaan restore terjadwal. Perilaku persis mengikuti OPS-017 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-017), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Monitoring backup/restore, penggunaan storage, dan pemeriksaan restore terjadwal" dari OPS-017; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-017-A dan AC-OPS-017-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Monitoring backup/restore, penggunaan storage, dan pemeriksaan restore terjadwal.", **maka** Insiden penyimpanan dapat dilaporkan/diinvestigasi tanpa membuka data pengguna lebih dari perlu. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-018 — Dashboard audit tindakan sensitif per role

- **Status awal:** `todo`; **tujuan tunggal:** Dashboard audit tindakan sensitif per role. Perilaku persis mengikuti OPS-018 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-018), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Dashboard audit tindakan sensitif per role" dari OPS-018; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-018-A dan AC-OPS-018-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Dashboard audit tindakan sensitif per role.", **maka** Audit admin/superuser tidak dapat dihapus oleh actor yang sama tanpa proses khusus. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-019 — Onboarding serta konfigurasi Superuser pertama

- **Status awal:** `todo`; **tujuan tunggal:** Onboarding serta konfigurasi Superuser pertama. Perilaku persis mengikuti OPS-019 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-019), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Onboarding serta konfigurasi Superuser pertama" dari OPS-019; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-019-A dan AC-OPS-019-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Onboarding serta konfigurasi Superuser pertama.", **maka** Bootstrap terbatas, tidak tersedia dari form publik. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-OPS-020 — Health incident & kanal laporan bug keamanan

- **Status awal:** `todo`; **tujuan tunggal:** Health incident & kanal laporan bug keamanan. Perilaku persis mengikuti OPS-020 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md#ops-020), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Health incident & kanal laporan bug keamanan" dari OPS-020; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-OPS-020-A dan AC-OPS-020-B yang relevan: **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Health incident & kanal laporan bug keamanan.", **maka** Eskalasi prioritas tinggi dan pembekuan fitur berisiko saat insiden. Negative/boundary: Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-TRUST-013 — Audit trail keuangan dan akses administratif minim PII

- **Status awal:** `todo`; **tujuan tunggal:** Audit trail keuangan dan akses administratif minim PII. Perilaku persis mengikuti TRUST-013 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Audit trail keuangan dan akses administratif minim PII" dari TRUST-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-013-A dan AC-TRUST-013-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Audit trail keuangan dan akses administratif minim PII.", **maka** Setiap perubahan nominal/izin/status memiliki provenance dan user-facing history. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-TRUST-015 — Prosedur insiden: klasifikasi, investigasi, mitigasi, pencabutan kunci, pemberitahuan bila diwajibkan hukum

- **Status awal:** `todo`; **tujuan tunggal:** Prosedur insiden: klasifikasi, investigasi, mitigasi, pencabutan kunci, pemberitahuan bila diwajibkan hukum. Perilaku persis mengikuti TRUST-015 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Prosedur insiden: klasifikasi, investigasi, mitigasi, pencabutan kunci, pemberitahuan bila diwajibkan hukum" dari TRUST-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-015-A dan AC-TRUST-015-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Prosedur insiden: klasifikasi, investigasi, mitigasi, pencabutan kunci, pemberitahuan bila diwajibkan hukum.", **maka** Tim/operator punya tindakan jelas tanpa menyembunyikan masalah kritis. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-TRUST-016 — Kebijakan usia dan penggunaan bertanggung jawab

- **Status awal:** `todo`; **tujuan tunggal:** Kebijakan usia dan penggunaan bertanggung jawab. Perilaku persis mengikuti TRUST-016 (bukan ilustrasi statis).
- **Dependensi:** `P9-001`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-016), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kebijakan usia dan penggunaan bertanggung jawab" dari TRUST-016; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-016-A dan AC-TRUST-016-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Kebijakan usia dan penggunaan bertanggung jawab.", **maka** Pendaftaran anak/minor dievaluasi secara hukum sebelum aktivasi publik. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-003 — Integrate admin UX with privacy-scoped API

- **Status awal:** `todo`; **tujuan tunggal:** Replace admin/superuser fixture data with authorized projections and real audit
- **Dependensi:** `P9-001`, `P9-002`, `P4-SCREEN-ADM-01`, `P4-SCREEN-SYS-01`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Admin never sees others private ledger; role tests all admin actions.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P9-004 — Verify capacity, throttle and cost telemetry

- **Status awal:** `todo`; **tujuan tunggal:** Measure actual quotas for R2, Neon, Workers and AI; respond without confusing usage/cost
- **Dependensi:** `P9-003`, `P0-008`.
- **Rujukan:** [`REQ-06-OPERATIONS.md`](../requirements/REQ-06-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Operator screen metrics match provider usage sample.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

