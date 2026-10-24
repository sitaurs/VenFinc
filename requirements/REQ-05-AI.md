# REQ-05-AI — User Stories & Acceptance Criteria

**PRD dasar:** [`PRD-06-AI-OCR.md`](../docs/prd/PRD-06-AI-OCR.md).

**Interpretasi:** AC-A adalah observasi dasar untuk satu ID; AC-B adalah skenario batas/negatif (bila berlaku). Semua kasus rinci wajib juga lolos [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md).

Tabel/entri di bawah mengikat ID persyaratan sumber. Apabila visual mockup berbeda dari hasil test ini, perilaku mengikuti requirement dan keputusan produk, bukan angka raster pada gambar.

## AI: Acceptance per requirement

<a id="ai-001"></a>

### AI-001 — Parser teks deterministik untuk pola sederhana sebelum memanggil model.

- **US-AI-001:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin parser teks deterministik untuk pola sederhana sebelum memanggil model, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-001-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Parser teks deterministik untuk pola sederhana sebelum memanggil model.", **maka** Hemat latency/API; teks kompleks dikirim ke LLM hanya bila perlu.
- **AC-AI-001-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-002"></a>

### AI-002 — Vision LLM utama melalui adapter kompatibel OpenAI/Anthropic.

- **US-AI-002:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin vision LLM utama melalui adapter kompatibel OpenAI/Anthropic, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-002-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Vision LLM utama melalui adapter kompatibel OpenAI/Anthropic.", **maka** Model/endpoint dapat diganti operator tanpa merombak fitur; pemanggilan dikendalikan server.
- **AC-AI-002-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-003"></a>

### AI-003 — Input foto diproses setelah consent, validasi MIME, ukuran, dan kepemilikan.

- **US-AI-003:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin input foto diproses setelah consent, validasi MIME, ukuran, dan kepemilikan, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-003-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Input foto diproses setelah consent, validasi MIME, ukuran, dan kepemilikan.", **maka** Tolak file tak valid dan jelaskan alasannya; data tidak bocor lintas user.
- **AC-AI-003-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-004"></a>

### AI-004 — Ekstraksi terstruktur: jenis bukti, payment status, nominal total, item, merchant, tanggal, mata uang, metode bayar, kategori usulan, confidence/evidence.

- **US-AI-004:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin ekstraksi terstruktur: jenis bukti, payment status, nominal total, item, merchant, tanggal, mata uang, metode bayar, kategori usulan, confidence/evidence, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-004-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Ekstraksi terstruktur: jenis bukti, payment status, nominal total, item, merchant, tanggal, mata uang, metode bayar, kategori usulan, confidence/evidence.", **maka** Field yang tidak terlihat diberi `unknown`, tidak ditebak.
- **AC-AI-004-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-005"></a>

### AI-005 — Deteksi dokumen non-pembayaran.

- **US-AI-005:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin deteksi dokumen non-pembayaran, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-005-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Deteksi dokumen non-pembayaran.", **maka** QR untuk dibayar, screenshot order pending, invoice belum lunas tidak langsung jadi pengeluaran.
- **AC-AI-005-B (batas):** LLM timeout/429 atau schema gagal beralih ke OCR tanpa menebak; input asli tetap tersedia untuk review.

<a id="ai-006"></a>

### AI-006 — Validasi angka, consistency checks (subtotal/diskon/total), tanggal, status paid, nominal wajar, duplikasi.

- **US-AI-006:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin validasi angka, consistency checks (subtotal/diskon/total), tanggal, status paid, nominal wajar, duplikasi, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-006-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Validasi angka, consistency checks (subtotal/diskon/total), tanggal, status paid, nominal wajar, duplikasi.", **maka** Ketidaksesuaian masuk review; tidak diam-diam memilih angka.
- **AC-AI-006-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-007"></a>

### AI-007 — OCR fallback lokal saat Vision error, timeout, overload, atau output invalid.

- **US-AI-007:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin oCR fallback lokal saat Vision error, timeout, overload, atau output invalid, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-007-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "OCR fallback lokal saat Vision error, timeout, overload, atau output invalid.", **maka** User melihat status provisional; OCR bukan sumber kebenaran final otomatis.
- **AC-AI-007-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-008"></a>

### AI-008 — Antrean recheck OCR dengan Vision ketika AI pulih.

- **US-AI-008:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin antrean recheck OCR dengan Vision ketika AI pulih, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-008-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Antrean recheck OCR dengan Vision ketika AI pulih.", **maka** Periksa ulang bukti asli dan hasil sebelumnya; tidak buat ledger duplikat.
- **AC-AI-008-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-009"></a>

### AI-009 — Konflik OCR vs Vision menuntut keputusan pengguna bila berdampak material.

- **US-AI-009:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin konflik OCR vs Vision menuntut keputusan pengguna bila berdampak material, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-009-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Konflik OCR vs Vision menuntut keputusan pengguna bila berdampak material.", **maka** Nominal final tidak ditimpa diam-diam, ditampilkan kedua angka dengan foto.
- **AC-AI-009-B (batas):** Hasil OCR Rp10.000 berbeda dari LLM Rp100.000 menimbulkan konflik; tidak ada perubahan ledger sampai user memutuskan.

<a id="ai-010"></a>

### AI-010 — Retry terbatas, circuit breaker, backoff, dan nonblocking.

- **US-AI-010:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin retry terbatas, circuit breaker, backoff, dan nonblocking, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-010-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Retry terbatas, circuit breaker, backoff, dan nonblocking.", **maka** Kegagalan upstream tidak menyebabkan spam requests atau freeze PWA.
- **AC-AI-010-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-011"></a>

### AI-011 — Dedup lintas foto, hash konten, sumber WA, dan transaksi terdekat.

- **US-AI-011:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin dedup lintas foto, hash konten, sumber WA, dan transaksi terdekat, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-011-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Dedup lintas foto, hash konten, sumber WA, dan transaksi terdekat.", **maka** Flag kandidat duplikat dan riwayat keputusan merge/keep.
- **AC-AI-011-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-012"></a>

### AI-012 — Koreksi hasil dan pembelajaran preferensi kategori berbasis user secara aman.

- **US-AI-012:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin koreksi hasil dan pembelajaran preferensi kategori berbasis user secara aman, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-012-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Koreksi hasil dan pembelajaran preferensi kategori berbasis user secara aman.", **maka** Ingat mapping merchant kategori bila diizinkan, tidak mengubah record lama otomatis.
- **AC-AI-012-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-013"></a>

### AI-013 — Pengguna bisa mengedit hasil, menandai salah, batal, dan input manual saat AI mati.

- **US-AI-013:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin pengguna bisa mengedit hasil, menandai salah, batal, dan input manual saat AI mati, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-013-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Pengguna bisa mengedit hasil, menandai salah, batal, dan input manual saat AI mati.", **maka** Proses cancel harus aman bila job masih berjalan.
- **AC-AI-013-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-014"></a>

### AI-014 — Antrian pekerjaan berstatus, progress, dan riwayat hasil.

- **US-AI-014:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin antrian pekerjaan berstatus, progress, dan riwayat hasil, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-014-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Antrian pekerjaan berstatus, progress, dan riwayat hasil.", **maka** Membedakan pending, retry, provisional, needs-review, verified, failed.
- **AC-AI-014-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-015"></a>

### AI-015 — Kuota harian/bulanan AI per user dan global yang dapat dikendalikan operator.

- **US-AI-015:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin kuota harian/bulanan AI per user dan global yang dapat dikendalikan operator, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-015-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Kuota harian/bulanan AI per user dan global yang dapat dikendalikan operator.", **maka** Bila habis, tetap tawarkan input manual atau OCR bila sumber daya memungkinkan.
- **AC-AI-015-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-016"></a>

### AI-016 — Retensi bukti disesuaikan status verifikasi dan kebijakan pengguna.

- **US-AI-016:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin retensi bukti disesuaikan status verifikasi dan kebijakan pengguna, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-016-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Retensi bukti disesuaikan status verifikasi dan kebijakan pengguna.", **maka** Bukti asli tersedia saat recheck, lalu dapat dihapus sesuai retention.
- **AC-AI-016-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-017"></a>

### AI-017 — Proteksi dari prompt injection di gambar/teks struk.

- **US-AI-017:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin proteksi dari prompt injection di gambar/teks struk, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-017-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Proteksi dari prompt injection di gambar/teks struk.", **maka** Perintah tertulis di bukti diperlakukan sebagai data, bukan instruksi sistem/otorisasi.
- **AC-AI-017-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-018"></a>

### AI-018 — Transparansi pemrosesan oleh model pihak ketiga.

- **US-AI-018:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin transparansi pemrosesan oleh model pihak ketiga, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-018-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Transparansi pemrosesan oleh model pihak ketiga.", **maka** User diberitahu bahwa 9router dapat meneruskan konten ke provider upstream sesuai model terpilih; butuh izin.
- **AC-AI-018-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-019"></a>

### AI-019 — Pengendalian biaya dan pemilihan provider fallback yang aman.

- **US-AI-019:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin pengendalian biaya dan pemilihan provider fallback yang aman, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-019-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Pengendalian biaya dan pemilihan provider fallback yang aman.", **maka** Model berbeda boleh dipakai jika lulus vision dan kebijakan data; tidak mengirim seluruh gambar ke provider lain secara diam-diam.
- **AC-AI-019-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

<a id="ai-020"></a>

### AI-020 — Audit tanpa menyimpan prompt/gambar sensitif di log publik.

- **US-AI-020:** Sebagai pengguna yang mengunggah bukti dengan izin, saya ingin audit tanpa menyimpan prompt/gambar sensitif di log publik, agar hasil pembacaan dapat dipercaya dan dikoreksi.
- **AC-AI-020-A (G/W/T):** **Diberikan** pengguna menyetujui penggunaan AI untuk bukti yang dipilih, **ketika** pengguna menjalankan kemampuan "Audit tanpa menyimpan prompt/gambar sensitif di log publik.", **maka** Simpan metadata yang cukup untuk debugging, pemrosesan content minimisasi.
- **AC-AI-020-B (batas):** Nominal yang meragukan tetap menunggu keputusan pengguna; AI tidak pernah menimpa transaksi final secara diam-diam.

