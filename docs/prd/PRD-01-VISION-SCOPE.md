# PRD-01 — Visi, Cakupan Produk, Pengguna, dan Hasil Bisnis

**Relasi:** [Indeks](./PRD-00-INDEX.md) · [Finance](./PRD-03-FINANCE-CORE.md) · [PWA](./PRD-04-PWA-UX-INPUT.md) · [Kualitas](./PRD-09-NFR-ACCEPTANCE.md)

## 1. Masalah yang diselesaikan

Banyak orang, terutama mahasiswa/pekerja dengan pemasukan terbatas, **tahu anggaran bulanan** tetapi sering lupa mencatat pengeluaran kecil. Pembayaran QRIS yang cepat membuat pembelian impulsif terasa kecil hingga akumulasinya besar. Aplikasi pencatat biasa memerlukan entri manual, sedangkan OCR/AI kadang salah membaca bukti. Pengingat yang berlebihan juga dapat membuat pengguna berhenti menggunakan aplikasi.

VenFinance menyelesaikan masalah ini melalui kombinasi: input supercepat, kantong budget dengan sisa yang transparan, pengingat WhatsApp **opt-in**, ekstraksi bukti menggunakan AI/OCR dengan konfirmasi, dan insight yang tidak menghakimi.

## 2. Visi dan proposisi nilai

> “Catat uang semudah mengirim chat; lihat dampak setiap pengeluaran terhadap rencana bulanan; tetap memegang kontrol penuh atas data.”

Konsumen mendapat alat untuk **melacak**, **memahami**, dan **membatasi diri secara sadar**, bukan produk yang dapat menolak transaksi dari rekening bank. Produk bisa berfungsi tanpa WhatsApp, AI, ataupun koneksi permanen.

## 3. Tujuan produk — `PROD-*`

| ID | Kebutuhan produk | Ukuran penerimaan |
|---|---|---|
| `PROD-001` | Dapat digunakan banyak pengguna terdaftar dengan isolasi data yang ketat. | Semua objek privat scoped terhadap pemiliknya; uji lintas akun 100% ditolak. |
| `PROD-002` | Pengeluaran/pemasukan mudah dicatat dengan teks, nominal, foto, atau WA. | Pengguna baru dapat membuat transaksi manual sah tanpa AI/WA dalam <=30 detik setelah login. |
| `PROD-003` | Anggaran secara real-time menunjukkan sisa kategori, keseluruhan, dan tren. | Setiap perubahan transaksi terkonfirmasi langsung tercermin di sisa anggaran dan laporan. |
| `PROD-004` | Pengingat mendorong kebiasaan tanpa mempermalukan. | Semua notifikasi non-keamanan opt-in/konfigurabel; dapat dijeda/dimatikan. |
| `PROD-005` | AI tidak boleh merusak pembukuan. | Hasil ambigu/provisional tetap dapat dikoreksi; tidak ada perubahan nominal diam-diam. |
| `PROD-006` | Produk tetap berguna selama gangguan integrasi. | Pencatatan manual online tersedia walau WA/AI offline; draft offline antre tanpa hilang. |
| `PROD-007` | Platform siap untuk demo/lomba, namun dapat dioperasikan sebagai produk publik. | Landing page, onboarding, panel admin, kebijakan privasi, ekspor data, audit, dan pengujian rilis terpenuhi. |

## 4. Persona utama

### Persona A — Mahasiswa dengan uang bulanan tetap
- Uang saku terbatas; belanja beras, lauk, bensin, data, air galon, laundry, utang, tabungan.
- Kebiasaan jajan impulsif saat teman belanja; lebih sering QRIS daripada tunai.
- Ingin reminder singkat tiap malam dan grafik sisa budget yang mudah dimengerti.
- Butuh kontrol batas **virtual** jajan harian dan bulanan, bukan fitur bank.

### Persona B — Pekerja pemula
- Pemasukan rutin + sampingan; tagihan berkala dan target tabungan.
- Perlu pengeluaran berulang, pencarian histori, perbandingan bulan, ekspor.

### Persona C — Pengguna yang peduli privasi
- Mau mencatat keuangan tetapi tidak mau menautkan WhatsApp atau mengirim struk ke model AI.
- Memerlukan mode manual lengkap, transparansi kebijakan data dan kontrol retensi.

### Persona D — Pengelola platform
- Admin harus dapat memantau kesehatan layanan, laporan penyalahgunaan, dan kuota tanpa membuka isi keuangan pribadi.
- Superuser perlu kontrol kebijakan produk dan integrasi tingkat platform.

## 5. Model produk

1. **B2C single-owner ledger:** setiap akun memiliki keuangan sendiri; role platform tidak memengaruhi kepemilikan data.
2. **Public registration:** user dapat mendaftar, verifikasi, onboarding, dan memakai aplikasi secara mandiri.
3. **Free-first:** target gratis untuk pengguna dan operator dalam batas free-tier; tidak ada paket berbayar, billing, atau penguncian fitur berdasarkan pembayaran dalam spesifikasi ini.
4. **AI optional:** izin ekstraksi dapat dimatikan; setiap transaksi tetap dapat dibuat manual.
5. **WhatsApp optional:** mode bot bersama atau tautan akun pribadi dengan kontrol izin berbeda. Tidak memaksa pengguna menautkan WA.
6. **PWA sebagai kanal utama:** semua fungsi kritikal tersedia di web, WhatsApp adalah kanal bantu.

## 6. Ruang lingkup produk production

**Masuk lingkup dan harus dirancang penuh:**

- Landing publik, kebijakan layanan/privasi, kontak bantuan, status layanan, FAQ, demo menggunakan data fiktif.
- Registrasi, verifikasi email, login, pemulihan akun, pengaturan profil/preferensi, semua role dan RBAC.
- Dompet virtual, kategori, anggaran harian/mingguan/bulanan, pemasukan, pengeluaran, transfer, tagihan berulang, tabungan, utang/cicilan, pelacakan jajan, notifikasi overspend.
- Input manual/teks natural, upload/capture/sharing screenshot, OCR/AI, koreksi, deduplikasi, riwayat, pencarian, filter, ekspor.
- GOWA multi-device, bot bersama, opsi sesi WA pribadi, QR/pairing, reconnect, status, logout, hapus, reminder, STOP.
- Admin/superuser dashboard, feature flags, quota, log operasional yang disanitasi, sistem bantuan, kontrol operasional.
- Isolasi data multiuser, kontrol file, retensi, penghapusan, backup dan pemulihan, aksesibilitas, mode offline serta sinkronisasi.

**Tidak termasuk lingkup saat ini (jelas ke pengguna):**

- Mengontrol limit QRIS bank, memblokir pembayaran bank, API mutasi resmi bank, SMS scraping, credential banking, open banking.
- Layanan escrow, transfer uang nyata, pembayaran tagihan, investasi/crypto, pinjaman, skor kredit, produk perbankan.
- Keuangan gabungan keluarga/organisasi beserta izin berbagi ledger (perlu rancangan tenant terpisah jika ditambah).
- OCR/AI dengan klaim akurasi 100% atau penggantian keputusan final pengguna oleh AI.
- Menjual, membagikan, atau menganalisis isi transaksi personal untuk iklan.

## 7. Contoh skenario, bukan pengaturan untuk semua akun

Contoh *starter budget template* **"Mahasiswa Kos"**, berasal dari kebutuhan awal dan **hanya diberikan jika pengguna memilih template serta mengonfirmasi nominalnya**:

| Pos | Contoh / bulan |
|---|---:|
| Tabungan | Rp200.000 |
| Lauk | Rp300.000 (30 hari x Rp10.000, mengikuti jumlah hari bulan) |
| Belanja dapur (beras, mi, telur/sayur, minyak/bumbu) | Rp195.000 |
| Galon | ±Rp95.000 rata-rata; Rp22.000 per minggu, bisa Rp110.000 pada bulan 5 pembelian |
| Laundry | Rp60.000 |
| Cicilan utang | Rp100.000 |
| Bensin | Rp120.000 |
| Paket data | Rp75.000 |
| Jajan | Rp30.000 |
| Dana cadangan | Rp25.000 |
| **Total contoh** | **Rp1.200.000** |

Penting: uang kos/listrik diasumsikan di luar contoh ini; **aplikasi wajib mengingatkan pengguna mengecek biaya kos dan listrik**, bukan otomatis menganggapnya nol. Harga dan pemasukan dapat diubah, tidak dijadikan patokan nasional.

## 8. Journey pengguna produk

1. Pengunjung membaca manfaat dan privacy → daftar → verifikasi → pilih template/atur anggaran dari nol.
2. Pengguna menambahkan sumber saldo virtual dan kategori → membuat rencana bulan berjalan → melihat angka sisa.
3. Pengguna mencatat manual atau kirim struk → memeriksa nominal → transaksi muncul pada histori → laporan terbarui.
4. Pengguna opsional mengaktifkan WhatsApp → memilih bot bersama/akun pribadi → menetapkan jadwal pengingat.
5. Tiap hari pengguna menerima nudge yang sesuai keadaan pencatatan → menambahkan transaksi/hari nihil → mendapat ringkasan yang bisa diverifikasi.
6. Saat tergoda jajan, pengguna membuka simulasi dampak budget → memutuskan sendiri.
7. Akhir minggu/bulan mendapat review, peringatan komitmen, pembandingan, dan opsi ekspor/koreksi.
8. Pengguna dapat menonaktifkan AI/WA, mengekspor atau menghapus data kapan pun sesuai proses.

## 9. Metrik keberhasilan

| Metrik | Definisi produk | Target awal untuk validasi, dapat direvisi berdasarkan penggunaan |
|---|---|---|
| Aktivasi | Akun terverifikasi yang membuat >=1 transaksi dan >=1 budget dalam 7 hari | >=60% pengguna yang menyelesaikan onboarding |
| Pencatatan | Pengguna aktif yang mencatat transaksi pada >=4 hari/minggu | >=50% cohort aktif setelah 30 hari |
| Kepatuhan budget | Pengguna yang rutin melihat sisa anggaran dan memasukkan catatan tidak terlambat >7 hari | Tren meningkat antarbulan |
| Kepuasan ektraksi | Bukti yang dapat disetujui tanpa koreksi nominal | >=90% pada dataset uji representatif; bukan jaminan pengguna |
| Kepercayaan data | Pengaduan duplicate/nominal berubah tanpa persetujuan | 0 kejadian serius yang belum ditangani |
| Reliabilitas dasar | Manual recording tetap berjalan saat WA/AI down | 100% pada uji fault injection |
| Pengendalian biaya | Pemakaian platform di bawah free allowances dalam operasi target | 0 tagihan tak diotorisasi |

Metrik tidak boleh dihitung dengan mengakses isi transaksi per pengguna melalui panel operator; utamakan agregat dan data diagnostik minimal.

## 10. Kriteria selesai pada level produk

- Seluruh fungsi in-scope dapat digunakan oleh `user`, dengan privilege yang benar untuk admin/superuser.
- Pengguna baru tanpa integrasi eksternal bisa melakukan semua operasi keuangan inti.
- Pengguna yang memilih WhatsApp dapat mengatur sesi dan pengingat dari PWA tanpa mengunjungi UI GOWA.
- AI/OCR gagal, salah baca, atau offline tidak menyebabkan transaksi ganda atau hilang.
- Privasi, migrasi data, penghapusan, kebijakan publik, dan monitoring benar-benar berfungsi.
- Tidak ada 'demo mode' yang diam-diam memakai data pengguna sesungguhnya.
