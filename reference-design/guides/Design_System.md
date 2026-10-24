# VenFinance — Sistem Desain

## Arah visual

Putih–lavender, aksen ungu, kartu membulat, hierarki angka yang kuat, ikon kategori pastel dan ilustrasi lembut. Gambar referensi pengguna menjadi acuan gaya. Identitas VenFinance memakai dua stroke membulat membentuk V. Gunakan file brand yang disediakan agar bentuknya tidak berubah antarhalaman.

## Token dasar

| Token | Nilai |
|---|---|
| Brand | #6D4CE8 |
| Brand pada dark mode | #B8A4FF |
| Latar terang | #F7F7FC |
| Surface terang | #FFFFFF |
| Lavender surface | #EEE9FF |
| Teks utama terang | #202334 |
| Teks pendukung terang | #62677B |
| Latar gelap | #13151F |
| Surface gelap | #1D2030 |
| Teks utama gelap | #F3F4FA |
| Sukses | #16724A |
| Perhatian | #885500 |
| Error | #B4233A |
| Informasi | #155B94 |

Warna pastel kategori: Makan peach/oranye, Transportasi mint/biru, Jajan pink, Lainnya lavender. Status selalu disertai teks dan ikon. Untuk komposisi laporan, bedakan persentase dari total pengeluaran dengan persentase penggunaan anggaran kategori.

## Tipografi dan jarak implementasi

- Rekomendasi font implementasi: Plus Jakarta Sans untuk heading, Inter/font sistem untuk isi. Bentuk huruf dalam PNG merupakan hasil raster generatif.
- Isi utama 16 px; pendukung 14 px; judul mobile 24–28 px; nominal penting 28–36 px.
- Gunakan tabular numerals dan format Rupiah Indonesia. Angka uang di tabel rata kanan; nilai negatif memakai tanda minus.
- Spacing 4/8 px; margin mobile 16–20 px, desktop 24–32 px.
- Kartu radius 20–24 px; field 12–14 px; modal/sheet 24 px.
- Target sentuh 44 × 44 px; focus keyboard terlihat; reduced motion didukung.

Nilai tersebut adalah acuan membangun komponen. Pengukuran kontras, keyboard, screen reader, performa dan usability dilakukan pada implementasi.

## Navigasi

Mobile: Beranda, Transaksi, + Catat, Anggaran, Lainnya. Tombol Catat membuka alur input. Dompet, target, utang, tagihan, laporan dan pengaturan dapat diakses dari Lainnya. Detail menggunakan back header; satu tujuan utama aktif pada navigasi.

Desktop: Beranda, Transaksi, Anggaran, Dompet, Target & Utang, Tagihan, Laporan, Perlu Ditinjau, WhatsApp, Pengaturan. Area Admin dan Superuser memakai navigasi operasional dan konteks role yang jelas.

Publik dan akses akun menggunakan shell tanpa data akun pribadi. Onboarding terdiri dari lima langkah dan tetap menyediakan Lewati/Atur nanti.

## Pemakaian aset

- `assets/brand`: identitas raster. Jaga proporsi dan ruang kosongnya. Varian putih digunakan di permukaan gelap.
- `assets/icons/navigation`: ikon ungu. Label tetap disertakan pada navigasi dan aksi penting.
- `assets/icons/categories`: ikon kategori pada tile pastel; gunakan di kartu dengan kontras yang sesuai.
- `assets/illustrations`: ilustrasi terpisah ber-alpha. Pakai untuk welcome, empty, review, offline, tabungan dan sukses.
- `assets/backgrounds`: latar dekoratif; teks dan angka tetap elemen UI tersendiri.
- `assets/extracted`: potongan ilustrasi dari screen, dengan latar gambar aslinya.
- `assets/components`: potongan komponen untuk referensi bentuk, jarak dan komposisi. Saat implementasi, buat tombol, label, angka, tabel dan grafik dari komponen serta data hidup.

PNG mempunyai resolusi native yang dicatat dalam manifest. Hindari memperbesar aset raster berlebihan. Font, ikon, kartu dan grafik pada screenshot tetap perlu diterjemahkan menjadi komponen saat membangun aplikasi.

## Data, izin dan status

Angka `Saldo tercatat`, `Sisa anggaran`, `Estimasi`, dan `Perlu ditinjau` selalu punya label berbeda. Pending Rp18.000 tidak masuk pengeluaran final Rp920.000. Transfer antardompet tidak menambah pemasukan/pengeluaran konsumsi. Dana target Rp250.000 sudah menjadi bagian saldo Bank Rp450.000.

Keadaan contoh yang mengubah angka, seperti overspend atau pratinjau pembayaran cicilan, diberi label skenario/pratinjau. Nilainya tidak mengganti fixture baseline sebelum dikonfirmasi.

Kuota, retensi, metode MFA, syarat password, batas file dan masa berlaku kode adalah konfigurasi produk. Angka ilustratif pada screen harus diselaraskan dengan konfigurasi final. Copy hukum pada screen merupakan draf tata letak, bukan kebijakan yang sudah disahkan.

WhatsApp pribadi menggunakan perangkat tertaut pihak ketiga dan membutuhkan izin serta ketersediaan fitur. Pengiriman bukti ke penyedia AI pihak ketiga memiliki izin terpisah. Manual tetap tersedia saat integrasi dinonaktifkan.
