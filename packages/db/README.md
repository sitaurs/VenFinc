# Database

Skema aplikasi disimpan sebagai Drizzle di `src/schema.ts`; migrasi PostgreSQL berada di `migrations/`. Drizzle ORM dipatok ke 0.45.4 dan Drizzle Kit ke 0.31.11. `pnpm --filter @venfinance/db generate` hanya menghasilkan berkas migrasi dari skema lokal; jangan arahkan `DATABASE_URL` ke production dari laptop atau CI umum. Migrasi RLS dan fungsi ledger dibuat sebagai migrasi kustom Drizzle supaya tetap masuk ke journal yang dibaca migrator.

RLS dan fungsi posting di migrasi harus diuji di cluster lokal disposable dan branch staging VenFinance. `pnpm db:test:local` hanya menjalankan cluster PostgreSQL sementara di mesin pengembang; klaim JWT lokal pada harness disetel langsung dan tidak membuktikan verifikasi Neon Data API. Koneksi Data API staging tidak dipakai oleh browser; Worker hanya menerima cookie Neon Auth, memeriksa sesi aktif, lalu meneruskan JWT terverifikasi dari server ke Data API. P0-005/P0-008/P1-007 tetap blocked sampai tes RLS melalui Worker, owner-checked R2, kuota, dan jalur migrasi/rollback lulus.

Migration `0004_platform-role-default-deny.sql` mempersempit akses role: user hanya dapat membaca role sendiri, default `user` dibuat oleh trigger, dan policy menolak assignment elevated. Bootstrap role privileged tetap menunggu P2-005. Bukti staging migration ini memakai fixture sintetis dalam savepoint yang di-rollback; lihat [`staging-role-policy-probe-2026-10-24.json`](../../qa/staging-role-policy-probe-2026-10-24.json). Bukti tersebut menguji policy PostgreSQL, bukan JWT atau Worker.

Lihat [rencana staging](../../infra/NEON-STAGING-PLAN.md), [model data TRD-01](../../architecture/TRD-01-DATA-MODEL.md), dan [probe PostgreSQL lokal](../../qa/database/README.md). Production tidak disentuh.
