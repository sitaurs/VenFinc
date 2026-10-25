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
    expect(response.status).toBe(201);
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
});
