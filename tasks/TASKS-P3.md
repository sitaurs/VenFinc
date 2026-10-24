# TASKS-P3 — Atomic finance ledger, budgets, debts and reports

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P3-001 — Schema atomic finance ledger

- **Status awal:** `todo`; **tujuan tunggal:** Create wallet accounts, finance_events, postings, allocations + constraints
- **Dependensi:** `P1-007`, `P2-003`.
- **Rujukan:** [`TRD-01-DATA-MODEL.md`](../architecture/TRD-01-DATA-MODEL.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Balanced posting enforced; inter-tenant FK rejected.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-002 — Build transaction posting command

- **Status awal:** `todo`; **tujuan tunggal:** Atomic SQL function with idempotency, concurrency safety and audit
- **Dependensi:** `P3-001`, `P1-006`.
- **Rujukan:** [`TRD-01-DATA-MODEL.md`](../architecture/TRD-01-DATA-MODEL.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Parallel duplicate key creates exactly one event and balanced entries.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-003 — Build read models finances

- **Status awal:** `todo`; **tujuan tunggal:** Tenant-scoped summary/projections, transaction and balance read side
- **Dependensi:** `P3-002`.
- **Rujukan:** [`TRD-02-API-CONTRACTS.md`](../architecture/TRD-02-API-CONTRACTS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Wallet sum matches exact ledger; no float drift.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-004 — Template categories and budgets

- **Status awal:** `todo`; **tujuan tunggal:** Seed opt-in student kos template as demo/config not default spending
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Budget planning does not create actual expense.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-001 — Buat/edit/arsipkan banyak sumber uang virtual (tunai, bank, e-wallet, dll.)

- **Status awal:** `todo`; **tujuan tunggal:** Buat/edit/arsipkan banyak sumber uang virtual (tunai, bank, e-wallet, dll.). Perilaku persis mengikuti FIN-001 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Buat/edit/arsipkan banyak sumber uang virtual (tunai, bank, e-wallet, dll.)" dari FIN-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-001-A dan AC-FIN-001-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Buat/edit/arsipkan banyak sumber uang virtual (tunai, bank, e-wallet, dll.).", **maka** Nama, ikon, saldo pembuka, mata uang dasar, dan status aktif; tidak login bank. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-002-01 — Catat pemasukan dan pengeluaran

- **Status awal:** `todo`; **tujuan tunggal:** Catat pemasukan dan pengeluaran. Perilaku persis mengikuti FIN-002 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Catat pemasukan dan pengeluaran" dari FIN-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-002-A dan AC-FIN-002-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Catat pemasukan, pengeluaran, transfer, refund, penyesuaian saldo, dan koreksi.", **maka** Jenis tepat, tanggal efektif, nilai bulat dalam unit terkecil, dompet sumber/tujuan, catatan opsional. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-002-02 — Catat transfer dan refund dengan pembalikan yang benar

- **Status awal:** `todo`; **tujuan tunggal:** Catat transfer dan refund dengan pembalikan yang benar. Perilaku persis mengikuti FIN-002 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-002-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Catat transfer dan refund dengan pembalikan yang benar" dari FIN-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-002-A dan AC-FIN-002-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Catat pemasukan, pengeluaran, transfer, refund, penyesuaian saldo, dan koreksi.", **maka** Jenis tepat, tanggal efektif, nilai bulat dalam unit terkecil, dompet sumber/tujuan, catatan opsional. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-002-03 — Catat koreksi dan penyesuaian saldo tanpa kehilangan audit

- **Status awal:** `todo`; **tujuan tunggal:** Catat koreksi dan penyesuaian saldo tanpa kehilangan audit. Perilaku persis mengikuti FIN-002 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-002-02`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Catat koreksi dan penyesuaian saldo tanpa kehilangan audit" dari FIN-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-002-A dan AC-FIN-002-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Catat pemasukan, pengeluaran, transfer, refund, penyesuaian saldo, dan koreksi.", **maka** Jenis tepat, tanggal efektif, nilai bulat dalam unit terkecil, dompet sumber/tujuan, catatan opsional. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-003 — Kategori & subkategori yang dapat diatur tiap pengguna

- **Status awal:** `todo`; **tujuan tunggal:** Kategori & subkategori yang dapat diatur tiap pengguna. Perilaku persis mengikuti FIN-003 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kategori & subkategori yang dapat diatur tiap pengguna" dari FIN-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-003-A dan AC-FIN-003-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Kategori & subkategori yang dapat diatur tiap pengguna.", **maka** Ada template (Makan, Bensin, Paket Data, Galon, Laundry, Cicilan, Tabungan, Jajan, dll.); custom/rename/arsip tidak merusak histori. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-004 — Transfer antardompet tidak dihitung sebagai income atau expense

- **Status awal:** `todo`; **tujuan tunggal:** Transfer antardompet tidak dihitung sebagai income atau expense. Perilaku persis mengikuti FIN-004 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Transfer antardompet tidak dihitung sebagai income atau expense" dari FIN-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-004-A dan AC-FIN-004-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Transfer antardompet tidak dihitung sebagai income atau expense.", **maka** Mutasi memindahkan saldo secara konsisten; satu kejadian transfer pada riwayat. Negative/boundary: Transfer Rp100.000 dari Tunai ke Bank mengurangi Tunai Rp100.000 dan menambah Bank Rp100.000; agregat pemasukan/pengeluaran konsumsi tetap sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-005 — Catatan pengeluaran dapat di-split ke beberapa kategori

- **Status awal:** `todo`; **tujuan tunggal:** Catatan pengeluaran dapat di-split ke beberapa kategori. Perilaku persis mengikuti FIN-005 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Catatan pengeluaran dapat di-split ke beberapa kategori" dari FIN-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-005-A dan AC-FIN-005-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Catatan pengeluaran dapat di-split ke beberapa kategori.", **maka** Jumlah rincian = nominal transaksi; split diubah dengan riwayat audit; pengeluaran tidak dobel. Negative/boundary: Split Makan Rp6.000 dan Jajan Rp4.000 atas satu transaksi Rp10.000 hanya terposting sekali; split Rp9.000 ditolak sampai lengkap. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-006-01 — Riwayat ledger terverifikasi

- **Status awal:** `todo`; **tujuan tunggal:** Riwayat ledger terverifikasi. Perilaku persis mengikuti FIN-006 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Riwayat ledger terverifikasi" dari FIN-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-006-A dan AC-FIN-006-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Riwayat ledger lengkap dengan edit, void, dan restore yang dapat diaudit.", **maka** Perubahan tidak menghilangkan bukti asal; delete UI tidak menghapus jejak yang masih diperlukan untuk konsistensi. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-006-02 — Void yang membuat reversal

- **Status awal:** `todo`; **tujuan tunggal:** Void yang membuat reversal. Perilaku persis mengikuti FIN-006 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-006-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Void yang membuat reversal" dari FIN-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-006-A dan AC-FIN-006-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Riwayat ledger lengkap dengan edit, void, dan restore yang dapat diaudit.", **maka** Perubahan tidak menghilangkan bukti asal; delete UI tidak menghapus jejak yang masih diperlukan untuk konsistensi. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-006-03 — Restore yang membuat event audit

- **Status awal:** `todo`; **tujuan tunggal:** Restore yang membuat event audit. Perilaku persis mengikuti FIN-006 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-006-02`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Restore yang membuat event audit" dari FIN-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-006-A dan AC-FIN-006-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Riwayat ledger lengkap dengan edit, void, dan restore yang dapat diaudit.", **maka** Perubahan tidak menghilangkan bukti asal; delete UI tidak menghapus jejak yang masih diperlukan untuk konsistensi. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-007-01 — Pencarian, sortir dan filter gabungan

- **Status awal:** `todo`; **tujuan tunggal:** Pencarian, sortir dan filter gabungan. Perilaku persis mengikuti FIN-007 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pencarian, sortir dan filter gabungan" dari FIN-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-007-A dan AC-FIN-007-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Transaksi pencarian, sort/filter, tag, merchant, metode bayar, lokasi opsional dan lampiran bukti.", **maka** Hanya data pengguna sendiri yang dapat dicari; semua filter kompatibel. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-007-02 — Tag, merchant, metode bayar dan lampiran

- **Status awal:** `todo`; **tujuan tunggal:** Tag, merchant, metode bayar dan lampiran. Perilaku persis mengikuti FIN-007 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-007-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Tag, merchant, metode bayar dan lampiran" dari FIN-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-007-A dan AC-FIN-007-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Transaksi pencarian, sort/filter, tag, merchant, metode bayar, lokasi opsional dan lampiran bukti.", **maka** Hanya data pengguna sendiri yang dapat dicari; semua filter kompatibel. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-008 — Koreksi duplikasi dan gabung transaksi yang mewakili satu kejadian

- **Status awal:** `todo`; **tujuan tunggal:** Koreksi duplikasi dan gabung transaksi yang mewakili satu kejadian. Perilaku persis mengikuti FIN-008 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Koreksi duplikasi dan gabung transaksi yang mewakili satu kejadian" dari FIN-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-008-A dan AC-FIN-008-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Koreksi duplikasi dan gabung transaksi yang mewakili satu kejadian.", **maka** Tidak menghilangkan lampiran/evidence; tindakan butuh konfirmasi. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-009 — Support transaksi bertanggal lampau, mendatang, timezone, dan status terjadwal

- **Status awal:** `todo`; **tujuan tunggal:** Support transaksi bertanggal lampau, mendatang, timezone, dan status terjadwal. Perilaku persis mengikuti FIN-009 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Support transaksi bertanggal lampau, mendatang, timezone, dan status terjadwal" dari FIN-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-009-A dan AC-FIN-009-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Support transaksi bertanggal lampau, mendatang, timezone, dan status terjadwal.", **maka** Laporan berdasarkan tanggal efektif yang ditampilkan kepada user, bukan timestamp server semata. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-010 — Input nominal valid & lokal

- **Status awal:** `todo`; **tujuan tunggal:** Input nominal valid & lokal. Perilaku persis mengikuti FIN-010 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Input nominal valid & lokal" dari FIN-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-010-A dan AC-FIN-010-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Input nominal valid & lokal.", **maka** Rupiah 10.000 ditampilkan sebagai Rp10.000; tidak ada drift float; pembulatan terdefinisi untuk mata uang lain jika kelak didukung. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-011-01 — Definisikan periode anggaran

- **Status awal:** `todo`; **tujuan tunggal:** Definisikan periode anggaran. Perilaku persis mengikuti FIN-011 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Definisikan periode anggaran" dari FIN-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-011-A dan AC-FIN-011-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Anggaran per kategori/envelope dengan periode harian, mingguan, bulanan, atau siklus kustom.", **maka** Setiap periode memiliki awal/akhir jelas; zona waktu user dihormati. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-011-02 — Buat anggaran kategori/global tanpa mencampur saldo

- **Status awal:** `todo`; **tujuan tunggal:** Buat anggaran kategori/global tanpa mencampur saldo. Perilaku persis mengikuti FIN-011 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-011-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Buat anggaran kategori/global tanpa mencampur saldo" dari FIN-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-011-A dan AC-FIN-011-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Anggaran per kategori/envelope dengan periode harian, mingguan, bulanan, atau siklus kustom.", **maka** Setiap periode memiliki awal/akhir jelas; zona waktu user dihormati. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-012 — Sisa anggaran dihitung dari budget dikurangi pengeluaran bersih relevan

- **Status awal:** `todo`; **tujuan tunggal:** Sisa anggaran dihitung dari budget dikurangi pengeluaran bersih relevan. Perilaku persis mengikuti FIN-012 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Sisa anggaran dihitung dari budget dikurangi pengeluaran bersih relevan" dari FIN-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-012-A dan AC-FIN-012-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Sisa anggaran dihitung dari budget dikurangi pengeluaran bersih relevan.", **maka** Menampilkan budget, terpakai, sisa, dan lebih budget; termasuk opsi provisional secara terpisah. Negative/boundary: Jika budget Rp30.000 dan expense posted Rp8.000, sisa Rp22.000; provisional Rp5.000 ditampilkan terpisah dan tidak mengubah Rp22.000. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-013 — Batas harian dan peristiwa belanja harus membentuk peringatan

- **Status awal:** `todo`; **tujuan tunggal:** Batas harian dan peristiwa belanja harus membentuk peringatan. Perilaku persis mengikuti FIN-013 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Batas harian dan peristiwa belanja harus membentuk peringatan" dari FIN-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-013-A dan AC-FIN-013-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Batas harian dan peristiwa belanja harus membentuk peringatan.", **maka** Jika Rp10.000/hari tercapai, aplikasi memberi tanda dan notifikasi bila diizinkan; tidak menolak QRIS bank. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-014 — Template budget reusable & copy period

- **Status awal:** `todo`; **tujuan tunggal:** Template budget reusable & copy period. Perilaku persis mengikuti FIN-014 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-014), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Template budget reusable & copy period" dari FIN-014; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-014-A dan AC-FIN-014-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Template budget reusable & copy period.", **maka** User dapat menyesuaikan nominal per bulan tanpa merusak bulan lampau. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-015 — Periode berbeda dengan frekuensi tagihan yang berbeda

- **Status awal:** `todo`; **tujuan tunggal:** Periode berbeda dengan frekuensi tagihan yang berbeda. Perilaku persis mengikuti FIN-015 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Periode berbeda dengan frekuensi tagihan yang berbeda" dari FIN-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-015-A dan AC-FIN-015-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Periode berbeda dengan frekuensi tagihan yang berbeda.", **maka** Contoh air galon Rp22.000/minggu dan laundry Rp60.000/bulan dapat diproyeksikan realistis berdasarkan tanggal pembelian/kejadian. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-016 — Siklus bulanan mempertimbangkan 28/29/30/31 hari

- **Status awal:** `todo`; **tujuan tunggal:** Siklus bulanan mempertimbangkan 28/29/30/31 hari. Perilaku persis mengikuti FIN-016 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-016), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Siklus bulanan mempertimbangkan 28/29/30/31 hari" dari FIN-016; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-016-A dan AC-FIN-016-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Siklus bulanan mempertimbangkan 28/29/30/31 hari.", **maka** Rp10.000/hari menghasilkan 280k/290k/300k/310k sesuai jumlah hari, bukan dikunci 30 hari. Negative/boundary: Budget Rp10.000 per hari menghasilkan rencana Rp280.000 (Feb non-kabisat), Rp290.000 (Feb kabisat), Rp300.000 (30 hari), Rp310.000 (31 hari). Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-017 — Rollover sisa anggaran opsional per kategori, default nonaktif

- **Status awal:** `todo`; **tujuan tunggal:** Rollover sisa anggaran opsional per kategori, default nonaktif. Perilaku persis mengikuti FIN-017 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-017), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Rollover sisa anggaran opsional per kategori, default nonaktif" dari FIN-017; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-017-A dan AC-FIN-017-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Rollover sisa anggaran opsional per kategori, default nonaktif.", **maka** Aturan rollover transparan; pindah dana budget tidak mengubah saldo riil. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-018 — Planned vs actual dan proyeksi sisa akhir bulan

- **Status awal:** `todo`; **tujuan tunggal:** Planned vs actual dan proyeksi sisa akhir bulan. Perilaku persis mengikuti FIN-018 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-018), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Planned vs actual dan proyeksi sisa akhir bulan" dari FIN-018; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-018-A dan AC-FIN-018-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Planned vs actual dan proyeksi sisa akhir bulan.", **maka** Proyeksi diberi label estimasi, tidak menyaru sebagai saldo aktual. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-019 — Aturan anggaran ketika kategori belum diatur

- **Status awal:** `todo`; **tujuan tunggal:** Aturan anggaran ketika kategori belum diatur. Perilaku persis mengikuti FIN-019 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-019), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Aturan anggaran ketika kategori belum diatur" dari FIN-019; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-019-A dan AC-FIN-019-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Aturan anggaran ketika kategori belum diatur.", **maka** Transaksi tetap bisa dicatat dengan status 'tidak dianggarkan'; muncul rekomendasi memperbaiki. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-020 — Reminder ketika anggaran mencapai threshold user-defined

- **Status awal:** `todo`; **tujuan tunggal:** Reminder ketika anggaran mencapai threshold user-defined. Perilaku persis mengikuti FIN-020 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-020), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Reminder ketika anggaran mencapai threshold user-defined" dari FIN-020; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-020-A dan AC-FIN-020-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Reminder ketika anggaran mencapai threshold user-defined.", **maka** Threshold mis. 50%, 75%, 90%, 100%; anti-spam dan non-shaming. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-021-01 — Buat, edit dan arsip target tabungan

- **Status awal:** `todo`; **tujuan tunggal:** Buat, edit dan arsip target tabungan. Perilaku persis mengikuti FIN-021 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-021), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Buat, edit dan arsip target tabungan" dari FIN-021; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-021-A dan AC-FIN-021-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Tujuan tabungan dengan nominal target, target tanggal, setoran, dan progress.", **maka** Realisasi didasarkan pada transfer/setoran yang dicatat; bukan sekadar budget rencana. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-021-02 — Setoran tabungan tanpa menghitung pengeluaran ganda

- **Status awal:** `todo`; **tujuan tunggal:** Setoran tabungan tanpa menghitung pengeluaran ganda. Perilaku persis mengikuti FIN-021 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-021-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-021), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Setoran tabungan tanpa menghitung pengeluaran ganda" dari FIN-021; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-021-A dan AC-FIN-021-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Tujuan tabungan dengan nominal target, target tanggal, setoran, dan progress.", **maka** Realisasi didasarkan pada transfer/setoran yang dicatat; bukan sekadar budget rencana. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-022 — Sumber uang tersendiri untuk tabungan atau earmark budget

- **Status awal:** `todo`; **tujuan tunggal:** Sumber uang tersendiri untuk tabungan atau earmark budget. Perilaku persis mengikuti FIN-022 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-022), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Sumber uang tersendiri untuk tabungan atau earmark budget" dari FIN-022; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-022-A dan AC-FIN-022-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Sumber uang tersendiri untuk tabungan atau earmark budget.", **maka** User memilih pendekatan; sistem menjelaskan bahwa target tidak otomatis mengunci uang fisik. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-023-01 — Buat utang/piutang serta perhitungan sisa

- **Status awal:** `todo`; **tujuan tunggal:** Buat utang/piutang serta perhitungan sisa. Perilaku persis mengikuti FIN-023 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-023), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Buat utang/piutang serta perhitungan sisa" dari FIN-023; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-023-A dan AC-FIN-023-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Pencatatan utang/piutang dengan pihak opsional, pokok, cicilan, jadwal, sisa, dan status.", **maka** Nilai pokok, pembayaran, bunga/biaya bila ada dipisahkan dengan benar. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-023-02 — Jadwalkan dan catat cicilan utang

- **Status awal:** `todo`; **tujuan tunggal:** Jadwalkan dan catat cicilan utang. Perilaku persis mengikuti FIN-023 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-023-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-023), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Jadwalkan dan catat cicilan utang" dari FIN-023; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-023-A dan AC-FIN-023-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Pencatatan utang/piutang dengan pihak opsional, pokok, cicilan, jadwal, sisa, dan status.", **maka** Nilai pokok, pembayaran, bunga/biaya bila ada dipisahkan dengan benar. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-024 — Reminder jatuh tempo utang/tagihan dan peringatan kekurangan dana

- **Status awal:** `todo`; **tujuan tunggal:** Reminder jatuh tempo utang/tagihan dan peringatan kekurangan dana. Perilaku persis mengikuti FIN-024 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-024), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Reminder jatuh tempo utang/tagihan dan peringatan kekurangan dana" dari FIN-024; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-024-A dan AC-FIN-024-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Reminder jatuh tempo utang/tagihan dan peringatan kekurangan dana.", **maka** Notifikasi mengikuti timezone user dan izin kanal; pembayaran tidak dicatat sebelum benar-benar dibayar. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-025 — Penyesuaian saldo utang, pelunasan dipercepat, perubahan jadwal, dan pembayaran sebagian

- **Status awal:** `todo`; **tujuan tunggal:** Penyesuaian saldo utang, pelunasan dipercepat, perubahan jadwal, dan pembayaran sebagian. Perilaku persis mengikuti FIN-025 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-025), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Penyesuaian saldo utang, pelunasan dipercepat, perubahan jadwal, dan pembayaran sebagian" dari FIN-025; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-025-A dan AC-FIN-025-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Penyesuaian saldo utang, pelunasan dipercepat, perubahan jadwal, dan pembayaran sebagian.", **maka** Riwayat peristiwa tetap tercatat; tidak membuat pengeluaran dobel. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-026-01 — Aturan tagihan dan transaksi berulang

- **Status awal:** `todo`; **tujuan tunggal:** Aturan tagihan dan transaksi berulang. Perilaku persis mengikuti FIN-026 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-026), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Aturan tagihan dan transaksi berulang" dari FIN-026; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-026-A dan AC-FIN-026-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Tagihan / transaksi berulang (misal laundry, galon, paket data).", **maka** Dapat dibuat sebagai pengingat atau draft otomatis, tidak auto-final tanpa bukti/konfirmasi yang diperlukan. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-026-02 — Kejadian jatuh tempo tidak auto-post tanpa konfirmasi

- **Status awal:** `todo`; **tujuan tunggal:** Kejadian jatuh tempo tidak auto-post tanpa konfirmasi. Perilaku persis mengikuti FIN-026 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-026-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-026), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kejadian jatuh tempo tidak auto-post tanpa konfirmasi" dari FIN-026; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-026-A dan AC-FIN-026-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Tagihan / transaksi berulang (misal laundry, galon, paket data).", **maka** Dapat dibuat sebagai pengingat atau draft otomatis, tidak auto-final tanpa bukti/konfirmasi yang diperlukan. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-027 — Pendapatan tetap dan tidak tetap; alokasi budget berdasarkan dana tersedia

- **Status awal:** `todo`; **tujuan tunggal:** Pendapatan tetap dan tidak tetap; alokasi budget berdasarkan dana tersedia. Perilaku persis mengikuti FIN-027 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-027), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pendapatan tetap dan tidak tetap; alokasi budget berdasarkan dana tersedia" dari FIN-027; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-027-A dan AC-FIN-027-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Pendapatan tetap dan tidak tetap; alokasi budget berdasarkan dana tersedia.", **maka** Template dapat disesuaikan jika pemasukan berubah, tidak menganggap semua user memiliki uang saku tetap. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-028 — Ringkasan dashboard: cash balance, budget sisa, pemasukan/pengeluaran, tabungan, dan utang

- **Status awal:** `todo`; **tujuan tunggal:** Ringkasan dashboard: cash balance, budget sisa, pemasukan/pengeluaran, tabungan, dan utang. Perilaku persis mengikuti FIN-028 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-028), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Ringkasan dashboard: cash balance, budget sisa, pemasukan/pengeluaran, tabungan, dan utang" dari FIN-028; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-028-A dan AC-FIN-028-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Ringkasan dashboard: cash balance, budget sisa, pemasukan/pengeluaran, tabungan, dan utang.", **maka** Tampilkan angka terverifikasi, provisional, dan rencana dengan label jelas. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-029-01 — Laporan rentang tanggal dan frekuensi

- **Status awal:** `todo`; **tujuan tunggal:** Laporan rentang tanggal dan frekuensi. Perilaku persis mengikuti FIN-029 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-029), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Laporan rentang tanggal dan frekuensi" dari FIN-029; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-029-A dan AC-FIN-029-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Laporan per hari, minggu, bulan, rentang tanggal dan perbandingan periode.", **maka** Zona waktu/awal periode konsisten; filter diterapkan ke semua agregasi. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-029-02 — Perbandingan periode dan nominal net

- **Status awal:** `todo`; **tujuan tunggal:** Perbandingan periode dan nominal net. Perilaku persis mengikuti FIN-029 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-029-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-029), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Perbandingan periode dan nominal net" dari FIN-029; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-029-A dan AC-FIN-029-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Laporan per hari, minggu, bulan, rentang tanggal dan perbandingan periode.", **maka** Zona waktu/awal periode konsisten; filter diterapkan ke semua agregasi. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-030 — Grafik kategori, frekuensi belanja, merchant, hari/hours dan tren

- **Status awal:** `todo`; **tujuan tunggal:** Grafik kategori, frekuensi belanja, merchant, hari/hours dan tren. Perilaku persis mengikuti FIN-030 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-030), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Grafik kategori, frekuensi belanja, merchant, hari/hours dan tren" dari FIN-030; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-030-A dan AC-FIN-030-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Grafik kategori, frekuensi belanja, merchant, hari/hours dan tren.", **maka** Tidak menyatakan sebab psikologis tanpa bukti. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-031 — Insight kebiasaan: impulsive-spend check, hari jajan, pola melebihi budget

- **Status awal:** `todo`; **tujuan tunggal:** Insight kebiasaan: impulsive-spend check, hari jajan, pola melebihi budget. Perilaku persis mengikuti FIN-031 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-031), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Insight kebiasaan: impulsive-spend check, hari jajan, pola melebihi budget" dari FIN-031; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-031-A dan AC-FIN-031-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Insight kebiasaan: impulsive-spend check, hari jajan, pola melebihi budget.", **maka** Empatik, non-moralistik, berbasis data sendiri; bisa dinonaktifkan. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-032 — Fitur 'Kalau beli ini, sisa berapa?' sebelum transaksi

- **Status awal:** `todo`; **tujuan tunggal:** Fitur 'Kalau beli ini, sisa berapa?' sebelum transaksi. Perilaku persis mengikuti FIN-032 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-032), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Fitur 'Kalau beli ini, sisa berapa?' sebelum transaksi" dari FIN-032; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-032-A dan AC-FIN-032-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Fitur 'Kalau beli ini, sisa berapa?' sebelum transaksi.", **maka** Simulasi tidak otomatis menyimpan transaksi; gunakan saldo budget aktual saat itu. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-033 — Ringkasan periodik yang bisa dibaca dan dibagikan atas permintaan

- **Status awal:** `todo`; **tujuan tunggal:** Ringkasan periodik yang bisa dibaca dan dibagikan atas permintaan. Perilaku persis mengikuti FIN-033 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-033), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Ringkasan periodik yang bisa dibaca dan dibagikan atas permintaan" dari FIN-033; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-033-A dan AC-FIN-033-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Ringkasan periodik yang bisa dibaca dan dibagikan atas permintaan.", **maka** Informasi privat hanya dibagikan melalui interaksi eksplisit dengan preview. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-034-01 — Ekspor CSV standar

- **Status awal:** `todo`; **tujuan tunggal:** Ekspor CSV standar. Perilaku persis mengikuti FIN-034 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-034), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Ekspor CSV standar" dari FIN-034; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-034-A dan AC-FIN-034-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Ekspor CSV dan JSON lengkap per pemilik untuk migrasi/backup personal.", **maka** Ekspor dapat dipahami manusia, lengkap transaksi/kategori/identitas minimal; file attachment diekspor via opsi terpisah. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-034-02 — Ekspor JSON lengkap dan versi schema

- **Status awal:** `todo`; **tujuan tunggal:** Ekspor JSON lengkap dan versi schema. Perilaku persis mengikuti FIN-034 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-034-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-034), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Ekspor JSON lengkap dan versi schema" dari FIN-034; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-034-A dan AC-FIN-034-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Ekspor CSV dan JSON lengkap per pemilik untuk migrasi/backup personal.", **maka** Ekspor dapat dipahami manusia, lengkap transaksi/kategori/identitas minimal; file attachment diekspor via opsi terpisah. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-035-01 — Pemetaan kolom CSV

- **Status awal:** `todo`; **tujuan tunggal:** Pemetaan kolom CSV. Perilaku persis mengikuti FIN-035 (bukan ilustrasi statis).
- **Dependensi:** `P3-002`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-035), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pemetaan kolom CSV" dari FIN-035; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-035-A dan AC-FIN-035-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Impor CSV yang dipetakan secara manual.", **maka** Preview mapping, validasi, deduplikasi, rollback impor gagal; tidak minta password bank. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-035-02 — Pratinjau validasi/duplikat

- **Status awal:** `todo`; **tujuan tunggal:** Pratinjau validasi/duplikat. Perilaku persis mengikuti FIN-035 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-035-01`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-035), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pratinjau validasi/duplikat" dari FIN-035; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-035-A dan AC-FIN-035-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Impor CSV yang dipetakan secara manual.", **maka** Preview mapping, validasi, deduplikasi, rollback impor gagal; tidak minta password bank. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P3-FIN-035-03 — Impor final atomik dan dapat diaudit

- **Status awal:** `todo`; **tujuan tunggal:** Impor final atomik dan dapat diaudit. Perilaku persis mengikuti FIN-035 (bukan ilustrasi statis).
- **Dependensi:** `P3-FIN-035-02`.
- **Rujukan:** [`REQ-02-FINANCE.md`](../requirements/REQ-02-FINANCE.md#fin-035), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Impor final atomik dan dapat diaudit" dari FIN-035; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-FIN-035-A dan AC-FIN-035-B yang relevan: **Diberikan** pengguna telah masuk dan sumber uang yang relevan tersedia, **ketika** pengguna menjalankan kemampuan "Impor CSV yang dipetakan secara manual.", **maka** Preview mapping, validasi, deduplikasi, rollback impor gagal; tidak minta password bank. Negative/boundary: Retry atau edit/void tidak boleh menambah saldo/pengeluaran dobel, membocorkan objek tenant lain, atau menghapus jejak koreksi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

