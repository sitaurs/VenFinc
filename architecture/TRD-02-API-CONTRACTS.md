# TRD-02 — HTTP API, Auth, Idempotency, Error Contracts

**Single browser origin:** `https://finance.venlab.tech` · **API base:** `/api/v1` · **Protocol:** HTTPS JSON unless upload/download. All routes versioned. This is the API contract **to implement**, not a verified running API.

## 1. Shared conventions

- Public `GET /`, `/demo`, `/legal/*`, `/status` static/edge. Browser auth uses the same-origin `/api/auth/*` allowlist; the Edge proxy forwards only approved Neon Managed Auth operations and keeps the opaque session in an `HttpOnly` cookie. Every private request resolves the cookie with Neon Auth, verifies the returned JWT against configured issuer/JWKS, and ignores browser-supplied bearer tokens, roles, and user IDs. Browser code never calls Neon Data API directly.
- For **state-changing finance commands**, require `Idempotency-Key` UUID (client-generated, stable across retry) and optional `If-Match: <entityVersion>` for conflict detection. Server enforces unique key **scoped to authenticated user and operation** and stores a canonical payload hash in `command_idempotency` in the same DB transaction. Reused key with different payload ⇒ `409 IDEMPOTENCY_KEY_REUSED`.
- JSON money format: `"amountMinor":"10000"`, `"currency":"IDR"`; no floats, no formatted `"Rp10.000"` in API. Timestamps ISO 8601 with offset/UTC plus separate `localDate` and user IANA `timezone` as applicable.
- Standard entity fields: `id`, `version`, `createdAt`, `updatedAt`, `status`, and owner implicitly derived from session. Client may receive `ownerId` on its own export, but never choose owner of a new record.
- Paginate list with `?cursor=<opaque>&limit=20` (max 100). Filter params allowlisted (category, kind, localDate range, wallet, status); default newest first with deterministic tie-break.
- Mutation payload validated with Zod/JSON Schema; unknown role/admin fields rejected. Responses `Cache-Control: no-store` for personal data; CSP, CSRF and CORS applied.
- General success JSON: `{ "data": {...}, "meta": { "requestId": "...", "version": 1 } }`; list has `data: []` and `page: { nextCursor, hasMore }`.

### Error envelope

```json
{
  "error": {
    "code": "BUDGET_WARNING_NOT_BLOCKER",
    "message": "Pengeluaran melebihi batas anggaran, tetapi tetap bisa dicatat.",
    "requestId": "req_...",
    "details": {"remainingMinor": "-1000"}
  }
}
```

- HTTP 400 invalid input; 401 unauthenticated; 403 action forbidden; 404 unknown **or hidden** object; 409 version/idempotency/conflict; 413 file too large; 422 semantically invalid (e.g. split mismatch); 429 quota; 502/503 dependency unavailable with retry guidance. No stack traces/SQL/secret in responses.
- `X-Request-ID` propagated between edge, bridge, service and audit. User-facing error translated ID/EN; internal codes stable.
- API role claim **never** taken from request body/JWT custom uncontrolled claim; app role fetched from trusted platform_roles and recent session.

## 2. Route inventory (public/user)

| Method + path | Role | Request → result / notes |
|---|---|---|
| `GET /api/v1/config/public` | guest | Safe feature availability, public status, locale; no endpoints/secrets |
| `GET /api/v1/security/sessions` | user+ | List current owner's safe session metadata only; never expose provider token, IP address or owner ID |
| `POST /api/v1/security/sessions/revoke` | user+ | Exact `{sessionId}`; owner-scoped resolve then revoke; hidden/foreign IDs return 404 |
| `POST /api/v1/security/sessions/revoke-others` | user+ | Exact empty object; retains current session |
| `POST /api/v1/security/sessions/revoke-all` | user+ | Exact empty object; revokes current session and expires the app cookie |
| `GET /api/v1/me` | user+ | Profile, own role, service availability, consent flags; no other users |
| `PATCH /api/v1/me` | user+ | name, locale, timezone, privacy preferences; `If-Match` |
| `GET /api/v1/onboarding` | user+ | current step, options, setup state |
| `POST /api/v1/onboarding/complete-step` | user+ | validate step, optional skip, never fake expense |
| `GET/POST /api/v1/wallets` | user+ | list/create wallet and optional opening event |
| `GET/PATCH /api/v1/wallets/:id` | owner | wallet details/update, concurrency version |
| `POST /api/v1/wallets/:id/archive` | owner | archive only when safe, history stays |
| `POST /api/v1/finance/transfer` | owner | fromWalletId,toWalletId,amountMinor,effectiveAt → single balanced event |
| `POST /api/v1/finance/adjustment` | owner | reconciled amount, reason, confirmation on negative |
| `GET/POST /api/v1/transactions` | owner | read filtered posted/voided history, or create posted event only after explicit user submit/confirmation; always balanced atomic write |
| `GET/POST /api/v1/transaction-drafts` | owner | draft list/create server-side, no ledger effect; source validated; safe ID replay |
| `GET/PATCH /api/v1/transaction-drafts/:id` | owner | read/revise own unposted draft with version check |
| `POST /api/v1/transaction-drafts/:id/confirm` | owner | one user-confirmed atomic posted event; idempotent and linked to source draft |
| `POST /api/v1/transaction-drafts/:id/cancel` | owner | cancel draft without posting or altering prior posted event |
| `GET/PATCH /api/v1/transactions/:id` | owner | detail/edit creates revision, not destructive overwrite |
| `POST /api/v1/transactions/:id/void` | owner | compensating reversal event, reason, confirmed |
| `POST /api/v1/transactions/:id/restore` | owner | valid restore from void, immutable audit |
| `POST /api/v1/transactions/:id/refund` | owner | reversal/refund amount ≤ eligible value |
| `POST /api/v1/transactions/:id/splits` | owner | categories allocations sum amount exactly |
| `POST /api/v1/transactions/deduplicate` | owner | compare candidates; merge or keep separate with consent |
| `GET/POST /api/v1/categories` | owner | categories/subcategories, archive/list/history safe |
| `GET/POST /api/v1/budgets` | owner | budget rules and category envelope |
| `GET/PATCH /api/v1/budgets/:id` | owner | period, rollover/warnings; reallocation separate |
| `POST /api/v1/budgets/:id/copy-period` | owner | new period not overwriting previous |
| `POST /api/v1/budgets/reallocate` | owner | planned amount only, no ledger postings |
| `GET /api/v1/budgets/summary` | owner | actual/provisional/estimates clearly separated |
| `POST /api/v1/budgets/simulate` | owner | preview only, no finance mutation |
| `GET/POST /api/v1/goals` | owner | savings goal and contributions |
| `POST /api/v1/goals/:id/contribute` | owner | must link finance event; no double count |
| `GET/POST /api/v1/debts` | owner | owed by/to user, payable/receivable opening event, balances and outflow category policy |
| `POST /api/v1/debts/:id/payments` | owner | atomic liability/asset event |
| `GET/POST /api/v1/recurring` | owner | rules, due schedule, preview |
| `POST /api/v1/recurring/:id/confirm` | owner | user confirms actual occurrence, idempotent |
| `GET/PATCH /api/v1/day-reports/:date` | owner | partial/done/zero, not automatically zero |
| `GET /api/v1/insights` | owner | date range, breakdown, compare, data provenance |
| `GET /api/v1/dashboard` | owner | trusted aggregate labels; no raw Chat data |
| `GET /api/v1/export/jobs` + `POST ...` | owner | jobs for CSV/JSON, status, signed authorized download |
| `POST /api/v1/imports/preview` | owner | map CSV, detect invalid and duplicate |
| `POST /api/v1/imports/:id/commit` | owner | atomic/idempotent batch; results + optional rollback |

## 3. Uploads, AI and offline routes

| Method + path | Role | Contract |
|---|---|---|
| `POST /api/v1/proofs/uploads` | owner | content type/size/sha256 intent; creates private upload intent with short-lived, owner-bound upload token (not R2 credentials) |
| `PUT /api/v1/proofs/uploads/:id/content` | owner | streams validated bytes via Cloudflare Worker R2 binding; no browser R2 key, strict byte/MIME limits; object untrusted until `complete` |
| `POST /api/v1/proofs/uploads/:id/complete` | owner | inspect object metadata + authorization, validate type/magic bytes, enqueue job if allowed |
| `GET /api/v1/proofs/:id` | owner | metadata/status, no public R2 key disclosure |
| `GET /api/v1/proofs/:id/content` | owner | authorized download/stream, `no-store` |
| `DELETE /api/v1/proofs/:id` | owner | honor retention/ongoing review, audit |
| `GET /api/v1/review-inbox` | owner | pending/provisional/duplicate/conflict candidates |
| `GET /api/v1/extractions/:id` | owner | state, field evidence, retry, conflict, user actions |
| `POST /api/v1/extractions/:id/confirm` | owner | approve/edit, creates one posted finance event (idempotency required) |
| `POST /api/v1/extractions/:id/reject` | owner | reject candidate, no posting |
| `POST /api/v1/extractions/:id/retry` | owner | rate-limited, no repeated posting |
| `POST /api/v1/extractions/:id/reconcile` | owner | resolve OCR↔AI conflict; audited |
| `POST /api/v1/text/parse` | owner | text parser preview, multi-item array, no posting |
| `POST /api/v1/sync/mutations` | owner | batch device mutations with stable IDs, returns per-item status |
| `GET /api/v1/sync/status` | owner | queue/conflict server summary |
| `POST /api/v1/sync/conflicts/:id/resolve` | owner | `server/local/merge` with preview and audit |

### Same-origin auth proxy allowlist

`/api/auth/*` is not a pass-through proxy. The only currently implemented methods are `GET /get-session` and `POST /sign-in/email`, `/sign-out`, `/sign-up/email`, `/email-otp/send-verification-otp`, `/email-otp/verify-email`, `/forget-password/email-otp`, and `/email-otp/reset-password`. Unknown path/method, cross-origin mutation, unapproved body field, oversized body, redirect, unverified email, and disabled signup fail closed. Provider session/JWT fields and response headers are stripped; only a validated opaque cookie is returned to the same origin. Successful inbox/OTP and reset-password flows are not yet live-tested, so this contract does not enable public signup by itself.

### Finance create example

Request:

```json
{
  "kind":"expense",
  "walletId":"<uuid-milik-user>",
  "amountMinor":"10000",
  "currency":"IDR",
  "categoryId":"<uuid-milik-user>",
  "effectiveAt":"2026-10-23T12:30:00+07:00",
  "note":"Lauk"
}
```

Response success (`201`): `data = { id, kind, status:"posted", amountMinor:"10000", walletId, categoryId, version:1, impacts:{ walletBalanceMinor, categoryBudgetRemainingMinor } }`. Draft/provisional path has **no impacts as if posted**. `POST /transactions` commits on explicit user action, while save-for-later uses `/transaction-drafts`. WA parser and recurring templates create drafts, not automatic ledger posts.

## 4. WhatsApp bridge-safe routes

| Method + path | Role | Behavior |
|---|---|---|
| `GET /api/v1/whatsapp` | owner | modes, own links/health/status, consents |
| `POST /api/v1/whatsapp/shared/start` | owner | begin link with short code/challenge, opt-in |
| `POST /api/v1/whatsapp/shared/verify` | owner | confirm code issued by bot via verified message; TTL/attempts |
| `POST /api/v1/whatsapp/personal/devices` | owner + flag | allocate **one** GOWA slot for owner; never arbitrary device list |
| `POST /api/v1/whatsapp/personal/pairing-code` | owner | phone masked; short TTL; privacy disclosure prerequisite |
| `GET /api/v1/whatsapp/personal/qr` | owner | ephemeral QR (no caches/logs); only own device |
| `GET /api/v1/whatsapp/personal/status` | owner | server-confirmed state, backoff/cooldown polling |
| `POST /api/v1/whatsapp/personal/reconnect` | owner | resync via GOWA if eligible; no forced logout |
| `POST /api/v1/whatsapp/personal/logout` | owner | unlink from WhatsApp, keep slot |
| `DELETE /api/v1/whatsapp/personal/device` | owner | destroy slot/sessions after reauth; finance records untouched |
| `GET/PATCH /api/v1/whatsapp/preferences` | owner | allowed chats, content scope, reminders, opt-out, quiet hours |
| `POST /api/v1/whatsapp/stop` | owner | immediate STOP for non-security messages |

**GOWA endpoint details** are mapped only inside [`TRD-03-INTEGRATIONS-JOBS.md`](./TRD-03-INTEGRATIONS-JOBS.md), not exposed to browser. Browser cannot supply raw GOWA `device_id` and thereby choose another account; edge resolves from DB identity.

## 5. Privacy, support, operations

| Method + path | Role | Behavior |
|---|---|---|
| `GET/PATCH /api/v1/consents` | owner | grant/revoke per purpose and policy version |
| `GET/POST /api/v1/support/tickets` | owner | list/create own, optional scoped attachment |
| `GET/PATCH /api/v1/support/tickets/:id` | owner | own ticket read/reply/revoke shared scope |
| `POST /api/v1/privacy/export` | owner + step-up | records data request; scoped export |
| `POST /api/v1/privacy/delete-account` | owner + step-up | consent revoked, soft freeze, deletion lifecycle |
| `GET /api/v1/privacy/requests/:id` | owner | status/progress of own export/delete request |
| `GET /api/v1/notifications` | owner | own notifications, unread, settings |
| `GET /api/v1/admin/overview` | admin+ | aggregate users/jobs/alerts, NO ledgers |
| `GET /api/v1/admin/users` | admin+ | limited account metadata; redaction |
| `POST /api/v1/admin/users/:id/suspend` | admin+ | reason, anti-self-elevation audit |
| `GET/PATCH /api/v1/admin/tickets/:id` | admin+ | only user shared subset; expiry enforced |
| `GET /api/v1/admin/jobs` | admin+ | status and error codes only, not image contents |
| `GET /api/v1/admin/audit` | admin+ | constrained operational events |
| `GET /api/v1/system/health` | superuser | integrated health and costs; secrets masked |
| `PATCH /api/v1/system/quotas` | superuser + reauth | versioned quota policy + rollback |
| `PATCH /api/v1/system/flags` | superuser + reauth | feature gating / emergency stop |
| `POST /api/v1/system/roles/assign` | superuser + MFA | **only user↔admin changes**; reason + step-up + audit; no superuser grant/removal via public API; bootstrap/break-glass reviewed procedure only |
| `POST /api/v1/system/credentials/rotate` | superuser + MFA | delegated secret rotation with safe confirmation, never return secret value |
| `GET /api/v1/system/data-requests` | superuser | metadata/progress only, no export content |
| `GET/PATCH /api/v1/system/public-content` | superuser | reviewed policies/changelog/status incident |

## 6. Internal-only contracts

- **Worker notification bridge (path-based, bukan hostname baru):** `POST https://gowa.venlab.tech/internal/v1/jobs/notify` only service-origin with `CF-Access-Client-*`, signed body/nonce, replay cache. Request `{jobId,eventType,version}`; 202 accepted when durable existence confirmed. Never send image bytes or model secrets in this request.
- **Finance Worker** consumes GOWA local signed webhook, validates `X-Hub-Signature-256` against raw body before parsing; HTTP 2xx only after durable inbox row, no long LLM call synchronously in GOWA webhook.
- **Neon** is durable work queue/outbox; `/internal` endpoints **not accessible** to user browser role, even if hostname guessed.
- CF edge may return `202 PENDING` when bridge offline. Armbian worker drains backlog on startup + low-frequency reconciliation; browser polls only while review page is active with backoff, not globally every few seconds.

## 7. Versioning / deprecation

- Keep `/api/v1` compatible during migration: additive response fields okay, breaking fields require `/v2` or ADR with migration window.
- Zod schemas in `packages/contracts` generate typed client tests; server is always source of authorization and validation.
- Every route has contract tests: unauthenticated, cross-tenant, invalid input, idempotent replay, dependency unavailable, and successful state transition.
