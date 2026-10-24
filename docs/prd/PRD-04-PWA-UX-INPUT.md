# PRD-04 — Pengalaman PWA, Input, Notifikasi, dan Offline

**Relasi:** [Visi](./PRD-01-VISION-SCOPE.md) · [Finance](./PRD-03-FINANCE-CORE.md) · [AI](./PRD-06-AI-OCR.md) · [Kualitas](./PRD-09-NFR-ACCEPTANCE.md)

## 1. Prinsip pengalaman

**Mobile-first**, pengoperasian satu tangan, navigasi singkat, bahasa manusia sehari-hari tanpa kehilangan ketelitian finansial. Pengguna tidak perlu memahami istilah akuntansi untuk mencatat biaya lauk, galon, laundry, bensin, maupun jajan.

Satu aksi paling menonjol adalah **Tambah Transaksi**. Peringatan overbudget harus suportif, bukan memalukan: 'Budget jajan tinggal Rp7.000' lebih baik daripada 'Kamu boros'. Tidak ada manipulasi dark pattern supaya pengguna sering membuka aplikasi.

## 2. Arsitektur informasi produk (bukan rancangan komponen teknis)

| Area/route konseptual | Fungsionalitas |
|---|---|
| `/` | Landing page, manfaat, screenshot/demo sintetis, cara kerja, syarat & privasi |
| `/login` `/register` | Identitas & onboarding |
| `/app` | Dashboard pengguna |
| `/app/transactions` | Riwayat, pencarian, koreksi, impor/ekspor |
| `/app/wallets` | Sumber uang/dompet virtual & transfer |
| `/app/budgets` | Anggaran/envelope dan limit virtual |
| `/app/goals` | Tabungan, utang, cicilan dan pengingat |
| `/app/insights` | Laporan & analitik |
| `/app/inbox` | Transaksi perlu review dan job AI |
| `/app/settings` | Profil, WA, AI consent, reminder, privasi dan data |
| `/admin` | Area Admin terbatas |
| `/system` | Area Superuser |

Semua route publik/privat dapat berubah pada DESIGN berikutnya; jalur di atas adalah struktur pengalaman, bukan API contract final.

## 3. Kebutuhan fitur — `UX-*`

| ID | Fitur | Perilaku yang harus ada |
|---|---|---|
| `UX-001` | PWA installable di Android/Desktop dan browser pendukung. | Manifest, ikon, instalasi, layar orientasi, tampilan stand-alone, prompt install tidak agresif. |
| `UX-002` | UI responsif HP kecil sampai desktop, termasuk dark/light mode. | Navigasi tidak overflow; font ukuran nyaman; semua tindakan penting tersedia di mobile. |
| `UX-003` | Dashboard dengan total saldo, budget, transaksi terbaru, catatan belum diverifikasi, dana tabungan dan utang. | Setiap angka punya label aktual/rencana/provisional. |
| `UX-004` | Quick Add 1-langkah angka + kategori; 2-langkah bila dompet/tanggal butuh konfirmasi. | Bisa digunakan offline untuk catatan manual; satu klik simpan memberikan feedback. |
| `UX-005` | Input kalimat natural, contohnya 'lauk 10k bensin 20k'. | Parser memperlihatkan daftar transaksi hasil ekstraksi sebelum konfirmasi bila ambigu. |
| `UX-006` | Upload foto/SS bukti dari file, kamera, dan paste jika browser mendukung. | Validasi ukuran/tipe, progress, retry, metadata dibatasi. |
| `UX-007` | 'Share to PWA' dari aplikasi lain pada browser yang mendukung. | Jika browser tidak mendukung Share Target, upload file biasa tetap bekerja. |
| `UX-008` | Halaman review: foto di sebelah daftar transaksi usulan, nominal, kategori, merchant, tanggal. | User dapat mengedit atau menolak sebelum final. |
| `UX-009` | Sinkronisasi offline-first untuk input manual dan draft perubahan. | Antrean punya status offline, syncing, synced, conflict; no silent data loss. |
| `UX-010` | Kalender riwayat pengeluaran dan penanda hari nihil/belum dilaporkan. | Hari yang belum dilaporkan tidak otomatis tercatat nol. |
| `UX-011` | Pencarian/filter transaksi cepat, undo aksi non-destruktif, edit & batch operations. | Konfirmasi jelas untuk tindakan permanen; aksesibilitas keyboard. |
| `UX-012` | Notifikasi budget, jatuh tempo, reminder dan status AI. | Kanal dan waktu dapat dikonfigurasi, quiet hours, dedup dan opt-out. |
| `UX-013` | Dashboard status integrasi (WA, AI, sinkronisasi, upload). | Selalu membedakan 'aktif', 'sedang menghubungkan', 'terganggu', 'butuh login ulang'. |
| `UX-014` | Simulasi pengeluaran sebelum jajan dan tantangan kebiasaan opsional. | Tidak otomatis membuat transaksi; user boleh mematikan tanpa kehilangan ledger. |
| `UX-015` | Ekspor laporan, impor terverifikasi, unduh bukti, dan permintaan hapus akun. | Tindakan mudah ditemukan di menu data dan privasi. |
| `UX-016` | Halaman bantuan & permintaan support, kesalahan sistem ramah pengguna. | Tidak mengekspos stack trace, token atau PII dalam pesan error. |
| `UX-017` | Bahasa Indonesia default; toggle English untuk antarmuka umum. | Nominal/tanggal diformat sesuai locale, istilah keuangan tidak berubah makna. |
| `UX-018` | Komponen demo tanpa login menggunakan data sintetis. | Terisolasi dari akun dan backend produksi, memiliki label 'contoh'. |

## 4. Alur input cepat yang disyaratkan

### A. Manual angka
1. Tekan tombol `+` → isi `10.000` → pilih `Lauk` → pilih sumber saldo (default terakhir digunakan) → Simpan.
2. Konfirmasi singkat terlihat tanpa memblokir layar.
3. Anggaran dan riwayat diperbarui; user dapat undo jika salah.

### B. Teks natural
1. Ketik `kemarin lauk 10k, bensin 20 ribu, es teh 8k`.
2. Tampilkan tiga baris usulan, tanggal kemarin berdasarkan zona waktu user; kategori yang belum pasti diberi tanda.
3. Konfirmasi atau edit; penjelasan singkat jika parser ragu.

### C. Foto atau screenshot
1. Upload/share foto → status `Memproses` + opsi tidak menunggu di layar.
2. Saat Vision sukses, tampilkan hasil dengan indikator jika nominal/merchant/tanggal tidak yakin.
3. Saat AI offline, tampilkan `Dibaca sementara via OCR` atau form isi manual.
4. User bisa meninjau hasil kemudian; sistem tidak mengubah transaksi final sembarangan.

### D. Offline
1. Ketika offline, form tetap dapat dibuka dan disimpan lokal.
2. Setiap draft mempunyai tanda *belum terkirim* dan opsi batalkan.
3. Saat jaringan pulih, sinkronisasi dijalankan ketika aplikasi aktif atau ketika mekanisme browser mengizinkan; tidak menjamin service worker terus berjalan tanpa batas.
4. Konflik versi ditangani dengan pesan yang memberi pilihan jelas, bukan overwrite tak terlihat.

## 5. Tampilan utama yang perlu dispesifikasikan lebih lanjut oleh DESIGN

- **Dashboard ringkasan** dengan kartu jatah makan/jajan harian, sisa budget, pengingat jatuh tempo, dan transaksi pending.
- **Dompet** memperjelas saldo uang virtual; **Budget** memperjelas batas pengeluaran virtual; keduanya tidak disamakan.
- **Laporan** memperlihatkan breakdown berdasarkan kategori, perubahan vs bulan lalu, pengeluaran sering, ringkasan tabungan/utang.
- **Inbox review** untuk OCR/AI konflik, transaksi duplikat, sinkronisasi gagal, data yang kurang.
- **Integrasi WhatsApp** punya status per sesi, QR/pairing code, pengaturan pengingat dan tindakan logout/hapus sesuai izin.
- **Admin & Superuser** terpisah secara navigasi dan akses; jangan menampilkan menu admin ke user meskipun otorisasi server tetap wajib.

## 6. Notifikasi dan anti-spam

| Peristiwa | Media | Aturan |
|---|---|---|
| Lewat budget harian/bulanan | In-app; WA/push jika opt-in | Satu notifikasi per threshold/kejadian signifikan; bukan setiap render. |
| Pengingat laporan harian | WA atau push sesuai izin | Default usulan 20.30 Asia/Jakarta; user bisa mematikan. |
| Tagihan utang jatuh tempo | In-app/WA/push | Dapat diatur H-7/H-1/hari H; pencatatan pembayaran manual. |
| Selesai OCR/AI | In-app; push opsional | Jangan menaruh nominal sensitif pada layar terkunci tanpa opt-in. |
| Gangguan integrasi | Halaman status & pesan konteks | Tidak menyalahkan pengguna; menawarkan input manual. |
| Keamanan akun | Email/in-app | Tidak dapat dimatikan untuk alert keamanan esensial. |

## 7. Aksesibilitas dan privasi di perangkat

- Sasaran aksesibilitas WCAG 2.2 AA untuk form, kontras, navigasi keyboard, focus, label, dan error message.
- Opsi sembunyikan nominal di dashboard (privacy mode) dan blur preview di app switcher sejauh dukungan platform memungkinkan.
- Offline cache **tidak** menyimpan data sensitif lintas pengguna: logout wajib membersihkan sesi dan draft/partisi cache akun sesuai pilihan risiko sinkronisasi.
- Tidak menyimpan API key 9router/GOWA di bundle web.
- Gambar bukti keuangan tidak boleh otomatis masuk cache publik CDN.

## 8. Acceptance cases

- **AC-UX-01:** Pertama kali install PWA lalu reopen: halaman dasar tetap tampil; login tetap aman.
- **AC-UX-02:** Transaksi manual berhasil di HP layar kecil tanpa perlu scroll horizontal.
- **AC-UX-03:** Browser tanpa `share_target` tetap dapat upload screenshot lewat picker file.
- **AC-UX-04:** Offline dan refresh: draft manual tidak hilang; status pending terlihat; saat sync tidak terjadi duplikasi.
- **AC-UX-05:** Login berganti dari user A ke B pada perangkat sama: data offline/halaman user A tidak terlihat di B.
- **AC-UX-06:** Role admin yang tidak berhak melihat transaksi akun lain tidak bisa melewati otorisasi dengan URL langsung.
- **AC-UX-07:** Mematikan notifikasi jajan berhenti mengirim notifikasi jajan, tetapi alert keamanan penting tetap dikirim.
- **AC-UX-08:** Error AI tidak mencegah pengisian form manual; teks error tidak menyalahkan pengguna.

## 9. Fakta browser yang membatasi janji produk

Web Share Target memiliki dukungan browser terbatas; bukan fitur universal. Background sync juga tidak menjamin PWA berjalan terus saat ditutup, karena browser dapat menghentikan service worker. Pengingat yang benar-benar terjadwal harus dikendalikan backend/Finance Worker, bukan hanya service worker.

**Referensi:** [MDN Web Share Target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target) · [MDN PWA Offline/Background](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) · [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/)
