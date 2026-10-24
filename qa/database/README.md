# Probe PostgreSQL lokal

Persiapan P0-005 berupa SQL dan harness terisolasi, sesuai izin mock/staging pada AGENTS §8. Dependensi P0-001 sudah selesai; P0-005 tetap **blocked** karena Neon Managed Auth, revocation dan propagasi identitas melalui Worker belum diuji. Ini bukan migrasi Drizzle atau implementasi P3.

`ledger-probe.sql` membuat empat tabel dengan RLS paksa, foreign key komposit pemilik, constraint saldo event, dan fungsi posting dengan idempotensi atomik. Role fixture `poc_a`/`poc_b` hanya mempunyai SELECT dan EXECUTE pada fungsi yang diizinkan. Pemilik fungsi tidak memiliki LOGIN, SUPERUSER atau BYPASSRLS. Identitas memakai `session_user` PostgreSQL fixture; **jangan menyalin adapter identitas ini ke Neon**. Kontrak produksi harus memakai subject Neon terverifikasi dan diuji ulang melalui Worker.

Jalankan dengan executable PostgreSQL resmi yang sudah tersedia:

```sh
PG_BIN=/usr/lib/postgresql/18/bin python3 tools/verify-local-postgres.py
```

`PG_SHARE` dapat menunjuk direktori share PostgreSQL 18 bila paket diekstrak ke lokasi khusus. Harness tidak menerima DSN/host jarak jauh, mengabaikan konfigurasi koneksi PG yang diwarisi, dan membuat cluster baru pada direktori sementara berizin 0700. PostgreSQL tidak mendengarkan TCP; socket lokal hanya dapat diakses akun OS ini. Login trust terbatas pada cluster fixture tersebut. Proses dihentikan dan direktori dihapus setelah tes. Tidak membutuhkan Docker, sudo, kredensial cloud, ataupun perubahan service OS.

Pemeriksaan aktual memakai PostgreSQL **18.6 Ubuntu 18.6-0ubuntu0.26.04.1**, diunduh dari repositori Ubuntu resmi dan diekstrak ke cache pengguna. Versi Neon belum diketahui. [Bukti terakhir](../local-postgres-evidence.json): **22 kasus lulus**, mencakup dua tenant, akses anonim/role palsu ditolak, FORCE RLS berlaku pada owner tabel, rollback kegagalan, batas BIGINT, nilai JSON number ditolak, 100 retry bersamaan menghasilkan satu event, konflik payload ditolak, dan restore dump sintetis mempertahankan saldo serta isolasi. Nominal Rp9.007.199.254.740.993 diuji sebagai string eksak.

Fungsi hanya probe posting seimbang generik. Ia belum menegakkan seluruh semantik jenis transaksi, saldo negatif dengan konfirmasi, periode/kategori, utang penuh, refund terkait asal, void/restore, draft, audit keamanan dan lifecycle akun. Hasil tes transfer/pokok menunjukkan posting fixture tidak menyentuh akun konsumsi; ini belum membuktikan command bisnis produksi. Restore dump lokal tidak membuktikan backup produksi terenkripsi atau memenuhi G-RECOVERY. `test:integration` dan `db:check` tetap blocked.

Rujukan: [TRD-01](../../architecture/TRD-01-DATA-MODEL.md), [TRD-04](../../architecture/TRD-04-SECURITY.md), [skenario kritis](../../requirements/REQ-09-SCENARIOS.md), PostgreSQL [row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html) dan [CREATE FUNCTION/security definer](https://www.postgresql.org/docs/18/sql-createfunction.html). Persiapan berkontribusi pada AC-FIN-002/004/010 dan AC-TRUST-002/004 dalam scope lokal, tanpa meluluskan acceptance produksi.
