# DESIGN-06 — Hasil Audit Handoff Desain (review terhadap ZIP pengguna)

**Bahan nyata:** 4 ZIP yang diserahkan pemilik produk; `screen_manifest.json` memuat **180 PNG** untuk **90 screen ID** yang sama di mobile dan web. Setiap dimensi tercatat 361×867 dan 1211×867, bukan layout HTML hidup.

## Yang wajib dipertahankan

1. **Identitas visual:** latar neutral `#F7F7FC`, violet `#6D4CE8`, card putih bulat, nama VenFinance, kategori pastel. Komponen harus diimplementasikan dengan CSS token asli, bukan dashboard template.
2. **Navigasi responsif:** pada mobile memakai tab Beranda/Transaksi/+Catat/Anggaran/Lainnya; di desktop memakai sidebar, dan shell Admin/Superuser terpisah. Halaman lain adalah route, overlay, atau state, bukan screenshot sebagai image background.
3. **Hierarki keuangan:** satu angka ringkasan utama, progress anggaran yang jelas, riwayat, target tabungan, utang, serta pengingat yang tidak menghakimi.
4. **Mobile parity:** halaman `SET-05..08` mengatur GOWA multiuser melalui PWA, termasuk pairing via kode ketika perangkat yang sama tidak bisa memindai QR sendiri.
5. **Review dan konflik:** `REV-03..05` dan `STATE-02` bukan dekorasi; jumlah belum final dan perbedaan OCR/LLM wajib dibedakan dari posted ledger.
6. **Ops shell:** `ADM-*` dan `SYS-*` harus mengurangi paparan data privat; angka pada gambar hanyalah demo, tidak memberi hak baca transaksi user lain.

## Temuan yang harus dinormalisasi saat implementasi

- **Visual bukan bukti perhitungan:** angka saldo/anggaran demo pada screenshot tidak dipakai sebagai seed riil; status sinkron lokal/pending/provisional/posted dipisahkan.
- **Menu aktif salah di sebagian artboard:** state menu ditentukan route/role aktual, bukan menyalin highlight bitmap mentah jika tidak sesuai.
- **Contrast dan font skala:** teks 12px pada screenshot yang diperkecil bukan izin membuat label sulit dibaca. Gunakan sekurang-kurangnya 14px untuk keterangan penting, cek kontras dan keyboard.
- **Dark mode:** hanya `DARK-01/02` anchor visual; tema gelap harus berlaku ke seluruh 90 screen ID.
- **Landing dan legal:** layar kebijakan tidak berarti kebijakan hukum telah disahkan; isi legal/privasi final harus memiliki persetujuan pemilik dan kajian kepatuhan.
- **Fitur tanpa layar khusus:** animasi kesalahan, autentikasi ulang, upload retry, cancel, offline, dan denied state wajib ditambahkan pada komponen atau state existing sesuai UX requirement.
- **Assets dan font:** jangan memasang screenshot utuh sebagai UI interaktif. Logo dan ikon kategori dari PNG resmi boleh; file font tidak boleh dibundel ulang tanpa pemeriksaan lisensi.

## Audit bukti

- Indeks: `reference-design/guides/screen_inventory.json` dan `screen_manifest.json`.
- Source style: `reference-design/guides/design_tokens.json`, `Design_System.md`, `Flows_and_Handoff.md`.
- Ringkasan visual: `reference-design/previews/mobile-core.jpg`, `web-core.jpg`, `mobile-ops.jpg`, `web-ops.jpg`.
- Original PNG resolusi penuh tersedia pada **empat ZIP desain user**, tidak dikemas ulang pada ZIP docs-lite; gunakan full reference pack atau serahkan keempat ZIP asli ke coding agent.

**Keterbatasan:** QA visual pada tahap dokumen bukan pengujian kode/aplikasi. Setelah implementasi, setiap layar harus diuji terhadap gambar aslinya dan perubahan yang disengaja dicatat. Semua security/functional/performance gates masih `NOT RUN`.
