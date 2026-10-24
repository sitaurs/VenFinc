# Neon — scope terverifikasi dan langkah PoC

Sumber: metadata API dan URL proyek yang dikirim pemilik pada 24 Oktober 2026. [Readiness teredaksi](../qa/neon-readiness-2026-10-24.json) dan [scope](neon-scope.json) tidak menyimpan email, avatar, connection string atau token.

| Resource | Nilai terverifikasi |
| --- | --- |
| Organisasi | VenFinance / `org-snowy-scene-55200104` |
| Proyek | `hidden-unit-95812377`, AWS `aws-us-east-2`, PostgreSQL 18 |
| Branch induk | `production` / `br-rapid-band-b4jw3tlq`, default, tidak protected |
| Branch uji baru | `venfinance-p0-auth-20261024` / `br-aged-mode-b4rcy9i0`, child, bukan default |
| Compute branch uji | Tidak dibuat (`no_compute: true`) |
| Auth / migrasi aplikasi | Belum diprovisikan / belum diterapkan |
| R2 | Hanya `ven`; metadata GET 200, r2.dev disabled; `sap` tidak diakses |

Metadata proyek melaporkan subscription `free_v3`, branch limit 10, logical size limit 1.073.741.824 byte dan history retention 21.600 detik. Ini snapshot API, bukan jaminan biaya atau bukti backup produksi. Default compute settings proyek bukan hasil inspeksi endpoint efektif. Tidak mengubah paket, billing, proteksi branch, DNS, domain atau konfigurasi produksi.

Branch uji dibuat melalui `create_branch` dengan project/parent eksplisit dan `no_compute: true`, lalu dikonfirmasi kembali melalui `describe_branch`. Auto-expiry belum dikonfigurasi karena parameter itu tidak tersedia pada alat tersebut. Branch ini bukan deployment dan belum menjalankan SQL. Tidak membaca row pengguna; struktur induk belum menunjukkan tabel aplikasi atau `neon_auth`. Probe SQL lokal di `qa/database/` tidak diterapkan ke Neon.

## Jalur akses berikutnya

MCP saat pemeriksaan hanya mengekspos alat Neon sampai `describe_project`. Alat koneksi, eksekusi SQL dan konfigurasi Auth belum tersedia. Jangan menggantinya dengan kredensial produksi, memasukkan Branch ID sebagai Project ID, membuat proyek kedua atau memanggil tool yang tidak tersedia.

Jalur aktif tetap **MCP**, sesuai preferensi pemilik. CLI resmi `neon@8.11.1` sempat diperiksa sebagai alternatif; hanya versi dan keberadaan profil diperiksa, tanpa login atau provisioning melalui CLI. Pemilik tidak perlu login CLI. Wrapper percobaan sudah dihapus dan tidak menjadi dependensi proyek.

Pengambilan koneksi, eksekusi SQL dan pengaturan Auth memerlukan alat MCP yang sesuai. Pemeriksaan `describe_project` dan `describe_branch` sudah sukses; koneksi ulang tidak diperlukan untuk memperbaiki scope proyek yang kini terverifikasi. Jangan mengirim password, API key, kode OAuth atau connection string ke chat. Tidak ada permintaan login CLI yang masih diperlukan.

## Urutan setelah kemampuan akses tersedia

1. Verifikasi project dan branch uji terhadap scope di atas. Ambil metadata compute/Auth; jangan menggunakan branch default sebagai pengganti staging.
2. Pastikan quota aktual/scale-to-zero sebelum membuat compute kecil untuk PoC. Tidak menaikkan plan atau menerima biaya.
3. Aktifkan Managed Auth hanya pada branch uji. Verifikasi subject, JWKS, session revocation, email dan dukungan driver/RLS menggunakan dua akun sintetis yang diizinkan. Operator tetap memerlukan MFA/step-up sesuai ADR-0001.
4. Rancang migration Drizzle/rollback terisolasi setelah dependensi P0-008/P0-005 terbukti. Jangan menerapkan SQL probe dengan identitas `session_user` fixture sebagai adapter Neon.
5. Uji request lewat workerd/Hono dengan driver HTTP aktual: dua tenant, JWT salah/expired/revoked, FK owner, concurrency/idempotency dan error tanpa secret. Jangan membuka API privat sebelum bukti lulus.
6. Tarik secret hanya ke store terlindungi bila diperlukan, tidak ke frontend/log/markdown. File `.neon` diabaikan Git; env yang ada tidak boleh ditimpa tanpa persetujuan sesuai skill branching. Jangan membagikan connection string di chat.
7. Catat hasil sebenarnya. P0-005/P0-008/P1-007 tetap blocked sampai minimum verifikasi masing-masing lulus. Penghapusan branch memerlukan persetujuan sesuai notice destructive tool; tidak dijalankan otomatis.

Produksi tetap memerlukan backup/restore aktual, seluruh acceptance matrix dan persetujuan go-live. Belum ada migrasi atau deployment produksi yang disetujui.
