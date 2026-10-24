# VenFinance — PRD Production (Indeks & Kontrak Produk)

| Metadata | Nilai |
|---|---|
| Nama kerja | **VenFinance** (nama produk/branding sementara, dapat diganti) |
| Domain produk | **finance.venlab.tech** |
| Jenis produk | Aplikasi keuangan pribadi **multiuser** berbasis PWA, dengan integrasi WhatsApp dan AI opsional |
| Tahap dokumen | **Full production product specification**, bukan PRD MVP |
| Versi | PRD 1.0 — 23 Oktober 2026 |
| Bahasa spesifikasi | Bahasa Indonesia |
| Status | **Draft siap review produk**; beberapa keputusan risiko/policy memerlukan pengesahan sebelum peluncuran publik |
| Dokumen lanjutan | REQUIREMENTS, TRD, DESIGN, PLAN, TASK, AGENTS — **belum dibuat** |

> **Cara menggunakan paket:** mulai dari indeks ini, baca tiap bab sesuai dependensi. Seluruh dokumen di paket ini adalah *Product Requirements Document*. Mereka menyatakan perilaku dan hasil yang diharapkan dari produk, bukan desain skema database, kode, atau rencana implementasi terperinci.

## 1. Isi paket PRD

| Dokumen | Pembahasan | ID persyaratan |
|---|---|---|
| [PRD-01-VISION-SCOPE.md](./PRD-01-VISION-SCOPE.md) | Visi, masalah, persona, sasaran, cakupan, model produk | `PROD-*` |
| [PRD-02-IDENTITY-RBAC.md](./PRD-02-IDENTITY-RBAC.md) | Registrasi multiuser, identitas, keamanan akun, tiga role | `IAM-*` |
| [PRD-03-FINANCE-CORE.md](./PRD-03-FINANCE-CORE.md) | Pemasukan, pengeluaran, dompet, budget, utang, tabungan, analitik | `FIN-*` |
| [PRD-04-PWA-UX-INPUT.md](./PRD-04-PWA-UX-INPUT.md) | UX, PWA, input cepat, offline, laporan dan aksesibilitas | `UX-*` |
| [PRD-05-WHATSAPP-GOWA.md](./PRD-05-WHATSAPP-GOWA.md) | GOWA multi-account, bot bersama, sesi pribadi, pairing, reminder | `WA-*` |
| [PRD-06-AI-OCR.md](./PRD-06-AI-OCR.md) | Ekstraksi teks/gambar, fallback OCR, pengecekan ulang, kualitas | `AI-*` |
| [PRD-07-ADMIN-OPERATIONS.md](./PRD-07-ADMIN-OPERATIONS.md) | Panel Admin dan Superuser, kontrol kuota, operasi produk | `OPS-*` |
| [PRD-08-PRIVACY-SECURITY.md](./PRD-08-PRIVACY-SECURITY.md) | Hak data, isolasi tenant, privasi, izin, penghapusan, keamanan | `TRUST-*` |
| [PRD-09-NFR-ACCEPTANCE.md](./PRD-09-NFR-ACCEPTANCE.md) | Target layanan, acceptance end-to-end, readiness production | `QUAL-*` |
| [PRD-10-RESEARCH-DECISIONS.md](./PRD-10-RESEARCH-DECISIONS.md) | Fakta riset, risiko, asumsi, keputusan terbuka, sumber | `DEC-*` |

## 2. Keputusan produk yang sudah diambil

1. **Multiuser dengan pendaftaran publik.** Setiap pengguna memiliki data keuangan, anggaran, bukti transaksi, preferensi, dan integrasi WhatsApp sendiri.
2. Tiga **role platform**: `user`, `admin`, `superuser`; akun yang mendaftar publik selalu `user`.
3. **PWA mobile-first** dan web responsif; pengguna boleh memasukkan pengeluaran secara manual kapan pun tanpa harus menghubungkan WhatsApp ataupun memakai AI.
4. **Dua moda WhatsApp** dalam satu pengalaman aplikasi: (a) bot bersama, dan (b) akun WhatsApp pribadi per pengguna yang ditautkan melalui GOWA; moda pribadi opsional, membutuhkan persetujuan eksplisit dan kelulusan gerbang risiko.
5. Pengelolaan WhatsApp, termasuk **QR/pairing code, status, reconnect, logout, hapus sesi**, harus tersedia **di PWA**; tidak mewajibkan pengguna membuka UI GOWA.
6. AI menerima **teks, foto struk, screenshot pembayaran**; model Vision via **9router OpenAI-compatible/Anthropic-compatible** dan **OCR fallback** saat AI gagal; hasil OCR diperiksa lagi ketika AI kembali normal.
7. **Satu sumber kebenaran keuangan** di Neon PostgreSQL; gambar di private Cloudflare R2; web/API di Cloudflare Workers; GOWA + 9router + pemroses pekerjaan di Armbian.
8. Domain yang direncanakan: `finance.venlab.tech` (web/API), `gowa.venlab.tech` (gateway WA), `9r.venlab.tech` (AI). Domain `venlab.tech` sudah dikelola Cloudflare.
9. Target **biaya layanan gratis** dalam free allowances, **bukan janji gratis untuk trafik tak terbatas**. Monitoring kuota wajib agar operator tidak mendapat tagihan tak terduga.
10. Catatan aplikasi **tidak** mengubah limit rekening/QRIS bank, tidak menolak transaksi bank, dan **tidak** menyambung mutasi bank secara otomatis pada lingkup ini.

## 3. Prinsip produk yang tidak boleh dikorbankan

- **Kebenaran nominal di atas kecepatan AI.** Nominal ambigu harus minta konfirmasi, bukan ditebak.
- **Privasi secara default.** Admin dan superuser tidak otomatis boleh melihat catatan keuangan maupun percakapan WA pribadi pengguna.
- **Tidak ada pencatatan ganda.** Transfer dompet, kiriman ulang webhook, share foto berulang, dan retry AI tidak boleh menggandakan pengeluaran.
- **Pengguna berdaulat.** Koreksi, ekspor, berhenti dari bot, cabut izin AI, logout/hapus WA, dan penghapusan akun tersedia secara mandiri.
- **Fail gracefully.** PWA/manual tetap bekerja ketika Armbian, GOWA, 9router, atau model AI tidak tersedia.
- **Bukan produk bank.** Ini alat pencatatan dan edukasi anggaran; bukan dompet pembayaran, jasa investasi, alat kredit, atau pemberi nasihat keuangan individual berizin.

## 4. Terminologi

| Istilah | Arti dalam produk |
|---|---|
| Tenant | Ruang data privat milik **satu pengguna**. Bukan workspace grup. |
| Wallet/dompet | Wadah saldo kas virtual untuk merepresentasikan sumber uang, bukan rekening bank yang dapat ditransaksikan. |
| Budget/kantong anggaran | Jatah pembelanjaan kategori/periode, berbeda dari saldo uang riil. |
| Transaksi | Catatan kejadian keuangan yang sudah jelas arah, nominal, mata uang, dan kepemilikannya. |
| Bukti | Screenshot/struk/file yang berkaitan dengan transaksi. |
| Draft | Belum dianggap transaksi finansial final sampai tersimpan sesuai aturan. |
| Provisional | Hasil OCR/AI sementara yang belum memenuhi syarat verifikasi. |
| Verified | Ekstraksi sudah melewati validasi dan/atau dikonfirmasi pengguna. |
| Shared bot | Satu akun WA bot platform; banyak pengguna bercakap dengan nomor bot tersebut. |
| Personal session | Akun WA pengguna sendiri yang ditautkan ke instance GOWA untuk fungsi yang secara eksplisit diizinkan. |
| Finance Worker | Layanan proses yang menangani antrean, pengingat, webhook, Vision/OCR di Armbian. |
| OCR | Optical Character Recognition; istilah yang dimaksud pengguna saat menyebut 'PCR'. |

## 5. Status keputusan

- **Disepakati dari percakapan:** tiga role; registrasi publik; PWA; domain; Cloudflare Workers, Neon, R2, GOWA Armbian dan 9router; fitur QR/pairing dan pengelolaan sesi; Vision + OCR/recheck.
- **Rekomendasi produk yang dapat diubah:** nama kerja VenFinance, bot bersama sebagai default; satu personal session aktif per user pada konfigurasi awal; bahasa Indonesia sebagai default dengan English opsional; sasaran performa dan nilai default pengingat/kuota.
- **Wajib divalidasi sebelum publik:** kelayakan kebijakan WhatsApp/GOWA untuk layanan publik dan akun pribadi pengguna; kapasitas Armbian; dukungan vision aktual dari model di 9router; keamanan, privacy review, dan status biaya platform.

## 6. Hubungan antardokumen

- Semua `IAM-*` menentukan identitas dan akses seluruh `FIN-*`, `WA-*`, `AI-*`.
- `FIN-*` menjadi sumber fakta untuk dashboard `UX-*` dan balasan `WA-*`.
- `AI-*` hanya boleh **mengusulkan** data finansial; aturan pembuatan/correction tetap mengikuti `FIN-*`.
- `TRUST-*` membatasi seluruh modul, termasuk wewenang `OPS-*`.
- Seluruh fitur dinyatakan selesai secara produk hanya ketika memenuhi `QUAL-*`.
- Status riset, asumsi dan risiko eksternal merujuk [PRD-10](./PRD-10-RESEARCH-DECISIONS.md).

---
**Batas paket:** tidak termasuk source code, diagram arsitektur teknis final, API contract detail, SQL schema, pemecahan sprint, checklist tugas coding, dan AGENTS.md. Itu sengaja disediakan untuk dokumen berikutnya sesuai urutan permintaan.
