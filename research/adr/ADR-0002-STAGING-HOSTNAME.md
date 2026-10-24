# ADR-0002 — Hostname staging

Status: **APPROVED — staging only**, 24 Oktober 2026.

## Context

DEC-002/AGENTS membatasi baseline produksi pada finance.venlab.tech, gowa.venlab.tech dan 9r.venlab.tech. Tabel staging TRD-05 memuat staging-finance.venlab.tech. Pemilik secara eksplisit memilih hostname itu untuk lingkungan staging saja pada 24 Oktober 2026.

## Options

1. Gunakan pengujian lokal dengan Worker emulator dan fixture terisolasi sambil menunggu keputusan lingkungan staging eksternal.
2. Evaluasi URL preview penyedia yang dilindungi, dengan auth origin/cookie, R2 dan DB terisolasi; URL tambahan tetap harus disetujui sesuai batas domain.
3. Setujui hostname staging tambahan melalui ADR eksplisit, termasuk Access, trusted origins, pemisahan binding dan prosedur penghapusan.

## Decision

Pilih opsi 3: setujui `staging-finance.venlab.tech` sebagai hostname keempat untuk Worker staging VenFinance. Hostname produksi tetap tiga baseline. Worker, Neon branch, kredensial, dan pengujian harus dipisahkan dari produksi. Terapkan Cloudflare Access dengan kebijakan deny-by-default sebelum mengaktifkan route publik; hanya operator/tester yang diizinkan dapat masuk setelah identitas MFA mereka diverifikasi. Tambahkan hostname sebagai trusted origin hanya pada Neon staging branch `venfinance-p0-auth-20261024`. Jangan memasang binding R2 sampai adapter bukti memiliki pemeriksaan kepemilikan dan isolasi staging yang teruji; bucket `sap` dilarang dan `ven` tidak boleh menerima data staging secara sembarang.

Cloudflare Access app staging telah dibuat sebagai deny-by-default tanpa kebijakan Allow. IdP yang terhubung saat ini hanya One-time PIN; ini tidak dianggap bukti MFA. Sebelum menerbitkan kebijakan Allow, sediakan IdP yang menegakkan MFA dan allowlist email operator/tester. Tidak ada DNS atau Worker staging yang diterbitkan saat status tersebut belum terpenuhi.

## Safety / scope tradeoff

Tidak berbagi secret/data produksi ke preview. Jangan memakai bucket `sap`, jangan mengubah ingress layanan lain, dan jangan mengubah konfigurasi/database produksi. Hostname staging tidak menjadi persetujuan go-live.

## Impact

DEC-002, TRD-00/05, P0-007, P1-005/007 dan konfigurasi auth/CI.

## Tests

Lint, typecheck, 97 unit tests, build PWA/Worker, dan Wrangler staging dry-run lulus lokal. Cloudflare Access app staging ada tanpa kebijakan Allow; origin Neon staging sudah ditambahkan. DNS, Worker, live Auth/RLS, Access MFA, path-bypass, R2 ownership, dan dua-tenant Worker tests belum dijalankan.

## Owner approval / timestamp

Pemilik produk: **DISETUJUI untuk staging saja** melalui pilihan eksplisit “staging-finance.venlab.tech (Recommended)” pada 24 Oktober 2026. Timestamp pencatatan keputusan: 2026-10-24 12:03 UTC. Access app deny-by-default dibuat 12:05 UTC; trusted origin hanya ditambahkan di branch Neon staging. Produksi tidak disetujui berubah.

## Rollback

Tutup Access dan hapus route/DNS Worker staging `venfinance-staging`, lalu hapus trusted origin hanya dari branch staging bila sudah tidak diperlukan. Kembali ke pengujian lokal tanpa menyentuh DNS, Worker, Auth, atau database produksi.
