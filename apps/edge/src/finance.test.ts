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
});
