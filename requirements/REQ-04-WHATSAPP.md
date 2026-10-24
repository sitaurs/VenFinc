# REQ-04-WHATSAPP — User Stories & Acceptance Criteria

**PRD dasar:** [`PRD-05-WHATSAPP-GOWA.md`](../docs/prd/PRD-05-WHATSAPP-GOWA.md).

**Interpretasi:** AC-A adalah observasi dasar untuk satu ID; AC-B adalah skenario batas/negatif (bila berlaku). Semua kasus rinci wajib juga lolos [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md).

Tabel/entri di bawah mengikat ID persyaratan sumber. Apabila visual mockup berbeda dari hasil test ini, perilaku mengikuti requirement dan keputusan produk, bukan angka raster pada gambar.

## WA: Acceptance per requirement

<a id="wa-001"></a>

### WA-001 — Pilihan WhatsApp opsional pada onboarding & pengaturan.

- **US-WA-001:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin pilihan WhatsApp opsional pada onboarding & pengaturan, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-001-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pilihan WhatsApp opsional pada onboarding & pengaturan.", **maka** User bisa memakai PWA tanpa koneksi WhatsApp; menautkan memerlukan persetujuan.
- **AC-WA-001-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-002"></a>

### WA-002 — Mode bot bersama dengan verifikasi kepemilikan nomor.

- **US-WA-002:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin mode bot bersama dengan verifikasi kepemilikan nomor, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-002-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Mode bot bersama dengan verifikasi kepemilikan nomor.", **maka** Chat dari nomor tidak terverifikasi tidak otomatis dikaitkan ke akun tertentu.
- **AC-WA-002-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-003"></a>

### WA-003 — Sesi pribadi per user, multi-device pada satu GOWA.

- **US-WA-003:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin sesi pribadi per user, multi-device pada satu GOWA, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-003-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Sesi pribadi per user, multi-device pada satu GOWA.", **maka** Pemetaan user ↔ session/device unik; akses ke session orang lain tidak pernah diizinkan.
- **AC-WA-003-B (batas):** Saat user A menebak ID device user B, status, login QR, logout, dan delete semua ditolak; tidak ada bocoran nomor/detail sesi B.

<a id="wa-004"></a>

### WA-004 — Membuat slot dan QR/pairing code dari PWA.

- **US-WA-004:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin membuat slot dan QR/pairing code dari PWA, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-004-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Membuat slot dan QR/pairing code dari PWA.", **maka** Pengguna melihat petunjuk WhatsApp, status masa berlaku kode, dan feedback keberhasilan/kegagalan.
- **AC-WA-004-B (batas):** Pairing code bisa diminta dari HP yang sama, menampilkan countdown, kedaluwarsa tidak dipakai; QR hanya dipakai pada perangkat lain.

<a id="wa-005"></a>

### WA-005 — Status sesi: belum terhubung, pairing, connected, disconnected, reconnecting, memerlukan login ulang, error.

- **US-WA-005:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin status sesi: belum terhubung, pairing, connected, disconnected, reconnecting, memerlukan login ulang, error, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-005-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Status sesi: belum terhubung, pairing, connected, disconnected, reconnecting, memerlukan login ulang, error.", **maka** State di PWA berubah setelah server memverifikasi keadaan terkini, bukan hanya klik tombol.
- **AC-WA-005-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-006"></a>

### WA-006 — Reconnect sesi terputus dan login ulang saat session invalid.

- **US-WA-006:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin reconnect sesi terputus dan login ulang saat session invalid, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-006-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Reconnect sesi terputus dan login ulang saat session invalid.", **maka** Retriable error tidak memaksa logout; pengguna mendapat tindakan selanjutnya.
- **AC-WA-006-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-007"></a>

### WA-007 — Logout WA tanpa menghapus slot, dan hapus slot/sesi permanen.

- **US-WA-007:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin logout WA tanpa menghapus slot, dan hapus slot/sesi permanen, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-007-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Logout WA tanpa menghapus slot, dan hapus slot/sesi permanen.", **maka** Dua tindakan berbeda, keduanya bisa dari PWA; konfirmasi efek terhadap pengingat.
- **AC-WA-007-B (batas):** Logout menyisakan slot, delete menghilangkan slot; ledger Neon dan lampiran transaksi tetap tersimpan setelah keduanya.

<a id="wa-008"></a>

### WA-008 — Pengguna dapat menonaktifkan sinkronisasi WA, mencabut izin, atau melepas nomor.

- **US-WA-008:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin pengguna dapat menonaktifkan sinkronisasi WA, mencabut izin, atau melepas nomor, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-008-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengguna dapat menonaktifkan sinkronisasi WA, mencabut izin, atau melepas nomor.", **maka** Penghentian pemrosesan dan pengiriman berlangsung sesuai kebijakan; histori ledger tetap aman.
- **AC-WA-008-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-009"></a>

### WA-009 — Input pesan teks natural, contohnya 'lauk 10k bensin 20k'.

- **US-WA-009:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin input pesan teks natural, contohnya 'lauk 10k bensin 20k', agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-009-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Input pesan teks natural, contohnya 'lauk 10k bensin 20k'.", **maka** Diparsing menjadi draft yang dipetakan ke akun pengirim terverifikasi, dengan konfirmasi bila ambigu.
- **AC-WA-009-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-010"></a>

### WA-010 — Input foto/SS/struk dari pesan WA.

- **US-WA-010:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin input foto/SS/struk dari pesan WA, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-010-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Input foto/SS/struk dari pesan WA.", **maka** Bukti diteruskan ke AI/OCR hanya jika consent masih aktif; status dapat dibalas.
- **AC-WA-010-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-011"></a>

### WA-011 — Balasan bukti pencatatan, rincian, kategori, budget tersisa, dan kontrol koreksi.

- **US-WA-011:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin balasan bukti pencatatan, rincian, kategori, budget tersisa, dan kontrol koreksi, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-011-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Balasan bukti pencatatan, rincian, kategori, budget tersisa, dan kontrol koreksi.", **maka** Balasan memuat cukup konteks; data sensitif diminimalkan sesuai pengaturan privasi.
- **AC-WA-011-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-012"></a>

### WA-012 — Perintah chat singkat: `saldo`, `budget`, `hari ini`, `minggu ini`, `bantuan`, `batal`, `nihil`, `selesai`, `STOP`, `MULAI`.

- **US-WA-012:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin perintah chat singkat: `saldo`, `budget`, `hari ini`, `minggu ini`, `bantuan`, `batal`, `nihil`, `selesai`, `STOP`, `MULAI`, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-012-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Perintah chat singkat: `saldo`, `budget`, `hari ini`, `minggu ini`, `bantuan`, `batal`, `nihil`, `selesai`, `STOP`, `MULAI`.", **maka** Perintah bisa dipahami dengan variasi bahasa wajar; `STOP` langsung dihormati.
- **AC-WA-012-B (batas):** Perintah STOP menghentikan pengingat non-keamanan dan membalas konfirmasi sekali; MULAI hanya aktif setelah opt-in kembali.

<a id="wa-013"></a>

### WA-013 — Pengingat harian berdasarkan timezone dan keadaan pencatatan.

- **US-WA-013:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin pengingat harian berdasarkan timezone dan keadaan pencatatan, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-013-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengingat harian berdasarkan timezone dan keadaan pencatatan.", **maka** Tidak mengirim reminder identik berkali-kali atau menandai hari kosong sebagai nol otomatis.
- **AC-WA-013-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-014"></a>

### WA-014 — Pengingat tagihan, budget hampir habis, dan status pending hanya sesuai opt-in.

- **US-WA-014:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin pengingat tagihan, budget hampir habis, dan status pending hanya sesuai opt-in, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-014-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengingat tagihan, budget hampir habis, dan status pending hanya sesuai opt-in.", **maka** Quiet hours, frekuensi, dan template dapat diatur.
- **AC-WA-014-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-015"></a>

### WA-015 — Proses webhook aman, idempotent, dan multi-device aware.

- **US-WA-015:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin proses webhook aman, idempotent, dan multi-device aware, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-015-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Proses webhook aman, idempotent, dan multi-device aware.", **maka** Event dari GOWA diverifikasi, memiliki asal device/message; replay tidak membuat transaksi dobel.
- **AC-WA-015-B (batas):** Kirim webhook message_id sama tiga kali dan satu kali dalam urutan tertukar: user mendapat tepat satu draft/transaksi yang benar.

<a id="wa-016"></a>

### WA-016 — Batas anti-spam dan kontrol kirim pesan platform.

- **US-WA-016:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin batas anti-spam dan kontrol kirim pesan platform, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-016-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Batas anti-spam dan kontrol kirim pesan platform.", **maka** Quota per user, global, per session, rate limit & emergency stop.
- **AC-WA-016-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-017"></a>

### WA-017 — Mode degradasi ketika WA/GOWA/tunnel mati.

- **US-WA-017:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin mode degradasi ketika WA/GOWA/tunnel mati, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-017-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Mode degradasi ketika WA/GOWA/tunnel mati.", **maka** PWA menunjukkan gangguan, transaksi manual tetap tersedia, antrean tidak hilang.
- **AC-WA-017-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-018"></a>

### WA-018 — Permintaan bantuan tanpa memberikan isi chat pribadi ke admin.

- **US-WA-018:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin permintaan bantuan tanpa memberikan isi chat pribadi ke admin, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-018-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Permintaan bantuan tanpa memberikan isi chat pribadi ke admin.", **maka** Pengguna hanya membagikan laporan relevan secara eksplisit.
- **AC-WA-018-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-019"></a>

### WA-019 — Audit tindakan sesi sendiri dan aktivitas keamanan.

- **US-WA-019:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin audit tindakan sesi sendiri dan aktivitas keamanan, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-019-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Audit tindakan sesi sendiri dan aktivitas keamanan.", **maka** Timestamp create, pairing, reconnect, logout, delete, stop/enable reminder; tanpa isi chat default.
- **AC-WA-019-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

<a id="wa-020"></a>

### WA-020 — Pengelolaan kapasitas sesi multiuser.

- **US-WA-020:** Sebagai pengguna yang mengaktifkan WhatsApp, saya ingin pengelolaan kapasitas sesi multiuser, agar pencatatan melalui WhatsApp mudah dan aman.
- **AC-WA-020-A (G/W/T):** **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengelolaan kapasitas sesi multiuser.", **maka** Maksimum sesi aktif ditentukan dari bench/resource Armbian dan kuota platform; perubahan bisa diatur Superuser.
- **AC-WA-020-B (batas):** Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama.

