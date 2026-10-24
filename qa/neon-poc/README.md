# P0-005 Neon Auth + RLS local proof

This disposable QA harness targets only Neon project `hidden-unit-95812377`, staging branch `br-aged-mode-b4rcy9i0`, and its `neondb` database. The staging Data API exposes only `p0_005_poc`, with browser CORS limited to the local Hono Worker. It does not use or configure the `production` branch. The local Worker is a separate entrypoint and is never deployed.

The harness creates only synthetic `.invalid` accounts. Keep `qa/neon-poc/.dev.vars` and `.env.local` local; both must remain untracked. The database URL must use the dedicated `venfinance_p0_worker` principal with `NOBYPASSRLS`, never `neondb_owner`. No token or password belongs in screenshots, test output, or committed files.

## Local settings

Copy `.dev.vars.example` to `.dev.vars` and `.env.local.example` to `.env.local`. Set the staging Auth base URL and JWKS URL in both files. In `.dev.vars`, set the exact Auth issuer from the verified JWT `iss` claim (it may be the Auth host origin rather than the Auth API base URL) and the staging Data API URL. Keep its file mode at `0600`.

Start the local test page with `pnpm --filter @venfinance/qa-neon-poc dev` and the disposable Worker with `pnpm --filter @venfinance/qa-neon-poc worker`. The worker uses only loopback ports and refuses requests unless `P0_ENABLED=1`.

Do not mark P0-005 done until user A/B isolation, anonymous/tampered-token denial, forged-owner denial, and session-revocation behavior have real browser evidence. Operator MFA and production email verification remain separate release gates.
