# PRD-03 — Mesin Keuangan Personal: Ledger, Budget, Dompet, Utang, Tabungan

**Relasi:** [Visi](./PRD-01-VISION-SCOPE.md) · [Input UX](./PRD-04-PWA-UX-INPUT.md) · [AI/OCR](./PRD-06-AI-OCR.md) · [Privasi](./PRD-08-PRIVACY-SECURITY.md)

## 1. Konsep fundamental

Aplikasi harus **membedakan tiga hal** agar laporan benar:

1. **Saldo akun/dompet virtual** = estimasi uang yang ada pada sumber dana (misalnya bank, tunai, e-wallet), dikoreksi oleh transaksi.
2. **Anggaran/envelope kategori** = jatah maksimal berbelanja pada periode; bukan uang di bank dan bukan dompet pembayaran QRIS sesungguhnya.
3. **Tujuan tabungan atau utang** = tujuan/kewajiban yang mengikuti perpindahan uang dan pembayaran, tidak otomatis dianggap konsumsi.

Satu transaksi yang masuk melalui PWA, WhatsApp, atau AI akan mengikuti aturan ledger yang **sama**. Data terverifikasi menjadi sumber kebenaran untuk grafik dan sisa anggaran. Pengguna dapat melihat draft/provisional secara terpisah agar tidak terjadi kesan saldo yang menipu.

## 2. Fitur ledger dan dompet virtual — `FIN-*`

| ID | Kebutuhan | Perilaku wajib |
|---|---|---|
| `FIN-001` | Buat/edit/arsipkan banyak sumber uang virtual (tunai, bank, e-wallet, dll.). | Nama, ikon, saldo pembuka, mata uang dasar, dan status aktif; **tidak** login bank. |
| `FIN-002` | Catat pemasukan, pengeluaran, transfer, refund, penyesuaian saldo, dan koreksi. | Jenis tepat, tanggal efektif, nilai bulat dalam unit terkecil, dompet sumber/tujuan, catatan opsional. |
| `FIN-003` | Kategori & subkategori yang dapat diatur tiap pengguna. | Ada template (Makan, Bensin, Paket Data, Galon, Laundry, Cicilan, Tabungan, Jajan, dll.); custom/rename/arsip tidak merusak histori. |
| `FIN-004` | Transfer antardompet tidak dihitung sebagai income atau expense. | Mutasi memindahkan saldo secara konsisten; satu kejadian transfer pada riwayat. |
| `FIN-005` | Catatan pengeluaran dapat di-split ke beberapa kategori. | Jumlah rincian = nominal transaksi; split diubah dengan riwayat audit; pengeluaran tidak dobel. |
| `FIN-006` | Riwayat ledger lengkap dengan edit, void, dan restore yang dapat diaudit. | Perubahan tidak menghilangkan bukti asal; delete UI tidak menghapus jejak yang masih diperlukan untuk konsistensi. |
| `FIN-007` | Transaksi pencarian, sort/filter, tag, merchant, metode bayar, lokasi opsional dan lampiran bukti. | Hanya data pengguna sendiri yang dapat dicari; semua filter kompatibel. |
| `FIN-008` | Koreksi duplikasi dan gabung transaksi yang mewakili satu kejadian. | Tidak menghilangkan lampiran/evidence; tindakan butuh konfirmasi. |
| `FIN-009` | Support transaksi bertanggal lampau, mendatang, timezone, dan status terjadwal. | Laporan berdasarkan tanggal efektif yang ditampilkan kepada user, bukan timestamp server semata. |
| `FIN-010` | Input nominal valid & lokal. | Rupiah 10.000 ditampilkan sebagai Rp10.000; tidak ada drift float; pembulatan terdefinisi untuk mata uang lain jika kelak didukung. |

### Aturan saldo

- Saldo sumber uang didapat dari saldo pembuka + pemasukan - pengeluaran + transfer masuk - transfer keluar + penyesuaian.
- Perpindahan uang nyata **ke dompet tabungan** adalah transfer, tidak menciptakan pengeluaran konsumsi atau pemasukan baru.
- Isi dompet saldo negatif dibolehkan hanya jika user mengonfirmasi alasan (mis. minus pencatatan), tampilkan peringatan alih-alih diam-diam mengoreksi.
- Transaksi dari screenshot sukses bisa saja memakai *sumber uang yang belum diketahui*; user dapat melengkapinya sebelum dianggap pembukuan final sesuai preferensi validasi.
- Refund harus dikaitkan dengan transaksi asal bila diketahui. Refund dapat memulihkan budget kategori jika berada pada periode yang relevan sesuai aturan yang ditampilkan.
- Pengguna dapat melakukan **rekonsiliasi manual** saldo aplikasi dengan bank/e-wallet fisik, mencatat selisih sebagai penyesuaian yang dapat ditinjau.

## 3. Anggaran periodik

| ID | Kebutuhan | Perilaku wajib |
|---|---|---|
| `FIN-011` | Anggaran per kategori/envelope dengan periode harian, mingguan, bulanan, atau siklus kustom. | Setiap periode memiliki awal/akhir jelas; zona waktu user dihormati. |
| `FIN-012` | Sisa anggaran dihitung dari alokasi rencana dikurangi realisasi yang relevan menurut jenis envelope. | Pengeluaran konsumsi bersih mengurangi envelope belanja; pembayaran pokok mengurangi envelope Cicilan bila dibuat; tabungan rencana/transfer nyata ditampilkan terpisah, bukan expense. Provisional terpisah. |
| `FIN-013` | Batas harian dan peristiwa belanja harus membentuk peringatan. | Jika Rp10.000/hari tercapai, aplikasi memberi tanda dan notifikasi bila diizinkan; **tidak menolak QRIS bank**. |
| `FIN-014` | Template budget reusable & copy period. | User dapat menyesuaikan nominal per bulan tanpa merusak bulan lampau. |
| `FIN-015` | Periode berbeda dengan frekuensi tagihan yang berbeda. | Contoh air galon Rp22.000/minggu dan laundry Rp60.000/bulan dapat diproyeksikan realistis berdasarkan tanggal pembelian/kejadian. |
| `FIN-016` | Siklus bulanan mempertimbangkan 28/29/30/31 hari. | Rp10.000/hari menghasilkan 280k/290k/300k/310k sesuai jumlah hari, bukan dikunci 30 hari. |
| `FIN-017` | Rollover sisa anggaran opsional per kategori, default nonaktif. | Aturan rollover transparan; pindah dana budget tidak mengubah saldo riil. |
| `FIN-018` | Planned vs actual dan proyeksi sisa akhir bulan. | Proyeksi diberi label **estimasi**, tidak menyaru sebagai saldo aktual. |
| `FIN-019` | Aturan anggaran ketika kategori belum diatur. | Transaksi tetap bisa dicatat dengan status 'tidak dianggarkan'; muncul rekomendasi memperbaiki. |
| `FIN-020` | Reminder ketika anggaran mencapai threshold user-defined. | Threshold mis. 50%, 75%, 90%, 100%; anti-spam dan non-shaming. |

### Aturan budget yang harus dipahami pengguna

- **Budget tidak memindahkan uang bank**. Mengalokasikan Rp30.000 ke Jajan bukan transaksi riil. Envelope Cicilan boleh terpakai oleh pembayaran **pokok** yang mengurangi saldo kas tetapi bukan expense konsumsi; tabungan adalah rencana/setoran terpisah, bukan expense.
- Overspend boleh terjadi; dicatat secara jujur dan ditampilkan negatif. Menyembunyikan transaksi untuk terlihat patuh dilarang oleh alur produk.
- Pengeluaran **provisional** ditampilkan sebagai potensi dampak, misalnya 'Sisa tersedia terkonfirmasi Rp20.000; ada Rp8.000 masih diverifikasi'.
- Kategori yang diganti di periode sekarang tidak boleh mengubah penghitungan kategori lama tanpa tindakan eksplisit.

## 4. Tabungan, tujuan, dan utang

| ID | Kebutuhan | Perilaku wajib |
|---|---|---|
| `FIN-021` | Tujuan tabungan dengan nominal target, target tanggal, setoran, dan progress. | Realisasi didasarkan pada transfer/setoran yang dicatat; bukan sekadar budget rencana. |
| `FIN-022` | Sumber uang tersendiri untuk tabungan atau earmark budget. | User memilih pendekatan; sistem menjelaskan bahwa target tidak otomatis mengunci uang fisik. |
| `FIN-023` | Pencatatan utang/piutang dengan pihak opsional, pokok, cicilan, jadwal, sisa, dan status. | Nilai pokok, pembayaran, bunga/biaya bila ada dipisahkan dengan benar. |
| `FIN-024` | Reminder jatuh tempo utang/tagihan dan peringatan kekurangan dana. | Notifikasi mengikuti timezone user dan izin kanal; pembayaran tidak dicatat sebelum benar-benar dibayar. |
| `FIN-025` | Penyesuaian saldo utang, pelunasan dipercepat, perubahan jadwal, dan pembayaran sebagian. | Riwayat peristiwa tetap tercatat; tidak membuat pengeluaran dobel. |
| `FIN-026` | Tagihan / transaksi berulang (misal laundry, galon, paket data). | Dapat dibuat sebagai pengingat atau draft otomatis, **tidak auto-final** tanpa bukti/konfirmasi yang diperlukan. |
| `FIN-027` | Pendapatan tetap dan tidak tetap; alokasi budget berdasarkan dana tersedia. | Template dapat disesuaikan jika pemasukan berubah, tidak menganggap semua user memiliki uang saku tetap. |

### Contoh yang harus didukung

- Awal bulan menerima Rp1.200.000 → pemasukan nyata ke dompet sumber.
- Menetapkan jatah tabungan Rp200.000 dan mentransfer Rp200.000 ke rekening tabungan → **transfer** tanpa menggandakan biaya.
- Bayar cicilan pokok utang Rp100.000 → saldo uang turun, sisa pokok utang turun, envelope Cicilan (jika ada) terpakai, tetapi **tidak menambah total pengeluaran konsumsi**; bunga terpisah. Mencatat utang/piutang awal wajib menghasilkan opening ledger seimbang.
- Beli lauk Rp10.000 setiap hari → akumulasi mengikuti tanggal kejadian; alarm jika jatah harian habis.
- Membeli galon Rp22.000 sebanyak 5 kali dalam suatu bulan → actual Rp110.000 walaupun perkiraan bulanannya Rp95.000.

## 5. Analitik, laporan, dan kebiasaan

| ID | Kebutuhan | Perilaku wajib |
|---|---|---|
| `FIN-028` | Ringkasan dashboard: cash balance, budget sisa, pemasukan/pengeluaran, tabungan, dan utang. | Tampilkan angka terverifikasi, provisional, dan rencana dengan label jelas. |
| `FIN-029` | Laporan per hari, minggu, bulan, rentang tanggal dan perbandingan periode. | Zona waktu/awal periode konsisten; filter diterapkan ke semua agregasi. |
| `FIN-030` | Grafik kategori, frekuensi belanja, merchant, hari/hours dan tren. | Tidak menyatakan sebab psikologis tanpa bukti. |
| `FIN-031` | Insight kebiasaan: impulsive-spend check, hari jajan, pola melebihi budget. | Empatik, non-moralistik, berbasis data sendiri; bisa dinonaktifkan. |
| `FIN-032` | Fitur 'Kalau beli ini, sisa berapa?' sebelum transaksi. | Simulasi tidak otomatis menyimpan transaksi; gunakan saldo budget aktual saat itu. |
| `FIN-033` | Ringkasan periodik yang bisa dibaca dan dibagikan atas permintaan. | Informasi privat hanya dibagikan melalui interaksi eksplisit dengan preview. |
| `FIN-034` | Ekspor CSV dan JSON lengkap per pemilik untuk migrasi/backup personal. | Ekspor dapat dipahami manusia, lengkap transaksi/kategori/identitas minimal; file attachment diekspor via opsi terpisah. |
| `FIN-035` | Impor CSV yang dipetakan secara manual. | Preview mapping, validasi, deduplikasi, rollback impor gagal; tidak minta password bank. |

## 6. Aturan pencatatan lintas kanal

1. PWA manual, WA teks, WA foto, dan AI semuanya menghasilkan **draft/usulan** yang sama standar validasinya.
2. Idempotency mengikat *asal peristiwa* (client request ID, message ID WA, hasil upload) supaya retry tidak membuat kejadian baru.
3. Saat transaksi AI memiliki potensi kesalahan nominal atau mata uang, jangan lanjut sebagai final tanpa review.
4. Hasil yang sudah terverifikasi tidak boleh ditimpa AI diam-diam. Koreksi adalah event terpisah dengan asal, alasan, waktu, dan persetujuan.
5. Pengguna dapat mengelompokkan item kecil dari satu struk; total struk harus sinkron dengan jumlah rincian.
6. Penghapusan lampiran tidak otomatis menghapus transaksi; penghapusan transaksi harus membedakan 'void' dengan penghapusan akun sesuai kebijakan.

## 7. UX keadaan khusus

| Kasus | Perilaku |
|---|---|
| Tidak ada transaksi hari ini | Status 'belum dilaporkan' sampai user menandai 'nihil' atau hari diverifikasi; tidak otomatis nol. |
| Transaksi tanggal lama | Mengubah laporan historis, menunjukkan adanya revisi bila berpengaruh signifikan. |
| Budget diubah setelah sebagian bulan berjalan | Tampilkan tanggal berlaku dan transparansi penghitungan. |
| 2 perangkat edit transaksi sama | Deteksi konflik dan bantu pilih versi; jangan hapus salah satu diam-diam. |
| User mencatat uang tunai dan screenshot QRIS identik | Tawarkan kemungkinan duplikat, bukan hapus otomatis tanpa bukti kuat. |
| Dompet sudah diarsipkan | Histori tetap terbaca; tidak dapat dipakai untuk transaksi baru sampai diaktifkan. |
| User menutup rekening bank sebenarnya | Pengarsipan virtual tidak mengklaim melakukan tindakan pada bank. |
| Dana langganan kurang | Peringatan; jangan otomatis mengarang transaksi pembayaran. |

## 8. Kriteria penerimaan `AC-FIN-*`

- **AC-FIN-01:** Pemasukan Rp1.200.000 dan pengeluaran Rp10.000 menghasilkan saldo selisih Rp1.190.000 pada dompet yang relevan.
- **AC-FIN-02:** Transfer Rp200.000 dari dompet A ke B mengurangi A/menambah B; total seluruh dompet tidak berubah; laporan expense tetap sama.
- **AC-FIN-03:** Budget harian Rp10.000: setelah pengeluaran 8k tersisa 2k; setelah lagi 5k tampil overspend 3k dan peringatan.
- **AC-FIN-04:** Bulan 31 hari, jatah lauk 10k/hari, hasil rancangan budget otomatis 310k (bila template dinamis dipilih).
- **AC-FIN-05:** Tagihan galon berulang mingguan dapat menghasilkan 4 atau 5 kejadian berdasarkan kalender aktual, bukan selalu 4.
- **AC-FIN-06:** OCR mengusulkan Rp80.000; user mengoreksi Rp8.000 → laporan final hanya Rp8.000 dengan riwayat revisi.
- **AC-FIN-07:** Refund/void, split payment dan transfer bukan transaksi konsumsi ganda.
- **AC-FIN-08:** Diimpor file dengan duplikasi → preview menunjukkan calon duplikat, hasil akhir dapat dibatalkan dan dapat diuji.
- **AC-FIN-09:** Laporan sama nominalnya bila transaksi dimasukkan lewat PWA atau WA, dengan tanggal dan kategori yang sama.
- **AC-FIN-10:** Transaksi milik dua user terpisah total, kategori, dan isi pencarian tanpa pencampuran.

## 9. Persyaratan kualitas domain keuangan

- Penghitungan uang **deterministik**; tidak ada floating point untuk bilangan uang.
- Basis pelaporan IDR pada konfigurasi default, mata uang akun dibuat eksplisit; otomatisasi kurs valuta tidak termasuk kebutuhan saat ini.
- Perubahan transaction/posting bersifat konsisten; kegagalan setengah jalan tidak boleh menghasilkan saldo yang tak seimbang.
- Semua laporan harus menyertakan tanggal efektif, filter, mata uang, serta informasi data provisional bila relevan.
