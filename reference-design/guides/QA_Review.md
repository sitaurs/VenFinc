# Pemeriksaan desain dan aset

## Cakupan

Review visual dilakukan pada screen hasil generasi dan revisi: kesamaan gaya ungu–lavender, hierarki mobile/web, pasangan konten, nominal utama, pemisahan area publik dan operator, status transaksi, izin AI/WhatsApp, serta hasil pemotongan aset. Manifest integritas terpisah memeriksa file, ukuran dan checksum; pemeriksaan ini tidak menggantikan usability test atau pengujian aplikasi.

## Perbaikan yang diterapkan

- Saldo dompet, anggaran, kategori, target dan cicilan diselaraskan dengan fixture sintetis bersama.
- Pending dipisahkan dari transaksi final; transfer tidak menjadi pengeluaran konsumsi.
- Grafik dan persentase anggaran diberi konteks; simulasi perubahan memakai label pratinjau.
- Shell publik, autentikasi dan onboarding dipisahkan dari sidebar akun. Area operator memakai navigasi operasional.
- Persetujuan pemrosesan AI dan perangkat WhatsApp tertaut dibuat eksplisit. Jalur catat manual tetap tersedia.
- Panel operator berfokus pada metadata; permintaan data memakai ID pengguna disamarkan tanpa akses isi ekspor.
- Opt-out reminder merupakan ketentuan wajib. Hari pemeliharaan 26 Oktober 2026 diperbaiki menjadi Senin.
- Ikon, ilustrasi, brand dan latar dipisahkan, diberi nama, serta diperiksa pada latar kotak-kotak.

## Normalisasi saat implementasi

| Screen/kelompok | Instruksi handoff |
|---|---|
| Seluruh screen | Pakai satu komponen brand, font, ikon, angka dan spacing dari sistem desain; jangan membaca teks dari bitmap |
| Sidebar desktop | Ikat menu aktif ke route aktual. Beberapa gambar masih menyorot Ringkasan pada halaman detail |
| ADM-05 | Judul tiket adalah “Foto belum terbaca”; nama pelapor dipisahkan dari judul. Isi tiket final harus sama dengan daftar tiket |
| SYS-01 | Hitung jumlah layanan sehat dari status layanan yang benar; headline angka pada bitmap hanya contoh |
| SYS-06 | Jeda hanya reminder rutin. Notifikasi keamanan dan verifikasi tetap dikirim. Hapus kalimat raster yang masih menyebut seluruh notifikasi aplikasi/email berhenti |
| SYS-09 | Gunakan label “aktivitas sistem”, bukan “transaksi”; role platform hanya User, Admin, Superuser |
| SYS-08 / SYS-10 | Gunakan konteks “platform/pengguna” pada panel operator; hindari sapaan yang menyiratkan akses ledger pribadi |
| Publik/kebijakan | Copy hukum, aturan retensi dan batas layanan tetap draf yang memerlukan finalisasi produk |
| Seluruh formulir | Validasi, fokus, label aksesibel dan interaksi dibuat serta diuji pada implementasi |

## Batas verifikasi

Hasil diperiksa sebagai desain visual dan file raster. Belum dilakukan pengujian interaksi, keyboard, screen reader, pengukuran kontras seluruh elemen, akses role di backend, maupun validasi kebijakan hukum. Gambar bukan bukti kontrol keamanan telah diterapkan.
