# REQ-06-OPERATIONS — User Stories & Acceptance Criteria

**PRD dasar:** [`PRD-07-ADMIN-OPERATIONS.md`](../docs/prd/PRD-07-ADMIN-OPERATIONS.md).

**Interpretasi:** AC-A adalah observasi dasar untuk satu ID; AC-B adalah skenario batas/negatif (bila berlaku). Semua kasus rinci wajib juga lolos [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md).

Tabel/entri di bawah mengikat ID persyaratan sumber. Apabila visual mockup berbeda dari hasil test ini, perilaku mengikuti requirement dan keputusan produk, bukan angka raster pada gambar.

## OPS: Acceptance per requirement

<a id="ops-001"></a>

### OPS-001 — Dashboard kesehatan: jumlah pengguna aktif, rate error, status gateway, antrean AI, status worker, pemakaian kuota.

- **US-OPS-001:** Sebagai operator sesuai izin role, saya ingin dashboard kesehatan: jumlah pengguna aktif, rate error, status gateway, antrean AI, status worker, pemakaian kuota, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-001-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Dashboard kesehatan: jumlah pengguna aktif, rate error, status gateway, antrean AI, status worker, pemakaian kuota.", **maka** Metrik agregat, tanpa transaksi/struk/chat raw.
- **AC-OPS-001-B (batas):** Dashboard admin hanya memperlihatkan jumlah akun, job, dan kesehatan; tidak dapat membuka saldo, struk, atau chat pengguna.

<a id="ops-002"></a>

### OPS-002 — Daftar akun dan status dengan pencarian terbatas.

- **US-OPS-002:** Sebagai operator sesuai izin role, saya ingin daftar akun dan status dengan pencarian terbatas, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-002-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Daftar akun dan status dengan pencarian terbatas.", **maka** Email disamarkan bila mungkin, alasan akses dicatat, tidak membuka ledger.
- **AC-OPS-002-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-003"></a>

### OPS-003 — Moderasi: warn, suspend, unsuspend, tangani banding.

- **US-OPS-003:** Sebagai operator sesuai izin role, saya ingin moderasi: warn, suspend, unsuspend, tangani banding, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-003-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Moderasi: warn, suspend, unsuspend, tangani banding.", **maka** Jejak alasan, actor, waktu dan status; tidak berlaku diam-diam.
- **AC-OPS-003-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-004"></a>

### OPS-004 — Tiket support/bug report yang dibuat user.

- **US-OPS-004:** Sebagai operator sesuai izin role, saya ingin tiket support/bug report yang dibuat user, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-004-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Tiket support/bug report yang dibuat user.", **maka** Hanya lampiran yang user pilih secara sengaja; ada masa akses dan penghapusan.
- **AC-OPS-004-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-005"></a>

### OPS-005 — Kuota per user/role global: ukuran file, AI/day, penyimpanan, WA session, reminder.

- **US-OPS-005:** Sebagai operator sesuai izin role, saya ingin kuota per user/role global: ukuran file, AI/day, penyimpanan, WA session, reminder, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-005-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Kuota per user/role global: ukuran file, AI/day, penyimpanan, WA session, reminder.", **maka** Menolak penggunaan di atas kuota secara ramah dengan fallback manual; role admin tidak bebas mengganti limit sistem.
- **AC-OPS-005-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-006"></a>

### OPS-006 — Superuser mengubah feature flags untuk integrasi bermasalah.

- **US-OPS-006:** Sebagai operator sesuai izin role, saya ingin superuser mengubah feature flags untuk integrasi bermasalah, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-006-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Superuser mengubah feature flags untuk integrasi bermasalah.", **maka** Dapat mematikan personal WA, shared bot, ekstraksi AI, upload saat incident tanpa mematikan pencatatan manual.
- **AC-OPS-006-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-007"></a>

### OPS-007 — Monitor kesehatan integrasi GOWA, 9router, Cloudflare Tunnel, Neon, R2, Finance Worker.

- **US-OPS-007:** Sebagai operator sesuai izin role, saya ingin monitor kesehatan integrasi GOWA, 9router, Cloudflare Tunnel, Neon, R2, Finance Worker, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-007-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Monitor kesehatan integrasi GOWA, 9router, Cloudflare Tunnel, Neon, R2, Finance Worker.", **maka** Hanya status dan timestamp; tidak menampilkan secret.
- **AC-OPS-007-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-008"></a>

### OPS-008 — Rotasi kredensial layanan dan rekam jejak perubahan.

- **US-OPS-008:** Sebagai operator sesuai izin role, saya ingin rotasi kredensial layanan dan rekam jejak perubahan, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-008-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Rotasi kredensial layanan dan rekam jejak perubahan.", **maka** Tindakan superuser dengan MFA/reauth, log audit, no secret display after save.
- **AC-OPS-008-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-009"></a>

### OPS-009 — Pengaturan reminder global & anti-spam, termasuk emergency stop.

- **US-OPS-009:** Sebagai operator sesuai izin role, saya ingin pengaturan reminder global & anti-spam, termasuk emergency stop, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-009-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Pengaturan reminder global & anti-spam, termasuk emergency stop.", **maka** Opt-out user tidak dapat dipaksa lewat kembali, bahkan oleh admin.
- **AC-OPS-009-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-010"></a>

### OPS-010 — Kontrol risiko biaya: pemakaian Workers/Neon/R2/model dan threshold.

- **US-OPS-010:** Sebagai operator sesuai izin role, saya ingin kontrol risiko biaya: pemakaian Workers/Neon/R2/model dan threshold, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-010-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Kontrol risiko biaya: pemakaian Workers/Neon/R2/model dan threshold.", **maka** Ketika mendekati batas, operator mendapat peringatan dan fitur mahal dapat diperlambat/dibatasi.
- **AC-OPS-010-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-011"></a>

### OPS-011 — Pengaturan pengumuman maintenance & banner gangguan layanan.

- **US-OPS-011:** Sebagai operator sesuai izin role, saya ingin pengaturan pengumuman maintenance & banner gangguan layanan, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-011-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Pengaturan pengumuman maintenance & banner gangguan layanan.", **maka** PWA menampilkan dampak dan jalur alternatif; tidak mengklaim integrasi aktif saat down.
- **AC-OPS-011-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-012"></a>

### OPS-012 — Statistik kinerja produk untuk lomba/demo.

- **US-OPS-012:** Sebagai operator sesuai izin role, saya ingin statistik kinerja produk untuk lomba/demo, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-012-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Statistik kinerja produk untuk lomba/demo.", **maka** Data diaggregasi, anonymized secukupnya; demo dataset sintetis terpisah.
- **AC-OPS-012-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-013"></a>

### OPS-013 — Retensi log, audit, serta permintaan penghapusan/ekspor.

- **US-OPS-013:** Sebagai operator sesuai izin role, saya ingin retensi log, audit, serta permintaan penghapusan/ekspor, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-013-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Retensi log, audit, serta permintaan penghapusan/ekspor.", **maka** Admin melihat progres pemrosesan permintaan tanpa akses isi keuangan.
- **AC-OPS-013-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-014"></a>

### OPS-014 — Perbaikan data operasional melalui job retry/cancel.

- **US-OPS-014:** Sebagai operator sesuai izin role, saya ingin perbaikan data operasional melalui job retry/cancel, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-014-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Perbaikan data operasional melalui job retry/cancel.", **maka** Retry idempotent; operator tidak boleh mengubah nominal transaksi user atas nama sistem.
- **AC-OPS-014-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-015"></a>

### OPS-015 — Kebijakan moderasi & konfigurasi izin WhatsApp.

- **US-OPS-015:** Sebagai operator sesuai izin role, saya ingin kebijakan moderasi & konfigurasi izin WhatsApp, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-015-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Kebijakan moderasi & konfigurasi izin WhatsApp.", **maka** Persetujuan publik yang jelas; opsi koneksi WA pribadi dapat dihentikan secara global.
- **AC-OPS-015-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-016"></a>

### OPS-016 — Pengaturan konten publik: FAQ, terms, privacy policy, pengumuman versi, changelog.

- **US-OPS-016:** Sebagai operator sesuai izin role, saya ingin pengaturan konten publik: FAQ, terms, privacy policy, pengumuman versi, changelog, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-016-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Pengaturan konten publik: FAQ, terms, privacy policy, pengumuman versi, changelog.", **maka** Perubahan dokumen hukum dikontrol dan ada jejak versi.
- **AC-OPS-016-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-017"></a>

### OPS-017 — Monitoring backup/restore, penggunaan storage, dan pemeriksaan restore terjadwal.

- **US-OPS-017:** Sebagai operator sesuai izin role, saya ingin monitoring backup/restore, penggunaan storage, dan pemeriksaan restore terjadwal, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-017-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Monitoring backup/restore, penggunaan storage, dan pemeriksaan restore terjadwal.", **maka** Insiden penyimpanan dapat dilaporkan/diinvestigasi tanpa membuka data pengguna lebih dari perlu.
- **AC-OPS-017-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-018"></a>

### OPS-018 — Dashboard audit tindakan sensitif per role.

- **US-OPS-018:** Sebagai operator sesuai izin role, saya ingin dashboard audit tindakan sensitif per role, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-018-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Dashboard audit tindakan sensitif per role.", **maka** Audit admin/superuser tidak dapat dihapus oleh actor yang sama tanpa proses khusus.
- **AC-OPS-018-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-019"></a>

### OPS-019 — Onboarding serta konfigurasi Superuser pertama.

- **US-OPS-019:** Sebagai operator sesuai izin role, saya ingin onboarding serta konfigurasi Superuser pertama, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-019-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Onboarding serta konfigurasi Superuser pertama.", **maka** Bootstrap terbatas, tidak tersedia dari form publik.
- **AC-OPS-019-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

<a id="ops-020"></a>

### OPS-020 — Health incident & kanal laporan bug keamanan.

- **US-OPS-020:** Sebagai operator sesuai izin role, saya ingin health incident & kanal laporan bug keamanan, agar layanan publik dapat dioperasikan aman.
- **AC-OPS-020-A (G/W/T):** **Diberikan** operator yang sah membuka area operasional sesuai role, **ketika** pengguna menjalankan kemampuan "Health incident & kanal laporan bug keamanan.", **maka** Eskalasi prioritas tinggi dan pembekuan fitur berisiko saat insiden.
- **AC-OPS-020-B (batas):** Aksi di luar izin tidak tersedia dan tetap ditolak walaupun endpoint dipanggil langsung; tindakan sensitif diaudit.

