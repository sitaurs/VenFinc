# PRD-09 — Kualitas, Target Layanan, dan Kriteria Production Readiness

**Relasi:** [Indeks](./PRD-00-INDEX.md) · [Finance](./PRD-03-FINANCE-CORE.md) · [WA](./PRD-05-WHATSAPP-GOWA.md) · [AI](./PRD-06-AI-OCR.md) · [Privacy](./PRD-08-PRIVACY-SECURITY.md)

## 1. Definisi 'production' untuk produk ini

**Production tidak sama dengan 'sudah bisa demo'.** Aplikasi harus lolos kontrol identitas, isolasi multiuser, akurasi ledger, hak privasi, backup/restore, responsivitas PWA, antrean tugas, fallback saat AI/WhatsApp mati, monitoring biaya, serta penanganan pelanggaran akun sebelum registrasi publik dibuka luas.

Seluruh modul inti dalam dokumen PRD harus tersedia sebagai pengalaman produk lengkap, walaupun fitur berisiko tinggi seperti *personal WhatsApp session* harus melalui kebijakan feature gate sampai audit platform/policy benar-benar selesai.

## 2. NFR — `QUAL-*`

| ID | Sasaran kualitas produk | Cara mengukurnya / batas |
|---|---|---|
| `QUAL-001` | Keamanan isolasi tenant. | **0 pelanggaran** pada suite uji lintas user, berbagai ID, gambar, dan device WA. |
| `QUAL-002` | Tidak ada pengeluaran dobel dari retry. | **0 duplicate posting** untuk input yang sama dari webhook, upload ulang dan pemulihan job. |
| `QUAL-003` | Konsistensi perhitungan uang. | 100% pada tes invariant: transfer, split, refund, utang, dan budget periodik. |
| `QUAL-004` | Tersedia fallback manual saat WA/AI gangguan. | 100% skenario fault injection tetap bisa mencatat manual online; draft offline dapat dibuat lokal. |
| `QUAL-005` | Kecepatan input manual. | Alur pengguna normal <=10 detik setelah kategori/dompet awal disiapkan (sasaran usability, diuji nyata). |
| `QUAL-006` | Kinerja web pada jaringan mobile rata-rata. | LCP halaman utama <=2.5 detik p75 untuk kondisi uji yang terdokumentasi; jika infra free-tier menjadikan target belum realistis, dokumentasikan deviasi dan perbaikan. |
| `QUAL-007` | Latensi API non-AI. | Target p95 <=1.5 detik pada beban dan lokasi tes yang jelas, termasuk respons Neon; cold-start dihitung terpisah. |
| `QUAL-008` | Keandalan web/API. | Target operasional >=99.0% bulanan untuk fitur inti, **bukan SLA kontraktual** dengan pengguna pada infrastruktur gratis. |
| `QUAL-009` | Akurasi ekstraksi bukti. | Dataset struk/QRIS representatif; target >=90% total nominal benar, 100% conflict material masuk review. |
| `QUAL-010` | Transparansi perubahan final. | Tidak ada nominal/jenis transaksi final yang diganti oleh AI tanpa konfirmasi/rekam audit. |
| `QUAL-011` | Responsivitas web & aksesibilitas. | Uji mobile kecil/tablet/desktop, navigasi keyboard, target WCAG 2.2 AA. |
| `QUAL-012` | Perilaku offline sinkron. | Input manual offline survives refresh dan tersinkron satu kali setelah online, atau muncul konflik yang dapat diselesaikan. |
| `QUAL-013` | Keamanan kredensial. | Tidak ada secret pada client bundle, public repo, error log, R2 public, atau URL aksi GOWA. |
| `QUAL-014` | Retensi/hak data berfungsi. | Export, revoke consent, penghapusan, dan audit lifecycle lolos tes sistem. |
| `QUAL-015` | Ketahanan job & WA. | Reconnect, retry, idempotency, queue recovery diuji sesudah restart GOWA/Worker/Armbian. |
| `QUAL-016` | Batas pemakaian platform. | Penggunaan Workers/Neon/R2/AI terpantau, ada peringatan sebelum melampaui free tier. |
| `QUAL-017` | Pengelolaan rilis/rollback. | Perubahan release bermasalah bisa ditarik tanpa kehilangan ledger, dengan migrasi aman. |
| `QUAL-018` | Pemulihan data. | Backup terenkripsi, recovery procedure didokumentasi, restore diuji pada lingkungan terisolasi secara berkala. |
| `QUAL-019` | Keamanan admin/superuser. | MFA, step-up, audit sensitive events, permission test wajib sebelum publik. |
| `QUAL-020` | Perbedaan status hari. | Hari tidak dilaporkan, nihil, sebagian dicatat, dan selesai bisa dibedakan pada semua kanal. |
| `QUAL-021` | Perlindungan dari salah kategori AI. | User dapat memperbaiki kategori tanpa mengubah nominal kecuali sengaja; data training adaptif tidak membocorkan preferensi user lain. |
| `QUAL-022` | Keamanan integrasi provider. | HTTP 429, 500, timeout, schema invalid, loss of vision forwarding tidak menyebabkan hang atau data silang. |
| `QUAL-023` | Kejelasan pemasaran. | Landing, terms dan UX tidak mengklaim bank integration, blokir QRIS, atau WhatsApp API resmi. |
| `QUAL-024` | Privasi operasional. | Telemetry/dashboard platform menunjukkan agregat, bukan raw isi transaksi/chat. |

## 3. Acceptance end-to-end untuk user

| Skenario | Ekspektasi production |
|---|---|
| **E2E-01** Registrasi publik | User berhasil membuat akun terverifikasi dan langsung memiliki role `user`. |
| **E2E-02** Percobaan akses akun lain | Detail transaksi/file/sesi WA user lain tidak bisa dibuka, termasuk via URL buatan. |
| **E2E-03** Budget awal | User memilih template Mahasiswa Kos, mengubah angka, mengonfirmasi; tidak ada catatan pengeluaran palsu. |
| **E2E-04** Quick add | Tulis lauk Rp10.000, kategori/anggaran/histori terbarui tepat satu kali. |
| **E2E-05** Transfer tabungan | Transfer Rp200.000 antardompet tidak membuat expense atau income fiktif. |
| **E2E-06** Bayar utang | Pembayaran Rp100.000 mengurangi cash dan pokok utang sesuai alokasi. |
| **E2E-07** Bulan 31 hari | Budget lauk harian 10k menghasilkan target 310k pada template dinamis. |
| **E2E-08** Pengeluaran galon | Catat galon 22k sebanyak lima kali; actual 110k dibanding estimate bulanan. |
| **E2E-09** Overspend | Jajan melebihi Rp30.000/bulan, jumlah minus transparan; tidak mengklaim menolak QRIS bank. |
| **E2E-10** Import lama | CSV dua transaksi identik ditandai duplikat sebelum posting. |
| **E2E-11** Offline | Input tanpa internet disimpan lokal dan masuk sekali ke server setelah tersambung. |
| **E2E-12** Perangkat bersama | Logout user A lalu user B login; B tidak bisa melihat cache/data A. |
| **E2E-13** OCR fallback | Vision unavailable tetapi foto dibaca OCR → provisional, tidak langsung dianggap final jika ambigu. |
| **E2E-14** Rekonsiliasi OCR | AI pulih, membaca bukti yang sama; jika konflik, minta konfirmasi dan tidak gandakan posting. |
| **E2E-15** Invoice unpaid | Gambar invoice yang belum lunas tidak dicatat otomatis sebagai pembayaran selesai. |
| **E2E-16** WA shared | Nomor yang terverifikasi mengirim 'lauk 10k'; muncul pada akun yang sesuai. |
| **E2E-17** WA personal | Pengguna dapat QR/pairing, status, reconnect, logout dan delete di halaman PWA. |
| **E2E-18** GOWA spoofing | Request dengan `device_id` akun lain ditolak oleh backend. |
| **E2E-19** STOP | Reminder berhenti seketika setelah STOP, tanpa menghapus akun. |
| **E2E-20** Missing-day | Hari tanpa input masih 'belum dilaporkan', bukan otomatis 'nihil'. |
| **E2E-21** Pengingat adaptif | User yang sudah menandai hari 'selesai' tidak menerima reminder laporan ulang. |
| **E2E-22** Armbian down | Web tetap bisa login, melihat transaksi tersimpan dan menambah transaksi manual. |
| **E2E-23** Neon down | PWA tidak mengklaim simpan server berhasil; catatan offline punya status pending. |
| **E2E-24** R2 down | User diberi pilihan catat teks tanpa bukti dan lanjut upload nanti. |
| **E2E-25** Hak hapus | User hapus sesi WA tanpa menghapus buku transaksi; hapus akun melalui alur terpisah. |
| **E2E-26** Data export | Pengguna mengunduh hanya datanya sendiri; admin tidak mendapat akses export user lain. |
| **E2E-27** Admin suspended user | Admin dapat suspend akun setelah alasan; tetap tidak bisa membuka ledger privat. |
| **E2E-28** Superuser change | Ganti pengaturan model/feature flag tercatat audit dan tidak merusak ledger. |
| **E2E-29** WA session corrupt | Kegagalan satu sesi tidak menyebabkan cross-tenant data; dampak platform tercatat. |
| **E2E-30** Public demo | Tanpa login melihat data sintetis, tidak pernah menyentuh informasi nyata. |

## 4. Matriks pengujian sistem yang dituntut produk

| Kategori | Contoh pengujian |
|---|---|
| Unit domain | Uang integer, kategori, jadwal bulan, split, transfer, utang, refund |
| Integrasi | Neon, R2 private access, autentikasi, 9router provider, GOWA events |
| End-to-end | Register → budget → input → upload → review → laporan → export |
| Multiuser isolation | IDOR, guessed UUID, R2 key, GOWA device ID, AI job ID, admin privilege |
| Fault injection | LLM 429/500/timeout; OCR empty; CF Access denied; R2/Neon down; Armbian restart |
| PWA/offline | Refresh offline, cache partition, file queued, conflict sync, logout, instalasi |
| WhatsApp | QR expiry, pairing code, reconnect, logout/delete, bot STOP, duplicate webhook |
| Security | OWASP ASVS, XSS, CSRF, brute force, OAuth callback abuse, malicious image |
| Load/cost | 10, 100, 1.000 active app users (sesuai load generator) dan concurrency WA sesuai tes kapasitas Armbian; ukur bukan asumsikan |
| Accessibility | Screen reader, contrast, zoom 200%, keyboard navigation, touch targets |
| Data lifecycle | Backups, restore, privacy export, deleting account, R2 retention, revoke WA |

## 5. Gate produksi (hard blockers)

| Gate | Mengapa wajib | Kelulusan |
|---|---|---|
| `GATE-SEC` | Aplikasi menyimpan keuangan pribadi dan metadata WA | Review keamanan, isolasi, MFA admin, secret management selesai |
| `GATE-DATA` | Kesalahan ledger berdampak nyata bagi pengelolaan uang | Seluruh invariant ledger dan dedup E2E lolos |
| `GATE-PRIV` | UU PDP dan kepercayaan publik | Kebijakan privasi/izin/ekspor/hapus implementasi & review legal selesai |
| `GATE-WA` | GOWA bukan integrasi resmi WhatsApp | Uji platform/legal/policy & sesi privat plus fallback manual layak untuk target publik |
| `GATE-OPS` | Operasi gratis punya batas nyata | Observabilitas, quota/circuit breaker, emergency stop aktif |
| `GATE-RESTORE` | Keuangan harus bisa dipulihkan | Backup dan restore berhasil diuji tanpa paparan data nyata |
| `GATE-AI` | Vision/OCR rawan halusinasi | Akurasi pengujian terpenuhi; conflict aman; failover idempotent |
| `GATE-UX` | Produk perlu dipakai orang nyata | Uji usability, accessibility, mobile, offline dan error states lolos |

**Keputusan:** belum boleh mengklaim semua gate telah lolos hanya karena source code sudah selesai atau Cloudflare deployment menunjukkan sukses.

## 6. Kapasitas & biaya gratis

### Komponen gratis yang harus dipantau

| Layanan | Batas resmi pada saat riset | Implikasi produk |
|---|---|---|
| Cloudflare Workers Free | 100.000 dynamic request/hari; CPU 10 ms per invocation | API ringan, cache/static assets, uji latency CPU berat |
| Cloudflare Worker static assets | Request statis gratis tanpa batas, jika tidak memanggil Worker script | Jangan membuat semua request statis menjadi request dinamis tak perlu |
| Neon Free | 1 GB storage dan 100 CU-hours/project/bulan (rilis 2 Oktober 2026) | Hindari polling DB rapat nonstop, kelola retensi/indeks |
| Cloudflare R2 Standard | 10 GB-month, 1 juta Class A, 10 juta Class B per bulan; egress gratis | File terbatasi ukuran/masa retensi; overage dapat ditagihkan |
| GOWA + 9router | Open-source self-hosted, konsumsi perangkat milik operator | Perlu listrik, bandwidth, RAM, backup dan keamanan; tidak 'free unlimited' |

*Jumlah request cloud bukan jumlah user pasti.* Dengan ilustrasi 1.000 user x 30 API request per hari berarti 30.000 request/hari, tetapi burst, retry, bot, autorefresh, OCR queue dan subrequests tetap memerlukan tes riil. Neon compute juga dapat habis walau jumlah user kecil jika server polling terus-menerus.

### Target biaya

Biaya layanan **$0 selama dalam allowance**; ini bukan janji bahwa seluruh pemakaian produksi selalu Rp0. Cloudflare R2 bisa menimbulkan billing di atas kuota; biaya domain, listrik Armbian, internet dan upstream AI harus dihitung bila ada. Operator wajib tahu fitur mana yang harus di-throttle ketika mencapai soft cap.

## 7. Keandalan dan pemulihan

- Status job harus bertahan restart Worker/Armbian, dan retry hanya melanjutkan job belum selesai.
- GOWA/9router down tidak boleh membuat app utama memblokir seluruh pengguna.
- Restore diuji secara terpisah dengan data dummy sebelum mencobanya pada data produksi.
- Incident log harus merekam waktu, dampak, tindakan korektif dan hasil review, tanpa mengekspor foto/isi chat pengguna secara default.
- Pengguna melihat pemberitahuan ketika layanan WA/AI bermasalah dengan jalur fallback manual.

## 8. Data yang diperlukan untuk mengevaluasi hasil

- Kumpulan screenshot dan struk berbagai kualitas dengan nominal ground truth dan persetujuan.
- Dataset transaksi sintetis lintas 28/29/30/31 hari, refund, split, hutang, perbedaan waktu.
- Pengujian 2+ user bersamaan dengan sesi WA berbeda, 2 perangkat web berbeda, serta akun admin.
- Dashboard request/error/CPU/storage minimal untuk menguji target free tier.
- Rekaman kasus QA hasil kelulusan `GATE-*` yang dapat diperiksa sebelum launch.

**Referensi biaya & standar:** [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [Static assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) · [Neon Free](https://neon.com/blog/neon-free-plan-1-gb-per-project) · [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) · [OWASP ASVS](https://asvs.owasp.org/).
