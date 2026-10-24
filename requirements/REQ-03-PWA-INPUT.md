# REQ-03-PWA-INPUT — User Stories & Acceptance Criteria

**PRD dasar:** [`PRD-04-PWA-UX-INPUT.md`](../docs/prd/PRD-04-PWA-UX-INPUT.md).

**Interpretasi:** AC-A adalah observasi dasar untuk satu ID; AC-B adalah skenario batas/negatif (bila berlaku). Semua kasus rinci wajib juga lolos [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md).

Tabel/entri di bawah mengikat ID persyaratan sumber. Apabila visual mockup berbeda dari hasil test ini, perilaku mengikuti requirement dan keputusan produk, bukan angka raster pada gambar.

## UX: Acceptance per requirement

<a id="ux-001"></a>

### UX-001 — PWA installable di Android/Desktop dan browser pendukung.

- **US-UX-001:** Sebagai pengguna PWA, saya ingin pWA installable di Android/Desktop dan browser pendukung, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-001-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "PWA installable di Android/Desktop dan browser pendukung.", **maka** Manifest, ikon, instalasi, layar orientasi, tampilan stand-alone, prompt install tidak agresif.
- **AC-UX-001-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-002"></a>

### UX-002 — UI responsif HP kecil sampai desktop, termasuk dark/light mode.

- **US-UX-002:** Sebagai pengguna PWA, saya ingin uI responsif HP kecil sampai desktop, termasuk dark/light mode, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-002-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "UI responsif HP kecil sampai desktop, termasuk dark/light mode.", **maka** Navigasi tidak overflow; font ukuran nyaman; semua tindakan penting tersedia di mobile.
- **AC-UX-002-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-003"></a>

### UX-003 — Dashboard dengan total saldo, budget, transaksi terbaru, catatan belum diverifikasi, dana tabungan dan utang.

- **US-UX-003:** Sebagai pengguna PWA, saya ingin dashboard dengan total saldo, budget, transaksi terbaru, catatan belum diverifikasi, dana tabungan dan utang, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-003-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Dashboard dengan total saldo, budget, transaksi terbaru, catatan belum diverifikasi, dana tabungan dan utang.", **maka** Setiap angka punya label aktual/rencana/provisional.
- **AC-UX-003-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-004"></a>

### UX-004 — Quick Add 1-langkah angka + kategori; 2-langkah bila dompet/tanggal butuh konfirmasi.

- **US-UX-004:** Sebagai pengguna PWA, saya ingin quick Add 1-langkah angka + kategori; 2-langkah bila dompet/tanggal butuh konfirmasi, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-004-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Quick Add 1-langkah angka + kategori; 2-langkah bila dompet/tanggal butuh konfirmasi.", **maka** Bisa digunakan offline untuk catatan manual; satu klik simpan memberikan feedback.
- **AC-UX-004-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-005"></a>

### UX-005 — Input kalimat natural, contohnya 'lauk 10k bensin 20k'.

- **US-UX-005:** Sebagai pengguna PWA, saya ingin input kalimat natural, contohnya 'lauk 10k bensin 20k', agar pencatatan cepat dan dapat dipahami.
- **AC-UX-005-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Input kalimat natural, contohnya 'lauk 10k bensin 20k'.", **maka** Parser memperlihatkan daftar transaksi hasil ekstraksi sebelum konfirmasi bila ambigu.
- **AC-UX-005-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-006"></a>

### UX-006 — Upload foto/SS bukti dari file, kamera, dan paste jika browser mendukung.

- **US-UX-006:** Sebagai pengguna PWA, saya ingin upload foto/SS bukti dari file, kamera, dan paste jika browser mendukung, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-006-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Upload foto/SS bukti dari file, kamera, dan paste jika browser mendukung.", **maka** Validasi ukuran/tipe, progress, retry, metadata dibatasi.
- **AC-UX-006-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-007"></a>

### UX-007 — 'Share to PWA' dari aplikasi lain pada browser yang mendukung.

- **US-UX-007:** Sebagai pengguna PWA, saya ingin 'Share to PWA' dari aplikasi lain pada browser yang mendukung, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-007-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "'Share to PWA' dari aplikasi lain pada browser yang mendukung.", **maka** Jika browser tidak mendukung Share Target, upload file biasa tetap bekerja.
- **AC-UX-007-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-008"></a>

### UX-008 — Halaman review: foto di sebelah daftar transaksi usulan, nominal, kategori, merchant, tanggal.

- **US-UX-008:** Sebagai pengguna PWA, saya ingin halaman review: foto di sebelah daftar transaksi usulan, nominal, kategori, merchant, tanggal, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-008-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Halaman review: foto di sebelah daftar transaksi usulan, nominal, kategori, merchant, tanggal.", **maka** User dapat mengedit atau menolak sebelum final.
- **AC-UX-008-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-009"></a>

### UX-009 — Sinkronisasi offline-first untuk input manual dan draft perubahan.

- **US-UX-009:** Sebagai pengguna PWA, saya ingin sinkronisasi offline-first untuk input manual dan draft perubahan, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-009-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Sinkronisasi offline-first untuk input manual dan draft perubahan.", **maka** Antrean punya status offline, syncing, synced, conflict; no silent data loss.
- **AC-UX-009-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-010"></a>

### UX-010 — Kalender riwayat pengeluaran dan penanda hari nihil/belum dilaporkan.

- **US-UX-010:** Sebagai pengguna PWA, saya ingin kalender riwayat pengeluaran dan penanda hari nihil/belum dilaporkan, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-010-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Kalender riwayat pengeluaran dan penanda hari nihil/belum dilaporkan.", **maka** Hari yang belum dilaporkan tidak otomatis tercatat nol.
- **AC-UX-010-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-011"></a>

### UX-011 — Pencarian/filter transaksi cepat, undo aksi non-destruktif, edit & batch operations.

- **US-UX-011:** Sebagai pengguna PWA, saya ingin pencarian/filter transaksi cepat, undo aksi non-destruktif, edit & batch operations, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-011-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Pencarian/filter transaksi cepat, undo aksi non-destruktif, edit & batch operations.", **maka** Konfirmasi jelas untuk tindakan permanen; aksesibilitas keyboard.
- **AC-UX-011-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-012"></a>

### UX-012 — Notifikasi budget, jatuh tempo, reminder dan status AI.

- **US-UX-012:** Sebagai pengguna PWA, saya ingin notifikasi budget, jatuh tempo, reminder dan status AI, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-012-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Notifikasi budget, jatuh tempo, reminder dan status AI.", **maka** Kanal dan waktu dapat dikonfigurasi, quiet hours, dedup dan opt-out.
- **AC-UX-012-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-013"></a>

### UX-013 — Dashboard status integrasi (WA, AI, sinkronisasi, upload).

- **US-UX-013:** Sebagai pengguna PWA, saya ingin dashboard status integrasi (WA, AI, sinkronisasi, upload), agar pencatatan cepat dan dapat dipahami.
- **AC-UX-013-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Dashboard status integrasi (WA, AI, sinkronisasi, upload).", **maka** Selalu membedakan 'aktif', 'sedang menghubungkan', 'terganggu', 'butuh login ulang'.
- **AC-UX-013-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-014"></a>

### UX-014 — Simulasi pengeluaran sebelum jajan dan tantangan kebiasaan opsional.

- **US-UX-014:** Sebagai pengguna PWA, saya ingin simulasi pengeluaran sebelum jajan dan tantangan kebiasaan opsional, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-014-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Simulasi pengeluaran sebelum jajan dan tantangan kebiasaan opsional.", **maka** Tidak otomatis membuat transaksi; user boleh mematikan tanpa kehilangan ledger.
- **AC-UX-014-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-015"></a>

### UX-015 — Ekspor laporan, impor terverifikasi, unduh bukti, dan permintaan hapus akun.

- **US-UX-015:** Sebagai pengguna PWA, saya ingin ekspor laporan, impor terverifikasi, unduh bukti, dan permintaan hapus akun, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-015-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Ekspor laporan, impor terverifikasi, unduh bukti, dan permintaan hapus akun.", **maka** Tindakan mudah ditemukan di menu data dan privasi.
- **AC-UX-015-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-016"></a>

### UX-016 — Halaman bantuan & permintaan support, kesalahan sistem ramah pengguna.

- **US-UX-016:** Sebagai pengguna PWA, saya ingin halaman bantuan & permintaan support, kesalahan sistem ramah pengguna, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-016-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Halaman bantuan & permintaan support, kesalahan sistem ramah pengguna.", **maka** Tidak mengekspos stack trace, token atau PII dalam pesan error.
- **AC-UX-016-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-017"></a>

### UX-017 — Bahasa Indonesia default; toggle English untuk antarmuka umum.

- **US-UX-017:** Sebagai pengguna PWA, saya ingin bahasa Indonesia default; toggle English untuk antarmuka umum, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-017-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Bahasa Indonesia default; toggle English untuk antarmuka umum.", **maka** Nominal/tanggal diformat sesuai locale, istilah keuangan tidak berubah makna.
- **AC-UX-017-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

<a id="ux-018"></a>

### UX-018 — Komponen demo tanpa login menggunakan data sintetis.

- **US-UX-018:** Sebagai pengguna PWA, saya ingin komponen demo tanpa login menggunakan data sintetis, agar pencatatan cepat dan dapat dipahami.
- **AC-UX-018-A (G/W/T):** **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Komponen demo tanpa login menggunakan data sintetis.", **maka** Terisolasi dari akun dan backend produksi, memiliki label 'contoh'.
- **AC-UX-018-B (batas):** Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi.

