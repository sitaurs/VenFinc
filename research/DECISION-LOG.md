# DECISION-LOG — Keputusan Produk, ADR, dan Launch Blockers

**Baseline:** PRD-10, 23 Oktober 2026. **Pemilik keputusan final:** pemilik produk; agent boleh memilih default teknis yang sudah dikunci di TRD, bukan mengubah scope/risiko sendiri.

| ID | Keputusan dari PRD | Working baseline | Status & gate |
|---|---|---|---|
| `DEC-001` | Nama produk | **VenFinance** | Working name; cek nama/merk sebelum publik |
| `DEC-002` | Domain | `finance.venlab.tech`, `gowa.venlab.tech`, `9r.venlab.tech` | **Tiga hostname baseline**; jalur mesin `https://gowa.venlab.tech/internal/v1/jobs/notify` di-route **lebih dahulu** oleh Cloudflare Tunnel ke Finance Worker, sedangkan path lainnya ke GOWA. Uji ingress/Access path di P0; hostname keempat hanya jika ADR disetujui. |
| `DEC-003` | Platform | React PWA + CF Worker/Hono, Neon, R2, Armbian | Baseline locked TRD; go/no-go cloud/free verification P0 |
| `DEC-004` | Registrasi & role | public signup; `user`, `admin`, `superuser` | Harus implement identity+authorization+isolation, no user self-promotion |
| `DEC-005` | Model WA | Shared bot default + personal session opt-in | **Policy/legal/privacy gate** sebelum public personal link, flag disabled by default |
| `DEC-006` | Jatah personal device | Satu slot aktif per user (configurable) | Working operational limit sampai ARM benchmark dan audit stabilitas |
| `DEC-007` | Reminder | 20.30 timezone user, bisa diubah, quiet hours + STOP | User preference, no enforced marketing blast |
| `DEC-008` | Kuota | 5 extract/day, file 5MB, 100MB bukti/user | Defaults yang bisa diubah superuser, global cap dan abuse throttle |
| `DEC-009` | Bahasa | Indonesian default, English optional | ID/EN ada di seluruh UI termasuk legal UX dan error |
| `DEC-010` | Retensi bukti | 90 hari setelah transaksi final (default usulan) | Privacy/legal verification required; user visibility & settings |
| `DEC-011` | Integrasi bank | Tidak ada koneksi bank/live QRIS hard limit | Website tak boleh klaim bisa blokir QRIS atau baca mutasi otomatis |
| `DEC-012` | Autentikasi | Neon Managed Better Auth kandidat terpilih di TRD | **Hard gate:** email verification, MFA operator, custom SMTP, Workers, RLS all smoke tested; if impossible submit ADR to owner |
| `DEC-013` | Vision fallback | Local Tesseract/Sharp on Armbian + deferred LLM recheck | Accepted functional contract, never silent financial edit |
| `DEC-014` | Biaya | Target $0 service tier, bukan jaminan | Hard usage caps R2/AI, hosting+electricity/domain cost disclosed |

## ADR convention (wajib untuk deviasi)

`ADR-####` disimpan `research/adr/ADR-####-SHORT-NAME.md` saat fase eksekusi, berisi: **Context; Options; Decision; Safety/Scope tradeoff; Impact PRD/REQ/TRD/DESIGN; Tests; Owner approval; Timestamp; Rollback.** Tidak boleh menyebut kandidat telah diputuskan tanpa konfirmasi owner. ADR yang berdampak pada produk/keamanan memerlukan approval user.

## Open critical go/no-go blockers

| Gate ID | Pembuktian yang diminta | Fail-safe/default | Owner |
|---|---|---|---|
| `G-IDENTITY` | Neon auth session + refresh + verify/reset + operator MFA + RLS, email transactional deliverability & cost | No public signup until verified; no fake MFA | Owner + tech |
| `G-RLS` | A/B data & R2 object isolation under worker AND finance-worker service access | Block release, never use unrestricted DB role for public queries | Security/tech |
| `G-GOWA-API` | Current pinned version actual endpoints, 2+ test devices, restart, webhook HMAC, scope | Disable personal WA rollout until tested | Owner + tech |
| `G-WHATSAPP-POLICY` | Compliance/legal decision for unofficial provider and data content risk, consent, STOP, deletion | WA public invitations disabled; manual finance still functional | Owner/legal |
| `G-9ROUTER-VISION` | Real image forwarded through user-owned 9router/upstream with correct amount from unseen image | OCR/manual review path, no invented image result | Tech |
| `G-INFRA` | Armbian RAM/CPU/storage baseline with GOWA sessions and 9router/OCR; Tunnel/Access tokens tested | Constrain per-user sessions, queuing, degraded mode | Tech |
| `G-EMAIL` | Transactional mail verification/reset reliable under zero budget or owner-approved paid provider | Do not enable registration globally | Owner |
| `G-COST` | Verified free allowances, R2 billing alerts and caps, test AI provider throughput | Cap optional features before paid overage | Owner + ops |
| `G-PRIVACY` | UU PDP compliant docs/consent/retention and mechanism for exports/deletes | No public release; no hidden data collection | Owner/legal |
| `G-VISUAL` | Design original 180 PNG present; mobile/web visual diffs QA with approved deviations | Do not claim pixel-perfect for missing assets/screens | UI QA |
| `G-RECOVERY` | Verified encrypted backup restore + DB invariants + rollback | No production change without recovery | Ops |

## Known architectural tradeoffs to record, not hide

- **2026-10-24, Neon reset path probe (staging only):** `POST /email-otp/passcode` returned 404; `POST /email-otp/reset-password` returned 400 `VALIDATION_ERROR` for `{}`. Evidence: [`qa/neon-auth-reset-route-probe-2026-10-24.json`](../qa/neon-auth-reset-route-probe-2026-10-24.json). The Edge allowlist uses the latter, but correct OTP/password change still needs an authorized inbox test. This aligns with [Neon SDK issue #229](https://github.com/neondatabase/neon-js/issues/229); it is not production reset proof.

- **Tiga hostname utama** mengikuti keputusan pengguna. Cloudflare Tunnel dapat mencocokkan path ingress, sehingga `gowa.venlab.tech/internal/v1/*` diarahkan ke Finance Worker dan sisanya ke GOWA. Kontrol Cloudflare Access terpisah per path, HMAC, anti-replay, dan tes negatif path-bypass wajib lulus P0 (`G-INFRA`). Jika dashboard-managed tunnel/Access policy tidak memungkinkan isolasi seperti kontrak ini, hentikan rilis jalur internal dan ajukan ADR untuk hostname keempat; jangan mengekspos endpoint tanpa proteksi.
- Free-tier Neon storage/compute, R2 overage and email-delivery cost can undermine the all-free goal. Multiuser public abuse throttled first; do not present as unlimited.
- RLS with Neon Managed Auth via serverless HTTP + Drizzle requires genuine integration proof; `user_id` query parameter is not authority.
- Cloudflare 10ms CPU cap makes Sharp/Tesseract unsuitable for edge runtime; local ARM hardware capacity unknown.
- Personal WA sessions technically expose larger WhatsApp surface to GOWA than finance-only messages; operator cannot offer an unverifiable promise of zero access.

## Next review moments

Before P0 gate, after P2 identity auth, before first real GOWA test device, before private beta, before **public production**. A `blocked` release gate cannot be changed to `passed` merely because documents exist.
