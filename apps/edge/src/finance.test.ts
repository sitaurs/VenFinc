import { afterEach, describe, expect, it, vi } from "vitest";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { app } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function testBindings(handler: (url: URL, init: RequestInit) => Response | Promise<Response>) {
  const { publicKey, privateKey } = await generateKeyPair("EdDSA");
  const host = `ep-${crypto.randomUUID()}.neonauth.c-6.us-east-2.aws.neon.tech`;
  const authBase = `https://${host}/neondb/auth`;
  const issuer = `https://${host}`;
  const jwksUrl = `${authBase}/.well-known/jwks.json`;
  const jwk = await exportJWK(publicKey);
  const kid = crypto.randomUUID();
  Object.assign(jwk, { kid, alg: "EdDSA", use: "sig" });
  const token = await new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "EdDSA", kid })
    .setIssuer(issuer)
    .setSubject("verified-user-1")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    if (url.href === jwksUrl) {
      return new Response(JSON.stringify({ keys: [jwk] }), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      });
    }
    if (url.href === `${authBase}/get-session`) {
      return new Response(JSON.stringify({
        session: { id: "opaque-active-session" },
        user: { id: "verified-user-1", emailVerified: true },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Set-Auth-Jwt": token },
      });
    }
    return handler(url, init);
  }));
  return {
    token,
    bindings: {
      APP_ENV: "test",
      APP_ORIGIN: "https://finance.test",
      AUTH_PROXY_ENABLED: "1",
      PUBLIC_SIGNUP_ENABLED: "0",
      EMAIL_VERIFICATION_ENABLED: "1",
      NEON_AUTH_URL: authBase,
      NEON_AUTH_ISSUER: issuer,
      NEON_AUTH_JWKS_URL: jwksUrl,
      NEON_DATA_API_URL: "https://ep-api-test.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1",
    },
  };
}

function activeCookie() {
  return "__Secure-neonauth.session_token=opaque-active-cookie";
}

describe("private finance routes", () => {
  it("returns monthly budgets using the exact requested calendar month", async () => {
    let captured: unknown;
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/list_budgets");
      captured = JSON.parse(String(init.body));
      return Response.json([{
        budget_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
        name: "Kebutuhan",
        kind: "category",
        category_id: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
        category_name: "Makan",
        frequency: "monthly",
        timezone: "Asia/Jakarta",
        rollover_policy: false,
        warning_thresholds: [50, 75, 90, 100],
        period_starts_on: "2026-02-01",
        period_ends_on: "2026-02-28",
        planned_minor: "1500000",
        used_minor: "425000",
        remaining_minor: "1075000",
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/budgets?startsOn=2026-02-01&endsOn=2026-02-28", {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(captured).toEqual({ p_starts_on: "2026-02-01", p_ends_on: "2026-02-28" });
    expect(body).toContain('"plannedMinor":"1500000"');
    expect(body).toContain('"remainingMinor":"1075000"');
  });

  it("rejects partial budget months before contacting the database", async () => {
    const upstream = vi.fn();
    const setup = await testBindings(async () => {
      upstream();
      return Response.json([]);
    });
    const response = await app.request("https://finance.test/api/v1/budgets?startsOn=2026-04-01&endsOn=2026-04-29", {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("creates an idempotent monthly budget through the owner's verified session", async () => {
    let captured: Record<string, unknown> | undefined;
    const setup = await testBindings(async (_url, init) => {
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json([{
        budget_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
        period_id: "f08fab98-b8ab-4db7-a53c-2215f5b9a76c",
        name: "Kebutuhan",
        kind: "global",
        category_id: null,
        frequency: "monthly",
        starts_on: "2026-02-01",
        ends_on: "2026-02-28",
        planned_minor: "2500000",
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/budgets", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
        "Idempotency-Key": "1212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({
        name: "Kebutuhan",
        kind: "global",
        categoryId: null,
        frequency: "monthly",
        timezone: "Asia/Jakarta",
        startsOn: "2026-02-01",
        endsOn: "2026-02-28",
        plannedMinor: "2500000",
        rolloverPolicy: false,
        warningThresholds: [50, 75, 90, 100],
      }),
    }, setup.bindings);
    const body = await response.text();
    expect(response.status, body).toBe(201);
    expect(captured?.p_idempotency_key).toBe("1212c76b-8875-4bf3-ace5-1e584e0a8d0d");
    expect(captured?.p_planned_minor).toBe("2500000");
    expect(captured).not.toHaveProperty("user_id");
    expect(body).toContain('"periodId":"f08fab98-b8ab-4db7-a53c-2215f5b9a76c"');
  });

  it("returns exact wallet balances through a fixed server-side RLS RPC", async () => {
    let providerJwt = "";
    const setup = await testBindings(async (url, init) => {
      expect(url.href).toBe("https://ep-api-test.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1/rpc/list_wallets");
      providerJwt = new Headers(init.headers).get("Authorization") ?? "";
      return Response.json([{
        wallet_id: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
        name: "Tabungan",
        wallet_type: "savings",
        currency: "IDR",
        balance_minor: "9007199254740993",
        archived_at: null,
        created_at: "2026-10-24T00:00:00Z",
        updated_at: "2026-10-24T00:00:00Z",
      }]);
    });

    const response = await app.request("https://finance.test/api/v1/wallets", {
      headers: { Cookie: activeCookie(), Authorization: "Bearer untrusted-browser-token" },
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(providerJwt).toBe(`Bearer ${setup.token}`);
    expect(body).toContain('"balanceMinor":"9007199254740993"');
    expect(body).not.toContain("providerJwt");
    expect(body).not.toContain("untrusted-browser-token");
  });

  it("updates a wallet through the authenticated tenant-scoped Data API", async () => {
    const walletId = "7b9be51e-0607-4c60-8315-e57ae8f61aba";
    let captured: Record<string, unknown> | undefined;
    let providerToken = "";
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/wallets");
      expect(url.searchParams.get("id")).toBe(`eq.${walletId}`);
      expect(init.method).toBe("PATCH");
      expect(new Headers(init.headers).get("Authorization")).toBe(`Bearer ${providerToken}`);
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json([{ id: walletId, archived_at: "2026-10-25T00:00:00Z" }]);
    });
    providerToken = setup.token;
    const response = await app.request(`https://finance.test/api/v1/wallets/${walletId}`, {
      method: "PATCH",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Bank Utama", type: "bank", archived: true }),
    }, setup.bindings);
    expect(response.status).toBe(200);
    expect(captured).toMatchObject({ name: "Bank Utama", type: "bank", archived_at: expect.any(String) });
    expect(captured).not.toHaveProperty("user_id");
    expect(await response.json()).toMatchObject({ data: { id: walletId, archivedAt: "2026-10-25T00:00:00Z" } });
  });

  it("returns tenant-scoped exact finance report totals from the database projection", async () => {
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/get_finance_report");
      expect(JSON.parse(String(init.body))).toEqual({ p_from: "2026-10-01", p_to: "2026-10-25" });
      return Response.json([{
        timezone: "Asia/Jakarta",
        period_from: "2026-10-01",
        period_to: "2026-10-25",
        income_minor: "9007199254740993",
        gross_expense_minor: "300000",
        refund_minor: "10000",
        event_count: 4,
        previous_income_minor: "0",
        previous_gross_expense_minor: "100000",
        previous_refund_minor: "0",
        daily: [{ localDate: "2026-10-01", incomeMinor: "9007199254740993", expenseMinor: "290000" }],
        categories: [{ categoryId: null, categoryName: "Tanpa kategori", amountMinor: "290000", eventCount: 2 }],
        merchants: [{ merchant: "Kantin", amountMinor: "290000", eventCount: 2 }],
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/reports/summary?from=2026-10-01&to=2026-10-25", {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ data: { current: { incomeMinor: "9007199254740993" }, timezone: "Asia/Jakarta" } });
  });

  it("blocks archiving a category with active children without issuing an update", async () => {
    const categoryId = "c8ab55d2-5d51-4bd0-bd90-dc1c7b09d121";
    const calls: string[] = [];
    const setup = await testBindings(async (url, init) => {
      calls.push(`${init.method} ${url.pathname}`);
      expect(url.pathname).toBe("/neondb/rest/v1/categories");
      expect(init.method).toBe("GET");
      return Response.json([{ id: "adf84c2e-d121-4f39-a478-1c9a0fe183d2" }]);
    });
    const response = await app.request(`https://finance.test/api/v1/categories/${categoryId}`, {
      method: "PATCH",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Rumah", parentId: null, iconKey: null, colorToken: null, archived: true }),
    }, setup.bindings);
    const result = await response.json();
    expect(calls, JSON.stringify(result)).toHaveLength(1);
    expect(calls[0]).toContain("GET /neondb/rest/v1/categories");
    expect(response.status, JSON.stringify(result)).toBe(409);
  });

  it("posts one strict transaction command with the stable idempotency header", async () => {
    let captured: Record<string, unknown> | undefined;
    const setup = await testBindings(async (_url, init) => {
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json([{
        event_id: "12d474d1-0470-4c65-a9c2-15f80b73f72e",
        kind: "expense",
        amount_minor: "9007199254740993",
        currency: "IDR",
        effective_at: "2026-10-24T07:30:00Z",
        negative_balance_confirmed: false,
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/transactions", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
        "Idempotency-Key": "1212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({
        kind: "expense",
        walletId: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
        amountMinor: "9007199254740993",
        currency: "IDR",
        effectiveAt: "2026-10-24T14:30:00+07:00",
        timezone: "Asia/Jakarta",
      }),
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(captured?.p_amount_minor).toBe("9007199254740993");
    expect(captured?.p_idempotency_key).toBe("1212c76b-8875-4bf3-ace5-1e584e0a8d0d");
    expect(captured?.p_trace_id).toBe(response.headers.get("X-Request-ID"));
    expect(body).toContain('"amountMinor":"9007199254740993"');
    expect(body).not.toContain("verified-user-1");
    expect(body).not.toContain(setup.token);
  });

  it("searches full transaction history through the tenant-scoped search RPC", async () => {
    let captured: Record<string, unknown> | undefined;
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/search_finance_events");
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json([{
        event_id: "12d474d1-0470-4c65-a9c2-15f80b73f72e",
        kind: "expense",
        status: "posted",
        amount_minor: "45000",
        currency: "IDR",
        wallet_id: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
        wallet_name: "Rekening Utama",
        destination_wallet_id: null,
        destination_wallet_name: null,
        category_id: null,
        category_name: null,
        effective_at: "2026-10-24T07:30:00Z",
        timezone: "Asia/Jakarta",
        note: "Makan di Kantin",
        merchant: "Kantin",
        source_channel: "manual",
        refund_of: null,
        allocations: [],
        negative_balance_confirmed: false,
        created_at: "2026-10-24T07:30:00Z",
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/transactions?q=Kantin&kind=expense&from=2026-10-19T17:00:00.000Z&to=2026-10-24T17:00:00.000Z&limit=20", {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(response.status).toBe(200);
    expect(captured).toMatchObject({
      p_search: "Kantin",
      p_kind: "expense",
      p_from: "2026-10-19T17:00:00.000Z",
      p_to: "2026-10-24T17:00:00.000Z",
      p_limit: 21,
    });
    expect(captured).not.toHaveProperty("user_id");
    expect(await response.json()).toMatchObject({ data: { items: [{ merchant: "Kantin", amountMinor: "45000" }] } });
  });

  it.each(["", "x".repeat(81)])("rejects malformed transaction search terms before Data API access (%s)", async (query) => {
    const upstream = vi.fn();
    const setup = await testBindings(async () => {
      upstream();
      return Response.json([]);
    });
    const response = await app.request(`https://finance.test/api/v1/transactions?q=${encodeURIComponent(query)}`, {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("rejects unknown owner fields and missing idempotency before Data API access", async () => {
    const upstream = vi.fn();
    const setup = await testBindings(async () => {
      upstream();
      return Response.json([]);
    });
    const response = await app.request("https://finance.test/api/v1/transactions", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
        "Idempotency-Key": "1212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({
        kind: "income",
        walletId: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
        amountMinor: "1000",
        currency: "IDR",
        effectiveAt: "2026-10-24T14:30:00+07:00",
        timezone: "Asia/Jakarta",
        user_id: "victim-user",
      }),
    }, setup.bindings);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain("victim-user");
  });

  it("maps sensitive provider errors to redacted idempotency conflict responses", async () => {
    const setup = await testBindings(async () => Response.json({
      code: "23505",
      message: "IDEMPOTENCY_KEY_REUSED INTERNAL_SQL_CANARY",
    }, { status: 409 }));
    const response = await app.request("https://finance.test/api/v1/transactions", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
        "Idempotency-Key": "1212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({
        kind: "income",
        walletId: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
        amountMinor: "1000",
        currency: "IDR",
        effectiveAt: "2026-10-24T14:30:00+07:00",
        timezone: "Asia/Jakarta",
      }),
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(409);
    expect(body).toContain("IDEMPOTENCY_KEY_REUSED");
    expect(body).not.toContain("INTERNAL_SQL_CANARY");
  });

  it("lists only the verified owner's safe session metadata", async () => {
    const setup = await testBindings(async (url) => {
      expect(url.pathname).toMatch(/\/auth\/list-sessions$/);
      return Response.json([
        {
          id: "opaque-active-session",
          userId: "verified-user-1",
          token: "CURRENT_SESSION_TOKEN_CANARY",
          ipAddress: "192.0.2.10",
          userAgent: "Chrome 130 · Windows",
          createdAt: "2026-10-23T10:00:00.000Z",
          expiresAt: "2026-11-23T10:00:00.000Z",
        },
        {
          id: "other-device-session",
          userId: "verified-user-1",
          token: "OTHER_SESSION_TOKEN_CANARY",
          ipAddress: "192.0.2.11",
          userAgent: "Pixel 7 · Android 14",
          createdAt: "2026-10-22T10:00:00.000Z",
          expiresAt: "2026-11-22T10:00:00.000Z",
        },
        {
          id: "foreign-owner-session",
          userId: "victim-user",
          token: "FOREIGN_SESSION_TOKEN_CANARY",
          ipAddress: "192.0.2.12",
          userAgent: "Other browser",
          createdAt: "2026-10-21T10:00:00.000Z",
          expiresAt: "2026-11-21T10:00:00.000Z",
        },
      ]);
    });
    const response = await app.request("https://finance.test/api/v1/security/sessions", {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain('"id":"opaque-active-session"');
    expect(body).toContain('"current":true');
    expect(body).toContain('"id":"other-device-session"');
    expect(body).not.toContain("foreign-owner-session");
    expect(body).not.toContain("victim-user");
    expect(body).not.toContain("SESSION_TOKEN_CANARY");
    expect(body).not.toContain("192.0.2.");
    expect(body).not.toContain('"userId"');
  });

  it("resolves a requested session ID to its provider token only on the server", async () => {
    let revokeBody: unknown;
    const setup = await testBindings(async (url, init) => {
      if (url.pathname.endsWith("/list-sessions")) {
        return Response.json([
          {
            id: "opaque-active-session",
            userId: "verified-user-1",
            token: "CURRENT_SESSION_TOKEN_CANARY",
            createdAt: "2026-10-23T10:00:00.000Z",
            expiresAt: "2026-11-23T10:00:00.000Z",
          },
          {
            id: "other-device-session",
            userId: "verified-user-1",
            token: "REVOKE_ONLY_SERVER_TOKEN_CANARY",
            createdAt: "2026-10-22T10:00:00.000Z",
            expiresAt: "2026-11-22T10:00:00.000Z",
          },
        ]);
      }
      expect(url.pathname).toMatch(/\/auth\/revoke-session$/);
      revokeBody = JSON.parse(String(init?.body));
      return Response.json({ status: true });
    });
    const response = await app.request("https://finance.test/api/v1/security/sessions/revoke", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: "other-device-session" }),
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(revokeBody).toEqual({ token: "REVOKE_ONLY_SERVER_TOKEN_CANARY" });
    expect(body).toContain('"currentSessionRevoked":false');
    expect(body).not.toContain("REVOKE_ONLY_SERVER_TOKEN_CANARY");
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });

  it("does not revoke a session ID belonging to another account", async () => {
    const calls: string[] = [];
    const setup = await testBindings(async (url) => {
      calls.push(url.pathname);
      if (url.pathname.endsWith("/list-sessions")) {
        return Response.json([
          {
            id: "opaque-active-session",
            userId: "verified-user-1",
            token: "CURRENT_SESSION_TOKEN_CANARY",
            createdAt: "2026-10-23T10:00:00.000Z",
            expiresAt: "2026-11-23T10:00:00.000Z",
          },
          {
            id: "victim-session-id",
            userId: "victim-user",
            token: "VICTIM_SESSION_TOKEN_CANARY",
            createdAt: "2026-10-22T10:00:00.000Z",
            expiresAt: "2026-11-22T10:00:00.000Z",
          },
        ]);
      }
      return Response.json({ status: true });
    });
    const response = await app.request("https://finance.test/api/v1/security/sessions/revoke", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: "victim-session-id" }),
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(404);
    expect(body).not.toContain("victim-user");
    expect(body).not.toContain("VICTIM_SESSION_TOKEN_CANARY");
    expect(calls.filter((path) => path.endsWith("/revoke-session"))).toHaveLength(0);
  });

  it.each([
    { action: "revoke-others", providerRoute: "/revoke-other-sessions", current: false },
    { action: "revoke-all", providerRoute: "/revoke-sessions", current: true },
  ])("maps $action to the managed Neon endpoint and reports current-session revocation", async ({ action, providerRoute, current }) => {
    let providerPath = "";
    const setup = await testBindings(async (url) => {
      providerPath = url.pathname;
      expect(providerPath).toMatch(new RegExp(`${providerRoute}$`));
      return Response.json({ status: true });
    });
    const response = await app.request(`https://finance.test/api/v1/security/sessions/${action}`, {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
      },
      body: "{}",
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain(`"currentSessionRevoked":${current}`);
    expect(providerPath).toMatch(new RegExp(`${providerRoute}$`));
    if (current) {
      expect(response.headers.get("Set-Cookie")).toMatch(/Max-Age=0/);
      expect(response.headers.get("Set-Cookie")).toContain("HttpOnly");
    } else {
      expect(response.headers.get("Set-Cookie")).toBeNull();
    }
  });

  it("keeps the session endpoints closed for anonymous and cross-origin callers", async () => {
    const setup = await testBindings(async () => {
      throw new Error("No upstream session-list request is allowed for rejected callers");
    });
    const anonymous = await app.request("https://finance.test/api/v1/security/sessions", undefined, setup.bindings);
    expect(anonymous.status).toBe(401);

    const crossOrigin = await app.request("https://finance.test/api/v1/security/sessions/revoke-all", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://attacker.invalid",
        "Content-Type": "application/json",
      },
      body: "{}",
    }, setup.bindings);
    expect(crossOrigin.status).toBe(403);
  });
});

describe("role-gated operator routes", () => {
  const operatorPath = (path: string) => `https://finance.test/api/v1/${path}`;

  it("rejects anonymous operator requests before resolving a platform role", async () => {
    const upstream = vi.fn();
    const setup = await testBindings(async () => {
      upstream();
      return Response.json("superuser");
    });

    const response = await app.request(operatorPath("system/maintenance"), undefined, setup.bindings);

    expect(response.status).toBe(401);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("rejects a user who forges browser role headers or bearer claims", async () => {
    let roleLookupAuthorization = "";
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/current_platform_role");
      expect(init.method).toBe("POST");
      expect(init.body).toBe("{}");
      roleLookupAuthorization = new Headers(init.headers).get("Authorization") ?? "";
      return Response.json("user");
    });

    const response = await app.request(operatorPath("system/maintenance"), {
      headers: {
        Cookie: activeCookie(),
        Authorization: "Bearer forged-browser-token",
        "X-Platform-Role": "superuser",
        "X-Role": "superuser",
      },
    }, setup.bindings);

    expect(response.status).toBe(403);
    expect(roleLookupAuthorization).toBe(`Bearer ${setup.token}`);
    expect(await response.text()).not.toContain("forged-browser-token");
  });

  it("returns savings goal progress as exact money and a capped integer percentage", async () => {
    const setup = await testBindings(async (url) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/list_savings_goals");
      return Response.json([{
        goal_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
        name: "Dana darurat",
        target_minor: "1000000",
        target_date: "2027-06-30",
        savings_wallet_id: "8d4a5f5d-63e1-43e1-83aa-bd4311e33e51",
        savings_wallet_name: "Tabungan",
        saved_minor: "1200000",
        remaining_minor: "-200000",
        progress_percent: 100,
        archived_at: null,
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/savings-goals", {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain('"savedMinor":"1200000"');
    expect(body).toContain('"remainingMinor":"-200000"');
    expect(body).toContain('"progressPercent":100');
  });

  it("creates savings goals with the verified owner session and idempotency key", async () => {
    let captured: Record<string, unknown> | undefined;
    let authorization: string | null = null;
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/create_savings_goal");
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      authorization = new Headers(init.headers).get("Authorization");
      return Response.json([{
        goal_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
        name: "Dana darurat",
        target_minor: "5000000",
        target_date: "2027-06-30",
        savings_wallet_id: null,
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/savings-goals", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
        "Idempotency-Key": "1212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({ name: "Dana darurat", targetMinor: "5000000", targetDate: "2027-06-30", savingsWalletId: null }),
    }, setup.bindings);
    expect(response.status).toBe(201);
    expect(captured).toEqual({
      p_idempotency_key: "1212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      p_name: "Dana darurat",
      p_target_minor: "5000000",
      p_target_date: "2027-06-30",
      p_savings_wallet_id: null,
    });
    expect(authorization).toMatch(/^Bearer /);
  });

  it("posts a savings contribution through the atomic ledger RPC with the selected tenant-owned wallets", async () => {
    let captured: Record<string, unknown> | undefined;
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/contribute_to_savings_goal");
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json([{
        event_id: "12d474d1-0470-4c65-a9c2-15f80b73f72e",
        amount_minor: "200000",
        effective_at: "2026-10-25T00:00:00Z",
        note: "Setoran awal",
        source_wallet_id: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
        source_wallet_name: "Tunai",
        destination_wallet_id: "8d4a5f5d-63e1-43e1-83aa-bd4311e33e51",
        destination_wallet_name: "Tabungan",
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/savings-goals/c36df782-e943-4ab5-80d5-07b8f6eef620/contributions", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
        "Idempotency-Key": "2212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({
        sourceWalletId: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
        destinationWalletId: "8d4a5f5d-63e1-43e1-83aa-bd4311e33e51",
        amountMinor: "200000",
        effectiveAt: "2026-10-25T00:00:00Z",
        timezone: "Asia/Jakarta",
        note: "Setoran awal",
      }),
    }, setup.bindings);
    expect(response.status).toBe(201);
    expect(captured).toMatchObject({
      p_goal_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
      p_source_wallet_id: "7b9be51e-0607-4c60-8315-e57ae8f61aba",
      p_destination_wallet_id: "8d4a5f5d-63e1-43e1-83aa-bd4311e33e51",
      p_amount_minor: "200000",
      p_idempotency_key: "2212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      p_allow_negative: false,
    });
  });

  it("rejects invalid savings goal IDs before querying private data", async () => {
    const upstream = vi.fn();
    const setup = await testBindings(async () => {
      upstream();
      return Response.json([]);
    });
    const response = await app.request("https://finance.test/api/v1/savings-goals/not-a-uuid/contributions", {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("creates an opening debt through the tenant-bound atomic ledger RPC", async () => {
    let captured: Record<string, unknown> | undefined;
    let authorization: string | null = null;
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/create_debt");
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      authorization = new Headers(init.headers).get("Authorization");
      return Response.json([{
        debt_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
        opening_event_id: "12d474d1-0470-4c65-a9c2-15f80b73f72e",
        direction: "owed_by_user",
        principal_minor: "9007199254740993",
        remaining_minor: "9007199254740993",
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/debts", {
      method: "POST",
      headers: {
        Cookie: activeCookie(), Origin: "https://finance.test", "Content-Type": "application/json",
        "Idempotency-Key": "3212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({
        direction: "owed_by_user", origin: "opening", counterpartyLabel: "Teman",
        principalMinor: "9007199254740993", openingDate: "2026-10-24", dueDate: null,
        installmentMinor: "100000", walletId: null, timezone: "Asia/Jakarta", note: "Catatan awal",
      }),
    }, setup.bindings);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      data: { principalMinor: "9007199254740993", remainingMinor: "9007199254740993" },
    });
    expect(captured).toMatchObject({
      p_idempotency_key: "3212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      p_direction: "owed_by_user", p_origin: "opening", p_principal_minor: "9007199254740993",
      p_wallet_id: null, p_allow_negative: false, p_timezone: "Asia/Jakarta",
    });
    expect(captured).not.toHaveProperty("p_user_id");
    expect(authorization).toMatch(/^Bearer /);
  });

  it("forwards explicit negative-balance consent for a new receivable loan", async () => {
    let captured: Record<string, unknown> | undefined;
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/create_debt");
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json([{
        debt_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
        opening_event_id: "12d474d1-0470-4c65-a9c2-15f80b73f72e",
        direction: "owed_to_user", principal_minor: "50000", remaining_minor: "50000",
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/debts", {
      method: "POST",
      headers: {
        Cookie: activeCookie(), Origin: "https://finance.test", "Content-Type": "application/json",
        "Idempotency-Key": "5212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({
        direction: "owed_to_user", origin: "loan", counterpartyLabel: "Teman", principalMinor: "50000",
        openingDate: "2026-10-25", dueDate: null, installmentMinor: null,
        walletId: "7b9be51e-0607-4c60-8315-e57ae8f61aba", allowNegative: true,
        timezone: "Asia/Jakarta",
      }),
    }, setup.bindings);
    expect(response.status).toBe(201);
    expect(captured).toMatchObject({
      p_direction: "owed_to_user", p_origin: "loan", p_principal_minor: "50000",
      p_wallet_id: "7b9be51e-0607-4c60-8315-e57ae8f61aba", p_allow_negative: true,
    });
  });

  it("records debt principal and fee separately with one idempotency key", async () => {
    let captured: Record<string, unknown> | undefined;
    const setup = await testBindings(async (url, init) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/record_debt_payment");
      captured = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json([{
        payment_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
        event_id: "12d474d1-0470-4c65-a9c2-15f80b73f72e",
        fee_event_id: "22d474d1-0470-4c65-a9c2-15f80b73f72e",
        principal_minor: "100000", fee_minor: "2500", effective_at: "2026-10-25T00:00:00Z",
        negative_balance_confirmed: false,
        timezone: "Asia/Jakarta", note: "Cicilan pertama",
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/debts/c36df782-e943-4ab5-80d5-07b8f6eef620/payments", {
      method: "POST",
      headers: {
        Cookie: activeCookie(), Origin: "https://finance.test", "Content-Type": "application/json",
        "Idempotency-Key": "4212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      },
      body: JSON.stringify({
        walletId: "7b9be51e-0607-4c60-8315-e57ae8f61aba", principalMinor: "100000", feeMinor: "2500",
        allowNegative: true,
        effectiveAt: "2026-10-25T00:00:00Z", timezone: "Asia/Jakarta",
        principalCategoryId: "8b9be51e-0607-4c60-8315-e57ae8f61aba",
        feeCategoryId: "9b9be51e-0607-4c60-8315-e57ae8f61aba", note: "Cicilan pertama",
      }),
    }, setup.bindings);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ data: { principalMinor: "100000", feeMinor: "2500", negativeBalanceConfirmed: false } });
    expect(captured).toMatchObject({
      p_debt_id: "c36df782-e943-4ab5-80d5-07b8f6eef620",
      p_principal_minor: "100000", p_fee_minor: "2500",
      p_allow_negative: true,
      p_idempotency_key: "4212c76b-8875-4bf3-ace5-1e584e0a8d0d",
      p_principal_category_id: "8b9be51e-0607-4c60-8315-e57ae8f61aba",
      p_fee_category_id: "9b9be51e-0607-4c60-8315-e57ae8f61aba",
    });
  });

  it("allows admin routes for admins but keeps system routes superuser-only", async () => {
    let role = "admin";
    const setup = await testBindings(async (url) => {
      expect(url.pathname).toBe("/neondb/rest/v1/rpc/current_platform_role");
      return Response.json(role);
    });

    const adminResponse = await app.request(operatorPath("admin/audit"), {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(adminResponse.status).toBe(404);

    const adminLedgerResponse = await app.request(operatorPath("admin/users/victim-user/ledger"), {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(adminLedgerResponse.status).toBe(404);

    const deniedSystemResponse = await app.request(operatorPath("system/maintenance"), {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(deniedSystemResponse.status).toBe(403);

    role = "superuser";
    const systemResponse = await app.request(operatorPath("system/maintenance"), {
      headers: { Cookie: activeCookie() },
    }, setup.bindings);
    expect(systemResponse.status).toBe(404);
  });

  it("fails closed for malformed roles and unavailable role storage", async () => {
    const invalidRoleSetup = await testBindings(async () => Response.json({ role: "owner" }));
    const invalidRoleResponse = await app.request(operatorPath("admin/audit"), {
      headers: { Cookie: activeCookie() },
    }, invalidRoleSetup.bindings);
    const invalidRoleBody = await invalidRoleResponse.text();
    expect(invalidRoleResponse.status).toBe(403);
    expect(invalidRoleBody).not.toContain("owner");

    const unavailableSetup = await testBindings(async () => Response.json({ message: "private-db-canary" }, { status: 500 }));
    const unavailableResponse = await app.request(operatorPath("system/maintenance"), {
      headers: { Cookie: activeCookie() },
    }, unavailableSetup.bindings);
    const unavailableBody = await unavailableResponse.text();
    expect(unavailableResponse.status).toBe(503);
    expect(unavailableBody).not.toContain("private-db-canary");
  });

  it("keeps proof upload closed until an explicit retention policy is configured", async () => {
    const upstream = vi.fn();
    const setup = await testBindings(async () => {
      upstream();
      return Response.json([]);
    });
    const response = await app.request("https://finance.test/api/v1/proofs/uploads", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType: "image/png", sizeBytes: 12, sha256: "a".repeat(64) }),
    }, Object.assign(setup.bindings, {
      PROOFS: { put: vi.fn(), head: vi.fn(), get: vi.fn(), delete: vi.fn() },
      PROOF_STORAGE_ENABLED: "1",
    }));
    expect(response.status).toBe(503);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("creates an owner-bound proof intent without returning its R2 key or stored token hash", async () => {
    let capturedUrl: URL | undefined;
    let capturedBody: Record<string, unknown> | undefined;
    const setup = await testBindings(async (url, init) => {
      capturedUrl = url;
      capturedBody = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json([{
        id: capturedBody.p_proof_id,
        user_id: "verified-user-1",
        object_key: capturedBody.p_object_key,
        content_type: capturedBody.p_content_type,
        size_bytes: capturedBody.p_size_bytes,
        sha256: capturedBody.p_sha256,
        upload_token_hash: capturedBody.p_upload_token_hash,
        upload_expires_at: capturedBody.p_upload_expires_at,
        expires_at: capturedBody.p_expires_at,
        upload_state: "pending",
        created_at: "2026-10-25T00:00:00.000Z",
        stored_at: null,
      }]);
    });
    const response = await app.request("https://finance.test/api/v1/proofs/uploads", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType: "image/png", sizeBytes: 12, sha256: "a".repeat(64), consentAccepted: true }),
    }, Object.assign(setup.bindings, {
      PROOFS: { put: vi.fn(), head: vi.fn(), get: vi.fn(), delete: vi.fn() },
      PROOF_STORAGE_ENABLED: "1",
      PROOF_RETENTION_CLEANUP_READY: "1",
      // Test-only retention fixture; production policy remains unset until owner approval.
      PROOF_RETENTION_DAYS: "2",
    }));
    const bodyText = await response.text();
    const payload = JSON.parse(bodyText) as { data: { id: string; uploadToken: string; uploadPath: string } };
    expect(response.status).toBe(201);
    expect(capturedUrl?.pathname).toBe("/neondb/rest/v1/rpc/create_proof_upload");
    expect(capturedBody?.p_size_bytes).toBe(12);
    expect(capturedBody?.p_user_id).toBeUndefined();
    expect(capturedBody?.p_consent_version).toBe("proof-storage-v1");
    expect(payload.data.id).toBe(capturedBody?.p_proof_id);
    expect(payload.data.uploadToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(payload.data.uploadPath).toBe(`/api/v1/proofs/uploads/${payload.data.id}/content`);
    expect(bodyText).not.toContain(String(capturedBody?.p_object_key));
    expect(bodyText).not.toContain(String(capturedBody?.p_upload_token_hash));
  });

  it("does not create a proof intent without explicit privacy consent", async () => {
    const upstream = vi.fn();
    const setup = await testBindings(async () => {
      upstream();
      return Response.json([]);
    });
    const response = await app.request("https://finance.test/api/v1/proofs/uploads", {
      method: "POST",
      headers: {
        Cookie: activeCookie(),
        Origin: "https://finance.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType: "image/png", sizeBytes: 12, sha256: "a".repeat(64) }),
    }, Object.assign(setup.bindings, {
      PROOFS: { put: vi.fn(), head: vi.fn(), get: vi.fn(), delete: vi.fn() },
      PROOF_STORAGE_ENABLED: "1",
      PROOF_RETENTION_CLEANUP_READY: "1",
      // Test-only retention fixture; production policy remains unset until owner approval.
      PROOF_RETENTION_DAYS: "2",
    }));
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
});
