# VenFinance — Paket QA untuk Pengujian Teman

**Tanggal baseline:** 24 Oktober 2026  
**Repo/branch:** `sitaurs/VenFinc`, `main`  
**Acuan:** [acceptance matrix](./ACCEPTANCE-MATRIX.md), [requirements index](../requirements/REQ-00-INDEX.md), [critical scenarios](../requirements/REQ-09-SCENARIOS.md), [decision log](../research/DECISION-LOG.md), dan `tasks/execution-status.json`.

Ini rencana tes, bukan bukti kelulusan produksi. Catat `PASS`, `FAIL`, `BLOCKED`, atau `NOT RUN` per ID/AC. Mock hanya membuktikan kontrak terhadap mock; mock bukan bukti Neon/RLS, R2 authorization, email delivery, GOWA, AI, availability, atau readiness produksi.

## Batas pengujian

- Gunakan akun A/B dan data sintetis. Jangan masukkan transaksi, bukti, email, atau nomor WhatsApp sungguhan.
- Uji cloud hanya pada branch staging VenFinance yang sudah ditetapkan. Jangan menyentuh branch `production` atau resource proyek lain.
- Cloudflare R2 hanya bucket **`ven`**. Bucket `sap` milik proyek lain dan di luar scope.
- Jangan deploy, migrasi production, mengubah DNS/Tunnel/Access, mengirim WA, mendaftarkan nomor, mengubah role live, atau memicu provider berbayar. Integrasi yang belum berizin/prasyaratnya hilang tetap `BLOCKED`.
- Jangan lampirkan secret/token/cookie/JWT, isi bukti, note transaksi atau pesan WA di laporan. Redaksi screenshot/trace/log.

## Keadaan infrastruktur yang sudah dibaca

Cloudflare `venlab.tech` aktif. ADR-0002 menyetujui `staging-finance.venlab.tech` untuk staging saja. App Access staging sudah dibuat tanpa kebijakan Allow sehingga deny-by-default; One-time PIN satu-satunya IdP yang tersedia dan belum membuktikan MFA. Belum ada DNS, custom Worker domain, atau deployment staging. Tidak ada Worker produksi `venfinance`; DNS produksi tetap belum dikonfigurasi. Bucket R2 `ven` tersedia di APAC, `r2.dev` mati, CORS belum dikonfigurasi, object lock kosong; tidak ada objek yang dibaca/ditulis. Bucket `sap` tidak diakses. Rincian aman ada di [`staging-host-readiness-2026-10-24.json`](./staging-host-readiness-2026-10-24.json) dan [`cloudflare-reconnection-evidence.json`](./cloudflare-reconnection-evidence.json).

Neon staging `venfinance-p0-auth-20261024` mengaktifkan Managed Better Auth, migrasi aplikasi `0000`–`0004` terverifikasi, dan trusted origin staging sudah ditambahkan. Compute staging 0.25 CU kembali idle setelah query catalog pada 12:17 UTC; suspend timeout Neon `0` sehingga pantau/suspend manual setelah tes yang menyalakannya. Production branch belum diberi Neon Auth atau migrasi. Pembacaan catalog membuktikan 11 tabel aplikasi staging memiliki RLS dan `FORCE ROW LEVEL SECURITY`, tetapi belum membuktikan dua-tenant behavior melalui Worker. Neon Auth staging sendiri masih mengizinkan signup dan tidak mewajibkan verifikasi email; flag Worker hanya menutup signup lewat proxy, dan panggilan langsung ke provider belum diuji. Tutup signup provider-level sebelum QA staging. Belum tersedia Worker staging, inbox QA sintetis, IdP MFA, atau tes delivery OTP. Direct JWT replay ke jalur Data API POC setelah sign-out tetap merupakan gate P0, walaupun batas app Hono lokal menguji penolakan cookie revoked dan bearer lama. Bukti lengkap: [`neon-readiness-2026-10-24.json`](./neon-readiness-2026-10-24.json) dan [`staging-host-readiness-2026-10-24.json`](./staging-host-readiness-2026-10-24.json).

## Menjalankan suite lokal

Node `24.22.1`; pnpm mengikuti versi yang dipin dalam `package.json`:

```sh
corepack enable
./tools/pnpm.sh install --frozen-lockfile
./tools/pnpm.sh lint
./tools/pnpm.sh typecheck
./tools/pnpm.sh test
./tools/pnpm.sh test:contracts
./tools/pnpm.sh test:security
./tools/pnpm.sh build
./tools/pnpm.sh test:e2e
./tools/pnpm.sh test:visual
./tools/pnpm.sh db:test:local
```

Gunakan wrapper `tools/pnpm.sh` agar runtime repo-pinned Node 24 dipilih bila tersedia di `.tools/node`; direct `node` pada mesin QA bisa berbeda. Jika browser belum terpasang: `./tools/pnpm.sh exec playwright install chromium`. Tes visual memeriksa layout dan overflow, bukan pixel-diff seluruh 180 PNG desain. `./tools/pnpm.sh test:integration` dan `./tools/pnpm.sh db:check` memang melaporkan `BLOCKED` tanpa Neon/R2 staging fixtures; jangan alihkan target ke production. `./tools/pnpm.sh infra:smoke` memerlukan app lokal pada `127.0.0.1:5173`.

### Bukti otomatis terakhir yang tercatat

| Perintah/suite | Hasil terakhir | Batas |
|---|---:|---|
| `./tools/pnpm.sh lint`, `typecheck` | PASS, Node 24.22.1 / pnpm 11.25.0 | Tidak membuktikan provider cloud |
| `./tools/pnpm.sh test` | 97/97 PASS | Unit tests; provider auth route dan session management memakai mocks; tambahan replay revoked-cookie/stale-bearer ditolak pada Hono test fixture |
| `./tools/pnpm.sh test:contracts` | 21/21 PASS | Contract tests |
| `./tools/pnpm.sh test:security` | 9/9 PASS + client bundle scan | Scan heuristic, bukan audit/RLS proof |
| `./tools/pnpm.sh build` | PASS | Worker + PWA build disajikan ulang dari preview yang baru dimulai; belum deploy |
| `./tools/pnpm.sh test:e2e` | 25/25 PASS, Chromium 156.0.8078.4, local app + mocked APIs | Tidak menguji provider nyata; termasuk auth, 2 alur offline, transaksi lokal/demo dan 3 interaksi session management |
| `./tools/pnpm.sh test:visual` | 14/14 PASS pada 320–1920px | Layout/overflow dan screen auth/settings; tidak dibandingkan pixel-per-pixel dengan 180 PNG sumber |
| `./tools/pnpm.sh infra:smoke` | PASS, preview Worker/Hono loopback yang baru dibangun | Tanpa provider; unauthenticated `/api/v1/me` menghasilkan 503 karena Auth lokal tidak dikonfigurasi dan tidak mengembalikan data privat |
| Neon staging role-policy probe | PASS; `qa/staging-role-policy-probe-2026-10-24.json` | A/B sintetis, claims disetel SQL, DDL/fixture di-rollback; tidak menguji Worker/JWT nyata |
| Neon staging migration `0000`–`0004` | PASS untuk apply dan readback policy di branch `venfinance-p0-auth-20261024` | `0004` diterapkan via MCP transaction; tidak menguji fresh database, rollback, atau Worker identity live; P1-007 tetap blocked |
| `tools/verify-local-postgres.py` (P0 generic probe) | 22/22 PASS pada bukti lokal sebelumnya | Probe schema generik P0-005, bukan migration aplikasi Drizzle/P3 |
| `./tools/pnpm.sh db:test:local` | BLOCKED, exit 2 | `VENFINANCE_PG_BIN`/PostgreSQL server tools tidak tersedia saat run; `packages/db` migration contract lokal belum lulus di run ini |
| `./tools/pnpm.sh db:check`, `test:integration` | BLOCKED, exit 2 | Tidak ada disposable Neon/R2 integration fixture; production tidak disentuh |
| `./tools/pnpm.sh docs:check` | PASS; 177 REQ, 90 screen, 373 task tervalidasi | Hanya validator dokumen |

Ulangi semuanya pada commit SHA yang diuji. Cantumkan versi browser, environment dan exit code aktual.

Lint dan typecheck juga PASS pada Node 24.22.1/pnpm 11.25.0. E2E berjalan pada Chromium headless lokal. Hasil ini membuktikan perubahan lokal, bukan signoff produk atau rilis.

### Tambahan tes autentikasi untuk tester — `IAM-001/002/005`, `TRUST-011/012`

Otomatis tersedia di `qa/e2e/auth-flows.spec.ts` dan `apps/edge/src/auth.test.ts`: signup mengirim email ternormalisasi dan tidak menerima callback URL browser; halaman privat baru terbuka setelah sesi aplikasi sah; reset tidak membocorkan keberadaan email; konfirmasi kata sandi yang berbeda tidak mengirim request reset. Probe validasi di branch staging memberi 404 untuk alias SDK `email-otp/passcode` dan 400 `VALIDATION_ERROR` untuk `email-otp/reset-password`; Edge memakai path kedua dengan payload ketat. Probe tidak menggunakan akun, email, atau OTP, sehingga reset kata sandi valid masih harus diuji QA staging. Tes proxy memeriksa allowlist endpoint, Origin, bentuk payload ketat, error generik, cookie dan redaksi token.

Tambahan unit `apps/edge/src/auth.test.ts` mensimulasikan Neon Auth yang sudah sign-out: pemanggilan ulang memakai cookie revoked dan bearer JWT lama dari browser menghasilkan `401` di Hono sebelum Data API dipanggil. Ini menutup regresi pada batas aplikasi yang sekarang menukar cookie opaque dengan sesi provider aktif setiap request; tes mock tersebut **tidak** mengubah bukti P0: raw JWT yang dikirim langsung ke Neon Data API staging masih dapat direplay sampai expiry.

**Status live provider: BLOCKED untuk tester.** Auth Neon berada pada branch staging, memakai shared email provider, `verify_email_on_sign_up=false`, dan sudah mempercayai origin staging. Worker belum dideploy, Access deny-by-default tanpa Allow policy, IdP MFA dan inbox uji berizin belum tersedia; signup aplikasi tetap tertutup. Jangan jalankan skenario live ke production atau memakai email/akun pribadi. Minta pemilik menyiapkan login Wrangler melalui CLI agar upload Worker + 31 asset PWA dapat dijalankan; konfigurasi dry-run sudah lulus.

Setelah Worker staging dan inbox sintetis milik tester tersedia, jalankan urutan berikut dengan akun A/B:

1. `QA-IAM-001`: daftar akun A dengan email baru dan variasi huruf besar/spasi; pastikan hanya role `user`, verifikasi diperlukan, dan `/api/v1/me` tertutup sebelum kode sah. Coba daftar ulang email sama serta payload role/callback tambahan.
2. `QA-IAM-001-OTP`: masukkan kode salah, format salah, OTP kedaluwarsa, lalu OTP benar. Coba pakai ulang kode; ulangi kirim sebelum cooldown dan setelah provider memberi 429. Pesan gagal tidak boleh menyebut apakah alamat terdaftar.
3. `QA-IAM-002-RESET`: minta reset untuk email A dan email yang tidak terdaftar; bandingkan status dan bentuk respons. Pakai OTP A dengan email B, kode salah/kedaluwarsa, password di bawah batas dan konfirmasi berbeda; semuanya harus gagal tanpa mengubah password.
4. `QA-IAM-002-RESET-OK`: terapkan OTP benar dan password baru; login dengan password lama harus gagal, password baru berhasil. Verifikasi sesi lama setelah reset tidak membuka data privat. Catatan auth tidak boleh mengandung OTP/token.
5. `QA-IAM-005-ORIGIN`: coba Origin asing/null, body callback URL, role/user ID/key tambahan, metode/path auth yang tidak di-allowlist; tidak boleh diteruskan ke Neon. Periksa response/cookie/browser storage/log agar tak ada JWT atau bearer token.
6. `QA-TRUST-AB`: login A dan B pada dua konteks browser; A tidak boleh mengganti cookie/session atau owner request untuk membaca data B. Logout A lalu pastikan app menutup cache privat A.

Catat environment, status HTTP tanpa body sensitif, scenario/AC, `PASS/FAIL/BLOCKED`, serta screenshot/trace teredaksi. Jangan mencatat inbox nyata, OTP, cookie atau JWT. Ganti email dan sesi multi-perangkat memerlukan implementasi/proof terpisah; jangan laporkan lulus dari alur ini.

### P2-004 — Guard role admin/system di Edge

Implementasi lokal mengambil role hanya melalui RPC `current_platform_role` dengan JWT provider yang diverifikasi pada sesi; header role/browser bearer tidak dipercaya. Route `/api/v1/admin/*` mensyaratkan `admin` atau `superuser`, sedangkan `/api/v1/system/*` mensyaratkan `superuser`; kegagalan DB fail-closed. Tes lokal `role-gated operator routes` memeriksa operator anonim sebelum role lookup (401), user dengan header forged (403), admin ke admin route dan percobaan `/admin/users/:id/ledger` (404 karena belum ada handler ledger lintas user), admin ke system (403), superuser melewati guard (fallback 404), malformed role (403), serta database error (503) tanpa detail internal.

**Status live: BLOCKED.** `P2-002` dan `P2-003` masih menunggu bukti Hono Worker + JWT identity + RLS pada staging memakai dua identitas provider nyata. Tes lokal ini tidak membuktikan assignment role staging, admin ledger isolation di database nyata, operator MFA/step-up, atau audit alur bootstrap; tidak ada role privileged yang diberikan. Jalankan hanya setelah app Worker staging, akun tester sintetis, dan gate P1-007/P0-005 tersedia.

### P2-IAM-004 — Daftar perangkat dan pencabutan sesi

Implementasi lokal sudah memiliki endpoint Edge same-origin di `/api/v1/security/sessions`: daftar, cabut satu sesi berdasarkan ID aman, cabut sesi lain, dan cabut semua sesi. Browser tidak pernah mengirim atau menerima token provider. Unit/Edge suite memakai data canary dan membuktikan metadata token/IP tidak keluar, ID milik tenant lain ditolak, Origin asing ditolak, logout semua menghapus cookie, dan endpoint tetap tertutup untuk anonymous. E2E lokal menguji konfirmasi UI untuk revoke satu, revoke sesi lain, dan logout semua; visual/responsif diuji di 320, 361, 768, 1440, dan 1920 px. Ini bukti kode terhadap mock/provider response sintetis, belum bukti API Neon staging.

**Manual staging: BLOCKED sampai tester memiliki app Worker staging, akun A/B sintetis milik tester, dan tiga konteks browser.** Jangan gunakan akun/ledger pribadi atau production. Sebelum mulai, catat hostname/origin yang disetujui di ADR; jangan menambahkan hostname ke-4 diam-diam. Tes live memakai branch Neon staging VenFinance dan harus memastikan binding `NEON_AUTH_URL`, issuer/JWKS, cookie domain dan APP_ORIGIN menunjuk origin staging yang sama.

| ID / skenario | Langkah tester | Hasil yang wajib |
|---|---|---|
| `QA-IAM-004-01` — daftar sesi sendiri | Login akun A di browser 1 dan 2, lalu akun B di browser 3. Buka SET-04 di A1 dan B1. | A1 hanya melihat sesi akun A; B hanya melihat sesi B. Current device ditandai benar. Daftar menampilkan browser/perangkat dan waktu yang provider sediakan, tanpa IP, user ID, cookie, token, atau secret. |
| `QA-IAM-004-02` — cabut satu perangkat | Dari A1, cabut sesi A2 dan konfirmasi. Coba buka route privat dari A2, lalu refresh A1. | A2 tidak bisa membaca data privat setelah provider menyelesaikan revoke. A1 tetap aktif. Daftar A1 tak lagi menampilkan A2. Saldo/cache A2 tidak tampak sebagai data terverifikasi setelah sesi dicabut. |
| `QA-IAM-004-03` — ID lintas-tenant | Salin hanya session ID aman milik A dari QA sheet tester; login B, kirim ID itu ke endpoint revoke B secara langsung. Jangan menyalin token provider. | Respons generik `404`; sesi A tidak dicabut; B tidak melihat keberadaan/user A; tidak ada pemanggilan revoke provider untuk target asing. Ulangi dengan ID acak dan ID lama. |
| `QA-IAM-004-04` — keluar dari perangkat lain | Di A1, pilih “Logout dari perangkat lain” lalu konfirmasi. Uji A2 dan A1. | A2 tidak lagi masuk; A1 tetap aktif. Daftar kemudian hanya menyisakan A1. Jangan menyamakan tombol ini dengan “Logout dari semua perangkat”. |
| `QA-IAM-004-05` — keluar dari semua perangkat | Di A1, pilih “Logout dari semua perangkat” lalu konfirmasi. Uji ketiga browser dan panggil satu API privat dari masing-masing. | Semua sesi A ditolak termasuk A1; browser yang melakukan aksi diarahkan ke login dan cookie sesi HttpOnly kedaluwarsa. Tidak ada API privat yang mengembalikan data setelah revoke. |
| `QA-IAM-004-06` — replay / sesi expired | Setelah revoke dari A1, gunakan ulang cookie browser A2 yang masih tersimpan hanya di browser; coba panggil `/api/v1/session`, `/api/v1/wallets`, dan `/api/v1/transactions`, sertakan stale `Authorization: Bearer` bila harness QA menyediakan token sintetis. Ulangi memakai akun yang sudah expired. Jangan panggil Neon Data API langsung dari skenario aplikasi ini. | Tidak ada data privat (`401` untuk sesi invalid/expired; `503` hanya jika provider tak tersedia). Bearer browser diabaikan; raw Data API stale-JWT replay tetap P0 blocker yang dilacak terpisah. Jangan menyalin cookie/token ke report, curl log, chat atau screenshot. |
| `QA-IAM-004-07` — CSRF dan payload | Coba POST revoke dari Origin asing/null, body tanpa `sessionId`, ID terlalu panjang, object dengan `token`, `userId` atau field tambahan, JSON oversized, dan method/path yang tidak dikenal. | Ditolak sebelum revoke provider; tidak mengubah sesi; tidak membocorkan detail provider. |
| `QA-IAM-004-08` — provider down / rotasi cookie | Saat QA menyetujui simulasi outage, matikan jalur provider atau gunakan fault injection staging; ulangi daftar/revoke. Lalu uji saat get-session mengeluarkan cookie rotasi yang valid. | Outage menghasilkan error fail-closed tanpa stale list/private data; retry memulihkan tampilan. Daftar/revoke memakai cookie rotasi yang berlaku dan tidak menampilkan nilai cookie. |

Tester tidak perlu mengirim kredensial ke chat. Kirim balik hasil per ID dengan `PASS/FAIL/BLOCKED`, build SHA, branch/environment, perangkat/browser, waktu lokal, status HTTP saja, dan bukti visual teredaksi. Jangan sertakan email, OTP, URL bertoken, token/JWT/cookie, IP, ledger asli, atau trace mentah. MFA operator, SMTP deliverability dan pengujian Worker-JWT-RLS tetap release gates terpisah.

## Kasus offline yang sudah otomatis

Jalankan `pnpm exec playwright test --project=chromium qa/e2e/offline-private.spec.ts`.

1. Siapkan kunci perangkat A dan snapshots akun dari API mock; emulasikan offline setelah form transaksi dibuka.
2. Simpan income Rp `9007199254740993` dan catatan sintetis. Pastikan status LOCAL_DRAFT, saldo tidak berubah, dan tidak ada POST saat offline atau sekadar online kembali.
3. Periksa IndexedDB `venfinance-private-offline-v1` hanya di konteks test: nominal dan note tidak boleh terlihat plaintext.
4. Tekan **Tinjau & catat**, verifikasi peringatan POSTED, lalu tekan **Catat transaksi**. Respons pertama 503 harus mempertahankan draf; retry mengirim UUID `Idempotency-Key` yang sama dan hanya menghasilkan satu event pada mock.
5. Logout, buka `/offline-unlock`; frasa salah ditolak, frasa benar memulihkan draf A. Ganti ke owner B dan pastikan B tidak melihat metadata privat atau draf A.

Ini tidak menguji RLS Neon atau backend nyata. Tambahkan run manual untuk: refresh saat draft tersimpan; browser ditutup saat request; server sudah menerima request tapi response hilang; IndexedDB rusak/penuh/unsupported; draf kedaluwarsa; 409/422 conflict; logout/account switch pada tab lain; perangkat dipakai bersama. Setiap failure harus mempertahankan LOCAL_DRAFT sampai tindakan eksplisit, tidak boleh mengubah saldo diam-diam.

## Skenario manual lengkap

### Identitas, tenant, dan role — `IAM-*`, `TRUST-001/002/011/012`

Prasyarat: akun sintetis A/B pada Neon staging dan inbox uji yang dikuasai QA. P0 mencatat gate Auth/email/MFA dan replay token setelah sign-out.

- Signup, verifikasi email, login, verifikasi ulang, forgot/reset password, ganti email, refresh, logout satu/semua sesi, expired session, lintas tab.
- Email tidak dikenal vs password salah harus mencegah enumerasi. Uji rate limit/429, cooldown, Origin/CSRF invalid, cookie attributes, unverified/suspended account.
- Tanpa cookie, forged JWT/issuer/signature/expired JWT, header `X-Role`, body/route `user_id`, `role`, `device_id` milik caller: harus ditolak.
- A/B menebak ID wallet/category/event/proof/job/user masing-masing melalui read, update, archive, delete, export, signed URL dan job: data silang harus nol (404/403 sesuai kontrak).
- User/Admin tidak dapat bootstrap Superuser atau menaikkan role. Admin tanpa step-up/MFA gagal; perubahan sah oleh Superuser memerlukan alasan, reauth, before/after audit.
- Logout/account switch: query cache, history/back, service worker dan tampilan harus dibersihkan; vault A harus tertutup sebelum akun B aktif.

### Ledger dan nilai uang — `FIN-001…010`, `FIN-028`, `QUAL-002/003`

- Input `1`, `8000`, `10000`, `100000`, `9007199254740993`, dan `9223372036854775807`; nilai JSON berupa decimal string. `0`, negatif, desimal, exponent, format `Rp`, overflow: ditolak, tanpa posting.
- Income/expense, opening, adjustment, transfer wallet→wallet; total posting event = 0; transfer tidak menambah income/consumption expense. Uji wallet archived/asing/tujuan sama.
- Split Rp10.000 → Rp6.000+Rp4.000 diterima satu kali; split Rp9.000, duplicate category, category asing, split non-expense ditolak.
- Refund parsial/penuh/lebih dari eligible, adjustment in/out, saldo minus dengan/tanpa konfirmasi. Void/reversal/restore membuat event kompensasi immutable, bukan menghapus history.
- Retry key sama + body sama mengembalikan event yang sama; key sama + body berbeda → 409; submit bersamaan/out-of-order tetap satu posting.
- Pagination/filter/cursor invalid, rentang waktu salah, effective date lampau/mendatang, `Asia/Jakarta`, bulan 28/29/30/31 hari, urutan deterministik.
- DB 429/500/timeout atau response hilang: UI tidak mengklaim sukses; retry memakai key stabil dan saldo tetap satu kali.

### Budget, goal, debt, reminder, import/export — `FIN-011…035`

Sebagian besar belum tersedia: tandai `BLOCKED (fitur belum tersedia)` sampai API/UI implement. Sesudah tersedia, uji:

- Budget daily/weekly/monthly/custom, category/global, timezone period, Feb 28/29, 30/31 hari, rollover default off, copy/reallocation tanpa mutasi wallet. Budget Rp30.000 − posted expense Rp8.000 = Rp22.000; provisional Rp5.000 terpisah, bukan pengurang actual.
- Overspend hanya virtual warning, bukan pemblokir QRIS/bank. Tabungan/goal contribution bukan expense konsumsi dan harus terkait event.
- Utang/piutang baru/lama wajib balanced opening; cicilan pokok bukan expense kedua; bunga/biaya dapat expense tersendiri; uji bayar sebagian/lebih/jadwal berubah/early close.
- Recurring/reminder tidak auto-post; timezone/quiet hours/STOP/snooze/retry worker tidak membuat duplicate atau menganggap tagihan sudah dibayar.
- Dashboard/report pisahkan posted, provisional, estimates, cashflow, consumption, savings, transfer, refund, debt. Hari `unreported`, `zero`, `partial`, `done` tidak tertukar.
- CSV/JSON export round-trip exact strings; export A tidak berisi B; impor mapping/preview/duplicate validation/atomic commit/rollback dan audit.

### PWA, desain, dan aksesibilitas — `UX-*`, `QUAL-004…008/011/020`

- Jalankan routes + states loading/empty/error/success/offline/disabled. Cocokkan screen registry dan **PNG sumber asli** per ID, desktop dan mobile; contact sheet saja tidak cukup.
- Viewports 320×740, 360×800, 393×852, 768×1024, 1440×900, 1920×1080; portrait/landscape, zoom 200%, Indonesian/English, light/dark/system, prefers-reduced-motion.
- Keyboard-only, focus order, skip link, selects/dialogs, error announcement, no trap, labels/names, contrast, reflow, touch targets; WCAG 2.2 AA manual + automated axe.
- Install/uninstall PWA; manifest/icon/standalone/update/old-cache purge; pastikan API privat tidak dilayani dari service-worker cache.
- Ukur `QUAL-005` input normal ≤10 detik setelah persiapan; `QUAL-006` LCP p75 ≤2,5s pada mobile network terukur; `QUAL-007` API non-AI p95 ≤1,5s termasuk Neon dan laporkan cold-start terpisah. Catat sampel/lokasi/throttle/median/p75/p95.

### R2 file privat — `UX-006/008`, `TRUST-003/009`, `P5-003`

Live Worker owner check belum diverifikasi. Hanya staging dan bucket `ven` setelah ada fixture/persetujuan.

- Owner A upload fixture PNG/JPEG; A read/delete sukses, B access denied; object key dan credential tidak keluar ke browser/log; public `r2.dev` tidak aktif.
- Magic bytes vs MIME mismatch, file kosong/oversize (batas 5MB dan +1 byte), image pixel bomb, path traversal, checksum duplicate, request timeout, upload intent expired, token tampered, retention/delete/revoke.
- Download perlu session/owner check dan TTL singkat; URL A milik B atau setelah expired/revoke gagal. Jangan tulis objek di bucket `sap`.

### AI/OCR, consent, dan proof review — `AI-*`, `TRUST-008/017/019`, `QUAL-009/010/021/022`

Live model test `BLOCKED` sampai consent, model/user-owned credential, cost cap dan novel synthetic fixtures tersedia.

- Fixture truth table: total, tanggal, merchant, expense/income/transfer/refund, multi-item, blur/rotation, screenshot QR tanpa nominal, non-transaksi; ukur nominal benar (target ≥90%) dan 100% konflik material ke review.
- Vision 429/500/timeout/no-image-forward/schema-invalid, OCR off, invalid image, quota exhausted; fallback manual/OCR tidak membuat amount fiktif atau blocking.
- OCR Rp10.000 vs Vision Rp100.000: tampilkan bukti/field conflict dan minta user; reject = nol posting; edit/confirm = satu posting idempotent; recheck tidak menimpa posted event.
- Cabut consent saat job pending: worker tidak boleh mengirim bukti ke provider. Proof sama dari WA+PWA menghasilkan duplicate candidate, bukan double post/auto-merge yang meragukan.

### WhatsApp / GOWA / Tunnel / Access — `WA-*`, `TRUST-006/020`, `OPS-*`

Live test `BLOCKED` sampai build GOWA dipin, perangkat tes owner disetujui, keputusan policy/legal tertulis, webhook HMAC/replay dan isolasi Tunnel/Access dibuktikan. Jangan daftarkan nomor atau kirim pesan QA tanpa izin eksplisit.

- Mock/unit: raw-body HMAC invalid, stale timestamp, nonce/message replay, duplicate ID, unlinked sender, opt-in dicabut, malformed/oversized payload → no processing/no finance event.
- A tidak dapat melihat QR/pairing/status/logout/delete device B walau menebak ID. Browser tidak pernah mengirim/menentukan raw GOWA device ID.
- `STOP` berhenti reminder opsional; quiet hours dihormati; logout WA meninggalkan slot dan ledger; delete slot tidak menghapus ledger; manual finance tetap jalan saat GOWA/tunnel mati.
- Chat/group/media di luar scope tidak dipindai, disimpan, dikirim ke AI/R2/log. Pending outbox cancel saat consent revoke.
- Tunnel/Access bypass negative (staging terisolasi): no/wrong service token, direct origin, encoded slash, dot segments, case, duplicate slash, redirect/canonical path, HMAC replay. Jangan probing public live endpoint.
- Restart Worker/GOWA/Armbian, duplicate webhook, pending queue restart, backoff, quota cap, stale health; tidak boleh hang/double send/lost ack.

### Admin, privasi, biaya, recovery — `OPS-*`, `TRUST-*`, `QUAL-013…019/022/024`

- Admin tanpa support grant hanya melihat metadata tiket. Grant salah tiket/expired/revoked tidak membuka raw transaction/chat/proof; akses sah dibatasi dan diaudit.
- User tidak dapat memberi dirinya role `admin`/`superuser`; bootstrap atau perubahan role privileged harus memakai alur trusted, MFA/reauth, reason, dan audit. Bukti staging saat ini menguji policy PostgreSQL dengan claims sintetis, bukan Worker.
- Export/delete milik sendiri, schema version, secure expiring download, step-up, consent revoke, request lifecycle, retensi/backups yang dijelaskan; A tidak dapat unduh hasil B.
- Perubahan roles/flags/quotas/policy/rotation perlu role tepat, MFA/reauth, reason, version, audit, safe rollback; response/log tak mengandung nilai credential.
- Inject Neon/R2/provider outage, R2 quota, stuck queue, worker restart; health freshness, redacted alert dan fallback manual harus benar.
- Beban/abuse throttle per user+global, Workers/Neon/R2/AI caps dan alert sebelum overage. Catat biaya actual; jangan janji gratis.
- Restore backup terenkripsi pada env terisolasi; periksa row counts/checksum, ledger balance, RLS, object manifest dan rollback. Backup yang belum direstore belum PASS.
- Tidak ada secret/cookie/JWT, exact transaction payload, image, raw WA, upstream prompt pada bundle/log/metric/trace. Copy publik tidak mengklaim koneksi bank, blokir QRIS, atau WhatsApp API resmi.

## Form laporan hasil

```text
QA run ID / tester:
Commit SHA / branch / UTC start-end:
Environment (local atau branch staging yang ditetapkan):
OS / Node / pnpm / browser / viewport:
REQ-ID / AC-ID / scenario ID:
Synthetic users/fixtures and setup:
Exact command atau langkah klik:
Expected / observed:
PASS / FAIL / BLOCKED / NOT RUN:
Reproduction frequency and steps:
Artifacts (redacted screenshot/trace/log):
Tenant/security impact and severity:
Issue link:
Mock / local PostgreSQL / actual staging provider:
```

`FAIL` perlu repro dan bukti teredaksi. `BLOCKED` menyebut prasyarat/owner yang hilang. Signoff produksi hanya memakai [acceptance matrix](./ACCEPTANCE-MATRIX.md) setelah hard gate selesai; dokumen ini bukan persetujuan rilis.
