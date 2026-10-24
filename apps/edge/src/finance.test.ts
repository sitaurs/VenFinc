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
