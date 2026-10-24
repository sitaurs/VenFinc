# SOURCES — Sumber Primer & Batas Kepastian (23 Oktober 2026)

Tujuan: mendokumentasikan dasar arsitektur, bukan menjamin bahwa setiap account atau versi deployment punya konfigurasi yang sama. Ketika agent akan mengubah versi atau melakukan deployment, **verifikasi ulang docs real-time** dan capture tanggal/commit SHA yang terpakai.

## Cloudflare

1. [Cloudflare Workers platform limits](https://developers.cloudflare.com/workers/platform/limits/) — Free 100.000 dynamic request/hari per akun, 10 ms CPU/invocation, memory 128 MB; aset statis terpisah. Tidak boleh menganggap 100.000 per worker atau unlimited compute.
2. [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — React static + Hono API dalam satu Worker; SPA fallback dan asset deployment.
3. [Cloudflare Workers Vite plugin](https://developers.cloudflare.com/workers/local-development/vite-plugin/) — pengembangan dan build Worker/Vite.
4. [Workers + Neon](https://developers.cloudflare.com/workers/databases/third-party-integrations/neon/) — driver koneksi Postgres edge, tetap validasi protected session & RLS.
5. [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) — 10GB-month Standard, 1M Class A, 10M Class B; egress free; **overage bisa ditagihkan**.
6. [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) — URL berjangka adalah bearer capability, limit media, jangan log/share publik; Worker binding ideal untuk kontrol.
7. [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/) — named tunnel multiple public hostnames → local services.
8. [Cloudflare Access service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/) — `CF-Access-Client-Id`/`CF-Access-Client-Secret` untuk origin protection service-to-service; tambahkan app auth dan anti-replay.
9. [Turnstile](https://developers.cloudflare.com/turnstile/) — bot challenge signup; selalu verifikasi token server-side.

## Neon / Auth / Database

10. [Neon Free plan expanded 2 Oktober 2026](https://neon.com/blog/neon-free-plan-1-gb-per-project) — 1 GB/project + 100 CU-hours/project/month; storage/compute sejalan free target untuk early multiuser, bukan SLA skala produksi.
11. [Neon Managed Auth](https://neon.com/blog/neon-auth-branchable-identity-in-your-database) — hosted Better Auth and branchable identity; validasi login/signup/reset/refresh/MFA requirements dengan SDK real.
12. [Neon Auth client README](https://github.com/neondatabase/neon-js/blob/main/packages/auth/README.md) — rujukan integrasi; pin package version.
13. [Neon Auth skill/email config](https://github.com/neondatabase/agent-skills/blob/main/plugins/neon-postgres/skills/neon-auth/SKILL.md) — konfigurasi auth, caveat shared mailer; **delivery verification email production/custom SMTP belum disepakati sebagai Rp0**.
14. [Drizzle Neon](https://orm.drizzle.team/docs/connect-neon), [Drizzle RLS](https://orm.drizzle.team/docs/rls) — SQL migration dan Postgres RLS; external user context propagation via tested trusted identity.

## WhatsApp / AI / OCR

15. [GOWA upstream repository](https://github.com/aldinokemal/go-whatsapp-web-multidevice) — Go WhatsApp Web MultiDevice ARM64/Docker, multi-device support; bukan WhatsApp Business resmi.
16. [GOWA OpenAPI source](https://github.com/aldinokemal/go-whatsapp-web-multidevice/blob/main/docs/openapi.yaml) — `/devices` create/login QR/pairing/status/reconnect/logout/delete, scoped device header; **pin exact release/tag/commit and run contract tests**.
17. [GOWA webhook payload docs](https://github.com/aldinokemal/go-whatsapp-web-multidevice/blob/main/docs/webhook-payload.md) — event shapes/signature; HMAC+dedup; minimize message contents.
18. [9router repository](https://github.com/decolua/9router) — ARM64 image, compatible proxy, local router; vision support is capability of specific model+forwarding, requires live smoke.
19. [Tesseract.js](https://github.com/naptha/tesseract.js) — local OCR fallback; Sharp processing, extraction schema and human-review control.
20. [WhatsApp Terms](https://www.whatsapp.com/legal/terms-of-service?lang=en), [Responsible Use](https://faq.whatsapp.com/361005896189245/) — risk unapproved automation; app should keep finance without WA.

## PWA / UX / Regulatory

21. [MDN PWA offline](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) — service worker browser lifetime not a 24/7 scheduler; IndexedDB queue with server reconcile.
22. [MDN Web Share Target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target) — support differs per platform; explicit file upload fallback required.
23. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — target 2.2 AA for public screen and input/a11y.
24. [UU 27/2022 Perlindungan Data Pribadi (BPK)](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) — legal compliance review, not a substitute for legal advice.
25. [OWASP ASVS](https://asvs.owasp.org/) — security acceptance baseline for auth/authorization/data.

## Local primary design evidence — user-supplied

- 4 ZIP originals: `VenFinance_01_Mobile(1).zip`, `VenFinance_02_Web_A(1).zip`, `VenFinance_03_Web_B(1).zip`, `VenFinance_04_Assets_Galeri(1).zip`.
- `reference-design/guides/{Design_System.md,Flows_and_Handoff.md,Design_Plan.md,design_tokens.json,screen_manifest.json,screen_inventory.json,ORIGINAL_QA_REVIEW.md}`.
- 90 unique screen IDs × 2 responsive design references. `design/DESIGN-01-SCREEN-MAP.md` adalah peta audit; image originals dibutuhkan untuk full visual comparison.
- Keputusan framework/color/shape oleh AI agent tidak boleh menggantikan desain user tanpa ADR.

## Caveat & maintenance

- Angka pricing/limits berubah; tanggal riset adalah baseline saja. Query API/GOWA OpenAPI yang terpasang dan provider AI yang benar-benar dipakai saat eksekusi.
- Screenshot bukan kontrak nilai data; `saldo`, `budget`, `utang` dan angka contoh tidak boleh di-hardcode ke aplikasi.
- Tidak ada klaim source review ini membuktikan layanan telah dapat diakses/QA pada lingkungan akun pengguna.

## Tambahan riset verifikasi audit (24 Oktober 2026)

- Cloudflare Tunnel ingress `hostname` + `path` regular expression, forward path tanpa rewrite, rule urut dan catch-all: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/configuration-file/ . Kontrak tiga hostname memerlukan implementasi dan pengujian **Access policy per path**, normalisasi traversal, serta negative tests di P0.
- Cloudflare Tunnel routing features / published applications: https://developers.cloudflare.com/tunnel/concepts/routing/ . Tidak berarti endpoint aman hanya karena berada di belakang Tunnel; tetap perlu Access/HMAC.
- Drizzle Neon RLS helper: https://orm.drizzle.team/docs/rls . Nama kolom tenant kanonik `user_id`, dibandingkan dengan `auth.user_id()` pada runtime; fungsi harus diuji dari Worker dan Finance Worker.
- Drizzle Neon HTTP vs WebSocket transactions: https://orm.drizzle.team/docs/connect-neon . Mutasi ledger multi-statement harus atomic di database lewat function/transaction, bukan terfragmentasi beberapa HTTP independen.

