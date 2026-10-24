# VenFinance — fondasi lokal, 24 Oktober 2026

Produk tetap menargetkan seluruh PRD. Deliverable saat ini ialah monorepo, API dasar yang menolak akses privat, kontrak dan logika murni, harness pengujian, serta persiapan UI publik/demo. Ini belum aplikasi keuangan produksi.

## Kode dan perilaku

- `apps/web`: landing, FAQ, status aktual proses lokal, gerbang akun tertutup, dan 11 tampilan demo. Tema terang/gelap dan ID/EN memakai token sumber. Form contoh mendukung validasi, pratinjau, draf, konfirmasi, feedback, Escape dan pemulihan fokus.
- `apps/edge`: satu Hono Worker, `/api/v1/health`, `/api/v1/config/public`, correlation ID, error generik, `no-store`, pemeriksaan Origin. Semua endpoint privat menolak akses; cookie/header role buatan browser tidak memberi izin.
- `packages/contracts` dan `packages/domain`: nominal string/BIGINT, batas PostgreSQL, kalender 28–31 hari, format lokal, heartbeat bertipe dan penolakan data stale/future. Total contoh direkonsiliasi; transfer, kandidat Rp18.000 dan draf tidak menjadi pengeluaran final. Overflow ditolak sebelum perubahan state; replay berbeda payload ditolak.
- `packages/ui`, `infra/wrangler.jsonc`, konfigurasi kualitas, dan `tools/`: komponen dasar, aset berlisensi, Worker assets, PWA shell, pengujian dan inventaris sumber. R2 hanya `ven`, emulasi lokal; `sap` tidak diakses.
- Folder DB dan ARM Worker masih menyatakan dependensi yang terblokir. Tidak ada migrasi, auth palsu, pengiriman WhatsApp, kredensial frontend, atau deployment produksi.

Data contoh hanya berada dalam modul `/demo` yang dimuat terpisah. Perubahan keuangan tidak dikirim ke API atau disimpan sebagai data pengguna; reload mengembalikan skenario awal. Preferensi bahasa/tema saja disimpan lokal. Offline yang diuji adalah tab demo yang sudah terbuka, bukan sinkronisasi/IndexedDB akun produksi.

## Bukti yang dapat diulang

Hasil terakhir: **56 tes unit/kontrak/keamanan**, **8 tes browser fungsional**, dan **9 ukuran capture layout** lulus. Tes keamanan merupakan subset tes unit, bukan tambahan 9 tes di luar 56. [Laporan terstruktur](P1-EXECUTION-REPORT.json) mencatat snapshot sumber, hasil dan batas scope.

- [Instalasi frozen dari clone snapshot bersih](frozen-install-evidence.json): Node 24.22.1, pnpm 11.25.0, exit 0, lockfile tidak berubah. Tidak membuat commit pada repo pengguna.
- [Kualitas dan build terakhir](final-quality-evidence.json), [hasil unit](unit-test-evidence.json), [browser fungsional](browser-functional-evidence.json), [layout](browser-layout-evidence.json), [preview hasil build](built-preview-evidence.json), [batas API dan smoke](final-boundary-evidence.json).
- [Negative gates](negative-gate-evidence.json): perintah test dan lint benar-benar exit 1 pada fixture rusak sengaja; fixture dihapus setelah pemeriksaan. [Fake adapters](adapter-fixture-evidence.json) tidak membuktikan RLS Neon atau kesetaraan protokol provider live.
- [Audit dependency produksi](dependency-audit.json): registry melaporkan nol advisory untuk graph produksi pada saat pemeriksaan; ini bukan sertifikasi keamanan.
- [Inventaris sumber](visual-source-evidence.json): 180 SHA screenshot, 59 aset, 90 pasangan mobile/web dan lisensi OFL font cocok. [Audit struktur](consistency-report.json) memeriksa 177 requirement, 14 keputusan dan 373 task.

Perintah pokok: `./tools/pnpm.sh lint`, `typecheck`, `test`, `build`, `test:contracts`, `test:security`, `test:e2e`, `test:visual`, `docs:check`, `infra:smoke`. Perintah smoke memerlukan dev lokal. `test:integration` dan `db:check` secara jujur exit 2/BLOCKED; tidak ada pengujian live yang dianggap lulus karena koneksi belum tersedia.

CI tersedia di `.github/workflows/quality.yml`, tanpa secret provider dan tanpa deployment. Eksekusi GitHub belum diuji karena remote/workflow hosted belum tersedia. Status atomik: [execution-status.json](../tasks/execution-status.json).

## Batas visual dan keamanan

Capture layout memeriksa 320/360/361/390/768/1024/1211/1440/1920, overflow, navigasi, font, serta pengaturan dark/EN. Ini bukan perbandingan pixel atau persetujuan seluruh 90 layar. Deviasi yang disengaja: ukuran sentuh 44px, konten bergulir, kontrol tema/bahasa, tombol pencatatan di banner agar tidak menutupi transaksi, status integrasi jujur, dan CTA akun yang belum dibuka. Semua angka contoh berasal dari model, bukan teks raster komponen.

Skill [12ui-design SKILL.md](/home/zamn/.codex/plugins/cache/openai-curated-remote/12ui-design/0.2.65/skills/12ui-design/SKILL.md) mewajibkan: “For every non-trivial completed design implementation, close against the original approved design after the requested functionality and content are in place.” CLI hanya dicoba dengan dry-run target asli; proses koneksi sign-in tidak dapat dihubungi. Konversi/alignment berbayar tidak dijalankan. Kit alignment belum selesai dan G-VISUAL tetap terbuka; persiapan UI tidak dinyatakan selesai sebagai P4.

PWA manifest menyatakan dimensi raster asli 316×315. Ikon instalasi persegi, update prompt, persistence offline akun, keseluruhan state, audit WCAG dan UAT masih perlu diselesaikan. Cache hanya diuji untuk aset publik; tidak ada respons privat di cache. Penolakan semua sesi belum menjadi bukti isolasi dua tenant terautentikasi atau RLS nyata.

Bukti fondasi berkontribusi pada AC-FIN-010-A/B, AC-QUAL-003-A/B, AC-QUAL-013-A/B, AC-TRUST-002-A/B, AC-TRUST-004-A/B, AC-TRUST-018-A/B dan AC-UX-002/004-A/B dalam scope lokal/mock. AC produksi tetap memerlukan integrasi dan seluruh pengujian terkait; tidak ditandai lulus melalui dokumen ini.

## Dependensi berikutnya

Neon: pemilik sudah memberikan URL proyek dan scope kini **terverifikasi melalui MCP**: `hidden-unit-95812377`, organisasi VenFinance, PostgreSQL 18. Branch pemilik `br-rapid-band-b4jw3tlq` bernama `production` dan default. Branch uji `venfinance-p0-auth-20261024` / `br-aged-mode-b4rcy9i0` sudah dibuat tanpa compute dan dikonfirmasi melalui pembacaan metadata terpisah. Belum ada Auth atau migrasi diterapkan. Lihat [readiness Neon](neon-readiness-2026-10-24.json) dan [rencana staging](../infra/NEON-STAGING-PLAN.md). Alat koneksi, SQL dan pengaturan Auth belum terekspos dalam sesi MCP; jalur aktif tetap MCP dan tidak memerlukan login CLI.

Arah MFA dipilih sesuai delegasi pemilik: Neon Managed Auth untuk pengguna, evaluasi Access + IdP dengan MFA untuk operator, pengikatan identitas terpercaya dan step-up. [ADR-0001](../research/adr/ADR-0001-OPERATOR-MFA.md) belum menjadi bukti MFA produksi. Hostname staging tambahan tidak didaftarkan.

Auth/email/RLS aktual, backup/restore, ARM/GOWA/9router, Vision, biaya/retensi, kebijakan publik dan seluruh visual/UAT masih terblokir. Tidak ada gate produksi yang diluluskan. Rollback saat ini hanya perubahan kode lokal; rencana pemulihan data produksi belum diuji dan tidak ada data produksi yang diubah.

## Lanjutan: probe database lokal

[Harness PostgreSQL](database/README.md) kini menyediakan persiapan P0-005 yang dapat dijalankan tanpa Neon/Docker. [Sebanyak 22 kasus lulus](local-postgres-evidence.json) pada cluster PostgreSQL 18.6 sementara, termasuk FORCE RLS dua login fixture, penolakan akses anonim/role palsu, FK antar-tenant, rollback transaksi, BIGINT eksak, 100 retry bersamaan, konflik payload dan dump/restore sintetis. Cluster sudah dihentikan dan dihapus. Tidak ada koneksi cloud atau migrasi produksi.

Ini tambahan terpisah dari snapshot laporan P1 sebelumnya; kode web/edge dan hasil 56/8/9 tidak berubah. Identitas fixture PostgreSQL tidak membuktikan Neon JWT, email atau sesi Worker. P0-005/P1-007 tetap blocked dan belum ada task P3 yang diluluskan. Skrip root integrasi live tetap exit 2. SQL ini belum merupakan command bisnis keuangan penuh atau migrasi Drizzle.
