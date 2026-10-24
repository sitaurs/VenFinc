# VenFinance — Rencana Desain UI/UX Mobile & Web

Tanggal: 23 Oktober 2026  
Dasar: seluruh PRD 00–10 dalam lampiran dan empat gambar referensi pengguna.  
Status: rancangan cakupan, arsitektur informasi, alur, dan arah visual; belum merupakan desain layar high-fidelity atau aplikasi production.

## 1. Tujuan desain

VenFinance membantu pengguna mencatat uang dengan cepat, memahami sisa anggaran, dan meninjau bukti transaksi dengan kendali penuh. Aplikasi utama berupa PWA responsif: mobile dan desktop memakai konsep data serta alur yang sama, dengan susunan layar sesuai perangkat.

Seluruh cakupan production dalam PRD masuk perencanaan. Urutan pengerjaan di bawah adalah urutan desain, bukan pengurangan fitur menjadi MVP.

Hasil yang ingin dicapai:

- Pengguna langsung membedakan **saldo sumber uang**, **sisa anggaran**, **rencana tabungan**, dan **utang**.
- Tambah transaksi menjadi tindakan utama yang mudah dijangkau.
- Manual tetap menjadi jalur lengkap dan tersedia tanpa AI maupun WhatsApp.
- Hasil bacaan struk yang belum disetujui tidak terlihat sebagai transaksi final.
- Pengguna memahami status offline, antrean, kegagalan, dan keputusan koreksi.
- Area operasional menjaga privasi: Admin/Superuser melihat metadata yang diizinkan, bukan buku keuangan atau chat pengguna.

## 2. Pembacaan referensi

| Referensi | Yang diadaptasi | Penyesuaian untuk VenFinance |
|---|---|---|
| 115015 — aplikasi belajar ungu | Lavender, kartu putih membulat, hierarki kartu, ring progress | Ring dipakai untuk penggunaan anggaran dengan angka dan label; tidak mengandalkan warna saja. |
| 115019 — catatan pastel | Permukaan terang, aksen pastel, quick actions, navigasi ringkas | Aksi utama menjadi Catat; navigasi selalu memakai label yang terbaca. |
| 115023 — finance cyan–pink | Ringkasan keuangan, kategori, laporan, aksen gradasi | Rupiah, budget pribadi, dan tabungan; hindari kartu bank fiktif yang memberi kesan fitur pembayaran. |
| 115027 — finance lintas perangkat | Sidebar desktop, grafik, dashboard modular, budget progress | Layout desktop lebih lapang; mobile menampilkan prioritas yang sama secara berurutan. |

Arah kerja: **tenang, rapi, ringan, ramah mahasiswa dan pekerja pemula**. Dominan putih–lavender dengan ungu sebagai identitas. Cyan, mint, peach, dan pink membantu membedakan kategori. Gradasi dipakai terbatas pada elemen brand dan highlight, sementara angka dan teks memakai permukaan yang mudah dibaca.

Referensi menjadi acuan gaya, bukan sumber logo, ilustrasi, nama, atau susunan yang disalin persis.

## 3. Navigasi lintas perangkat

### Mobile

Bottom navigation memiliki lima posisi:

1. **Beranda** — ringkasan dan tindakan hari ini.
2. **Transaksi** — riwayat, filter, kalender.
3. **Catat (+)** — membuka input cepat; merupakan aksi, bukan tab halaman.
4. **Anggaran** — kantong dan batas periode.
5. **Lainnya** — Dompet, Target & Utang, Tagihan, Laporan, WhatsApp, Pengaturan, Bantuan.

Inbox review dan notifikasi dapat dibuka dari header; badge review juga muncul di Beranda. Label navigasi tetap terlihat. Quick Add memakai bottom sheet, sedangkan form panjang dan proses bertahap memakai halaman penuh. Tombol simpan menyesuaikan keyboard dan safe area.

### Web desktop

Sidebar: Beranda, Transaksi, Anggaran, Dompet, Target & Utang, Tagihan, Laporan, Perlu Ditinjau, lalu WhatsApp dan Pengaturan. Tombol **+ Catat transaksi** tetap konsisten di shell.

Detail ringan memakai side panel; alur panjang seperti impor, review struk, dan penghapusan akun memakai halaman tersendiri. Review struk menempatkan gambar dan form berdampingan.

### Tablet

Sidebar dapat dipadatkan, daftar dan detail memakai dua panel jika ruang cukup. Pada ukuran sempit, susunan mengikuti mobile tanpa menyembunyikan kemampuan penting.

### Area operator

Menu **Operasional** hanya tersedia bagi role yang berhak. Pergantian dari keuangan pribadi ke platform selalu eksplisit dengan judul area. Admin dan Superuser memakai shell operasional terpisah dari dashboard pribadi; akses mobile tersedia melalui menu dan daftar yang responsif.

## 4. Inventaris halaman yang harus dirancang

Ada **78 screen template/tujuan tampilan logis** dalam rencana ini. Angka tersebut bukan jumlah URL final: beberapa dapat berbagi template, tab, atau komponen. Setiap template direncanakan untuk mobile dan desktop; keadaan khusus dan modal dihitung terpisah.

### A. Publik — 8

| ID | Halaman | Isi dan tindakan penting |
|---|---|---|
| PUB-01 | Landing | Nilai produk, cara kerja, preview, CTA daftar, akses demo, penjelasan sebagai pencatat keuangan. |
| PUB-02 | Demo interaktif | Shell aplikasi dengan data sintetis dan label Contoh; jalur menuju daftar. |
| PUB-03 | FAQ & pusat bantuan publik | Pencarian topik manual, anggaran, AI, WA, privasi, offline. |
| PUB-04 | Kontak dukungan | Pilihan masalah, form, pemberitahuan agar tidak mengirim data sensitif yang tidak diperlukan. |
| PUB-05 | Status layanan | Status layanan dan riwayat insiden, waktu pembaruan serta alternatif pencatatan. |
| PUB-06 | Kebijakan privasi | Dokumen terbaca, daftar isi, versi, tanggal berlaku. |
| PUB-07 | Syarat layanan | Dokumen terbaca, batas fungsi dan versi; tidak mengarang kebijakan yang belum disahkan. |
| PUB-08 | Pembaruan produk | Changelog dan catatan fitur. |

### B. Identitas & akses — 7

| ID | Halaman | Isi dan tindakan penting |
|---|---|---|
| AUTH-01 | Masuk | Email, password, pemulihan; Google hanya jika diaktifkan. |
| AUTH-02 | Daftar | Email, password, syarat, petunjuk validasi; tanpa pilihan role. |
| AUTH-03 | Verifikasi email | Kirim ulang, ubah alamat sesuai kebijakan, tautan kedaluwarsa, hasil verifikasi. |
| AUTH-04 | Lupa password | Permintaan reset dengan respons yang tidak membocorkan keberadaan akun. |
| AUTH-05 | Reset password | Password baru, validasi, tautan invalid/kedaluwarsa, selesai. |
| AUTH-06 | Verifikasi keamanan | MFA/step-up; bentuk final mengikuti metode autentikasi yang dipilih. |
| AUTH-07 | Akses akun dibatasi | Alasan yang boleh ditampilkan, bantuan, banding, status pengajuan. |

### C. Onboarding — 5

| ID | Halaman | Isi dan tindakan penting |
|---|---|---|
| ONB-01 | Kenalan & preferensi | Nama panggilan, bahasa, IDR, Asia/Jakarta, awal siklus. |
| ONB-02 | Sumber uang awal | Buat dompet virtual dan saldo pembuka; dapat dilewati untuk disiapkan nanti. |
| ONB-03 | Pilih rencana anggaran | Mahasiswa Kos, umum, atau mulai kosong. |
| ONB-04 | Sesuaikan anggaran | Edit nominal, cek pemasukan dan kebutuhan termasuk kos/listrik; tidak mencatat rencana sebagai pengeluaran. |
| ONB-05 | Fitur opsional & selesai | AI, bukti, WA, pengingat dengan izin terpisah; Lewati tetap jelas. |

Onboarding memakai progress singkat dan menyimpan kemajuan. Pengguna terverifikasi dapat masuk dashboard tanpa menautkan integrasi atau mengisi seluruh rencana.

### D. Keuangan pribadi — 16

| ID | Halaman | Isi dan tindakan penting |
|---|---|---|
| FIN-UI-01 | Beranda | Saldo terkonfirmasi, sisa anggaran, jatah hari ini, review, transaksi, tagihan, status hari. |
| FIN-UI-02 | Riwayat transaksi | Search, filter gabungan, pengelompokan tanggal, bulk action dan ekspor. |
| FIN-UI-03 | Detail transaksi | Jenis, nominal, sumber uang, kategori/split, bukti, asal input, edit, void/restore, riwayat. |
| FIN-UI-04 | Kalender pencatatan | Belum dilaporkan, sebagian, selesai, nihil; rincian per hari dan koreksi. |
| FIN-UI-05 | Daftar dompet | Total saldo dan sumber uang, tambah, arsip, transfer. |
| FIN-UI-06 | Detail dompet | Saldo virtual, mutasi, rekonsiliasi, penyesuaian dan arsip. |
| FIN-UI-07 | Ringkasan anggaran | Periode, budget, terpakai, sisa, lebih budget, copy periode/template. |
| FIN-UI-08 | Detail kantong anggaran | Batas, transaksi terkait, threshold, rollover, riwayat perubahan. |
| FIN-UI-09 | Daftar target tabungan | Target, realisasi, tanggal, kemajuan. |
| FIN-UI-10 | Detail target | Riwayat setoran/transfer, sumber uang, sisa target dan edit. |
| FIN-UI-11 | Daftar utang & piutang | Sisa pokok, jatuh tempo, pihak opsional, filter status. |
| FIN-UI-12 | Detail utang/piutang | Pokok, pembayaran, bunga/biaya terpisah, jadwal, catat cicilan/pelunasan. |
| FIN-UI-13 | Tagihan & catatan berulang | Daftar/kalender, jatuh tempo, dana tersedia, pengingat atau draft otomatis. |
| FIN-UI-14 | Detail tagihan | Jadwal, nominal rencana, sumber uang, riwayat; Bayar berarti catat pembayaran nyata. |
| FIN-UI-15 | Laporan & insight | Periode, kategori, arus kas, perbandingan, data grafik, ekspor dan preview berbagi. |
| FIN-UI-16 | Simulasi belanja | Masukkan nominal/kategori → lihat dampak; tidak menyimpan transaksi otomatis. |

### E. Input bukti & review — 5

| ID | Halaman | Isi dan tindakan penting |
|---|---|---|
| REV-01 | Inbox perlu ditinjau | Usulan, sementara, konflik, duplikat, gagal; jumlah dan prioritas jelas. |
| REV-02 | Unggah & proses bukti | Kamera/file/paste bila didukung, izin, validasi, progress, antrean, batal, manual. |
| REV-03 | Review hasil bacaan | Bukti asli, nominal, tanggal, merchant, kategori, dompet, item/split, konfirmasi. |
| REV-04 | Bandingkan hasil berbeda | OCR vs hasil pemeriksaan ulang vs nilai tersimpan bila ada; pilih/koreksi dengan alasan. |
| REV-05 | Periksa kemungkinan duplikat | Dua kandidat, bukti dan asal, gabungkan/simpan terpisah/batalkan. |

### F. Pengaturan & layanan pengguna — 19

| ID | Halaman | Isi dan tindakan penting |
|---|---|---|
| SET-01 | Pusat pengaturan / Lainnya | Direktori yang mudah dipindai; status integrasi dan akses cepat. |
| SET-02 | Profil | Nama, foto opsional, email dan verifikasi perubahan. |
| SET-03 | Tampilan & preferensi | Bahasa ID/EN, light/dark/system, timezone, siklus, sembunyikan nominal. |
| SET-04 | Keamanan & perangkat | Password, sesi aktif, cabut perangkat, logout semua, keamanan akun. |
| SET-05 | WhatsApp — pilihan & status | Bot bersama/pribadi, status aktual, fitur yang tersedia dan koneksi opsional. |
| SET-06 | Verifikasi nomor bot bersama | Pembuktian nomor dan hasil; tidak meminta QR sesi pribadi. |
| SET-07 | Tautkan WhatsApp pribadi | Mobile mengutamakan kode pairing; desktop dapat mengutamakan QR; masa berlaku dan petunjuk. |
| SET-08 | Izin & aktivitas WhatsApp | Chat/tujuan diizinkan, reconnect, login ulang, logout, hapus sesi, cabut izin. |
| SET-09 | AI, bukti & pemakaian | Izin upstream, simpan bukti, kuota aktual, preferensi kategori, cabut izin. |
| SET-10 | Pengingat & notifikasi | Kanal, jam, hari, timezone, quiet hours, threshold dan STOP/jeda. |
| SET-11 | Kategori & subkategori | Buat, ubah, arsip, ikon, pengaruh ke histori. |
| SET-12 | Data & privasi | Ekspor CSV/JSON, bukti terpisah, retensi, izin, status permintaan. |
| SET-13 | Impor — pemetaan | Upload CSV, mapping kolom, format tanggal/nominal, validasi. |
| SET-14 | Impor — pratinjau & hasil | Valid/error/duplikat, keputusan sebelum posting, hasil dan rollback sesuai aturan. |
| SET-15 | Pusat notifikasi | Budget, jatuh tempo, review, keamanan; kontrol data sensitif. |
| SET-16 | Bantuan & tiket saya | Artikel, buat tiket, pilih lampiran dan izin akses terbatas. |
| SET-17 | Detail tiket saya | Status, balasan, lampiran yang dibagikan, masa akses dan cabut akses. |
| SET-18 | Sinkronisasi & konflik | Antrean lokal, syncing, gagal, versi lokal/server, retry dan keputusan konflik. |
| SET-19 | Hapus akun & progres | Dampak, reauth, ekspor opsional, tenggang jika disahkan, status proses/pengecualian. |

### G. Admin — 7

| ID | Halaman | Isi dan tindakan penting |
|---|---|---|
| ADM-01 | Dashboard operasional | Pengguna agregat, error, antrean, kuota, status layanan. |
| ADM-02 | Daftar akun | Metadata minimum, identitas tersamar, status dan pencarian terbatas. |
| ADM-03 | Moderasi & banding akun | Alasan, warn/suspend/unsuspend, banding, jejak tindakan; tanpa tab transaksi pribadi. |
| ADM-04 | Antrean support | Tiket, kategori, prioritas, masa akses lampiran. |
| ADM-05 | Detail tiket berizin | Konten yang sengaja dibagikan, batas izin/waktu, tanggapan. |
| ADM-06 | Insiden & antrean pekerjaan | Metadata aman, retry/cancel sesuai mandat dan status insiden. |
| ADM-07 | Audit operasional | Tindakan aktor, waktu, alasan dan hasil; filter tanpa payload pribadi. |

### H. Superuser — 11

| ID | Halaman | Isi dan tindakan penting |
|---|---|---|
| SYS-01 | Ringkasan sistem | Health, kapasitas, insiden, kontrol yang memerlukan perhatian. |
| SYS-02 | Integrasi & kredensial | Konfigurasi gateway/model, kapabilitas teruji, status, rotasi; secret tersamarkan. |
| SYS-03 | Kuota & biaya | Per-user/global, soft/hard limit, penggunaan dan peringatan. |
| SYS-04 | Feature flags | Dampak fitur, rollout dan fallback, perubahan dengan audit. |
| SYS-05 | Peran & akses | User ↔ Admin, reauth, alasan, audit; tidak menyediakan promosi Superuser publik. |
| SYS-06 | Kebijakan reminder | Antispam, batas global, quiet hours, emergency stop; opt-out pengguna dihormati. |
| SYS-07 | Konten & kebijakan publik | FAQ, terms, privacy, changelog, versi dan publikasi terkendali. |
| SYS-08 | Backup & pemulihan | Status backup, pengujian restore, ringkasan dampak dan alur otorisasi. |
| SYS-09 | Audit sensitif | Role, konfigurasi, kuota, kredensial, kebijakan dan hasil tindakan. |
| SYS-10 | Permintaan data | Progres ekspor/hapus, tenggat dan pengecualian; tidak membuka isi ekspor. |
| SYS-11 | Insiden & pengumuman | Dampak, banner, maintenance, mitigasi, pemulihan dan riwayat. |

## 5. Form, dialog, dan komponen alur

Komponen berikut mendapat desain sendiri tetapi tidak dihitung sebagai tambahan 78 halaman:

| Komponen/alur | Mobile | Desktop |
|---|---|---|
| Pilih cara mencatat | Bottom sheet: Angka, Teks, Foto | Popover/dialog dari tombol Catat |
| Input angka cepat | Nominal, kategori favorit, dompet, Simpan; opsi lanjutan | Dialog ringkas, keyboard friendly |
| Pemasukan, pengeluaran, transfer, refund | Pilihan jenis eksplisit; transfer menampilkan sumber/tujuan | Form/dialog dengan field sesuai jenis |
| Penyesuaian saldo | Perbandingan saldo dan selisih, alasan | Dialog rekonsiliasi dengan preview |
| Teks natural & preview beberapa transaksi | Teks lalu daftar usulan yang bisa diedit | Panel input dan tabel usulan |
| Pecah kategori satu transaksi | Daftar item dan sisa yang belum dialokasikan | Tabel split dan total validasi |
| Tambah/edit dompet dan kategori | Sheet atau halaman bila form panjang | Dialog |
| Buat/edit/copy anggaran | Wizard pendek, ringkasan sebelum simpan | Dialog besar atau halaman edit |
| Pindah alokasi budget | Sumber, tujuan, dampak; bukan transfer uang | Dialog dengan preview perubahan |
| Buat target, setoran, utang, cicilan | Form bertahap jika perlu | Dialog/panel dengan perhitungan jelas |
| Buat/ubah jadwal berulang | Jenis, frekuensi, timezone dan preview tanggal | Form dan preview kalender |
| Filter, sort, pilih rentang tanggal | Full sheet dengan Terapkan/Reset | Popover/panel dengan chips filter |
| Void, restore dan undo | Konsekuensi dan kesempatan batal | Konfirmasi dan toast undo bila aman |
| Preview ekspor/berbagi | Pilih isi, sembunyikan data sensitif, tujuan | Dialog preview |
| Logout WA, hapus slot, cabut izin | Tiga penjelasan dampak berbeda | Konfirmasi dengan status hasil |
| Tutup hari: selesai/nihil | Pilihan eksplisit dan penjelasan | Dialog pendek dari Beranda/kalender |
| Persetujuan support | Pilih data, tujuan, masa akses, revoke | Dialog/panel |
| Aksi operator sensitif | Ringkasan dampak → alasan → reauth → hasil | Pola yang sama; tidak tersimpan karena toggle saja |

## 6. Susunan layar jangkar

### Beranda mobile

Urutan konten:

1. Sapaan, periode, sembunyikan nominal, notifikasi.
2. Kartu **Saldo tercatat** dengan keterangan sumber uang virtual.
3. Kartu **Sisa anggaran**: rencana − pengeluaran terkonfirmasi; nominal usulan terpisah.
4. Jatah kategori hari ini, misalnya Makan dan Jajan.
5. Perlu ditinjau dan status offline jika relevan.
6. Tagihan terdekat dan transaksi terbaru.
7. Status hari: Belum selesai / Selesai / Nihil.
8. Bottom navigation tetap terjangkau.

Beranda desktop memakai sidebar, header periode, ringkasan saldo/anggaran/pemasukan/pengeluaran, grafik arus kas, anggaran kategori, transaksi terbaru, serta panel tugas hari ini. Ringkasan tidak dibanjiri seluruh fitur.

### Review struk

- Desktop: bukti asli di kiri, hasil ekstraksi yang dapat diedit di kanan, ringkasan dampak dan CTA di bawah.
- Mobile: bukti bisa diperbesar; form tetap halaman utama, bukan mengecilkan dua kolom desktop.
- Field yang meragukan memiliki label dan penjelasan; tidak menampilkan angka confidence sebagai jaminan.
- Simpan aktif setelah field wajib valid. Ada opsi Batal, Isi manual, dan Tinjau nanti sesuai status job.

### WhatsApp

- Bot bersama dan sesi pribadi dipisahkan jelas sebelum pengguna menautkan nomor.
- Mode pribadi menjelaskan perangkat tertaut pihak ketiga, pilihan chat, dan izin terpisah untuk AI.
- Pada satu HP, pairing code menjadi jalur pertama; QR tersedia untuk perangkat lain.
- Connected baru ditampilkan setelah konfirmasi status server.
- Tombol Reconnect, Tautkan ulang, Logout, dan Hapus sesi mengikuti keadaan aktual.

## 7. Alur utama yang harus diprototipekan

1. **Daftar → verifikasi → onboarding singkat → transaksi manual pertama.** Integrasi dan pengaturan lanjutan dapat dilewati.
2. **Beranda → Catat angka → pilih kategori/dompet → simpan → undo.** Target usability dari PRD: ≤10 detik untuk pengguna yang sudah menyiapkan preferensi; wajib diuji, bukan diklaim sudah tercapai.
3. **Teks beberapa pengeluaran → preview → perbaiki kategori/tanggal → simpan sekali.**
4. **Upload/share bukti → izin bila diperlukan → proses → review → simpan → anggaran diperbarui.**
5. **AI gagal → OCR sementara → review manual → pemeriksaan ulang → konflik bila berbeda.** Transaksi final tidak ditimpa diam-diam.
6. **Bukti diduga sama → bandingkan → gabung/pertahankan terpisah/batalkan.**
7. **Buat anggaran → copy periode → edit limit → simulasi belanja → lihat sisa/lebih budget.**
8. **Transfer ke tabungan → saldo berpindah → kemajuan target berubah → tidak menambah konsumsi.**
9. **Tagihan jatuh tempo → catat pembayaran sebagian/penuh → sisa kewajiban diperbarui.**
10. **WhatsApp bot bersama → verifikasi nomor → opt-in pengingat → STOP/jeda.**
11. **Sesi WA pribadi → disclosure/izin → kode/QR → terhubung → putus → reconnect/login ulang → logout/hapus.**
12. **Offline → catat lokal → refresh → online → sync sekali / selesaikan konflik.**
13. **Impor CSV → mapping → validasi → deduplikasi → konfirmasi → hasil/rollback.**
14. **Ekspor atau hapus akun → verifikasi → status proses; ledger tidak dihapus hanya karena logout WA.**
15. **User membuka tiket → memilih lampiran → Admin menangani dalam izin → akses dicabut/kedaluwarsa.**
16. **Superuser mengubah limit/flag/role → ringkasan dampak → reauth → audit → hasil.**

## 8. Matriks keadaan wajib

| Area | Keadaan yang dirancang | Isi pesan/tindakan |
|---|---|---|
| Semua daftar | Loading, kosong pertama, hasil filter kosong, berhasil, gagal | Skeleton proporsional; CTA relevan; retry tanpa kehilangan input. |
| Simpan manual | Menyimpan, berhasil server, tersimpan lokal, gagal | Jangan menyamakan Tersimpan di perangkat dengan Tersimpan di akun. |
| Offline | Offline, antre, syncing, synced, conflict | Status per catatan, retry, batalkan, pilihan versi dan waktu. |
| Anggaran | Belum ada, aman, mendekati batas, habis, negatif | Selalu angka dan label; overspend tetap boleh dicatat. |
| Status hari | Belum dilaporkan, sebagian, nihil, selesai | Hari tanpa input tidak otomatis nihil. |
| Bukti | Memilih, unggah, antre, proses, sementara, perlu tinjau, gagal, batal, diverifikasi | Dampak ke ledger jelas; manual selalu tersedia. |
| Review | Nominal ambigu, tanggal tidak pasti, belum dibayar, duplikat, hasil berbeda | Field spesifik yang perlu diperbaiki dan pilihan yang jelas. |
| WA | Belum terhubung, pairing, kedaluwarsa, connected, disconnected, reconnecting, login ulang, error, fitur dibatasi | Status aktual dan tindakan berikutnya, tanpa memperlihatkan token. |
| Kuota | Normal, mendekati, habis | Sisa/masa reset dari konfigurasi aktual; manual atau OCR jika tersedia; tidak menawarkan paket berbayar. |
| Privasi | Izin ditolak, aktif, dicabut, queued dibatalkan | Dampak serta pilihan tetap mencatat manual. |
| Akun | Belum verifikasi, sesi kedaluwarsa, suspend, deletion pending | Jalur aman masuk/verifikasi/bantuan dan progres. |
| Akses | Tidak berhak, objek tidak tersedia, tautan bukti kedaluwarsa | Pesan aman tanpa membocorkan data pengguna lain. |
| Platform | Integrasi turun, API terganggu, maintenance | Dampak spesifik dan alternatif; bukan error mentah teknis. |

## 9. Design system awal

Token berikut adalah titik awal untuk diuji pada desain visual, bukan hasil contrast audit yang sudah lulus.

| Elemen | Usulan |
|---|---|
| Brand utama | Ungu #6D4CE8; teks tombol putih, diverifikasi saat QA. |
| Latar light | #F7F7FC; surface #FFFFFF; lavender #EEE9FF. |
| Teks light | Primer #202334; sekunder #62677B. |
| Status | Sukses #16724A; perhatian #885500; error #B4233A; informasi #155B94. |
| Pastel kategori | Lavender, cyan, mint, peach, pink; selalu disertai ikon dan nama. |
| Dark mode | Latar #13151F, surface #1D2030; brand terang #B8A4FF, teks #F3F4FA. |
| Font | Plus Jakarta Sans untuk heading; Inter atau font sistem untuk isi dan angka. Validasi keterbacaan ID/EN. |
| Ukuran | Isi utama 16 px; pendukung 14 px; judul mobile 24–28 px; nominal penting 28–36 px. |
| Angka uang | Tabular numerals, rata kanan di tabel, format Rupiah konsisten, nilai negatif eksplisit. |
| Spacing | Sistem 4/8 px; margin mobile 16–20 px, desktop 24–32 px. |
| Radius | Kartu 20–24 px, field 12–14 px, modal 24 px, chips berbentuk pill. |
| Ikon | Satu keluarga outline; label tetap dipakai untuk navigasi dan tindakan penting. |
| Grafik | Warna konsisten, legenda dan satuan, tabel alternatif, tanpa dekorasi yang mengaburkan angka. |
| Motion | Transisi ringan sekitar 150–220 ms; hormati reduced motion dan jangan menghambat pencatatan. |

Komponen dasar: app shell mobile/desktop/operator; button; form field; amount input; currency; category picker; wallet picker; date/time picker; tabs; chips; progress; status badge; notice; toast; dialog/sheet; menu; table/list; receipt viewer; timeline; quota meter; consent card; sync indicator; chart legend; empty/error state.

## 10. Aturan responsive dan aksesibilitas

- Artboard utama: mobile **390 × 844** dan desktop **1440 × 1024**. Uji tambahan pada 360 px, tablet 768–1024 px, dan desktop 1280–1920 px. Ini acuan QA, bukan kewajiban tinggi halaman tetap.
- Mobile satu kolom dengan urutan prioritas; tablet satu/dua kolom; desktop grid dan panel kontekstual.
- Tabel transaksi mobile menjadi daftar kartu ringkas dengan detail; tidak memaksa seluruh tabel desktop mengecil.
- Tabel operasional yang perlu hubungan antarkolom dapat memakai scroll terbatas dengan label tetap, disertai akses detail yang nyaman.
- Target sentuh direncanakan minimal 44 × 44 px. Focus terlihat, label eksplisit, error terkait field, urutan keyboard logis.
- Target WCAG 2.2 AA: kontras, keyboard, screen reader, zoom 200%, reduced motion, dan grafik yang tidak hanya mengandalkan warna. Kelulusan memerlukan pengujian implementasi.
- Sembunyikan nominal berlaku konsisten pada kartu, daftar dan preview yang relevan.
- Teks Indonesia menjadi dasar. Uji English agar label, tanggal, dan tombol tidak terpotong.
- Instalasi PWA berupa tawaran kontekstual yang dapat ditutup. Dukungan share target/biometrik tidak diasumsikan universal.

## 11. Urutan desain dengan 12ui-design

### Gelombang 1 — fondasi dan layar jangkar

1. Susun empat kandidat arah visual **Beranda mobile**, memakai referensi lampiran dan isi VenFinance.
2. Periksa gambar kandidat asli: hierarki angka, kebersihan kartu, kontras, ruang, navigasi, dan kesesuaian referensi. Pilih satu arah terkuat; jangan mencampur semua kandidat menjadi kompromi generik.
3. Adaptasikan arah terpilih menjadi **Beranda desktop**; verifikasi bahwa keduanya satu sistem desain.
4. Rancang **Quick Add**, **Anggaran**, **Review struk**, dan **WhatsApp** di kedua ukuran. Layar ini menguji identitas visual, form, kepadatan data, serta alur paling khas produk.

### Gelombang 2 — aplikasi pengguna lengkap

Perluas desain terpilih melalui branch untuk transaksi/detail, dompet, kalender, target, utang, tagihan, laporan, inbox dan pengaturan. Setiap cabang merujuk layar jangkar yang sama; navigasi dan komponen konsisten.

### Gelombang 3 — publik dan akses akun

Landing, demo sintetis, auth, onboarding, bantuan, kebijakan dan status layanan; memakai bahasa visual produk yang sudah stabil.

### Gelombang 4 — operator

Admin dan Superuser memakai token yang sama tetapi hierarki lebih padat, fokus monitoring, izin, audit, dan dampak tindakan. Versi mobile tetap mencakup fungsi penting serta konfirmasi tindakan sensitif.

### Gelombang 5 — kelengkapan dan handoff

Dark mode, English, loading/empty/error/offline, konflik, kuota, keyboard, prototipe alur, anotasi dan audit cakupan. Jika hasil diekspor menjadi HTML, gunakan keluaran 12ui sebagai dasar dan cocokkan tiap halaman ke gambar sumbernya.

## 12. Deliverable tahap visual

1. Peta halaman dan alur ini.
2. Style direction terpilih dan design system dengan komponen serta state.
3. High-fidelity mobile dan desktop untuk template yang disepakati pada inventaris, dengan manifest cakupan nyata.
4. Prototipe klik untuk alur inti dan alur kegagalan yang menentukan kepercayaan.
5. Anotasi: trigger, validasi, status, izin, perhitungan yang ditampilkan, responsivitas dan dampak tindakan.
6. Paket handoff aset dan dokumen desain UI/UX; ekspor HTML jika digunakan diberi status prototipe, bukan backend production.
7. Daftar sisa pekerjaan eksplisit bila ada layar belum tergambar. Template kosong/holding page tidak dihitung sebagai desain selesai.

## 13. Kriteria review desain

- Navigasi dapat dipahami tanpa tutorial panjang dan semua fitur PRD punya tujuan tampilan.
- Beranda menjawab: saldo tercatat berapa, sisa budget berapa, hari ini perlu melakukan apa.
- Saldo, budget, target, utang, provisional dan estimasi tidak tercampur.
- Transaksi, transfer, refund dan pembayaran utang menampilkan konsekuensi yang tepat.
- Hasil bacaan salah/ambigu bisa dikoreksi tanpa membuat duplikat.
- Bukti dan form tetap nyaman pada satu HP.
- WA pada perangkat yang sama tidak memaksa memindai QR dari layar sendiri.
- Offline, sinkronisasi, error dan kuota memiliki jalan lanjut yang jelas.
- Izin opsional dapat ditolak/cabut; tindakan destruktif menjelaskan dampak dan meminta autentikasi sesuai PRD.
- Operator tidak diberi jalur membaca ledger/chat pengguna secara default.
- Light/dark, ID/EN, keyboard, zoom, screen reader dan rentang ukuran masuk daftar pemeriksaan.
- Klaim usability/performa/aksesibilitas diberi status target sampai pengujian selesai.

## 14. Asumsi kerja

Nama VenFinance, branding ungu–lavender, bahasa Indonesia utama, English opsional, serta IDR/Asia-Jakarta menjadi asumsi awal. Tidak perlu menunda perencanaan untuk memilih provider teknis.

Usulan PRD seperti kuota AI, retensi bukti, tenggang hapus akun, metode MFA, serta akses publik sesi WA pribadi tetap configurable/belum final. UI menampilkan nilai konfigurasi nyata dan status fitur; desain tidak menjadikan usulan tersebut janji produk.

Paket ini khusus perencanaan UI/UX. Ia tidak menetapkan skema database, kontrak API, arsitektur deployment, atau bukti kelulusan production gate.
