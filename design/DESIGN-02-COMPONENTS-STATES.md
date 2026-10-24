# DESIGN-02 — Component Catalog, Reusable Patterns & State Contract

Cross-reference [`DESIGN-00`](./DESIGN-00-FOUNDATIONS.md), [`DESIGN-01`](./DESIGN-01-SCREEN-MAP.md), product acceptance [`REQ-09`](../requirements/REQ-09-SCENARIOS.md).

## 1. UI component inventory (to implement once)

| Component | Variants and behavior | Reference screens |
|---|---|---|
| `BrandMark`, `Wordmark` | light/dark, compact header, brand asset preserved | PUB-01, AUTH-01, FIN-UI-01 |
| `AppShell`, `PublicShell`, `OperatorShell` | mobile/desktop nav, active role, safe-area, breakpoints | FIN-UI-01, PUB-01, ADM-01, SYS-01 |
| `PrimaryAction`, `SecondaryAction`, `DangerAction` | loading, disabled, focus-visible, confirmation for destructive | FLOW-01, SET-19, SYS-05 |
| `MoneyText` | IDR/en, negative, privacy masked, tabular digits, spoken amount | FIN-UI-01..16 |
| `AmountField`, `NumericKeypad` | validate integers, no locale parse ambiguity, keypad clear/backspace | FLOW-01, FLOW-06 |
| `WalletPicker`, `CategoryPicker` | search/add custom, own-only options, keyboard | FLOW-01..04 |
| `DatePicker`, `PeriodSelect` | locale/timezone, month/year, custom cycle | FIN-UI-04, FIN-UI-07 |
| `BalanceCard`, `BudgetSummary`, `BudgetProgress` | posted versus preview, change annotations, threshold/overspend | FIN-UI-01, FIN-UI-07, FIN-UI-08 |
| `GoalProgress`, `DebtSummary`, `BillCard` | due date, remaining, status, zero and partial payments | FIN-UI-09..14 |
| `TransactionRow`, `TransactionTable`, `FilterPanel` | item icons, method, date, filters, bulk selection, empty rows | FIN-UI-02, FIN-UI-03 |
| `DailyStatusCard`, `CalendarStatus` | unreported/partial/zero/done, explicit close day | FIN-UI-04, FIN-UI-01 |
| `QuickAddSheet`, `TransactionForm` | expense/income/transfer/refund, draft preservation | FLOW-01..06 |
| `PreviewReceipt`, `ReceiptZoom`, `EvidenceField` | original image left/zoom, other panel editable, EXIF safe | REV-02..04 |
| `ReviewCandidate`, `ConflictComparison` | OCR vs Vision, field provenance, confirm/correct/cancel | REV-03/04 |
| `DuplicateResolver` | merge evidence, keep separate, cancel, clear monetary impact | REV-05 |
| `StatusBadge`, `InlineAlert`, `NoticeBanner` | icon + text for pending/warning/success/errors | STATE-01..04 |
| `QuotaMeter`, `FeatureFlagToggle` | remaining/resets, soft/hard limit, opt-out | SET-09, SYS-03, SYS-04 |
| `WhatsAppLinkCard`, `PairingCodePanel`, `QRPanel` | shared/personal, expire countdown, status from server | SET-05..08, STATE-03 |
| `ConsentCard`, `SensitiveDataGrant` | separate scopes, terms link, revocation effect | SET-08, SET-09, ADM-05 |
| `JobStatusTimeline`, `SyncConflictPanel` | queued/working/provisional/verified/failed, choose resolution | REV-01, SET-18 |
| `TicketList`, `TicketReply`, `AuditTimeline` | assigned access, expiration, metadata-only | SET-16/17, ADM-04/05/07 |
| `SystemHealthPanel`, `UsageCard`, `CredentialStatus` | stale indicator, masked secrets, step-up | SYS-01/02/03 |
| `ConfirmDialog`, `StepUpDialog` | destructive impact preview, reason, reauth, safe cancel | SYS-05, SET-19 |
| `Toast`, `Snackbar`, `Skeleton`, `EmptyState` | copy with action, no auto-dismiss for important errors | all, STATE-01 |
| `ChartWithTableFallback` | clear legends, reduced motion, accessible table | FIN-UI-15 |
| `LanguageSwitcher`, `ThemeSwitcher`, `PrivacyMask` | persist user preference, accessibility | SET-03 |

**Rule:** no bitmap screenshots as `background-image` for live forms/tables/numbers. Raster extracted text is reference only. Each component gets Storybook-like showcase/test fixtures if tool included (optional Storybook dependency; not at cost of bundle performance).

## 2. Common state matrix

| Context | Loading / pending | Empty | Error/degraded | Success/confirm |
|---|---|---|---|---|
| Dashboard | skeleton 3 KPI with labels, no fabricated zeros | onboarding empty CTA | retry + as-of timestamp; manual catat remains | live snapshot with updated local timestamp |
| Transaction list | skeleton rows; don't flash stale other account | STATE-01 with Catat/Import CTA | preserve filter and scroll; retry | row with posted/voided label |
| Quick add | disable duplicate submit, spinner, stable idempotency | prefill last safe category/wallet | invalid field inline; draft retained | server confirmed vs saved locally explicit |
| Budget | placeholder ring until values known | create template/blank | stale balance notice; do not calculate from missing zero | safe/near limit/over budget with signed amount |
| Image upload | bytes/progress upload, parse queued separately | drag/select CTA | STATE-02 with retry and manual input | proof linked to review item, not posted |
| AI review | queued/process/vision/ocr/provisional/recheck | no review inbox | retry/cancel, no hallucinated numeric | conflict resolved by user; final posted once |
| WhatsApp | waiting for code/login/status | choose mode | STATE-03 expired/disconnected with reconnect or re-pair | connected only after confirmed GOWA server state |
| Offline sync | saved locally/syncing | queue empty | SET-18 conflict panel; never silently overwrite | synced once, own account only |
| Import | processing records | no compatible columns | mapping per row errors, options rollback | inserted/duplicate/invalid counts |
| Support | assigned/in progress | first ticket CTA | expired grant/no access | user own ticket, revoke available |
| Admin / Superuser | loading / stale health | zero tickets/jobs not 0 service failure | incident/degraded banner, auth step-up | action audit with before/after reason |
| Security/export/delete | verification pending | no requests | expired links & retry safe | progress explicit; don't claim immediate backup erasure |

## 3. Specific state machines rendered

### Transaction status

`LOCAL_DRAFT → SYNCING → SERVER_DRAFT [transaction_drafts] → (CANDIDATE_PROVISIONAL / NEEDS_REVIEW [extraction_candidates] bila ada bukti AI) → POSTED [finance_events] → VOIDED [finance_events + reversal event]`

- `LOCAL_DRAFT` not included in confirmed balance; `SERVER_DRAFT` also not included.
- `CANDIDATE_PROVISIONAL` may show **estimated budget impact** visually *separate* from confirmed total; label always visible.
- `POSTED` includes finance event ID and amount/dated occurrence; `VOIDED` shows reversal, not silent delete. **Restore** membuat event kompensasi baru: `RESTORED_EVENT` hanya label UI/audit lineage, **bukan status DB** yang ditambahkan ke `finance_events`.
- Quick-add manual **Simpan Transaksi** adalah konfirmasi user dan langsung menghasilkan `POSTED`; **Simpan Draft** menghasilkan `SERVER_DRAFT`. WA text, recurring, dan AI image memerlukan konfirmasi sesuai mode/risiko sebelum `POSTED`.

### Budget threshold

`NO_BUDGET → SAFE → NEAR_LIMIT → REACHED → OVER_BUDGET` (based on percentage and signed remaining); at `REACHED` remaining Rp0, at `OVER_BUDGET` negative and **transaction still allowed**.

### WhatsApp state

`NOT_LINKED / VERIFY_PENDING / PAIRING / CODE_EXPIRED / CONNECTED / DISCONNECTED / RECONNECTING / NEEDS_REPAIR / LOGGED_OUT / DELETING / DELETED / SERVICE_DISABLED`. Show relevant next action, never success immediately after press.

### AI proof state

`UPLOADING / UPLOADED / QUEUED / VISION_PROCESS / OCR_FALLBACK / PROVISIONAL / RECHECK_QUEUED / CONFLICT / NEEDS_REVIEW / POSTED / FAILED / CANCELLED`. User can always choose manual entry.

**Pemetaan wajib (alias presentasi ≠ enum tabel):** `UPLOADING` hanya status upload klien; `UPLOADED/QUEUED/VISION_PROCESS/OCR_FALLBACK/RECHECK_QUEUED/FAILED/CANCELLED` diproyeksikan dari `proofs`/`extraction_jobs`; `PROVISIONAL` adalah label layar untuk `extraction_candidates.status=provisional` (`CANDIDATE_PROVISIONAL` di alur transaksi); `NEEDS_REVIEW`/`CONFLICT` adalah status tampilan hasil review, bukan status `finance_events`; `POSTED` hanya jika ada `finance_events.status=posted` yang terkait. **Jangan membuat enum tunggal dari deretan label ini.**

### Day completion state

`UNREPORTED` (default no report), `PARTIAL` (some events), `DONE` (explicit 'selesai'), `ZERO` (explicit 'nihil'). Never infer ZERO from no records.

## 4. Button and confirmation design rules

- Primary actions at most one dominant in a section. Danger actions red/destructive with explicit impact and cancel; delete account/WA requires reauth where specified.
- Inline error shows field-specific reason and clear next step, not just red border. Privacy errors do not reveal whether hidden user/object exists.
- All interactive controls ≥44px recommended target; no icon-only buttons without aria-label/tooltip.
- Loading states retain last valid form values and do not allow duplicate finance posting.
- Stale/estimated/posted financial numbers always labeled. Examples from raster may not sum; implementation must follow actual data and ledger.
