import { describe, expect, it, vi } from "vitest";
import { app } from "./index";

describe("P1 API security boundary (not a live RLS proof)", () => {
  it('creates independent correlation IDs and ignores a caller-supplied ID', async () => {
    const first = await app.request('/api/v1/health', { headers: { 'X-Request-ID': 'untrusted-caller-id' } });
    const second = await app.request('/api/v1/health');
    expect(first.headers.get('X-Request-ID')).not.toBe(second.headers.get('X-Request-ID'));
    expect(first.headers.get('X-Request-ID')).not.toBe('untrusted-caller-id');
  });
  it('redacts internal exceptions without logging the raw error', async () => {
    const canary = 'CANARY_SENSITIVE_SYNTHETIC_TEST_ONLY';
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(Date.prototype, 'toISOString').mockImplementationOnce(() => { throw new Error(canary); });
    try {
      const response = await app.request('/api/v1/health');
      const body = await response.text();
      expect(response.status).toBe(500);
      expect(body).toContain('INTERNAL_ERROR');
      expect(body).not.toContain(canary);
      expect(JSON.stringify([...logged.mock.calls, ...output.mock.calls])).not.toContain(canary);
      expect(JSON.parse(body).error.requestId).toBe(response.headers.get('X-Request-ID'));
    } finally { vi.restoreAllMocks(); }
  });
  it("reports only the API process as available", async () => {
    const r = await app.request("/api/v1/health");
    const body = await r.json();
    expect(r.status).toBe(200);
    expect(body.data.services.auth).toBe("not_configured");
    expect(body.data.services.database).toBe("not_configured");
    expect(r.headers.get("Cache-Control")).toContain("no-store");
    expect(r.headers.get("X-Request-ID")).toBe(body.meta.requestId);
  });
  it.each([
    "/api/v1/me",
    "/api/v1/transactions/victim",
    "/api/v1/system/roles/assign",
    "/api/v1/whatsapp/personal/status",
  ])("denies forged owner/role for %s", async (path) => {
    const r = await app.request(path, {
      headers: {
        Cookie: "userId=victim; role=superuser",
        "X-User-Id": "victim",
        "X-Role": "superuser",
      },
    });
      expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("victim");
  });
  it("rejects cross-origin state-changing requests before any handler", async () => {
    const r = await app.request(
      "https://finance.venlab.tech/api/v1/transactions",
      {
        method: "POST",
        headers: {
          Origin: "https://attacker.invalid",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "superuser", userId: "victim" }),
      },
    );
    expect(r.status).toBe(403);
  });
  it("does not expose service credentials or fabricate provider availability", async () => {
    const r = await app.request("/api/v1/config/public");
    const body = await r.json();
    expect(body.data.authAvailable).toBe(false);
    expect(body.data.registrationOpen).toBe(false);
    expect(body.data.aiAvailable).toBe(false);
    expect(JSON.stringify(body)).not.toMatch(
      /DATABASE_URL|CF-Access-Client-Secret|device_id|password/i,
    );
  });
});
