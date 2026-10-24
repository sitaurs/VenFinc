# Audit Konsistensi Antardokumen — VenFinance Production Handoff v1.0.1

**Audit tanggal:** 24 Oktober 2026  
**Status:** koreksi dokumen selesai dan pemeriksaan struktural otomatis dapat dijalankan ulang. **Belum ada pengujian aplikasi nyata, deployment, akun penyedia, perangkat Armbian, atau kesiapan legal yang dinyatakan lolos.**

## Ruang lingkup

Menginspeksi silang [`../docs/prd/PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md), [`../requirements/REQ-00-INDEX.md`](../requirements/REQ-00-INDEX.md), seluruh TRD, design specs, PLAN, 373 tasks, AGENTS, QA matrix, riset/keputusan, serta manifest gambar dari 4 ZIP pengguna. Pemeriksaan visual pada contact sheets mendukung pemetaan, **bukan** tes pixel-perfect 180 screen yang sudah diimplementasikan (aplikasi belum dibangun).

### Koreksi substansial yang sudah diterapkan

| ID | Temuan sebelum audit | Normalisasi/keputusan setelah audit | Area pembuktian |
|---|---|---|---|
| C-01 | Tautan `#fin-001`, `#iam-001`, dll. tidak cocok dengan slug heading | Tambahkan stable HTML anchors pada setiap 177 requirement; validator mengecek path dan anchor | REQ, Tasks, QA |
| C-02 | Lima task review P4 bergantung ke task fase P5 | Pisahkan **screenshot/UI fixture P4** dari **integrasi data nyata P5/P8/P10**; hapus dependensi fase maju | PLAN, TASKS-P4, TASKS-INDEX |
| C-03 | Varian status pending/draft dipakai sebagai seolah posted | Tetapkan status berlapis `LOCAL_DRAFT` / `SYNCING` / `SERVER_DRAFT` / `CANDIDATE_PROVISIONAL` / `NEEDS_REVIEW` / `POSTED` / `VOIDED`; AI kandidat tidak mengubah ledger | PRD-03, REQ-02, TRD-01/03, Design-02, AGENTS |
| C-04 | Pembayaran pokok utang/piutang mungkin disalahartikan belanja/pemasukan konsumsi | Tetapkan opening events berimbang; pembayaran pokok mengurangi kas dan liability/receivable serta bisa mengurangi envelope Cicilan, tetapi bukan konsumsi | PRD-03, REQ-02/09, TRD-01/02, QA |
| C-05 | Empat hostname tersirat pada beberapa TRD (`bridge.*`) padahal pengguna menetapkan tiga | Hanya `finance.venlab.tech`, `gowa.venlab.tech`, `9r.venlab.tech`; jalur internal **gowa `/internal/v1/*`** diarahkan ke Finance Worker dengan policy Access terpisah. P0-007 mencakup negative bypass dan normalisasi path sebelum produksi | TRD-00/02/03/05, AGENTS, Tasks P0/P6, DEC-002 |
| C-06 | Retry command finansial belum memaksa perbandingan payload pada key yang sama | Kontrak `command_idempotency` di transaksi DB atomik + hash payload; replay berbeda menghasilkan HTTP 409 | TRD-01/02, REQ-09 |
| C-07 | Hash JID saja tidak dapat dipakai mengirim WhatsApp keluar | Tambahkan recipient JID terenkripsi untuk outbound + keyed HMAC untuk inbound; least-privilege Finance Worker | TRD-01/03/04 |
| C-08 | Bukti gambar dapat diunggah melalui mekanisme yang tidak disepakati | Tetapkan streaming lewat authenticated Worker R2 binding, bucket privat; tidak ada R2 key di browser | TRD-02/04 |
| C-09 | Deskripsi void/reversal berisiko pengurangan saldo dua kali | Original postings tetap dalam histori, reversal menetralkan, restore menghasilkan kompensasi baru idempotent | TRD-01, REQ-09, TRD-06 |
| C-10 | Keputusan `191 ID` bisa terbaca sebagai 191 functional requirements | Tulis eksplisit **177 requirement + 14 decision IDs**, dan NFR `QUAL` punya measurable AC, bukan dipaksa jadi cerita persona | REQ-00, QA matrix |
| C-11 | Pernyataan tidak menyimpan history WhatsApp bisa terdengar sebagai jaminan atas GOWA lokal | Batasi klaim pada lapisan aplikasi VenFinance; retensi/cakupan GOWA host memerlukan audit aktual | PRD-05, TRD-03/04 |
| C-12 | Artefak markdown belum punya pemeriksaan konsistensi yang bisa diulang agent | Tambahkan CLI `tools/validate_handoff.py`, laporan JSON, serta path/ID/dependensi/hash verification | tools, qa, README |

## Cakupan yang diverifikasi otomatis

- **177** persyaratan PRD memiliki ID/heading REQ yang sama, dua AC per ID, link anchor stabil, dan mapping QA. Untuk 24 quality/NFR ID, yang diwajibkan adalah measurable AC, bukan user story berpersona.
- **14** decisions (`DEC-*`) tercatat terpisah; 177 + 14 = 191 item terlacak, bukan 191 requirements.
- **373** tasks, seluruh dependency terdefinisi, tidak ada referensi task hilang, self-dependency, cycle, atau dependensi fase lebih akhir; seluruh 177 requirement dan 90 screen memiliki task teridentifikasi.
- **90** screen ID berpasangan mobile+web; referensi gambar **180 PNG** dan aset **59** diverifikasi terhadap SHA-256 asli pada Full edition. Lite edition hanya punya panduan/manifest/previews sehingga uji gambar penuh harus diulang setelah menggabungkan aset asli.
- Semua internal Markdown relative links dan anchor dicek, termasuk yang merujuk dokumen PRD/Requirements/TRD/Design/Tasks/QA.

### Jalankan ulang dari root hasil ekstrak

```sh
python tools/validate_handoff.py --json qa/consistency-report.json
```

Untuk **Specs Lite** (tanpa direktori screenshot HD), gunakan:

```sh
python tools/validate_handoff.py --allow-lite --json qa/consistency-report.json
```

Report JSON hasil pemeriksaan terakhir berada pada [`consistency-report.json`](./consistency-report.json). Pemeriksa memvalidasi konsistensi struktural/identitas referensi, **bukan** memeriksa jaringan eksternal, kebijakan WhatsApp, output nyata AI, bug aplikasi, atau kualitas legal.

## Gate yang tetap terbuka; jangan klaim production-ready

1. **G-IDENTITY / G-EMAIL / G-RLS:** Neon Managed Auth versi aktual, SMTP/email verification+reset, MFA operator, RLS yang benar-benar memblokir tenant silang diuji sebelum signup publik.
2. **G-INFRA:** Cloudflare Tunnel path rule dan **Access policy terpisah** untuk GOWA API vs Finance Worker internal harus lulus path bypass test; jika gagal, jangan ekspos endpoint atau membuat hostname keempat tanpa ADR dari owner.
3. **G-GOWA-API / G-WHATSAPP-POLICY:** GOWA multi-device/live session/webhook, isu WhatsApp unofficial, consent, data residency, privasi sesi dan stabilitas di Armbian harus diuji; personal session publik off secara default.
4. **G-9ROUTER-VISION:** 9router terbukti meneruskan image bytes pada OpenAI-compatible/Anthropic-compatible adapter; jika tidak, OCR/manual yang diberi status sesuai, tidak posting diam-diam.
5. **G-COST:** pantau kuota Cloudflare Workers Free, Neon, R2 billing, biaya email dan provider AI; target `$0` adalah sasaran, bukan garansi.
6. **G-PRIVACY / G-RECOVERY / G-VISUAL:** hak data, retensi dan kebijakan Indonesia, backup restore, serta visual QA terhadap screenshot mobile/web harus benar-benar lulus.

**Kesimpulan audit:** tidak ditemukan masalah struktural tersisa pada cakupan yang diuji otomatis **apabila** `tools/validate_handoff.py` melaporkan `PASS`. Ini hanya menyatakan konsistensi spesifikasi, tidak berarti sistem dibangun atau semua asumsi produksi telah terbukti.
