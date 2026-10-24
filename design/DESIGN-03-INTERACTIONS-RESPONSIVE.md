# DESIGN-03 — Responsive Layout, Flows, UX Microinteractions

**Design authority:** mobile/web PNG pairs at `reference-design/full/VenFinance_UIUX_ImageGen/screens/{mobile,web}` after unzip originals, plus this behavior spec. Viewports below are **targets for QA** rather than fixed canvas dimensions.

## 1. Breakpoints & container rules

| Width | Navigation | Content / forms | Tables |
|---|---|---|---|
| 320–359px | compact tab labels; horizontal scroll only where unavoidable | one-column, accessible no clipped CTA, QA mandatory | cards |
| 360–599px | bottom tabs `Beranda/Transaksi/Catat/Anggaran/Lainnya` | 16px gutter, one-column cards, modal sheet | transaction cards, no squeezed 8 columns |
| 600–767px | tabs/conditional drawer | one or two cards per row | compact responsive lists |
| 768–1023px | navigation rail/drawer | responsive grid 2 columns | table subset or cards |
| 1024–1279px | sidebar desktop and header | 12-col grid constrained | table/filter |
| ≥1280px | full sidebar | max content width ~1440px, no uncontrolled stretch | desktop tables + side detail |

Test devices at 360, 390, 768, 1024, 1440, 1920, 200% browser zoom, and keyboard visible. UI must keep tab safe-area and scroll when keyboard opens.

## 2. Navigation and IA

- **Public:** landing header (Fitur, Cara Kerja, Bantuan, Masuk, Mulai gratis), CTA demo synthetic. Avoid banking-card imagery implying real payment capability.
- **Account:** login/register/forgot/verify flows have independent shell; don't expose private data behind CSS overlay only.
- **Onboarding:** five-step wizard, can skip optional integrations; template Mahasiswa Kos prefilled but editable and **not** forced on everyone. Respect `kos/listrik belum diketahui`, monthly cycle and currency.
- **Mobile private:** 5 bottom tabs, `Catat` floating central action; menu `Lainnya` for Dompet, Target/Utang, Tagihan, Laporan, WhatsApp, Pengaturan. Back navigation preserves draft where offered.
- **Desktop private:** sidebar Beranda, Transaksi, Anggaran, Dompet, Target & Utang, Tagihan, Laporan, Perlu Ditinjau, WhatsApp, Pengaturan; exact active state derived from route, not fixed screenshot highlight.
- **Operator:** switch role context, distinct sidebars Admin/Superuser, no accidental user financial content in operator layout. Breadcrumb labels distinguish `Operasional` vs `Sistem`.

## 3. Feature-by-feature screen behavior

### Home `FIN-UI-01`

Mobile: greeting/period/hide amount → saldo confirmed → budget remaining separately → Makan/Jajan daily tile → review inbox alert → recent 3 transactions → bill/day state. Desktop: header + 4 KPIs, cash flow chart, budget breakdown, today list, recent transactions. No graph when insufficient points; display meaningful empty state. All positive/negative amounts with accessible labels and timestamps.

### Quick add `FLOW-01` and natural input `FLOW-02`

- `+ Catat` launches sheet mobile/dialog desktop. Inputs `Pengeluaran/Pemasukan/Transfer` with correct dynamically required fields. Format `Rp10.000` display while data stores `"10000"` minor string.
- Persist chosen wallet/category only when owner opts in, not if invalid/archived. Place submit away from bottom keyboard and sticky only when safe.
- Natural text e.g. `lauk 10k bensin 20k es teh 8k` shows **3 separate draft proposals**, not one aggregated transaction. User can edit/delete draft before confirming batch, with `total Rp38.000` computed from proposals. Requires duplicate warning if same evidence exists.

### Receipt review `REV-01…05`

- Upload state clearly separate from Vision processing state; photo never counts as spent until candidate approved and posted.
- Mobile: preview image zoomable, below editable amount/date/merchant/category/wallet/item breakdown; desktop: original proof left, form right, save anchored bottom.
- OCR/AI conflict `REV-04` shows both values (`OCR Rp10.000`, `AI Rp100.000`) with provenance and **radio choose/manual edit**. The mock image shows a different pair; actual data driven from job.
- Duplicate `REV-05` shows canonical existing transaction and new candidate with dates/merchant/amount and choices `Gabungkan bukti`, `Simpan terpisah`, `Batalkan`, never hidden auto-merge uncertain cases.

### Savings/debts/budgets `FIN-UI-07…14`, `FLOW-03…06`

- Budget **per-period** and **per-category** progress; over limit signed negative and gentle warning. Period copy never rewrites history; budget money ≠ wallet balance.
- Transfer to goal does not become consumer expense; cross-category budget reallocation also does not move actual wallet balance.
- Debt repayment preview shows wallet debit + liability reduction, interest/fees separate. Recurring bills show upcoming until confirmed; don't silently post on due date.
- Simulator `FIN-UI-16` previews hypothetical spend; CTA `Catat jika jadi membeli` creates manual form with amount, still requires confirmation.

### Calendar `FIN-UI-04` and day status

- Color + accessible label for `Belum dilaporkan`, `Sebagian`, `Selesai`, `Nihil` with legend; no missing day assumed zero; future dates not marked unreported as past.
- Summary chart and filter date honor user's timezone and financial period, not server UTC date only.

### WhatsApp `SET-05…08`, `STATE-03`

- Mode choice presents `Bot Bersama` and `WhatsApp Pribadi` separately, with privacy disclosure and availability. Personal may be disabled by platform feature flag.
- Shared bot verification: show masked bot number, short one-time code/time remaining, step-by-step `Kirim kode → Bot membalas → Status verified`. Never expose private phone in public image/URL.
- Personal on same phone: **Kode pairing** first; QR is optional if user has second device. Pairing has copy action and actual expiry countdown; expiry displays new code action. Do not render real QR placeholder as success.
- Connected status `SET-08` based on GOWA latest status; controls `Reconnect`/`Tautkan ulang`/`Logout`/`Hapus sesi` conditionally. Each destructive action needs consequence and confirmation. `Cabut izin` distinct from logout/delete.
- Activity displayed as minimal finance events metadata, not personal conversation viewer. Admin sees health only.

### Offline `SET-18` and user data `SET-12/19`

- Pending local draft: `Tersimpan di perangkat — belum disinkronkan`. Syncing `Sedang disinkronkan`, succeeded `Tersimpan di akun`, conflict compare two versions with changed fields and timestamp.
- Import has mapping preview and computed counts, status after commit, rollback accessible when eligible; export requires scope, sensitive-field and proof inclusion controls.
- Delete account shows steps, review of affected data/WA/backup retention, reauth. Progres asynchronous and support route, not instant fake "sukses dihapus".

### Admin `ADM-*` and Superuser `SYS-*`

- Admin dashboard shows aggregate metrics and queue, no user balances. Support detail reveals only explicit time-limited shared file/data and revoke button.
- Superuser dashboard service status contains age of heartbeat; stale data not labeled "Healthy". Credentials masked, rotation logged, never copy public secret. Role mutation screen requires reason, reauth and anti-self-lockout.
- Public policy and incident content versioned; visually distinguish draft/reviewed/published.

## 4. Interaction quality

- Confirmation should describe **financial effect** before posting, especially split, transfer, refund, debt payment, void, merge.
- Undo may reverse event within allowed window; nothing removed silently. Toast on success links to detail, but keep nonblocking.
- Long operations show precise status (server pending, AI processing, offline, auth code expired) and don't replace last visible state with invented zero.
- Back/close from review/draft asks `Simpan draft / Buang / Lanjut edit` if dirty; don't trap accidental screenshot upload.
- Text input focus order follows reading order; dialogs trap focus and return to trigger. Stable tab bar & escape/cancel paths. 
- No discriminatory or shaming financial nudges. User may disable habit challenge, reminders, AI and WA without losing finance capability.

## 5. Visual QA checklist per flow

- Compare actual screenshot at reference mobile+desktop layout to original; document differences in layout, figures, spacing, token color, asset placement and state (expected data different).
- Test `/app` with synthetic user before/after expense: dashboard cards and budget progress update consistently.
- Test screenshot with duplicate/ambiguous outputs: `REV-03`, `REV-04`, `REV-05` each exercised via fixture.
- Test 3 roles and forbidden routes; operator UI must not receive private finance data in API response, not merely hide it.
- Capture dark mode on home+review then sample all main routes, keyboard navigation, ID/EN overflow and 200% zoom.
