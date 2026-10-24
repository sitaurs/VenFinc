# TRD-05 — Deployment, Secrets, Availability, Limits & Runbooks

**Environments:** `local`, `staging`, `production`. **Sasaran:** biaya cloud serendah mungkin; **$0 only if all quotas, account plans, and provider usage stay within free allowances**. No claim of SLA 24/7 from free providers/home server.

## 1. Environment deployment map

| Environment | Frontend/API | Database | Storage | GOWA/9router/worker |
|---|---|---|---|---|
| local | `wrangler dev` via Cloudflare Vite plugin | separate disposable Neon dev branch or local PG w equivalent RLS | R2 dev bucket/miniflare binding | fake adapters by default, opt-in local Docker |
| staging | `staging-finance.venlab.tech` CF Worker preview project | Neon staging branch/project, isolated auth users | separate private R2 staging | Armbian staging worker / fake GOWA session; no real bulk messaging |
| production | `finance.venlab.tech` single Worker+assets | Neon production | R2 private Standard production | `gowa.venlab.tech`, `9r.venlab.tech` via one CF Tunnel; finance worker receives restricted `/internal/v1/*` path on `gowa` |

All config from environment-specific bindings/secrets; no production secrets in preview deployments. Deployment pipeline must approve reviewed branch and run contract/security/golden monetary tests before production.

## 2. Single Cloudflare Worker responsibilities

- Deployment uses Cloudflare Vite plugin to bundle React/Vite static assets and Hono API into **one Worker application**. `routes` `/api/v1/*` by Hono and SPA HTML fallback for client router; static assets cached via CF platform.
- Use `wrangler.jsonc` with bindings for R2 bucket, `DATABASE_URL`/Auth origin/Access service tokens as environment secrets. All secrets in Cloudflare dashboard or CI secret store, never checked in `.dev.vars` or screenshot.
- **Workers Free (verified 2026-10-23):** 100,000 dynamic requests/day account-wide, 10ms CPU/request, 128MB memory; static asset requests excluded from Workers dynamic count when served as static assets. CPU is execution CPU, but framework boot/schema validation/signature code **must be profiled**. See SOURCES.
- Use `Cache-Control: private, no-store` for every financial read; caching only public/static and safely keyed demo. No periodic automatic dashboard polling that drives 100k/day on its own.
- If Edge CPU/auth flow exceeds Free allowance in P0, optimize routes or propose a **decision-recorded** alternative; **do not** bypass auth/security to fit 10ms.

## 3. Neon PostgreSQL configuration

- Production DB and Managed Neon Auth in region geographically reasonable for Indonesia and available plan (verify live region). Use pooled/serverless HTTP driver, transaction functions, RLS identity.
- Enable email verification; **Neon Managed Auth shared mail transport is not considered production-ready email delivery** without reviewing production custom SMTP requirement. Product owner may approve a dedicated provider/plan or private beta; no pretend account activation works in public.
- **Neon Free (as of 2026-10-02):** 1 GB DB/project, 100 CU-hours/project/month and scale-to-zero. Monitor daily and monthly; traffic/transfer/mail limits also apply. DB capacity is not guaranteed for arbitrary public users. Do not poll every few seconds from Armbian; use event notification plus 30min reconciliation.
- Include backups **outside** default restore window; export encrypted incremental/full snapshot to private offsite storage, retention and restore drill approved. Don't put Neon direct full connection string into client.

## 4. Cloudflare R2

- Bucket Standard class only, private binding from Worker. **Chosen upload path:** browser → same-origin owner-checked streaming `PUT /api/v1/proofs/uploads/:id/content` → R2 binding; no S3 credentials, public R2 URL, or long-running image transform in Worker. Image storage is for screenshot/struk with user consent; upload limit example 5 MiB, image dimensions guard, generated content must be purged per retention.
- **R2 free allowance (as of Oct 2026):** 10 GB-month Standard, 1M Class A/month, 10M Class B/month, egress free. Beyond free tier can **bill**, and activation can require payment details. Bucket has lifecycle/retention and alerts well before quota reached.
- Example effective guard: globally warn at 60%, stop optional noncritical uploads at 85% until operator reviews; never block manual transaction entry. Threshold configurable Superuser and **not** new plan tier.
- File size and upload frequency quotas per user (illustrative defaults 5 MiB and 100 MiB retained/user, 5 image AI analyses/day); these are rollout defaults pending bench.

## 5. Armbian services (Docker Compose)

```text
/opt/venfinance/
  compose.yml                  # pinned image digests, no secrets
  env/                         # restrictive root-only secret files
  volumes/gowa/                # auth/session/chat store - encrypted backup/private
  volumes/9router/             # 9router durable configuration/keys
  volumes/finance-worker/      # local spool/temp/cache only
  backups/                     # encrypted & access restricted
```

- `gowa`: ARM64 compatible pinned image, persistent auth/session volume, `APP_BASIC_AUTH`, secret webhook, ignore unrelated groups/status, limit media auto-download, healthcheck and auto-restart; remote UI disabled unless operator specifically needs access.
- `9router`: ARM64 compatible pinned image, stable provider configuration, API key enforcement, healthcheck, no unauthenticated public proxy; local Finance Worker uses Docker private network. Vision forwarding proof test required.
- `finance-worker`: Node.js 24 LTS, long-running limited memory/concurrency, consumes GOWA signed local webhooks, sends scheduled reminders, processes OCR/AI jobs, checksum/metadata, queue recovery.
- `cloudflared`: one tunnel, two tunnel hostnames (`gowa`, `9r`), path-scoped `gowa/internal/v1/*` to finance-worker, Access service policies; no public host ports or port-forward on home router; no extra `bridge` hostname by default. Prefer `localhost` to protected service or internal Docker network binding.
- Resource bench must precede enabling many personal GOWA sessions; GOWA stores per-linked-device state, memory scales with active sessions. Cap sessions using measured RAM/CPU, not a guessed capacity.
- Service start order, persistent volumes and graceful SIGTERM define shutdown; retries use backoff. Disk-pressure stops optional media before corrupting sessions.

## 6. Cloudflare Tunnel & Access deployment

- DNS is already Cloudflare-managed for `venlab.tech`, so `finance.venlab.tech`, `gowa.venlab.tech`, `9r.venlab.tech` need no newly purchased apex domain.
- `finance` custom domain -> Cloudflare Worker, **not through the Armbian Tunnel**.
- `gowa` -> for path `^/internal/v1/` local Finance Worker restricted API **first**, remaining path -> local GOWA API; `9r` -> local AI gateway. ALL private services behind Access policy and their own service authentication, protected with TLS. Application path Access must be proven to deny unauthorized traffic to `/internal/v1/*` independently of other GOWA API paths.
- **Locally-managed Tunnel ingress order (illustrative, not ready-to-run):** first `hostname: gowa.venlab.tech` + `path: ^/internal/v1/` → finance-worker; next `hostname: gowa.venlab.tech` → GOWA; next `hostname: 9r.venlab.tech` → 9router; last catch-all `http_status:404`. `cloudflared` forwards original path unchanged. Dashboard-managed setup must demonstrate equivalent routing or require ADR. Test traversal and alternate spellings, including path-normalization behavior (`cloudflared` 2026.10.0+).
- CF Access service-token headers (internal only): `CF-Access-Client-Id`, `CF-Access-Client-Secret`; send only from server Worker, never to PWA JS. GOWA Basic Auth and 9router API key still required behind Access.
- Rotation: access service secret, GOWA auth, 9router key and R2 credentials independent and revocable. No copy of secrets in debug URL/console screenshots.

## 7. Graceful degradation/incident outcomes

| Failure | User sees | Recovery |
|---|---|---|
| Armbian completely offline | Manual PWA works; image job `waiting for processor`; WA unavailable | queued jobs in Neon, rerun on boot, no duplicate |
| GOWA down or unpaired | WhatsApp status disconnected and re-pair instructions; no fake success | restart/reconnect, state check, never use another session |
| 9router / LLM 429 | OCR fallback + provisional + queued AI recheck | backoff, circuit breaker, user confirmation |
| OCR unsupported file/blur | Manual review with original image/download | correct input/re-upload |
| Neon quota exhausted | Financial server writes temporarily unavailable; offline drafts saved locally if enabled | throttle background polls, recover quota/upgrade only with approval |
| R2 over quota | Manual entry remains; media uploads disabled with clear status | retention cleanup/capacity review |
| CF Workers daily requests cap | static PWA may still load but API could be unavailable | monitor rate, graceful offline drafts, investigate abuse |
| User withdraws consent mid-job | Queue task cancelled if unsent, safety state shown | user manually enters without AI |
| Backup failure | Superuser alert with no raw data; gate major migrations | retrigger, diagnose, restore rehearsal |

## 8. Observability and capacity targets

- Logs JSON structured redacted; data: request ID, tenant hash (nonreversible), route, duration, response, job ID, error code, optional provider ID; **no raw receipt, QR, WhatsApp phone/chat, API keys, auth token, prompt**.
- Health of Worker, Neon, R2, Tunnel, GOWA, 9router, AI/OCR worker. Use low-frequency checks and report `degraded` honestly; control panel never claims universal healthy based on stale last status.
- Quota display global and per-user; `CF request/day`, Worker CPU percentiles, Neon CU/GB/transfer, R2 GB/Class A/B, GOWA sessions active, 9router upstream failures/latency, queue oldest age.
- Rate-limiting: account creation + Turnstile, login/backoff, expensive AI uploads, pairing code, message sends, account export/delete; all configurable; abuse stops long before provider overages.
- NFR targets from `QUAL-*` include p75 LCP <=2.5s, non-AI API p95 <=1.5s under recorded workload; never promise for all geographic/network conditions without measurement.

## 9. Disaster recovery and staged release

1. DB migration backup+dry run on staging first; strict migration owner (different from runtime role).
2. Worker can be rolled back to previously verified deployment; schema migrate expand/contract compatibility ensured.
3. Compose images pinned + health smoke before rollout; volumes not overwritten; test service startup and personal-session continuity.
4. Daily encrypted backup job proposed with configurable retention, restore drill monthly (initial); verify restores from backup, not just backup job success.
5. Public status page describes incidents and available manual workflow. In a prolonged interruption, prevent reminders from being mass-sent after restart.

## 10. Cost/launch decisions unresolved

Do not claim **full-free unlimited production**. Track: Neon custom SMTP/email deliverability, Cloudflare R2 billable overages, Armbian electricity/connectivity, privacy/legal review, WhatsApp unofficial service policy, 9router upstream credits/cost. **Public launch gate** blocks on unresolved production identity and session risk.
