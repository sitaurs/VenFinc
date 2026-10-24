# TASKS-P8 — 9router vision, Tesseract OCR, review and recheck

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P8-001 — 9router dual API protocol adapters

- **Status awal:** `todo`; **tujuan tunggal:** Connect OpenAI-compatible and Anthropic-compatible without browser secrets
- **Dependensi:** `P6-001`, `P0-004`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Real image passes and model capability gate is exercised.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-002 — Local OCR processing adapter

- **Status awal:** `todo`; **tujuan tunggal:** Sharp preprocessing/Tesseract.js OCR on ARM worker, not at Edge
- **Dependensi:** `P6-001`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Golden fixtures parsed and no Worker 10ms CPU overrun.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-003 — AI candidate state machine

- **Status awal:** `todo`; **tujuan tunggal:** Persist image hash/field evidence/candidate review statuses, no autopost
- **Dependensi:** `P8-001`, `P8-002`, `P5-003`, `P6-002`.
- **Rujukan:** [`TRD-01-DATA-MODEL.md`](../architecture/TRD-01-DATA-MODEL.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Transient OCR/AI cannot create posted ledger event.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-004 — Review comparison & reconciliation

- **Status awal:** `todo`; **tujuan tunggal:** Compare AI against OCR, ownership-reviewed correction and audit before posting
- **Dependensi:** `P8-003`, `P3-002`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Disagreement blocks automatic posting; one confirmed entry.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-001 — Parser teks deterministik untuk pola sederhana sebelum memanggil model

- **Status awal:** `todo`; **tujuan tunggal:** Parser teks deterministik untuk pola sederhana sebelum memanggil model. Perilaku persis mengikuti AI-001 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Parser teks deterministik untuk pola sederhana sebelum memanggil model" dari AI-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-001-A dan AC-AI-001-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Parser teks deterministik untuk pola sederhana sebelum memanggil model.", **maka** Hemat latency/API; teks kompleks dikirim ke LLM hanya bila perlu. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-002 — Vision LLM utama melalui adapter kompatibel OpenAI/Anthropic

- **Status awal:** `todo`; **tujuan tunggal:** Vision LLM utama melalui adapter kompatibel OpenAI/Anthropic. Perilaku persis mengikuti AI-002 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Vision LLM utama melalui adapter kompatibel OpenAI/Anthropic" dari AI-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-002-A dan AC-AI-002-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Vision LLM utama melalui adapter kompatibel OpenAI/Anthropic.", **maka** Model/endpoint dapat diganti operator tanpa merombak fitur; pemanggilan dikendalikan server. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-003 — Input foto diproses setelah consent, validasi MIME, ukuran, dan kepemilikan

- **Status awal:** `todo`; **tujuan tunggal:** Input foto diproses setelah consent, validasi MIME, ukuran, dan kepemilikan. Perilaku persis mengikuti AI-003 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Input foto diproses setelah consent, validasi MIME, ukuran, dan kepemilikan" dari AI-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-003-A dan AC-AI-003-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Input foto diproses setelah consent, validasi MIME, ukuran, dan kepemilikan.", **maka** Tolak file tak valid dan jelaskan alasannya; data tidak bocor lintas user. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-004-01 — Baca nominal, total dan currency

- **Status awal:** `todo`; **tujuan tunggal:** Baca nominal, total dan currency. Perilaku persis mengikuti AI-004 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Baca nominal, total dan currency" dari AI-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-004-A dan AC-AI-004-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Ekstraksi terstruktur: jenis bukti, payment status, nominal total, item, merchant, tanggal, mata uang, metode bayar, kategori usulan, confidence/evidence.", **maka** Field yang tidak terlihat diberi `unknown`, tidak ditebak. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-004-02 — Baca merchant, date, payment status dan items

- **Status awal:** `todo`; **tujuan tunggal:** Baca merchant, date, payment status dan items. Perilaku persis mengikuti AI-004 (bukan ilustrasi statis).
- **Dependensi:** `P8-AI-004-01`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Baca merchant, date, payment status dan items" dari AI-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-004-A dan AC-AI-004-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Ekstraksi terstruktur: jenis bukti, payment status, nominal total, item, merchant, tanggal, mata uang, metode bayar, kategori usulan, confidence/evidence.", **maka** Field yang tidak terlihat diberi `unknown`, tidak ditebak. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-005 — Deteksi dokumen non-pembayaran

- **Status awal:** `todo`; **tujuan tunggal:** Deteksi dokumen non-pembayaran. Perilaku persis mengikuti AI-005 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Deteksi dokumen non-pembayaran" dari AI-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-005-A dan AC-AI-005-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Deteksi dokumen non-pembayaran.", **maka** QR untuk dibayar, screenshot order pending, invoice belum lunas tidak langsung jadi pengeluaran. Negative/boundary: LLM timeout/429 atau schema gagal beralih ke OCR tanpa menebak; input asli tetap tersedia untuk review. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-006 — Validasi angka, consistency checks (subtotal/diskon/total), tanggal, status paid, nominal wajar, duplikasi

- **Status awal:** `todo`; **tujuan tunggal:** Validasi angka, consistency checks (subtotal/diskon/total), tanggal, status paid, nominal wajar, duplikasi. Perilaku persis mengikuti AI-006 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Validasi angka, consistency checks (subtotal/diskon/total), tanggal, status paid, nominal wajar, duplikasi" dari AI-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-006-A dan AC-AI-006-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Validasi angka, consistency checks (subtotal/diskon/total), tanggal, status paid, nominal wajar, duplikasi.", **maka** Ketidaksesuaian masuk review; tidak diam-diam memilih angka. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-007-01 — Fallback pada error, timeout dan invalid output

- **Status awal:** `todo`; **tujuan tunggal:** Fallback pada error, timeout dan invalid output. Perilaku persis mengikuti AI-007 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Fallback pada error, timeout dan invalid output" dari AI-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-007-A dan AC-AI-007-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "OCR fallback lokal saat Vision error, timeout, overload, atau output invalid.", **maka** User melihat status provisional; OCR bukan sumber kebenaran final otomatis. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-007-02 — Status sementara dan permintaan review

- **Status awal:** `todo`; **tujuan tunggal:** Status sementara dan permintaan review. Perilaku persis mengikuti AI-007 (bukan ilustrasi statis).
- **Dependensi:** `P8-AI-007-01`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Status sementara dan permintaan review" dari AI-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-007-A dan AC-AI-007-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "OCR fallback lokal saat Vision error, timeout, overload, atau output invalid.", **maka** User melihat status provisional; OCR bukan sumber kebenaran final otomatis. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-008-01 — Antrian recheck setelah layanan pulih

- **Status awal:** `todo`; **tujuan tunggal:** Antrian recheck setelah layanan pulih. Perilaku persis mengikuti AI-008 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Antrian recheck setelah layanan pulih" dari AI-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-008-A dan AC-AI-008-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Antrean recheck OCR dengan Vision ketika AI pulih.", **maka** Periksa ulang bukti asli dan hasil sebelumnya; tidak buat ledger duplikat. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-008-02 — Bandingkan hasil baru dengan evidence lama

- **Status awal:** `todo`; **tujuan tunggal:** Bandingkan hasil baru dengan evidence lama. Perilaku persis mengikuti AI-008 (bukan ilustrasi statis).
- **Dependensi:** `P8-AI-008-01`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Bandingkan hasil baru dengan evidence lama" dari AI-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-008-A dan AC-AI-008-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Antrean recheck OCR dengan Vision ketika AI pulih.", **maka** Periksa ulang bukti asli dan hasil sebelumnya; tidak buat ledger duplikat. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-009-01 — Tampilan konflik nilai dan sumber

- **Status awal:** `todo`; **tujuan tunggal:** Tampilan konflik nilai dan sumber. Perilaku persis mengikuti AI-009 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Tampilan konflik nilai dan sumber" dari AI-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-009-A dan AC-AI-009-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Konflik OCR vs Vision menuntut keputusan pengguna bila berdampak material.", **maka** Nominal final tidak ditimpa diam-diam, ditampilkan kedua angka dengan foto. Negative/boundary: Hasil OCR Rp10.000 berbeda dari LLM Rp100.000 menimbulkan konflik; tidak ada perubahan ledger sampai user memutuskan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-009-02 — Persetujuan owner untuk mengganti kandidat

- **Status awal:** `todo`; **tujuan tunggal:** Persetujuan owner untuk mengganti kandidat. Perilaku persis mengikuti AI-009 (bukan ilustrasi statis).
- **Dependensi:** `P8-AI-009-01`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Persetujuan owner untuk mengganti kandidat" dari AI-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-009-A dan AC-AI-009-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Konflik OCR vs Vision menuntut keputusan pengguna bila berdampak material.", **maka** Nominal final tidak ditimpa diam-diam, ditampilkan kedua angka dengan foto. Negative/boundary: Hasil OCR Rp10.000 berbeda dari LLM Rp100.000 menimbulkan konflik; tidak ada perubahan ledger sampai user memutuskan. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-010-01 — Retry backoff dan timeouts

- **Status awal:** `todo`; **tujuan tunggal:** Retry backoff dan timeouts. Perilaku persis mengikuti AI-010 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Retry backoff dan timeouts" dari AI-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-010-A dan AC-AI-010-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Retry terbatas, circuit breaker, backoff, dan nonblocking.", **maka** Kegagalan upstream tidak menyebabkan spam requests atau freeze PWA. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-010-02 — Circuit breaker tidak mengganggu manual input

- **Status awal:** `todo`; **tujuan tunggal:** Circuit breaker tidak mengganggu manual input. Perilaku persis mengikuti AI-010 (bukan ilustrasi statis).
- **Dependensi:** `P8-AI-010-01`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Circuit breaker tidak mengganggu manual input" dari AI-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-010-A dan AC-AI-010-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Retry terbatas, circuit breaker, backoff, dan nonblocking.", **maka** Kegagalan upstream tidak menyebabkan spam requests atau freeze PWA. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-011 — Dedup lintas foto, hash konten, sumber WA, dan transaksi terdekat

- **Status awal:** `todo`; **tujuan tunggal:** Dedup lintas foto, hash konten, sumber WA, dan transaksi terdekat. Perilaku persis mengikuti AI-011 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Dedup lintas foto, hash konten, sumber WA, dan transaksi terdekat" dari AI-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-011-A dan AC-AI-011-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Dedup lintas foto, hash konten, sumber WA, dan transaksi terdekat.", **maka** Flag kandidat duplikat dan riwayat keputusan merge/keep. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-012 — Koreksi hasil dan pembelajaran preferensi kategori berbasis user secara aman

- **Status awal:** `todo`; **tujuan tunggal:** Koreksi hasil dan pembelajaran preferensi kategori berbasis user secara aman. Perilaku persis mengikuti AI-012 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Koreksi hasil dan pembelajaran preferensi kategori berbasis user secara aman" dari AI-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-012-A dan AC-AI-012-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Koreksi hasil dan pembelajaran preferensi kategori berbasis user secara aman.", **maka** Ingat mapping merchant kategori bila diizinkan, tidak mengubah record lama otomatis. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-013 — Pengguna bisa mengedit hasil, menandai salah, batal, dan input manual saat AI mati

- **Status awal:** `todo`; **tujuan tunggal:** Pengguna bisa mengedit hasil, menandai salah, batal, dan input manual saat AI mati. Perilaku persis mengikuti AI-013 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengguna bisa mengedit hasil, menandai salah, batal, dan input manual saat AI mati" dari AI-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-013-A dan AC-AI-013-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Pengguna bisa mengedit hasil, menandai salah, batal, dan input manual saat AI mati.", **maka** Proses cancel harus aman bila job masih berjalan. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-014-01 — State transisi job dan progress

- **Status awal:** `todo`; **tujuan tunggal:** State transisi job dan progress. Perilaku persis mengikuti AI-014 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-014), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "State transisi job dan progress" dari AI-014; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-014-A dan AC-AI-014-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Antrian pekerjaan berstatus, progress, dan riwayat hasil.", **maka** Membedakan pending, retry, provisional, needs-review, verified, failed. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-014-02 — Worker crash recovery dan expiry lease

- **Status awal:** `todo`; **tujuan tunggal:** Worker crash recovery dan expiry lease. Perilaku persis mengikuti AI-014 (bukan ilustrasi statis).
- **Dependensi:** `P8-AI-014-01`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-014), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Worker crash recovery dan expiry lease" dari AI-014; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-014-A dan AC-AI-014-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Antrian pekerjaan berstatus, progress, dan riwayat hasil.", **maka** Membedakan pending, retry, provisional, needs-review, verified, failed. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-015 — Kuota harian/bulanan AI per user dan global yang dapat dikendalikan operator

- **Status awal:** `todo`; **tujuan tunggal:** Kuota harian/bulanan AI per user dan global yang dapat dikendalikan operator. Perilaku persis mengikuti AI-015 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kuota harian/bulanan AI per user dan global yang dapat dikendalikan operator" dari AI-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-015-A dan AC-AI-015-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Kuota harian/bulanan AI per user dan global yang dapat dikendalikan operator.", **maka** Bila habis, tetap tawarkan input manual atau OCR bila sumber daya memungkinkan. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-016 — Retensi bukti disesuaikan status verifikasi dan kebijakan pengguna

- **Status awal:** `todo`; **tujuan tunggal:** Retensi bukti disesuaikan status verifikasi dan kebijakan pengguna. Perilaku persis mengikuti AI-016 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-016), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Retensi bukti disesuaikan status verifikasi dan kebijakan pengguna" dari AI-016; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-016-A dan AC-AI-016-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Retensi bukti disesuaikan status verifikasi dan kebijakan pengguna.", **maka** Bukti asli tersedia saat recheck, lalu dapat dihapus sesuai retention. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-017 — Proteksi dari prompt injection di gambar/teks struk

- **Status awal:** `todo`; **tujuan tunggal:** Proteksi dari prompt injection di gambar/teks struk. Perilaku persis mengikuti AI-017 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-017), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Proteksi dari prompt injection di gambar/teks struk" dari AI-017; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-017-A dan AC-AI-017-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Proteksi dari prompt injection di gambar/teks struk.", **maka** Perintah tertulis di bukti diperlakukan sebagai data, bukan instruksi sistem/otorisasi. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-018 — Transparansi pemrosesan oleh model pihak ketiga

- **Status awal:** `todo`; **tujuan tunggal:** Transparansi pemrosesan oleh model pihak ketiga. Perilaku persis mengikuti AI-018 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-018), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Transparansi pemrosesan oleh model pihak ketiga" dari AI-018; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-018-A dan AC-AI-018-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Transparansi pemrosesan oleh model pihak ketiga.", **maka** User diberitahu bahwa 9router dapat meneruskan konten ke provider upstream sesuai model terpilih; butuh izin. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-019 — Pengendalian biaya dan pemilihan provider fallback yang aman

- **Status awal:** `todo`; **tujuan tunggal:** Pengendalian biaya dan pemilihan provider fallback yang aman. Perilaku persis mengikuti AI-019 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-019), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengendalian biaya dan pemilihan provider fallback yang aman" dari AI-019; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-019-A dan AC-AI-019-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Pengendalian biaya dan pemilihan provider fallback yang aman.", **maka** Model berbeda boleh dipakai jika lulus vision dan kebijakan data; tidak mengirim seluruh gambar ke provider lain secara diam-diam. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-AI-020 — Audit tanpa menyimpan prompt/gambar sensitif di log publik

- **Status awal:** `todo`; **tujuan tunggal:** Audit tanpa menyimpan prompt/gambar sensitif di log publik. Perilaku persis mengikuti AI-020 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-05-AI.md`](../requirements/REQ-05-AI.md#ai-020), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Audit tanpa menyimpan prompt/gambar sensitif di log publik" dari AI-020; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-AI-020-A dan AC-AI-020-B yang relevan: **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Audit tanpa menyimpan prompt/gambar sensitif di log publik.", **maka** Simpan metadata yang cukup untuk debugging, pemrosesan content minimisasi. Negative/boundary: Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-TRUST-008 — Transparansi vendor/subprocessor dan perubahan tujuan pemrosesan

- **Status awal:** `todo`; **tujuan tunggal:** Transparansi vendor/subprocessor dan perubahan tujuan pemrosesan. Perilaku persis mengikuti TRUST-008 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Transparansi vendor/subprocessor dan perubahan tujuan pemrosesan" dari TRUST-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-008-A dan AC-TRUST-008-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Transparansi vendor/subprocessor dan perubahan tujuan pemrosesan.", **maka** User mendapat penjelasan bahwa 9router dapat meneruskan gambar ke provider upstream. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-TRUST-017 — Anti prompt injection dan konten tidak tepercaya

- **Status awal:** `todo`; **tujuan tunggal:** Anti prompt injection dan konten tidak tepercaya. Perilaku persis mengikuti TRUST-017 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-017), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Anti prompt injection dan konten tidak tepercaya" dari TRUST-017; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-017-A dan AC-TRUST-017-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Anti prompt injection dan konten tidak tepercaya.", **maka** Teks gambar/chat tidak dapat memerintah perubahan role atau mengambil data user lain. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-TRUST-019 — Data keuangan tidak digunakan untuk periklanan atau training AI tanpa dasar/izin spesifik terpisah

- **Status awal:** `todo`; **tujuan tunggal:** Data keuangan tidak digunakan untuk periklanan atau training AI tanpa dasar/izin spesifik terpisah. Perilaku persis mengikuti TRUST-019 (bukan ilustrasi statis).
- **Dependensi:** `P8-003`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-019), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Data keuangan tidak digunakan untuk periklanan atau training AI tanpa dasar/izin spesifik terpisah" dari TRUST-019; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-019-A dan AC-TRUST-019-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Data keuangan tidak digunakan untuk periklanan atau training AI tanpa dasar/izin spesifik terpisah.", **maka** Tidak ada iklan tertarget memakai struk/saldo/riwayat transaksi. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-005 — Connect UI proof review to extraction jobs

- **Status awal:** `todo`; **tujuan tunggal:** Wire REV screens/upload to real candidate and explicit owner confirmation
- **Dependensi:** `P8-004`, `P4-SCREEN-REV-03`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Image mismatch correction and duplicate prompt tested in browser.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P8-006 — Golden receipt dataset evaluation

- **Status awal:** `todo`; **tujuan tunggal:** Use truth-annotated images from various banks/shops and OCR error cases
- **Dependensi:** `P8-001`, `P8-002`, `P8-005`.
- **Rujukan:** [`REQ-08-QUALITY.md`](../requirements/REQ-08-QUALITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Record per-field precision/recall and disagreement metrics; do not invent accuracy.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

