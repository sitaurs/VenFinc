# VenFinance

**Implementasi lokal mulai tersedia, 24 Oktober 2026.** Monorepo React/Vite + Hono Worker, kontrak Zod, perhitungan rupiah eksak, UI publik dan demo terisolasi sudah dibuat. Autentikasi, database, ledger produksi, R2 privat, GOWA/AI, dan release gates belum terintegrasi atau dinyatakan lulus. Cakupan produk tetap seluruh PRD.

## Menjalankan kode lokal

Gunakan Node **24.22.1**, Corepack, dan pnpm **11.25.0** yang dipin di package.json. Pada mesin ini, `tools/pnpm.sh` memakai runtime Node 24 di `.tools/node` bila tersedia; checkout baru tetap perlu memasang Node 24 terlebih dahulu.

```sh
corepack enable
./tools/pnpm.sh install --frozen-lockfile
./tools/pnpm.sh dev
```

Buka `http://127.0.0.1:5173/` atau `/demo`. API lokal `/api/v1/health` dijalankan oleh workerd. Semua jalur API privat menolak akses sampai adapter identitas dan RLS benar-benar terverifikasi. Data demo hanya di memori tab, direset saat reload, tidak dikirim ke API, dan tidak dipakai oleh jalur akun asli.

```sh
./tools/pnpm.sh lint
./tools/pnpm.sh typecheck
./tools/pnpm.sh test
./tools/pnpm.sh build
./tools/pnpm.sh test:security
./tools/pnpm.sh exec playwright install chromium
./tools/pnpm.sh test:e2e
./tools/pnpm.sh test:visual
./tools/pnpm.sh infra:smoke
./tools/pnpm.sh docs:check
```

`infra:smoke` memerlukan server dev lokal. `test:visual` memotret layout dan memeriksa overflow; ini **bukan persetujuan kesesuaian seluruh 180 referensi**. `test:integration` dan `db:check` mengembalikan **BLOCKED (exit 2)** karena integrasi live/disposable belum tersedia. CI tidak menerima secret provider. Konfigurasi Wrangler saat ini untuk lokal; jangan deploy langsung atau menjalankan migrasi ke produksi.

Bukti instalasi bersih: [frozen-install-evidence.json](qa/frozen-install-evidence.json). Integritas gambar dan lisensi font: [visual-source-evidence.json](qa/visual-source-evidence.json). Status atomik seluruh backlog: [execution-status.json](tasks/execution-status.json). Referensi dokumentasi historis tetap bekerja melalui symlink `VenFinance_Production_Handoff/`.

Persiapan database memiliki [probe PostgreSQL lokal](qa/database/README.md) yang membuat cluster sementara tanpa koneksi cloud. Sebanyak 22 kasus, termasuk 100 retry bersamaan dan isolasi dua tenant, sudah lulus. Ini tidak menggantikan Neon Auth/RLS melalui Worker atau migrasi produksi.

[Scope Neon terverifikasi dan branch uji terpisah](infra/NEON-STAGING-PLAN.md) kini tersedia melalui MCP. Branch uji belum mempunyai compute, Auth atau migrasi aplikasi; implementasi produksi tetap terblokir oleh verifikasi terkait.

## Baseline handoff spesifikasi

Handoff implementasi lokal dan batas pengujian: [qa/P1-LOCAL-HANDOFF.md](qa/P1-LOCAL-HANDOFF.md).

**Versi:** 1.0.1 (audit konsistensi) · **Tanggal baseline:** 23 Oktober 2026 · **Audit:** 24 Oktober 2026 · **Bahasa:** Indonesia  
**Produk:** VenFinance — PWA keuangan pribadi multiuser; produk public-facing dengan role `user`, `admin`, `superuser`.  
**Status baseline saat handoff:** specification complete. Bagian ini menjelaskan paket spesifikasi asal; status implementasi terkini ada di atas dan tracker. Belum deployed, security-certified, legally approved, atau publicly launch-ready.

## Mulai dari sini

1. **Baca [`AGENTS.md`](./AGENTS.md)** sebelum menulis/mengubah kode.
2. **Baca [`docs/prd/PRD-00-INDEX.md`](./docs/prd/PRD-00-INDEX.md)** untuk kesepakatan produk yang tidak boleh ditawar.
3. **Baca [`requirements/REQ-00-INDEX.md`](./requirements/REQ-00-INDEX.md)** untuk user stories, acceptance criteria, invariants, dan traceability PRD.
4. **Baca [`architecture/TRD-00-OVERVIEW.md`](./architecture/TRD-00-OVERVIEW.md)** lalu seluruh TRD untuk stack, batas trust, skema data, API, integrasi, operasional.
5. **Baca [`design/DESIGN-00-FOUNDATIONS.md`](./design/DESIGN-00-FOUNDATIONS.md)** dan referensi gambar; jangan mengganti desain dengan template generik.
6. **Baca [`plan/PLAN.md`](./plan/PLAN.md)**, lalu **[`tasks/TASKS-INDEX.md`](./tasks/TASKS-INDEX.md)**. Kerjakan hanya task terpilih beserta dependensinya; jangan menebak requirement.

## Struktur paket

```text
AGENTS.md                              Aturan/konstitusi agent persisten
requirements/REQ-00..REQ-10*.md       177 PRD requirements + 14 keputusan ditelusuri
architecture/TRD-00..TRD-06*.md       Batas komponen, skema, API, jobs, keamanan, operasi
design/DESIGN-00..DESIGN-06*.md        Token, 90 layar, komponen, state, interaksi, audit
plan/PLAN.md                          Fase produk production (bukan menyunat cakupan)
tasks/TASKS-INDEX.md + TASKS-P*.md    Backlog atomik, dependensi, verifikasi
research/SOURCES.md, DECISION-LOG.md  Sumber primer, asumsi dan blocker
qa/ACCEPTANCE-MATRIX.md               Uji end-to-end, non-fungsional, release gates
qa/CONSISTENCY-AUDIT.md                Temuan konflik, koreksi, sisa go-live blockers
tools/validate_handoff.py              Pemeriksa tautan/ID/dependensi/aset
docs/prd/PRD-*.md                     Salinan PRD production baseline asli
reference-design/guides/*             Panduan/manifest asli dari empat ZIP desain
reference-design/previews/*           Contact sheet visual kecil untuk orientasi
reference-design/brand/*              Raster brand asli (bukan font)
```

## Sumber visual 4 ZIP — penting untuk implementasi pixel-aware

Dokumen ini mereferensikan **180 PNG layar asli, 90 pasang mobile/web, dan 59 aset** yang berasal dari empat lampiran user:

- `VenFinance_01_Mobile(1).zip`
- `VenFinance_02_Web_A(1).zip`
- `VenFinance_03_Web_B(1).zip`
- `VenFinance_04_Assets_Galeri(1).zip`

**Paket Full** berisi `reference-design/full/VenFinance_UIUX_ImageGen/` beserta gambar asli dan aset. **Paket Specs Lite** tidak memuat direktori `reference-design/full/`; saat memakai Lite, ekstrak/merge keempat ZIP tersebut dengan mempertahankan struktur `reference-design/full/VenFinance_UIUX_ImageGen/`. Panduan sumber, metadata/manifest, logo, dan contact sheet terdapat di keduanya. Lihat [`design/DESIGN-04-ASSETS-AUDIT.md`](./design/DESIGN-04-ASSETS-AUDIT.md). Jika paket **Full** atau keempat ZIP tidak disertakan kepada coding agent, ia **tidak dapat mengklaim telah memvalidasi kesesuaian visual individual 180 gambar**.

## Prinsip kontrak

- **PRD = What/why**; **Requirements = observable behaviors**, **TRD = how/where/contracts**, **Design = visual interaction**, **Plan = sequence**, **Tasks = executable units**, **AGENTS = persistent rules**.
- Identitas akun **bukan** authorization role: semua request API butuh pemeriksaan objek milik user; Admin/Superuser tak punya akses ledger privat orang lain secara default.
- Semua nilai uang **integer dalam unit terkecil**, no JS float for money; manual finance tetap berjalan tanpa WhatsApp, AI, atau Armbian.
- Saat OCR/AI berbeda, transaksi final **tidak** diubah tanpa approval user; replay webhook/queue tidak menghasilkan posting ganda.
- GOWA tidak resmi: platform publik dan multi-personal-session tetap dibatasi **launch gate** dan persetujuan pengguna. Jangan pernah menyatakan WhatsApp API resmi.
- Gratis = **target penggunaan dalam free tier**, bukan jaminan nol biaya di semua keadaan. Tenant quotas/anti-abuse & billing alerts wajib.

## Keputusan/problematika tersisa

Lihat [`research/DECISION-LOG.md`](./research/DECISION-LOG.md) dan hasil audit [`qa/CONSISTENCY-AUDIT.md`](./qa/CONSISTENCY-AUDIT.md). Semua default ditetapkan untuk menghindari agent “invent stack”, tetapi masalah layanan eksternal yang belum dapat dipastikan dinyatakan sebagai **gates** yang memblokir peluncuran publik, bukan alasan menghentikan penulisan spesifikasi.
