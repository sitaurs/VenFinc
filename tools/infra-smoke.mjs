import assert from "node:assert/strict";
// Fixed loopback target. This command never touches Cloudflare/Neon production.
const base = "http://127.0.0.1:5173";
try {
  const html = await fetch(base);
  assert.equal(html.status, 200);
  assert.match(await html.text(), /<div id="root"><\/div>/);
  const health = await fetch(`${base}/api/v1/health`);
  assert.equal(health.status, 200);
  assert.match(health.headers.get("cache-control") ?? "", /no-store/);
  const body = await health.json();
  assert.equal(body.data.api, "available");
  assert.equal(body.data.services.database, "not_configured");
  assert.equal(body.meta.version, 1);
  const denied = await fetch(`${base}/api/v1/me`, {
    headers: { "X-Role": "superuser", "Sec-Fetch-Mode": "navigate" },
  });
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get("content-type") ?? "", /application\/json/);
  console.log(
    JSON.stringify({
      status: "PASS",
      scope: "local static assets + real workerd Hono route + fail-closed API",
      externalProvidersTested: false,
    }),
  );
} catch (error) {
  console.error(
    JSON.stringify({
      status: "FAIL",
      scope: "local smoke",
      reason: error instanceof Error ? error.message : "Unknown error",
    }),
  );
  process.exitCode = 1;
}
