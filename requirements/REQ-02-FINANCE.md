# REQ-02-FINANCE — User Stories & Acceptance Criteria

**PRD dasar:** [`PRD-03-FINANCE-CORE.md`](../docs/prd/PRD-03-FINANCE-CORE.md).

**Interpretasi:** AC-A adalah observasi dasar untuk satu ID; AC-B adalah skenario batas/negatif (bila berlaku). Semua kasus rinci wajib juga lolos [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md).

Tabel/entri di bawah mengikat ID persyaratan sumber. Apabila visual mockup berbeda dari hasil test ini, perilaku mengikuti requirement dan keputusan produk, bukan angka raster pada gambar.

## FIN: Acceptance per requirement

<a id="fin-001"></a>

### FIN-001 — Buat/edit/arsipkan banyak sumber uang virtual (tunai, bank, e-wallet, dll.).

- **US-FIN-001:** Sebagai pengguna, saya ingin buat/edit/arsipkan banyak sumber uang virtual (tunai, bank, e-wallet, dll.), agar pembukuan saya akurat.
- **AC-FIN-001-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Buat/edit/arsipkan banyak sumber uang virtual (tunai, bank, e-wallet, dll.).", **maka** Nama, ikon, saldo pembuka, mata uang dasar, dan status aktif; tidak login bank.
- **AC-FIN-001-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-002"></a>

### FIN-002 — Catat pemasukan, pengeluaran, transfer, refund, penyesuaian saldo, dan koreksi.

- **US-FIN-002:** Sebagai pengguna, saya ingin catat pemasukan, pengeluaran, transfer, refund, penyesuaian saldo, dan koreksi, agar pembukuan saya akurat.
- **AC-FIN-002-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Catat pemasukan, pengeluaran, transfer, refund, penyesuaian saldo, dan koreksi.", **maka** Jenis tepat, tanggal efektif, nilai bulat dalam unit terkecil, dompet sumber/tujuan, catatan opsional.
- **AC-FIN-002-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-003"></a>

### FIN-003 — Kategori & subkategori yang dapat diatur tiap pengguna.

- **US-FIN-003:** Sebagai pengguna, saya ingin kategori & subkategori yang dapat diatur tiap pengguna, agar pembukuan saya akurat.
- **AC-FIN-003-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Kategori & subkategori yang dapat diatur tiap pengguna.", **maka** Ada template (Makan, Bensin, Paket Data, Galon, Laundry, Cicilan, Tabungan, Jajan, dll.); custom/rename/arsip tidak merusak histori.
- **AC-FIN-003-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-004"></a>

### FIN-004 — Transfer antardompet tidak dihitung sebagai income atau expense.

- **US-FIN-004:** Sebagai pengguna, saya ingin transfer antardompet tidak dihitung sebagai income atau expense, agar pembukuan saya akurat.
- **AC-FIN-004-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Transfer antardompet tidak dihitung sebagai income atau expense.", **maka** Mutasi memindahkan saldo secara konsisten; satu kejadian transfer pada riwayat.
- **AC-FIN-004-B (batas):** Transfer Rp100.000 dari Tunai ke Bank mengurangi Tunai Rp100.000 dan menambah Bank Rp100.000; agregat pemasukan/pengeluaran konsumsi tetap sama.

<a id="fin-005"></a>

### FIN-005 — Catatan pengeluaran dapat di-split ke beberapa kategori.

- **US-FIN-005:** Sebagai pengguna, saya ingin catatan pengeluaran dapat di-split ke beberapa kategori, agar pembukuan saya akurat.
- **AC-FIN-005-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Catatan pengeluaran dapat di-split ke beberapa kategori.", **maka** Jumlah rincian = nominal transaksi; split diubah dengan riwayat audit; pengeluaran tidak dobel.
- **AC-FIN-005-B (batas):** Split Makan Rp6.000 dan Jajan Rp4.000 atas satu transaksi Rp10.000 hanya terposting sekali; split Rp9.000 ditolak sampai lengkap.

<a id="fin-006"></a>

### FIN-006 — Riwayat ledger lengkap dengan edit, void, dan restore yang dapat diaudit.

- **US-FIN-006:** Sebagai pengguna, saya ingin riwayat ledger lengkap dengan edit, void, dan restore yang dapat diaudit, agar pembukuan saya akurat.
- **AC-FIN-006-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Riwayat ledger lengkap dengan edit, void, dan restore yang dapat diaudit.", **maka** Perubahan tidak menghilangkan bukti asal; delete UI tidak menghapus jejak yang masih diperlukan untuk konsistensi.
- **AC-FIN-006-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-007"></a>

### FIN-007 — Transaksi pencarian, sort/filter, tag, merchant, metode bayar, lokasi opsional dan lampiran bukti.

- **US-FIN-007:** Sebagai pengguna, saya ingin transaksi pencarian, sort/filter, tag, merchant, metode bayar, lokasi opsional dan lampiran bukti, agar pembukuan saya akurat.
- **AC-FIN-007-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Transaksi pencarian, sort/filter, tag, merchant, metode bayar, lokasi opsional dan lampiran bukti.", **maka** Hanya data pengguna sendiri yang dapat dicari; semua filter kompatibel.
- **AC-FIN-007-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-008"></a>

### FIN-008 — Koreksi duplikasi dan gabung transaksi yang mewakili satu kejadian.

- **US-FIN-008:** Sebagai pengguna, saya ingin koreksi duplikasi dan gabung transaksi yang mewakili satu kejadian, agar pembukuan saya akurat.
- **AC-FIN-008-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Koreksi duplikasi dan gabung transaksi yang mewakili satu kejadian.", **maka** Tidak menghilangkan lampiran/evidence; tindakan butuh konfirmasi.
- **AC-FIN-008-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-009"></a>

### FIN-009 — Support transaksi bertanggal lampau, mendatang, timezone, dan status terjadwal.

- **US-FIN-009:** Sebagai pengguna, saya ingin support transaksi bertanggal lampau, mendatang, timezone, dan status terjadwal, agar pembukuan saya akurat.
- **AC-FIN-009-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Support transaksi bertanggal lampau, mendatang, timezone, dan status terjadwal.", **maka** Laporan berdasarkan tanggal efektif yang ditampilkan kepada user, bukan timestamp server semata.
- **AC-FIN-009-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-010"></a>

### FIN-010 — Input nominal valid & lokal.

- **US-FIN-010:** Sebagai pengguna, saya ingin input nominal valid & lokal, agar pembukuan saya akurat.
- **AC-FIN-010-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Input nominal valid & lokal.", **maka** Rupiah 10.000 ditampilkan sebagai Rp10.000; tidak ada drift float; pembulatan terdefinisi untuk mata uang lain jika kelak didukung.
- **AC-FIN-010-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-011"></a>

### FIN-011 — Anggaran per kategori/envelope dengan periode harian, mingguan, bulanan, atau siklus kustom.

- **US-FIN-011:** Sebagai pengguna, saya ingin anggaran per kategori/envelope dengan periode harian, mingguan, bulanan, atau siklus kustom, agar pembukuan saya akurat.
- **AC-FIN-011-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Anggaran per kategori/envelope dengan periode harian, mingguan, bulanan, atau siklus kustom.", **maka** Setiap periode memiliki awal/akhir jelas; zona waktu user dihormati.
- **AC-FIN-011-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-012"></a>

### FIN-012 — Sisa anggaran dihitung dari budget dikurangi pengeluaran bersih relevan.

- **US-FIN-012:** Sebagai pengguna, saya ingin sisa anggaran dihitung dari budget dikurangi pengeluaran bersih relevan, agar pembukuan saya akurat.
- **AC-FIN-012-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Sisa anggaran dihitung dari budget dikurangi pengeluaran bersih relevan.", **maka** Menampilkan budget, terpakai, sisa, dan lebih budget; termasuk opsi provisional secara terpisah.
- **AC-FIN-012-B (batas):** Jika budget Rp30.000 dan expense posted Rp8.000, sisa Rp22.000; provisional Rp5.000 ditampilkan terpisah dan tidak mengubah Rp22.000.

<a id="fin-013"></a>

### FIN-013 — Batas harian dan peristiwa belanja harus membentuk peringatan.

- **US-FIN-013:** Sebagai pengguna, saya ingin batas harian dan peristiwa belanja harus membentuk peringatan, agar pembukuan saya akurat.
- **AC-FIN-013-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Batas harian dan peristiwa belanja harus membentuk peringatan.", **maka** Jika Rp10.000/hari tercapai, aplikasi memberi tanda dan notifikasi bila diizinkan; tidak menolak QRIS bank.
- **AC-FIN-013-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-014"></a>

### FIN-014 — Template budget reusable & copy period.

- **US-FIN-014:** Sebagai pengguna, saya ingin template budget reusable & copy period, agar pembukuan saya akurat.
- **AC-FIN-014-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Template budget reusable & copy period.", **maka** User dapat menyesuaikan nominal per bulan tanpa merusak bulan lampau.
- **AC-FIN-014-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-015"></a>

### FIN-015 — Periode berbeda dengan frekuensi tagihan yang berbeda.

- **US-FIN-015:** Sebagai pengguna, saya ingin periode berbeda dengan frekuensi tagihan yang berbeda, agar pembukuan saya akurat.
- **AC-FIN-015-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Periode berbeda dengan frekuensi tagihan yang berbeda.", **maka** Contoh air galon Rp22.000/minggu dan laundry Rp60.000/bulan dapat diproyeksikan realistis berdasarkan tanggal pembelian/kejadian.
- **AC-FIN-015-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-016"></a>

### FIN-016 — Siklus bulanan mempertimbangkan 28/29/30/31 hari.

- **US-FIN-016:** Sebagai pengguna, saya ingin siklus bulanan mempertimbangkan 28/29/30/31 hari, agar pembukuan saya akurat.
- **AC-FIN-016-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Siklus bulanan mempertimbangkan 28/29/30/31 hari.", **maka** Rp10.000/hari menghasilkan 280k/290k/300k/310k sesuai jumlah hari, bukan dikunci 30 hari.
- **AC-FIN-016-B (batas):** Budget Rp10.000 per hari menghasilkan rencana Rp280.000 (Feb non-kabisat), Rp290.000 (Feb kabisat), Rp300.000 (30 hari), Rp310.000 (31 hari).

<a id="fin-017"></a>

### FIN-017 — Rollover sisa anggaran opsional per kategori, default nonaktif.

- **US-FIN-017:** Sebagai pengguna, saya ingin rollover sisa anggaran opsional per kategori, default nonaktif, agar pembukuan saya akurat.
- **AC-FIN-017-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Rollover sisa anggaran opsional per kategori, default nonaktif.", **maka** Aturan rollover transparan; pindah dana budget tidak mengubah saldo riil.
- **AC-FIN-017-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-018"></a>

### FIN-018 — Planned vs actual dan proyeksi sisa akhir bulan.

- **US-FIN-018:** Sebagai pengguna, saya ingin planned vs actual dan proyeksi sisa akhir bulan, agar pembukuan saya akurat.
- **AC-FIN-018-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Planned vs actual dan proyeksi sisa akhir bulan.", **maka** Proyeksi diberi label estimasi, tidak menyaru sebagai saldo aktual.
- **AC-FIN-018-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-019"></a>

### FIN-019 — Aturan anggaran ketika kategori belum diatur.

- **US-FIN-019:** Sebagai pengguna, saya ingin aturan anggaran ketika kategori belum diatur, agar pembukuan saya akurat.
- **AC-FIN-019-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Aturan anggaran ketika kategori belum diatur.", **maka** Transaksi tetap bisa dicatat dengan status 'tidak dianggarkan'; muncul rekomendasi memperbaiki.
- **AC-FIN-019-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-020"></a>

### FIN-020 — Reminder ketika anggaran mencapai threshold user-defined.

- **US-FIN-020:** Sebagai pengguna, saya ingin reminder ketika anggaran mencapai threshold user-defined, agar pembukuan saya akurat.
- **AC-FIN-020-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Reminder ketika anggaran mencapai threshold user-defined.", **maka** Threshold mis. 50%, 75%, 90%, 100%; anti-spam dan non-shaming.
- **AC-FIN-020-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-021"></a>

### FIN-021 — Tujuan tabungan dengan nominal target, target tanggal, setoran, dan progress.

- **US-FIN-021:** Sebagai pengguna, saya ingin tujuan tabungan dengan nominal target, target tanggal, setoran, dan progress, agar pembukuan saya akurat.
- **AC-FIN-021-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Tujuan tabungan dengan nominal target, target tanggal, setoran, dan progress.", **maka** Realisasi didasarkan pada transfer/setoran yang dicatat; bukan sekadar budget rencana.
- **AC-FIN-021-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-022"></a>

### FIN-022 — Sumber uang tersendiri untuk tabungan atau earmark budget.

- **US-FIN-022:** Sebagai pengguna, saya ingin sumber uang tersendiri untuk tabungan atau earmark budget, agar pembukuan saya akurat.
- **AC-FIN-022-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Sumber uang tersendiri untuk tabungan atau earmark budget.", **maka** User memilih pendekatan; sistem menjelaskan bahwa target tidak otomatis mengunci uang fisik.
- **AC-FIN-022-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-023"></a>

### FIN-023 — Pencatatan utang/piutang dengan pihak opsional, pokok, cicilan, jadwal, sisa, dan status.

- **US-FIN-023:** Sebagai pengguna, saya ingin pencatatan utang/piutang dengan pihak opsional, pokok, cicilan, jadwal, sisa, dan status, agar pembukuan saya akurat.
- **AC-FIN-023-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Pencatatan utang/piutang dengan pihak opsional, pokok, cicilan, jadwal, sisa, dan status.", **maka** Nilai pokok dan saldo payable/receivable berasal dari opening/loan event seimbang; pembayaran pokok menurunkan kewajiban/piutang dan kas, mengurangi envelope cicilan bila berlaku, sedangkan bunga/biaya terpisah dari konsumsi pokok.
- **AC-FIN-023-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-024"></a>

### FIN-024 — Reminder jatuh tempo utang/tagihan dan peringatan kekurangan dana.

- **US-FIN-024:** Sebagai pengguna, saya ingin reminder jatuh tempo utang/tagihan dan peringatan kekurangan dana, agar pembukuan saya akurat.
- **AC-FIN-024-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Reminder jatuh tempo utang/tagihan dan peringatan kekurangan dana.", **maka** Notifikasi mengikuti timezone user dan izin kanal; pembayaran tidak dicatat sebelum benar-benar dibayar.
- **AC-FIN-024-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-025"></a>

### FIN-025 — Penyesuaian saldo utang, pelunasan dipercepat, perubahan jadwal, dan pembayaran sebagian.

- **US-FIN-025:** Sebagai pengguna, saya ingin penyesuaian saldo utang, pelunasan dipercepat, perubahan jadwal, dan pembayaran sebagian, agar pembukuan saya akurat.
- **AC-FIN-025-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Penyesuaian saldo utang, pelunasan dipercepat, perubahan jadwal, dan pembayaran sebagian.", **maka** Riwayat peristiwa tetap tercatat; tidak membuat pengeluaran dobel.
- **AC-FIN-025-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-026"></a>

### FIN-026 — Tagihan / transaksi berulang (misal laundry, galon, paket data).

- **US-FIN-026:** Sebagai pengguna, saya ingin tagihan / transaksi berulang (misal laundry, galon, paket data), agar pembukuan saya akurat.
- **AC-FIN-026-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Tagihan / transaksi berulang (misal laundry, galon, paket data).", **maka** Dapat dibuat sebagai pengingat atau draft otomatis, tidak auto-final tanpa bukti/konfirmasi yang diperlukan.
- **AC-FIN-026-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-027"></a>

### FIN-027 — Pendapatan tetap dan tidak tetap; alokasi budget berdasarkan dana tersedia.

- **US-FIN-027:** Sebagai pengguna, saya ingin pendapatan tetap dan tidak tetap; alokasi budget berdasarkan dana tersedia, agar pembukuan saya akurat.
- **AC-FIN-027-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Pendapatan tetap dan tidak tetap; alokasi budget berdasarkan dana tersedia.", **maka** Template dapat disesuaikan jika pemasukan berubah, tidak menganggap semua user memiliki uang saku tetap.
- **AC-FIN-027-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-028"></a>

### FIN-028 — Ringkasan dashboard: cash balance, budget sisa, pemasukan/pengeluaran, tabungan, dan utang.

- **US-FIN-028:** Sebagai pengguna, saya ingin ringkasan dashboard: cash balance, budget sisa, pemasukan/pengeluaran, tabungan, dan utang, agar pembukuan saya akurat.
- **AC-FIN-028-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Ringkasan dashboard: cash balance, budget sisa, pemasukan/pengeluaran, tabungan, dan utang.", **maka** Tampilkan angka terverifikasi, provisional, dan rencana dengan label jelas.
- **AC-FIN-028-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-029"></a>

### FIN-029 — Laporan per hari, minggu, bulan, rentang tanggal dan perbandingan periode.

- **US-FIN-029:** Sebagai pengguna, saya ingin laporan per hari, minggu, bulan, rentang tanggal dan perbandingan periode, agar pembukuan saya akurat.
- **AC-FIN-029-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Laporan per hari, minggu, bulan, rentang tanggal dan perbandingan periode.", **maka** Zona waktu/awal periode konsisten; filter diterapkan ke semua agregasi.
- **AC-FIN-029-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-030"></a>

### FIN-030 — Grafik kategori, frekuensi belanja, merchant, hari/hours dan tren.

- **US-FIN-030:** Sebagai pengguna, saya ingin grafik kategori, frekuensi belanja, merchant, hari/hours dan tren, agar pembukuan saya akurat.
- **AC-FIN-030-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Grafik kategori, frekuensi belanja, merchant, hari/hours dan tren.", **maka** Tidak menyatakan sebab psikologis tanpa bukti.
- **AC-FIN-030-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-031"></a>

### FIN-031 — Insight kebiasaan: impulsive-spend check, hari jajan, pola melebihi budget.

- **US-FIN-031:** Sebagai pengguna, saya ingin insight kebiasaan: impulsive-spend check, hari jajan, pola melebihi budget, agar pembukuan saya akurat.
- **AC-FIN-031-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Insight kebiasaan: impulsive-spend check, hari jajan, pola melebihi budget.", **maka** Empatik, non-moralistik, berbasis data sendiri; bisa dinonaktifkan.
- **AC-FIN-031-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-032"></a>

### FIN-032 — Fitur 'Kalau beli ini, sisa berapa?' sebelum transaksi.

- **US-FIN-032:** Sebagai pengguna, saya ingin fitur 'Kalau beli ini, sisa berapa?' sebelum transaksi, agar pembukuan saya akurat.
- **AC-FIN-032-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Fitur 'Kalau beli ini, sisa berapa?' sebelum transaksi.", **maka** Simulasi tidak otomatis menyimpan transaksi; gunakan saldo budget aktual saat itu.
- **AC-FIN-032-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-033"></a>

### FIN-033 — Ringkasan periodik yang bisa dibaca dan dibagikan atas permintaan.

- **US-FIN-033:** Sebagai pengguna, saya ingin ringkasan periodik yang bisa dibaca dan dibagikan atas permintaan, agar pembukuan saya akurat.
- **AC-FIN-033-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Ringkasan periodik yang bisa dibaca dan dibagikan atas permintaan.", **maka** Informasi privat hanya dibagikan melalui interaksi eksplisit dengan preview.
- **AC-FIN-033-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-034"></a>

### FIN-034 — Ekspor CSV dan JSON lengkap per pemilik untuk migrasi/backup personal.

- **US-FIN-034:** Sebagai pengguna, saya ingin ekspor CSV dan JSON lengkap per pemilik untuk migrasi/backup personal, agar pembukuan saya akurat.
- **AC-FIN-034-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Ekspor CSV dan JSON lengkap per pemilik untuk migrasi/backup personal.", **maka** Ekspor dapat dipahami manusia, lengkap transaksi/kategori/identitas minimal; file attachment diekspor via opsi terpisah.
- **AC-FIN-034-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

<a id="fin-035"></a>

### FIN-035 — Impor CSV yang dipetakan secara manual.

- **US-FIN-035:** Sebagai pengguna, saya ingin impor CSV yang dipetakan secara manual, agar pembukuan saya akurat.
- **AC-FIN-035-A (G/W/T):** **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Impor CSV yang dipetakan secara manual.", **maka** Preview mapping, validasi, deduplikasi, rollback impor gagal; tidak minta password bank.
- **AC-FIN-035-B (batas):** Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi.

