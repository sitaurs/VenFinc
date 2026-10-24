# VenFinance — Alur dan Handoff

## Alur utama

| Alur | Screen rujukan |
|---|---|
| Mulai dari pengunjung | PUB-01 → AUTH-02 → AUTH-03 → ONB-01…05 → FIN-UI-01 |
| Catat angka | FIN-UI-01 → FLOW-01 → FIN-UI-02/03 |
| Teks natural | FLOW-02 → periksa tiga usulan → konfirmasi |
| Foto bukti | REV-02 → REV-01 → REV-03 → konfirmasi |
| Nominal bacaan berbeda | REV-04 → pilih/perbaiki → konfirmasi koreksi |
| Kemungkinan ganda | REV-05 → gabungkan bukti/simpan terpisah/batal |
| Transfer dompet | FIN-UI-05/06 → FLOW-03 → pratinjau → simpan |
| Split kategori | FIN-UI-03/REV-03 → FLOW-04 → total pembagian valid → simpan |
| Anggaran | FIN-UI-07/08 → FLOW-05; FIN-UI-16 untuk simulasi |
| Target dan utang | FIN-UI-09…12; FLOW-06 untuk cicilan |
| Tagihan | FIN-UI-13/14 → catat pembayaran yang benar-benar terjadi |
| WhatsApp bot bersama | SET-05 → SET-06 → pengingat opt-in SET-10 |
| WhatsApp pribadi | SET-05 → izin → SET-07 → SET-08; STATE-03 untuk kode kedaluwarsa |
| Privasi dan data | SET-09/12/19; ekspor dan penghapusan dengan verifikasi |
| Impor | SET-13 → SET-14 → konfirmasi data valid |
| Offline | SET-18; STATE-02 untuk upload gagal |
| Bantuan | SET-16 → SET-17; ADM-04/05 hanya konten yang dibagikan dengan izin |
| Operator | ADM-01…07; SYS-01…11 untuk pengaturan berhak lebih tinggi |

## Pola interaksi

- Setelah Simpan, tampilkan status yang membedakan tersimpan di perangkat dari tersimpan di server.
- Pertahankan isian ketika permintaan gagal. Retry tidak membuat transaksi ganda.
- Foto ambigu menghasilkan usulan. Nilai final tidak ditimpa pemeriksaan ulang tanpa keputusan pemilik.
- Form mobile panjang dapat di-scroll; navigasi bawah dan footer tindakan mengikuti safe area dan keyboard.
- Sheet Catat bisa ditutup tanpa menghilangkan draft yang memang dipilih untuk disimpan.
- Logout WA, hapus slot WA, cabut izin dan hapus akun memiliki dampak berbeda.
- Admin tidak mendapat tombol membuka saldo/ledger/chat pribadi pengguna lain.
- Aksi sistem sensitif menampilkan dampak, alasan, autentikasi ulang dan hasil/audit.

## Prioritas penerjemahan ke kode

1. Ambil shell, brand, warna, kartu, input uang dan navigasi dari desain acuan.
2. Gunakan komponen bersama untuk mobile dan desktop; sesuaikan susunan konten.
3. Gunakan fixture JSON sebagai acuan angka; bangun grafik dari nilai data, bukan mengambil grafik sebagai gambar.
4. Ketik ulang copy UI ke berkas locale yang dapat diaudit. PNG berfungsi sebagai acuan visual dan posisi.
5. Implementasikan state, izin dan perhitungan sesuai PRD. Keberadaan gambar belum membuktikan backend atau otorisasi bekerja.
6. Uji layar kecil, keyboard, kontras, zoom, screen reader dan alur manual saat AI/WA terganggu.

## Cakupan visual

78 tujuan tampilan utama mendapat pasangan mobile dan web. Tersedia pula enam pasangan alur form, empat pasangan keadaan khusus, serta dua pasangan acuan dark mode. Mayoritas gambar adalah satu viewport representatif; halaman panjang diteruskan dengan komponen dan pola yang sama saat implementasi. Dark mode memakai dua layar acuan, dan English mengikuti struktur locale pada rencana desain.

File tidak memuat backend, koneksi WhatsApp nyata, akun bank, QR pairing aktif atau transaksi pengguna asli. Label data contoh dan kode demo sengaja dipakai di desain.
