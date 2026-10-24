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

## Menjalankan suite lokal

Node `24.22.1`; pnpm mengikuti versi yang dipin dalam `package.json`:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contracts
pnpm test:security
pnpm build
pnpm test:e2e
pnpm test:visual
pnpm db:test:local
```

Jika browser belum terpasang: `pnpm exec playwright install chromium`. Tes visual saat ini memeriksa beberapa layout dasar; belum membandingkan seluruh 180 PNG desain. `pnpm test:integration` dan `pnpm db:check` memang melaporkan `BLOCKED` tanpa Neon/R2 staging fixtures; jangan alihkan target ke production. `pnpm infra:smoke` memerlukan app lokal pada `127.0.0.1:5173`.

### Bukti otomatis terakhir yang tercatat

| Perintah/suite | Hasil terakhir | Batas |
|---|---:|---|
| `pnpm lint`, `pnpm typecheck` | PASS | Tidak membuktikan provider cloud |
| `pnpm test` | 82/82 PASS | Unit tests |
| `pnpm test:contracts` | 21/21 PASS | Contract tests |
| `pnpm test:security` | 9/9 PASS + client bundle scan | Scan heuristic, bukan audit/RLS proof |
| `pnpm test:e2e` | 20/20 PASS, Chromium, local app + mocked APIs | Tidak menguji provider nyata; termasuk 2 skenario offline pribadi |
| `pnpm test:visual` | 12/12 PASS pada 320–1920px + component gallery | Pemeriksaan layout dasar; belum dibandingkan dengan 180 PNG sumber |
| Neon staging role-policy probe | PASS; `qa/staging-role-policy-probe-2026-10-24.json` | A/B sintetis, claims disetel SQL, DDL/fixture di-rollback; tidak menguji Worker/JWT nyata |
| `tools/verify-local-postgres.py` (P0 generic probe) | 22/22 PASS pada bukti lokal sebelumnya | Probe schema generik P0-005, bukan migration aplikasi Drizzle/P3 |
| `pnpm db:test:local` | BLOCKED, exit 2 | `VENFINANCE_PG_BIN`/PostgreSQL server tools tidak tersedia saat run; `packages/db` migration contract lokal belum lulus di run ini |
| `pnpm docs:check` | PASS; 177 REQ, 90 screen, 373 task tervalidasi | Hanya validator dokumen |

Ulangi semuanya pada commit SHA yang diuji. Cantumkan versi browser, environment dan exit code aktual.

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
