import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  exportJWK,
  generateKeyPair,
  SignJWT,
  type CryptoKey,
} from "jose";
import app from "./p0-005.worker";

const appOrigin = "http://127.0.0.1:5173";
const stagingDataApiUrl =
  "https://ep-rapid-flower-b46lkbp1.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1";
const cookie = "__Secure-neonauth.session_token=opaque-staging-cookie";

let privateKey: CryptoKey;
let publicJwk: Awaited<ReturnType<typeof exportJWK>>;

beforeAll(async () => {
  const keyPair = await generateKeyPair("EdDSA", { crv: "Ed25519" });
  privateKey = keyPair.privateKey;
  publicJwk = {
    ...(await exportJWK(keyPair.publicKey)),
    kid: "p0-test-key",
    use: "sig",
    alg: "EdDSA",
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function authConfig() {
  const suffix = crypto.randomUUID().replaceAll("-", "");
  const host = `ep-${suffix}.neonauth.us-east-1.aws.neon.tech`;
  const authUrl = `https://${host}/neondb/auth`;
  return {
    env: {
      APP_ENV: "local",
      APP_ORIGIN: appOrigin,
      AUTH_PROXY_ENABLED: "1",
      NEON_AUTH_URL: authUrl,
      NEON_AUTH_ISSUER: `https://${host}`,
      NEON_AUTH_JWKS_URL: `${authUrl}/.well-known/jwks.json`,
      NEON_DATA_API_URL: stagingDataApiUrl,
      P0_ENABLED: "1",
      P0_ALLOWED_ORIGIN: appOrigin,
    },
    authUrl,
    jwksUrl: `${authUrl}/.well-known/jwks.json`,
    issuer: `https://${host}`,
  };
}

async function providerJwt(issuer: string, subject = "verified-user-a") {
  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "EdDSA", kid: "p0-test-key" })
    .setIssuer(issuer)
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
}

function activeSession(jwt: string, subject = "verified-user-a") {
  return new Response(
    JSON.stringify({
      data: {
        session: { id: "session-active" },
        user: { id: subject, emailVerified: true },
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Auth-Jwt": jwt,
      },
    },
  );
}

describe("P0-005 local Worker session boundary", () => {
  it("keeps signup closed until verified staging accounts exist", async () => {
    const { env } = authConfig();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await app.request(
      "http://127.0.0.1:8788/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          Origin: appOrigin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Synthetic Staging User",
          email: "staging-test@example.invalid",
          password: "not-a-real-account-password",
        }),
      },
      env,
    );

    expect(response.status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects bearer-only requests without contacting Neon or the Data API", async () => {
    const { env } = authConfig();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await app.request(
      "http://127.0.0.1:8788/__p0/rows",
      {
        headers: { Authorization: "Bearer forged-or-stale-jwt" },
      },
      env,
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "AUTH_REQUIRED" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("checks a verified active cookie before forwarding RLS identity server-side", async () => {
    const config = authConfig();
    const jwt = await providerJwt(config.issuer);
    const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
    const diagnostics: string[] = [];
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url === config.jwksUrl) return Response.json({ keys: [publicJwk] });
      if (url === `${config.authUrl}/get-session`) {
        if (new Headers(init?.headers).get("Cookie") !== cookie) {
          diagnostics.push("auth-cookie-not-forwarded");
        }
        if (new Headers(init?.headers).get("Origin") !== appOrigin) {
          diagnostics.push("auth-origin-not-forwarded");
        }
        return activeSession(jwt);
      }
      if (url.startsWith(`${stagingDataApiUrl}/owner_probe?`)) {
        if (new Headers(init?.headers).get("Authorization") !== `Bearer ${jwt}`) {
          diagnostics.push("server-bearer-not-forwarded");
        }
        const payload = JSON.parse(String(init?.body)) as Record<string, unknown>;
        if (
          payload.owner_user_id !== "verified-user-a" ||
          payload.marker !== "worker-session-check" ||
          typeof payload.id !== "string"
        ) {
          diagnostics.push("owner-payload-invalid");
        }
        return Response.json([
          { id: "row-1", marker: "worker-session-check" },
        ]);
      }
      diagnostics.push(`unexpected-request:${new URL(url).pathname}`);
      return Response.json({ error: "unmocked" }, { status: 500 });
    });
    vi.stubGlobal("fetch", fetcher);

    const response = await app.request(
      "http://127.0.0.1:8788/__p0/rows",
      {
        method: "POST",
        headers: {
          Cookie: cookie,
          Origin: appOrigin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ marker: "worker-session-check" }),
      },
      config.env,
    );
    const responseText = await response.text();

    expect(response.status, diagnostics.join(",") || responseText).toBe(201);
    expect(responseText).toContain('"sessionStatus":"active-cookie"');
    expect(responseText).not.toContain(jwt);
    expect(response.headers.get("Set-Auth-Jwt")).toBeNull();
    expect(calls.map((call) => call.url)).toContain(config.jwksUrl);
    expect(calls.map((call) => call.url)).toContain(`${config.authUrl}/get-session`);
    expect(calls.some((call) => call.url.startsWith(`${stagingDataApiUrl}/owner_probe?`))).toBe(true);
  });

  it("rejects a stale cookie when Neon Auth no longer returns an active session", async () => {
    const config = authConfig();
    const calls: string[] = [];
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      if (url === `${config.authUrl}/get-session`) {
        return Response.json({ data: { session: null, user: null } });
      }
      throw new Error("A revoked session must not reach another provider");
    });
    vi.stubGlobal("fetch", fetcher);

    const response = await app.request(
      "http://127.0.0.1:8788/__p0/rows",
      { headers: { Cookie: cookie } },
      config.env,
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "AUTH_REQUIRED" });
    expect(calls).toEqual([`${config.authUrl}/get-session`]);
  });

  it("rejects unverified users before querying the Data API", async () => {
    const config = authConfig();
    const calls: string[] = [];
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      if (url === `${config.authUrl}/get-session`) {
        return Response.json({
          data: {
            session: { id: "session-unverified" },
            user: { id: "unverified-user", emailVerified: false },
          },
        });
      }
      throw new Error("Unverified session must not reach the Data API");
    });
    vi.stubGlobal("fetch", fetcher);

    const response = await app.request(
      "http://127.0.0.1:8788/__p0/rows",
      { headers: { Cookie: cookie } },
      config.env,
    );

    expect(response.status).toBe(401);
    expect(calls).toEqual([`${config.authUrl}/get-session`]);
  });
});
