# End-to-End Acceptance Scenarios — Perilaku, bukan implementasi

> Semua contoh memakai data uji sintetis. Langkah pengamatan boleh dilakukan lewat UI/API test tetapi hasilnya harus identik. Contoh mata uang IDR dan zona Asia/Jakarta; aplikasi umum tidak boleh mengunci budget semua pengguna ke Rp1.200.000.

## AUTH / Multiuser / Role

### AT-IAM-01 Registrasi publik tidak dapat mengangkat role
**Diberikan** alamat email baru dan pendaftaran publik, **ketika** membuat akun dan menyisipkan field `role=superuser` dengan request buatan, **maka** akun hanya berperan `user`; fitur `/admin` dan `/system` ditolak. Penolakan tidak memaparkan role internal pengguna lain.

### AT-IAM-02 Akun dibatasi dan pemulihan
**Diberikan** user aktif, **ketika** operator mensuspend dengan alasan ter-audit, **maka** akses privat ditolak pada sesi lama, user melihat langkah banding; ketika banding disetujui akses dikembalikan tanpa hilangnya data.

### AT-IAM-03 Tenant silang wajib gagal
**Diberikan** A dan B masing-masing memiliki transaksi, lampiran, akun WA, target, job AI dan support ticket, **ketika** A mengganti UUID/URL menuju objek B lewat UI/API dan URL file yang dibagikan, **maka** semuanya ditolak tanpa mengungkap detail keberadaan B. Jalankan juga menggunakan akun Admin dan Superuser biasa tanpa consent support.

### AT-IAM-04 Verifikasi, reset, session dan step-up
**Diberikan** akun menunggu verifikasi, token kedaluwarsa, sesi lama, serta action perubahan role, **ketika** tindakan diulang/dikirim dari perangkat lain, **maka** hanya token dan sesi yang masih sah diterima; permintaan pemulihan menghindari enumerasi email; superuser diminta verifikasi keamanan terbaru.

## Ledger / uang

### AT-FIN-01 Debit/kredit virtual dan budget
**Diberikan** Tunai Rp100.000, Bank Rp450.000, E-wallet Rp125.000, dan limit Makan Rp300.000, **ketika** catat pengeluaran Makan Rp10.000 dari Tunai, **maka** Tunai Rp90.000, saldo agregat turun Rp10.000, budget Makan berkurang Rp10.000, dan riwayat menunjukkan satu expense.

### AT-FIN-02 Transfer bukan expense
**Diberikan** Tunai Rp100.000, Bank Rp450.000, **ketika** transfer Rp50.000 dari Tunai ke Bank, **maka** saldo masing-masing Rp50.000 dan Rp500.000, total tetap Rp550.000, sedangkan expense/income konsumsi tidak bertambah. Retry identik tidak mengulang transfer.

### AT-FIN-03 Tabungan bukan double expense
**Diberikan** target Dana Darurat dan rekening virtual Bank, **ketika** pindahkan Rp200.000 ke dompet Tabungan, **maka** target bertambah sesuai setoran, saldo total tidak berubah, pengeluaran konsumsi tidak bertambah, mutasi terlacak.

### AT-FIN-04 Utang dan cicilan
**Diberikan** utang Rp300.000 sudah dicatat dengan opening event liability seimbang dan envelope Cicilan aktif, **ketika** cicil pokok Rp100.000 dari dompet Bank, **maka** sisa utang Rp200.000, saldo Bank turun Rp100.000, envelope Cicilan terpakai Rp100.000, tetapi total pengeluaran **konsumsi** tidak bertambah karena pokok bukan belanja. Pembayaran melebihi sisa ditolak atau diminta koreksi.

### AT-FIN-05 Split, refund, void
**Diberikan** pembelian Rp18.000, **ketika** split Rp10.000 Makan + Rp8.000 Jajan, **maka** pengeluaran agregat tetap Rp18.000; split Rp17.000 gagal validasi. Refund parsial Rp8.000 dan void/recovery mengubah saldo dan agregasi tepat sekali dengan histori audit; original posting tetap tersimpan, reversal mengimbangi original, restore membuat kompensasi baru tanpa double adjustment.

### AT-FIN-06 Siklus dan nominal kecil
**Diberikan** budget Lauk Rp10.000/hari dan galon Rp22.000/minggu, **ketika** berpindah bulan 28/29/30/31 hari dan perubahan DST di zona lain, **maka** tanggal/periode tertampil benar; perkiraan lauk Rp280k/290k/300k/310k dan belanja galon tidak diasumsikan pasti 4 minggu di setiap bulan.

### AT-FIN-07 Overspend bukan payment blocker
**Diberikan** sisa budget jajan Rp7.000, **ketika** pengguna menyimpan expense Rp8.000, **maka** transaksi tetap sah tersimpan, sisa budget −Rp1.000, peringatan suportif ditampilkan; aplikasi tidak menyatakan transaksi QRIS bank ditolak.

### AT-FIN-08 Laporan vs provisional
**Diberikan** confirmed spending Rp920.000 dan usulan OCR Rp18.000 belum dikonfirmasi, **ketika** membuka laporan, **maka** total confirmed tetap Rp920.000; Rp18.000 muncul sebagai pending/estimasi terpisah dan tidak tercampur grafik total final.

### AT-FIN-09 Nominal input dan round trip
**Diberikan** angka 1000, 10000, dan 100000, **ketika** disimpan lewat UI, diekspor, dan diimpor kembali, **maka** sama persis Rp1.000/Rp10.000/Rp100.000; tidak ada perpindahan digit atau float drift.

## Catatan / PWA / offline

### AT-UX-01 Manual tetap bekerja tanpa layanan opsional
**Diberikan** AI, WhatsApp, Armbian dan Tunnel unavailable, **ketika** user online membuka PWA, **maka** input manual tetap membuat transaksi server-confirmed di database dan dashboard menampilkannya.

### AT-UX-02 Offline dan refresh
**Diberikan** perangkat tanpa internet, **ketika** user membuat expense Rp10.000 dan me-refresh, **maka** draft muncul sebagai 'tersimpan di perangkat'; setelah online, hanya satu expense server-confirmed. Bila edit di dua perangkat bertabrakan, user diberi perbandingan, bukan last-write-wins diam-diam.

### AT-UX-03 Hari nihil dan belum dilaporkan
**Diberikan** hari tanpa transaksi, **ketika** tanggal berlalu tanpa jawaban, **maka** status 'belum dilaporkan'; hanya aksi eksplisit `nihil` yang mengubah menjadi 'nihil'. `selesai` dengan transaksi tetap membedakan status dari nihil.

### AT-UX-04 Berbagi screenshot
**Diberikan** browser mendukung Share Target, **ketika** pengguna membagikan gambar dari aplikasi lain, **maka** bukti tampil sebagai draft untuk review; browser tidak mendukung tetap menyediakan upload file. Tidak pernah mengirim otomatis tanpa consent.

### AT-UX-05 Impor dan rollback
**Diberikan** CSV berisi 10 baris, 1 duplikat, 2 tidak valid, **ketika** preview, mapping kolom, lalu commit, **maka** jumlah inserted/skipped/error benar dan rollback undo batch tidak menyentuh transaksi lama unrelated.

## WhatsApp

### AT-WA-01 Verifikasi bot bersama
**Diberikan** nomor WA yang belum verified, **ketika** mengirim 'lauk 10k', **maka** tidak membuat transaksi akun manapun. Setelah verifikasi yang sah dan opt-in, pesan sama bisa diproses sebagai draft milik user tersebut.

### AT-WA-02 Multi-device personal session
**Diberikan** user A dan B punya perangkat masing-masing di satu GOWA, **ketika** A meminta status/log out/delete memakai ID sesi B, **maka** ditolak. Webhook sesi B hanya dikaitkan ke B, dan tidak pernah berbagi QR/pairing code ke A.

### AT-WA-03 Pairing code dan QR
**Diberikan** satu smartphone dipakai untuk PWA+WA, **ketika** memilih 'Kode pairing', **maka** panduan dan kode ditampilkan dengan masa berlaku; jika timeout, tombol buat ulang tersedia. QR scan diberikan pada perangkat lain; tidak ada redirect user ke dashboard GOWA.

### AT-WA-04 Logout/delete/consent
**Diberikan** personal session tersambung, **ketika** logout, **maka** sesi WhatsApp lepas tetapi slot dapat dipakai ulang. **Ketika** hapus slot, data slot dihapus tetapi catatan uang tetap ada. Mencabut izin menghalangi pengiriman/pemrosesan opsional berikutnya.

### AT-WA-05 STOP / quiet hours / spam
**Diberikan** pengingat aktif jam 20.30 Asia/Jakarta, **ketika** user mengirim `STOP`, **maka** reminder berikutnya berhenti. Pada quiet hours tidak dikirim pesan rutin; notifikasi keamanan yang diperlukan mengikuti kebijakan terpisah. Bot tidak mengirim pesan duplikat setelah restart.

### AT-WA-06 Privasi percakapan pribadi
**Diberikan** personal session, **ketika** chat tidak masuk sumber yang diizinkan, **maka** percakapan dan media tidak ditransfer ke AI, R2, atau log aplikasi; pesan grup dan kontak lain diabaikan menurut consent. Operator tidak dapat membaca isi chat pengguna.

## AI/OCR

### AT-AI-01 Ekstraksi nominal berulang
**Diberikan** screenshot transaksi berisi Rp8.000 dan merchant, **ketika** Vision berhasil, **maka** usulan nominal 8000, tanggal/merchant/jenis/source dikembalikan dengan field yang belum jelas ditandai; tidak ada posting tanpa validasi.

### AT-AI-02 Gambar non-transaksi
**Diberikan** screenshot QR kode pembayaran yang hanya berisi QR tanpa nominal, **ketika** diproses, **maka** sistem tidak membuat nominal fiktif; minta input manual.

### AT-AI-03 Vision error → OCR provisional → recheck
**Diberikan** layanan Vision timeout atau HTTP 429, **ketika** gambar diterima, **maka** OCR lokal menghasilkan draft provisional atau membutuhkan review. Setelah Vision pulih dan consent masih sah, job recheck memverifikasi objek sama, bukan menambah transaksi kedua.

### AT-AI-04 Konflik tidak menimpa posting final
**Diberikan** OCR membaca Rp10.000, Vision membaca Rp100.000, **ketika** keduanya berbeda, **maka** tampilan membandingkan hasil/bukti dan meminta user memilih/edit; posted transaction sebelum review tidak diubah diam-diam.

### AT-AI-05 Kualitas dan refund/transfer screenshot
**Diberikan** gambar berisi bukti transfer sendiri atau refund, **ketika** Vision mengusulkan expense, **maka** rule validasi mendeteksi kemungkinan transaksi bukan konsumsi dan membutuhkan review sebelum posting.

### AT-AI-06 Dedup sumber berbeda
**Diberikan** satu bukti dikirim melalui WA lalu PWA dengan checksum sama/nominal+tanda transaksi sama, **ketika** kedua job selesai, **maka** user menerima 'kemungkinan duplikat'; tidak ada posting otomatis ganda. Penggabungan otomatis hanya diizinkan jika identitas pembayaran dan key sumber terbukti sama secara deterministik, selain itu pemilik mengonfirmasi penggabungan.

## Admin / privacy / safety

### AT-OPS-01 Batas Admin
**Diberikan** Admin melihat antrean support, **ketika** membuka tiket yang tidak diberi izin berbagi data, **maka** hanya metadata ditampilkan. File sensitif hanya boleh dilihat sesuai izin eksplisit yang masih berlaku dan diaudit.

### AT-OPS-02 Perubahan role sensitif
**Diberikan** Superuser bersesi MFA, **ketika** mengubah User menjadi Admin, **maka** tindakan memerlukan alasan, autentikasi ulang, audit before/after. Admin biasa tidak bisa mengangkat Admin baru.

### AT-OPS-03 Limit dan kebijakan antispam
**Diberikan** user melampaui kuota AI/WA, **ketika** mencoba lagi, **maka** sistem menolak pekerjaan opsional secara sopan, menunjukkan masa reset, namun tetap bisa mencatat manual. Emergency stop berlaku untuk semua request pengiriman non-keamanan.

### AT-TRUST-01 Export/hapus akun
**Diberikan** pengguna login, **ketika** meminta ekspor, **maka** arsip hanya berisi data miliknya; tautan unduh sementara dan terotorisasi. Setelah mengajukan hapus akun dan verifikasi aman, status progres transparan dan data dihapus sesuai kebijakan retensi/persyaratan hukum yang telah disetujui; tidak menjanjikan penghapusan instan dari backup.

### AT-TRUST-02 Consent AI lintas fase
**Diberikan** foto belum diproses dan izin AI dicabut, **ketika** worker mengambil job, **maka** AI tidak dipanggil. Hasil yang sudah final tetap tercatat; untuk hapus bukti terpisah mengikuti kebijakan pengguna.

### AT-QUAL-01 Production release
**Diberikan** hasil test E2E, security, backup restore, uji performa, biaya, dan review privacy WhatsApp, **ketika** salah satu hard-gate gagal, **maka** label 'production ready' tidak boleh diberikan; mode demo/lokal bisa tetap digunakan dengan batas jelas.

## Bukti yang wajib disimpan untuk setiap skenario

Tiap skenario membutuhkan: nama suite/test ID, input sintetis, konfigurasi role/account, status cloud/Armbian, versi library/adapter, hasil yang diharapkan, hasil aktual, tangkapan layar/log teredaksi, dan pass/fail. Semua contoh di atas adalah requirement, **bukan** klaim sudah diuji.
