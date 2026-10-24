# TRD-04 — Security, Privacy, Role & Data Protection

**Target:** application holds *personal financial data* and optional WhatsApp identity/media, so never treat it like non-sensitive demo content. Mapping: [`REQ-07-TRUST`](../requirements/REQ-07-TRUST.md), [`REQ-01`](../requirements/REQ-01-PRODUCT-IAM.md).

## 1. Threat boundaries and controls

| Threat | Mandatory control / test |
|---|---|
| Tenant IDOR via URL/guessable UUID | API owner lookup from verified session + DB RLS `auth.user_id()`; A→B reads/writes never reveal existence |
| User forges role | Role stored server-side; no role signup/user writable; admin mutations step-up & audit |
| Admin reads private ledger/chat | no finance search permissions across users; support via explicit scoped/time-limited grant; all access audited |
| GOWA untrusted official status | GOWA Basic Auth & Cloudflare Access; browser never sees credentials/device list; private sessions feature-gated |
| 9router unauthorized access | Access service token, 9router key, local container isolation; no public unauthenticated proxy |
| Webhook replay/signature spoof | verify HMAC raw body in constant time; max body size, TTL/nonce if applicable, durable unique message ID |
| Double-spend/double expense | atomic ledger posting, unique idempotency, isolation + high-concurrency tests |
| CSRF/session fixation | Secure HttpOnly SameSite cookie on appropriate domain; Origin/CSRF policy for writes; rotate/revoke sessions |
| XSS/CSV formula injection | escape user/AI text, Content Security Policy, safe CSV export spreadsheet-injection neutralization |
| Upload malicious content | type/magic bytes/size/dimensions validation, no executable format, no public bucket, EXIF stripping |
| SSRF through image URLs | disallow remote URLs from untrusted user/model; only private object bytes read by worker |
| Secrets/log leakage | env secret store; deny client bundle and logs of tokens/OTP/receipt; credential rotation and inventory |
| Offline data on shared phone | protect drafts at rest with WebCrypto-derived key and explicit per-device unlock/consent, avoid generic CacheStorage; clear access on logout; threat model includes XSS/device compromise; test privacy under refresh and account switch |
| WhatsApp personal chat access | filter allowed sources before app processing, informed opt-in, restrict GOWA storage access; no blanket chat ingestion |
| WhatsApp recipient identifier exfiltration | inbound lookup via keyed JID HMAC; sendable JID encrypted at rest, decrypt only in Armbian Worker for consented outbound; audit key rotation and erasure |
| Free-tier abuse | Turnstile on signup, rate limits, per-user AI/WA/upload quotas, emergency switch, admin overview |
| Restore/backup leakage | encrypted backup, access control, restore in isolated env; retention per approved policy |

## 2. Authorization matrix

| Operation | User | Admin | Superuser |
|---|---|---|---|
| Own ledger/receipts/savings/debts/WA | **Yes own only** | **Yes own only** | **Yes own only** |
| Search other user financial entries | **No** | **No** | **No** |
| View operational account metadata | Own | Limited, redacted | Limited, redacted |
| Support ticket with explicit data grant | Own | Within active grant | Within active grant if assigned/approved |
| Suspend/restraint User | No | Yes, reason+audit | Yes, reason+audit |
| Promote User→Admin | No | No | Yes, step-up+MFA+reason |
| Assign/remove Superuser | No | No | Restricted bootstrap/manual two-person review; not public API action |
| AI/GOWA/feature/quotas config | No | Read health as scoped | Change, MFA+audit+rollback |
| Raw integration service credentials | Never | Never | Never displayed; rotation action only |

## 3. Authentication + privileged accounts

- Managed Neon Auth: email verified before financial private access; Google OAuth optional after configured and tested. Use managed SDK; don't independently hash/store passwords. Auth remains source for session; application `platform_roles` separate.
- Bootstrap **first** Superuser via provisioning command/one-time audited admin operation, not through public registration. Never hardcode email in repo or URL param.
- MFA/step-up is mandatory for platform role changes, backups, credential rotation, user deletion; verify supported Managed Auth method, otherwise privileged launch **blocked** until secure compatible provider/flow. Do not silently replace MFA with password-only UI.
- Suspended users: revoke sessions/app access and optional integrations safely; preserve ability to submit appeal using limited public workflow.
- Auth secrets are distinct from GOWA/9router, Tunnel, Neon DB, R2. Each service gets least permissions.

## 4. Consent purpose matrix

| Purpose | Default | User must understand | Revocation effect |
|---|---|---|---|
| Manual finance | Core functionality | Data retained for bookkeeping | account delete/export route |
| AI receipt/image | Off | Images leave app to selected model gateway/provider, retention risks | stop unsent AI work, keep user-approved finance posts |
| WhatsApp shared bot | Off | Phone/JID linked, messages sent to bot, messaging risk | STOP/disable reminders, unlink identifier |
| WhatsApp personal session | Off + feature gate | Linked device may access chat context; third-party unofficial integration | log out/delete slot, stop processing; local session purge scheduled |
| WhatsApp eligible chats | Minimal allowlist | Which chats/messages will be parsed | immediate filtering on further events |
| Notifications | Off except security | Channel, quiet hours, per-user limits | no routine notices on opt-out |
| Support access | Off | Exactly what file/data, who, expiry | immediate revoke for future views |

Separate boolean consent and policy version stored with timestamps. **Do not** infer consent for AI from WhatsApp consent or vice versa. Each async job checks active consent again before dispatch and before sending to provider.

## 5. Object storage and data lifecycle

- R2 bucket always private; object names random tenant prefix, never contains phone/email/merchant in key. Upload via scoped short-lived capability or edge binding after account quota and MIME checks; no universal list or public R2 URLs.
- Browser gets preview/download only after edge session check; short TTL URLs treated as bearer credentials, no index/search engine, `Cache-Control: no-store`.
- Proof original and derivative files retain provenance, checksum, owner and expiry. OCR previews don't become stored training data by default.
- User export scoped CSV/JSON with explicit date and media choices, encrypted or short-lived signed download.
- Account delete lifecycle includes queued jobs, WA sessions, R2 objects, Neon data, logs/backups within retention obligations; user sees **pending/processed** not false claim of immediate erasure across backups.
- Indonesia UU No. 27/2022 concerning Personal Data Protection includes financial personal data; legal text/retention/timeframes must be approved before actual public launch. This spec does **not** certify regulatory compliance.

## 6. Observability without leaking private data

- `traceId`, route name, status code, latency histogram, job age, queue depth, connector health, quota usage; scrub PII and payloads.
- Don't use full chat/struk/raw AI prompt in monitoring. Operator dashboard sees aggregate counts and sample safe error codes; support grants time-limited.
- Security audit immutable: role changes, account suspend, consent, integrations, object access grant, export/delete, credential rotation, emergency stop. Include actor+reason+before/after masked summary and source context.
- Incident runbook must cover accidental exposed token, unauthorized access, data inconsistency, mass erroneous notification, cloud free-tier exhaustion and lost WhatsApp session.

## 7. Browser & CSP contract

- Restrict origins to production/staging domains; no `*` origin with credentialed requests.
- `Content-Security-Policy` default-src self; asset/font rules allow specific trusted origins only, image R2 through safe route; upgrade insecure requests, frame restrictions; no inline unreviewed script.
- PWA offline cache **never** stores personalized API responses in publicly shared CacheStorage; IndexedDB drafts scoped to verified account and device, encrypted with a WebCrypto key recoverable only through user-authorized device unlock. After logout, remove/deactivate local decryption key and purge account caches; if user opts to retain encrypted offline drafts, they remain inaccessible until reauthentication/device unlock. **Do not promise cryptographic protection against active XSS, rooted/shared devices, or browser extension compromise.** P5 must test logout→different user, refresh, key loss/recovery, and queue expiry. Avoid sensitive push notification bodies by default.
- URL query tokens not used for login/WS GOWA; pairing/QR ephemeral secrets not logged and masked from analytics/screenshot collection.

## 8. Production security gates

1. Tenant A/B red-team test across every private route, R2 object and GOWA session.
2. Automated dependency/SAST/secret scan, CSP security header check, CSRF attack test.
3. WA policy/privacy review with product owner approval before enabling nonofficial integration for public signups. Safer official WhatsApp Business Platform replacement path documented as separate integration.
4. Contract tests prove AI consent checks, OCR race, no silent write; admin permissions examined by negative tests.
5. Production authenticated email+MFA are genuinely functioning; staging UI alone does not qualify.
6. Privacy policy/terms legal reviewed, data lifecycle restore tested.
