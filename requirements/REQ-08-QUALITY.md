# REQ-08-QUALITY — User Stories & Acceptance Criteria

**PRD dasar:** [`PRD-09-NFR-ACCEPTANCE.md`](../docs/prd/PRD-09-NFR-ACCEPTANCE.md).

**Interpretasi:** AC-A adalah observasi dasar untuk satu ID; AC-B adalah skenario batas/negatif (bila berlaku). Semua kasus rinci wajib juga lolos [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md).

Tabel/entri di bawah mengikat ID persyaratan sumber. Apabila visual mockup berbeda dari hasil test ini, perilaku mengikuti requirement dan keputusan produk, bukan angka raster pada gambar.

## QUAL: Acceptance per requirement

<a id="qual-001"></a>

### QUAL-001 — Keamanan isolasi tenant.

- **NFR:** Keamanan isolasi tenant.
- **AC-QUAL-001-A (ukuran):** 0 pelanggaran pada suite uji lintas user, berbagai ID, gambar, dan device WA.
- **AC-QUAL-001-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-002"></a>

### QUAL-002 — Tidak ada pengeluaran dobel dari retry.

- **NFR:** Tidak ada pengeluaran dobel dari retry.
- **AC-QUAL-002-A (ukuran):** 0 duplicate posting untuk input yang sama dari webhook, upload ulang dan pemulihan job.
- **AC-QUAL-002-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-003"></a>

### QUAL-003 — Konsistensi perhitungan uang.

- **NFR:** Konsistensi perhitungan uang.
- **AC-QUAL-003-A (ukuran):** 100% pada tes invariant: transfer, split, refund, utang, dan budget periodik.
- **AC-QUAL-003-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-004"></a>

### QUAL-004 — Tersedia fallback manual saat WA/AI gangguan.

- **NFR:** Tersedia fallback manual saat WA/AI gangguan.
- **AC-QUAL-004-A (ukuran):** 100% skenario fault injection tetap bisa mencatat manual online; draft offline dapat dibuat lokal.
- **AC-QUAL-004-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-005"></a>

### QUAL-005 — Kecepatan input manual.

- **NFR:** Kecepatan input manual.
- **AC-QUAL-005-A (ukuran):** Alur pengguna normal <=10 detik setelah kategori/dompet awal disiapkan (sasaran usability, diuji nyata).
- **AC-QUAL-005-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-006"></a>

### QUAL-006 — Kinerja web pada jaringan mobile rata-rata.

- **NFR:** Kinerja web pada jaringan mobile rata-rata.
- **AC-QUAL-006-A (ukuran):** LCP halaman utama <=2.5 detik p75 untuk kondisi uji yang terdokumentasi; jika infra free-tier menjadikan target belum realistis, dokumentasikan deviasi dan perbaikan.
- **AC-QUAL-006-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-007"></a>

### QUAL-007 — Latensi API non-AI.

- **NFR:** Latensi API non-AI.
- **AC-QUAL-007-A (ukuran):** Target p95 <=1.5 detik pada beban dan lokasi tes yang jelas, termasuk respons Neon; cold-start dihitung terpisah.
- **AC-QUAL-007-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-008"></a>

### QUAL-008 — Keandalan web/API.

- **NFR:** Keandalan web/API.
- **AC-QUAL-008-A (ukuran):** Target operasional >=99.0% bulanan untuk fitur inti, bukan SLA kontraktual dengan pengguna pada infrastruktur gratis.
- **AC-QUAL-008-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-009"></a>

### QUAL-009 — Akurasi ekstraksi bukti.

- **NFR:** Akurasi ekstraksi bukti.
- **AC-QUAL-009-A (ukuran):** Dataset struk/QRIS representatif; target >=90% total nominal benar, 100% conflict material masuk review.
- **AC-QUAL-009-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-010"></a>

### QUAL-010 — Transparansi perubahan final.

- **NFR:** Transparansi perubahan final.
- **AC-QUAL-010-A (ukuran):** Tidak ada nominal/jenis transaksi final yang diganti oleh AI tanpa konfirmasi/rekam audit.
- **AC-QUAL-010-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-011"></a>

### QUAL-011 — Responsivitas web & aksesibilitas.

- **NFR:** Responsivitas web & aksesibilitas.
- **AC-QUAL-011-A (ukuran):** Uji mobile kecil/tablet/desktop, navigasi keyboard, target WCAG 2.2 AA.
- **AC-QUAL-011-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-012"></a>

### QUAL-012 — Perilaku offline sinkron.

- **NFR:** Perilaku offline sinkron.
- **AC-QUAL-012-A (ukuran):** Input manual offline survives refresh dan tersinkron satu kali setelah online, atau muncul konflik yang dapat diselesaikan.
- **AC-QUAL-012-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-013"></a>

### QUAL-013 — Keamanan kredensial.

- **NFR:** Keamanan kredensial.
- **AC-QUAL-013-A (ukuran):** Tidak ada secret pada client bundle, public repo, error log, R2 public, atau URL aksi GOWA.
- **AC-QUAL-013-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-014"></a>

### QUAL-014 — Retensi/hak data berfungsi.

- **NFR:** Retensi/hak data berfungsi.
- **AC-QUAL-014-A (ukuran):** Export, revoke consent, penghapusan, dan audit lifecycle lolos tes sistem.
- **AC-QUAL-014-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-015"></a>

### QUAL-015 — Ketahanan job & WA.

- **NFR:** Ketahanan job & WA.
- **AC-QUAL-015-A (ukuran):** Reconnect, retry, idempotency, queue recovery diuji sesudah restart GOWA/Worker/Armbian.
- **AC-QUAL-015-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-016"></a>

### QUAL-016 — Batas pemakaian platform.

- **NFR:** Batas pemakaian platform.
- **AC-QUAL-016-A (ukuran):** Penggunaan Workers/Neon/R2/AI terpantau, ada peringatan sebelum melampaui free tier.
- **AC-QUAL-016-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-017"></a>

### QUAL-017 — Pengelolaan rilis/rollback.

- **NFR:** Pengelolaan rilis/rollback.
- **AC-QUAL-017-A (ukuran):** Perubahan release bermasalah bisa ditarik tanpa kehilangan ledger, dengan migrasi aman.
- **AC-QUAL-017-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-018"></a>

### QUAL-018 — Pemulihan data.

- **NFR:** Pemulihan data.
- **AC-QUAL-018-A (ukuran):** Backup terenkripsi, recovery procedure didokumentasi, restore diuji pada lingkungan terisolasi secara berkala.
- **AC-QUAL-018-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-019"></a>

### QUAL-019 — Keamanan admin/superuser.

- **NFR:** Keamanan admin/superuser.
- **AC-QUAL-019-A (ukuran):** MFA, step-up, audit sensitive events, permission test wajib sebelum publik.
- **AC-QUAL-019-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-020"></a>

### QUAL-020 — Perbedaan status hari.

- **NFR:** Perbedaan status hari.
- **AC-QUAL-020-A (ukuran):** Hari tidak dilaporkan, nihil, sebagian dicatat, dan selesai bisa dibedakan pada semua kanal.
- **AC-QUAL-020-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-021"></a>

### QUAL-021 — Perlindungan dari salah kategori AI.

- **NFR:** Perlindungan dari salah kategori AI.
- **AC-QUAL-021-A (ukuran):** User dapat memperbaiki kategori tanpa mengubah nominal kecuali sengaja; data training adaptif tidak membocorkan preferensi user lain.
- **AC-QUAL-021-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-022"></a>

### QUAL-022 — Keamanan integrasi provider.

- **NFR:** Keamanan integrasi provider.
- **AC-QUAL-022-A (ukuran):** HTTP 429, 500, timeout, schema invalid, loss of vision forwarding tidak menyebabkan hang atau data silang.
- **AC-QUAL-022-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-023"></a>

### QUAL-023 — Kejelasan pemasaran.

- **NFR:** Kejelasan pemasaran.
- **AC-QUAL-023-A (ukuran):** Landing, terms dan UX tidak mengklaim bank integration, blokir QRIS, atau WhatsApp API resmi.
- **AC-QUAL-023-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

<a id="qual-024"></a>

### QUAL-024 — Privasi operasional.

- **NFR:** Privasi operasional.
- **AC-QUAL-024-A (ukuran):** Telemetry/dashboard platform menunjukkan agregat, bukan raw isi transaksi/chat.
- **AC-QUAL-024-B (bukti):** Laporan uji menyebut lingkungan, dataset/traffic, hasil nyata, pass/fail, dan artefak yang dapat diperiksa; hasil tanpa pengukuran bukan kelulusan.

