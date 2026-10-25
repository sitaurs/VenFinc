# P0-005 Neon Auth + RLS local proof

This disposable QA harness targets only Neon project `hidden-unit-95812377`, staging branch `br-aged-mode-b4rcy9i0`, and its `neondb` database. It uses the application Worker auth boundary: browser requests go through same-origin `/api/auth/*`, the session cookie is HttpOnly, and each private Worker request calls Neon Auth `/get-session` before forwarding the provider JWT server-side to the staging Data API. The browser never receives or stores a bearer JWT. This local Worker is a separate entrypoint and is never deployed.

The browser test uses two existing, owner-controlled, verified staging accounts. It does not create accounts or change Neon Auth configuration. Keep `qa/neon-poc/.dev.vars` and `.env.local` local and untracked. `.dev.vars` must contain only the staging Auth/JWKS/Data API endpoints and local feature flags. The Data API target is pinned in the Worker to the dedicated staging endpoint. The database URL must use the dedicated `venfinance_p0_worker` principal with `NOBYPASSRLS`, never `neondb_owner`. No token or password belongs in screenshots, test output, or committed files.

## Local settings

Copy `.dev.vars.example` to `.dev.vars` and `.env.local.example` to `.env.local`. Set the staging Auth URL, exact issuer, JWKS URL, and Data API URL in `.dev.vars`. Keep its file mode at `0600`. Set the two verified staging test-account credentials in `.env.local`; the test runner reads them locally and never prints them. Do not enable public signup to work around missing verified accounts or email delivery.

Start the local page with `pnpm --filter @venfinance/qa-neon-poc dev` and the disposable Worker with `pnpm --filter @venfinance/qa-neon-poc worker`. Both bind to loopback. The Worker refuses requests unless `P0_ENABLED=1`; auth proxy settings remain local and do not modify hosted settings.

Run the live test with `pnpm --filter @venfinance/qa-neon-poc exec node test_auth.mjs`. It checks anonymous and bearer-only rejection, hidden JWT headers, HttpOnly cookies, verified same-origin sign-in, A/B row isolation, forged-owner rejection, and stale-cookie replay after sign-out. Do not mark P0-005 done until this live test has real staging evidence and the remaining Auth, RLS, MFA, and architecture gates are resolved. A passing local mocked test does not replace this gate.
