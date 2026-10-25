# Neon — scope and staging status

This file records the current VenFinance Neon setup and the safe path for further work. The latest read-only project, branch, and endpoint check is in [`qa/neon-readiness-2026-10-24.json`](../qa/neon-readiness-2026-10-24.json); the live P0-005 result and blockers are also recorded there. The refreshed resource and quota evidence is [`qa/p0-008-resource-readiness-2026-10-25.json`](../qa/p0-008-resource-readiness-2026-10-25.json).

| Resource | Current verified state |
| --- | --- |
| Organization / project | VenFinance / `org-snowy-scene-55200104`; project `hidden-unit-95812377`, AWS `aws-us-east-2`, PostgreSQL 18 |
| Production branch | `production` / `br-rapid-band-b4jw3tlq`, default, not protected; Neon Auth and application migrations are not enabled there |
| P0-005 staging branch | `venfinance-p0-auth-20261024` / `br-aged-mode-b4rcy9i0`, child branch; 0.25-CU endpoint exists and was idle at the latest read |
| Staging Auth/schema | Neon Managed Auth and Data API are enabled on staging; migrations `0000`–`0004` and synthetic A/B identity probes exist there |
| Staging identity result | Tenant A/B isolation, anonymous denial, tampered JWT denial, and forged-owner denial passed; post-sign-out replay remains accepted until the 900-second JWT expires, so session revocation is not proven |
| Neon plan and caps | API reports `free_v3`, 10 branches/project, 1 GiB branch logical-size limit, 6-hour history; endpoint limits are 0.25–2 CU on production and 0.25 CU on staging |
| R2 | `ven` is production; `ven-staging` exists for QA. Both are Standard/APAC with `r2.dev` disabled. Bucket `sap` was not accessed. |

The Neon Free plan currently includes 100 CU-hours, 1 GB PostgreSQL storage and 5 GB public network transfer per project per month. It scales idle computes to zero after five minutes and suspends compute when compute/network limits are exhausted; storage and branch caps block growth. These are service limits, not a per-feature guarantee of uninterrupted free use. Neon documents project usage fields as approximate rather than billing/metering evidence. See [Neon Free limits](https://neon.com/faqs/free-plan-limits-and-quotas) and [consumption limits](https://neon.com/docs/guides/consumption-limits).

Cloudflare R2 Standard includes 10 GB-month storage, 1 million Class A requests and 10 million Class B requests per month; egress is free and overage can be billed. The approved production bucket and the QA bucket each have managed public access disabled, no custom domains, no object-lock rules, and only the default seven-day incomplete-multipart abort rule. CORS is absent, which is expected for same-origin Worker binding uploads. Account-level R2 metrics aggregate all buckets, so they were not queried because this project scope excludes other project buckets. See [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/).

## Staging and migration path

The Cloudflare binding `PROOFS` now targets `ven-staging` in `infra/wrangler.staging.jsonc`. A local Wrangler dry-run passed and confirmed that binding; it did not deploy a Worker. The production config continues to bind `PROOFS` to `ven` and has not been deployed.

The local proof adapter validates owner identity, MIME signature, SHA-256, size, short-lived upload capability, and object metadata with a fake R2 adapter. It is not yet wired to authenticated Worker routes or Neon proof metadata functions. A live A/B upload/read check against `ven-staging` remains required before P0-008 can pass.

The staging branch contains migrations `0000`–`0004`; repository migrations `0005` onward, including the current debt migration, have not been applied to Neon. Before applying them, verify the actual staging schema and migration history, run the SQL on an isolated test database/branch, exercise owner RLS and rollback, and confirm the result through the actual Hono Worker. Keep the production branch untouched during that work.

## Remaining release gates

- P0-005 remains blocked until session revocation works through the production-shaped Worker boundary, direct signup/email verification is proven, and operator MFA/step-up is enforced. The Managed Better Auth roadmap still does not supply the required operator MFA; follow [`research/adr/ADR-0001-OPERATOR-MFA.md`](../research/adr/ADR-0001-OPERATOR-MFA.md).
- P0-008 remains in progress until staged Worker R2 owner-isolation tests, usable quota/alert controls and the cost/retention policy are evidenced. Do not mark it done from metadata or mocked adapters alone.
- P1-007 and dependent schema/auth tasks remain gated on the P0 evidence. The production branch currently has no application migration or Auth change.
- Production still requires the complete acceptance matrix, backup/restore rehearsal, external provider and legal gates, and explicit go-live approval.

The Neon MCP connection is available and is the preferred management path; CLI login is not required for the current MCP-based work. Do not place a connection string, API key, session token, or other secret in chat, repository files, test output, or screenshots. Do not delete a branch or apply a production migration without explicit approval for that exact operation.
