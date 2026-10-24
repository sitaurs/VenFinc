import { afterEach, describe, expect, it, vi } from "vitest";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { app } from "./index";
import { resolveNeonSession } from "./auth";

const authBase = "https://ep-test.neonauth.us-east-1.aws.neon.tech/neondb/auth";
const appOrigin = "https://finance.test";

function bindings(overrides: Record<string, string> = {}) {
  return {
    APP_ENV: "test",
    APP_ORIGIN: appOrigin,
    AUTH_PROXY_ENABLED: "1",
    PUBLIC_SIGNUP_ENABLED: "0",
    NEON_AUTH_URL: authBase,
    NEON_AUTH_ISSUER: "https://ep-test.neonauth.us-east-1.aws.neon.tech",
    NEON_AUTH_JWKS_URL: `${authBase}/.well-known/jwks.json`,
    ...overrides,
  };
}

function setCookie(name = "__Secure-neonauth.session_token", value = "opaque") {
  return `${name}=${value}; Path=/neondb/auth; Domain=.neon.tech; HttpOnly; Secure; SameSite=None`;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("same-origin Neon Auth boundary", () => {
  it("proxies email sign-in, strips bearer credentials, and never returns a JWT", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(`${authBase}/sign-in/email`);
      expect(init?.redirect).toBe("manual");
      const headers = new Headers(init?.headers);
      expect(headers.get("Origin")).toBe(appOrigin);
      expect(headers.get("Authorization")).toBeNull();
      expect(headers.get("Cookie")).toBeNull();
      return new Response(
        JSON.stringify({
          token: "JWT_CANARY_SHOULD_NOT_REACH_BROWSER",
          session: { access_token: "NESTED_JWT_CANARY" },
          user: { id: "user-A", email: "a@example.invalid" },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": setCookie(),
            "Set-Auth-Jwt": "HEADER_JWT_CANARY",
          },
        },
      );
    });
    vi.stubGlobal("fetch", fetcher);

    const response = await app.request(
      "https://finance.test/api/auth/sign-in/email",
      {
        method: "POST",
        headers: {
          Origin: appOrigin,
          "Content-Type": "application/json",
          Authorization: "Bearer CLIENT_JWT_CANARY",
        },
        body: JSON.stringify({ email: "a@example.invalid", password: "synthetic-only" }),
      },
      bindings({ APP_ENV: "staging" }),
    );

    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain("user-A");
    expect(body).not.toContain("JWT_CANARY");
    expect(response.headers.get("Set-Auth-Jwt")).toBeNull();
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Set-Cookie")).toContain("__Secure-neonauth.session_token=opaque");
    expect(response.headers.get("Set-Cookie")).toContain("Path=/");
    expect(response.headers.get("Set-Cookie")).toContain("HttpOnly");
    expect(response.headers.get("Set-Cookie")).not.toMatch(/Domain=/i);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("forwards only Neon Auth's opaque cookie to get-session", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("Cookie")).toBe(
        "__Secure-neonauth.session_token=opaque-value",
      );
      return new Response(JSON.stringify({ user: null, session: null }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Set-Auth-Jwt": "STALE_JWT_CANARY" },
      });
    });
    vi.stubGlobal("fetch", fetcher);

    const response = await app.request(
      "https://finance.test/api/auth/get-session",
      {
        headers: {
          Cookie: "theme=dark; __Secure-neonauth.session_token=opaque-value; analytics=ignored",
          Authorization: "Bearer STALE_JWT_CANARY",
        },
      },
      bindings(),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).not.toContain("STALE_JWT_CANARY");
    expect(response.headers.get("Set-Auth-Jwt")).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("rejects unapproved fields before they reach an auth provider", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const response = await app.request(
      "https://finance.test/api/auth/sign-in/email",
      {
        method: "POST",
        headers: { Origin: appOrigin, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "a@example.invalid",
          password: "synthetic-only",
          callbackURL: "https://attacker.invalid/collect",
        }),
      },
      bindings(),
    );
    expect(response.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("hides provider details and account-existence differences from public auth requests", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const path = new URL(String(input)).pathname;
      if (path.endsWith("/sign-in/email")) {
        return Response.json({ code: "USER_NOT_FOUND", message: "EMAIL_ENUMERATION_CANARY" }, { status: 404 });
      }
      return Response.json({ code: "USER_NOT_FOUND", message: "EMAIL_ENUMERATION_CANARY" }, { status: 404 });
    }));

    const signIn = await app.request(
      "https://finance.test/api/auth/sign-in/email",
      {
        method: "POST",
        headers: { Origin: appOrigin, "Content-Type": "application/json" },
        body: JSON.stringify({ email: "missing@example.invalid", password: "synthetic-only" }),
      },
      bindings(),
    );
    expect(signIn.status).toBe(401);
    expect(await signIn.text()).not.toContain("EMAIL_ENUMERATION_CANARY");

    const reset = await app.request(
      "https://finance.test/api/auth/forget-password/email-otp",
      {
        method: "POST",
        headers: { Origin: appOrigin, "Content-Type": "application/json" },
        body: JSON.stringify({ email: "missing@example.invalid" }),
      },
      bindings(),
    );
    expect(reset.status).toBe(200);
    expect(await reset.text()).toBe('{"success":true}');
  });

  it("allows only verification codes, never passwordless sign-in OTPs on this public flow", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(init?.body)).toBe(JSON.stringify({
        email: "person@example.invalid",
        type: "email-verification",
      }));
      return Response.json({ success: true });
    });
    vi.stubGlobal("fetch", fetcher);
    const response = await app.request(
      "https://finance.test/api/auth/email-otp/send-verification-otp",
      {
        method: "POST",
        headers: { Origin: appOrigin, "Content-Type": "application/json" },
        body: JSON.stringify({ email: " Person@Example.invalid ", type: "email-verification" }),
      },
      bindings(),
    );
    expect(response.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(1);

    const passwordless = await app.request(
      "https://finance.test/api/auth/email-otp/send-verification-otp",
      {
        method: "POST",
        headers: { Origin: appOrigin, "Content-Type": "application/json" },
        body: JSON.stringify({ email: "person@example.invalid", type: "sign-in" }),
      },
      bindings(),
    );
    expect(passwordless.status).toBe(400);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("uses the staging-confirmed reset route and rejects the broken SDK alias", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(`${authBase}/email-otp/reset-password`);
      expect(String(init?.body)).toBe(JSON.stringify({
        email: "person@example.invalid",
        otp: "123456",
        password: "Synthetic-Password-01",
      }));
      return Response.json({ success: true });
    });
    vi.stubGlobal("fetch", fetcher);
    const response = await app.request(
      "https://finance.test/api/auth/email-otp/reset-password",
      {
        method: "POST",
        headers: { Origin: appOrigin, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: " Person@Example.invalid ",
          otp: "123456",
          password: "Synthetic-Password-01",
        }),
      },
      bindings(),
    );
    expect(response.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(1);

    const uncontractedRoute = await app.request(
      "https://finance.test/api/auth/email-otp/passcode",
      { method: "POST", headers: { Origin: appOrigin, "Content-Type": "application/json" }, body: "{}" },
      bindings(),
    );
    expect(uncontractedRoute.status).toBe(404);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("keeps public signup closed unless the server feature flag is enabled", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const response = await app.request(
      "https://finance.test/api/auth/sign-up/email",
      {
        method: "POST",
        headers: { Origin: appOrigin, "Content-Type": "application/json" },
        body: JSON.stringify({ email: "new@example.invalid", password: "synthetic-only" }),
      },
      bindings(),
    );
    expect(response.status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([
    "/api/auth/admin/delete-user",
    "/api/auth/sign-in%2femail",
    "/api/auth/get-session?redirect=https://attacker.invalid",
  ])("rejects unapproved auth path %s", async (path) => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const response = await app.request(
      `https://finance.test${path}`,
      undefined,
      bindings(),
    );
    expect(response.status).toBe(404);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects cross-origin writes before contacting Neon Auth", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const response = await app.request(
      "https://finance.test/api/auth/sign-out",
      {
        method: "POST",
        headers: { Origin: "https://attacker.invalid", "Content-Type": "application/json" },
        body: "{}",
      },
      bindings(),
    );
    expect(response.status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("caps request bodies and fails closed on upstream errors without leaking details", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const oversized = await app.request(
      "https://finance.test/api/auth/sign-in/email",
      {
        method: "POST",
        headers: {
          Origin: appOrigin,
          "Content-Type": "application/json",
          "Content-Length": "70000",
        },
        body: JSON.stringify({ value: "x".repeat(65_000) }),
      },
      bindings(),
    );
    expect(oversized.status).toBe(413);
    expect(fetcher).not.toHaveBeenCalled();

    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("UPSTREAM_SECRET_CANARY");
    }));
    const unavailable = await app.request(
      "https://finance.test/api/auth/get-session",
      undefined,
      bindings(),
    );
    const body = await unavailable.text();
    expect(unavailable.status).toBe(503);
    expect(body).not.toContain("UPSTREAM_SECRET_CANARY");
  });

  it("never follows an upstream redirect", async () => {
    const fetcher = vi.fn(async () =>
      new Response(null, {
        status: 302,
        headers: { Location: "https://attacker.invalid/collect" },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    const response = await app.request(
      "https://finance.test/api/auth/sign-in/email",
      {
        method: "POST",
        headers: { Origin: appOrigin, "Content-Type": "application/json" },
        body: JSON.stringify({ email: "a@example.invalid", password: "synthetic-only" }),
      },
      bindings(),
    );
    expect(response.status).toBe(502);
    expect(response.headers.get("Location")).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("reports auth as unavailable until the server-side proxy is enabled", async () => {
    const fetcher = vi.fn();
    const response = await app.request(
      "https://finance.test/api/auth/get-session",
      undefined,
      bindings({ AUTH_PROXY_ENABLED: "0" }),
    );
    expect(response.status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("denies a replayed cookie and browser-supplied bearer after provider sign-out", async () => {
    const provider = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/sign-out")) return Response.json({ success: true });
      if (url.pathname.endsWith("/get-session")) {
        return Response.json({ session: null, user: null });
      }
      throw new Error("unexpected provider route");
    });
    vi.stubGlobal("fetch", provider);

    const cookie = "__Secure-neonauth.session_token=revoked-cookie-canary";
    const signOut = await app.request(
      "https://finance.test/api/auth/sign-out",
      {
        method: "POST",
        headers: {
          Origin: appOrigin,
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        body: "{}",
      },
      bindings(),
    );
    expect(signOut.status).toBe(200);

    const replay = await app.request(
      "https://finance.test/api/v1/session",
      {
        headers: {
          Cookie: cookie,
          Authorization: "Bearer stale-browser-jwt-canary",
        },
      },
      bindings(),
    );
    const body = await replay.text();
    expect(replay.status).toBe(401);
    expect(body).not.toContain("stale-browser-jwt-canary");
    expect(body).not.toContain("revoked-cookie-canary");
    expect(provider.mock.calls.map(([input]) => new URL(String(input)).pathname)).toEqual([
      "/neondb/auth/sign-out",
      "/neondb/auth/get-session",
    ]);
  });
});

describe("Neon session resolution", () => {
  it("accepts only an active provider cookie and a verified subject JWT", async () => {
    const { publicKey, privateKey } = await generateKeyPair("EdDSA");
    const host = `ep-${crypto.randomUUID()}.neonauth.us-east-1.aws.neon.tech`;
    const base = `https://${host}/neondb/auth`;
    const issuer = `https://${host}`;
    const jwksUrl = `${base}/.well-known/jwks.json`;
    const jwk = await exportJWK(publicKey);
    const kid = crypto.randomUUID();
    jwk.kid = kid;
    jwk.alg = "EdDSA";
    jwk.use = "sig";
    const token = await new SignJWT({ role: "authenticated" })
      .setProtectedHeader({ alg: "EdDSA", kid })
      .setIssuer(issuer)
      .setSubject("user-A")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) !== jwksUrl) throw new Error("unexpected fetch");
      return new Response(JSON.stringify({ keys: [jwk] }), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      });
    }));

    const authFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(`${base}/get-session`);
      expect(new Headers(init?.headers).get("Cookie")).toBe(
        "__Secure-neonauth.session_token=opaque-value",
      );
      return new Response(JSON.stringify({
        session: { id: "session-A" },
        user: { id: "user-A", emailVerified: true },
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Auth-Jwt": token,
          "Set-Cookie": setCookie("__Secure-neonauth.session_token", "rotated-value"),
        },
      });
    });
    const request = new Request(`${appOrigin}/api/v1/private`, {
      headers: {
        Cookie: "__Secure-neonauth.session_token=opaque-value",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await resolveNeonSession(
      request,
      bindings({ NEON_AUTH_URL: base, NEON_AUTH_ISSUER: issuer, NEON_AUTH_JWKS_URL: jwksUrl }),
      authFetch,
    );
    expect(result.ok).toBe(true);
    if (!result.ok || !result.session) throw new Error("verified session expected");
    expect(result.session.subject).toBe("user-A");
    expect(result.session.providerJwt).toBe(token);
    expect(result.refreshedCookies[0]).toContain("rotated-value");
    expect(result.refreshedCookies[0]).not.toMatch(/Domain=/i);
  });

  it("blocks private sessions until the provider confirms email verification", async () => {
    const { publicKey, privateKey } = await generateKeyPair("EdDSA");
    const host = `ep-${crypto.randomUUID()}.neonauth.us-east-1.aws.neon.tech`;
    const base = `https://${host}/neondb/auth`;
    const issuer = `https://${host}`;
    const jwksUrl = `${base}/.well-known/jwks.json`;
    const jwk = await exportJWK(publicKey);
    const kid = crypto.randomUUID();
    Object.assign(jwk, { kid, alg: "EdDSA", use: "sig" });
    const token = await new SignJWT({ role: "authenticated" })
      .setProtectedHeader({ alg: "EdDSA", kid })
      .setIssuer(issuer)
      .setSubject("unverified-user")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === jwksUrl) {
        return new Response(JSON.stringify({ keys: [jwk] }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({
        session: { id: "session-unverified" },
        user: { id: "unverified-user", emailVerified: false },
      }), {
        headers: { "Content-Type": "application/json", "Set-Auth-Jwt": token },
      });
    }));

    const response = await app.request(
      "https://finance.test/api/v1/session",
      { headers: { Cookie: "__Secure-neonauth.session_token=opaque" } },
      bindings({
        NEON_AUTH_URL: base,
        NEON_AUTH_ISSUER: issuer,
        NEON_AUTH_JWKS_URL: jwksUrl,
      }),
    );
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain("unverified-user");
  });

  it("exposes only the current verified subject on the private session endpoint", async () => {
    const { publicKey, privateKey } = await generateKeyPair("EdDSA");
    const host = `ep-${crypto.randomUUID()}.neonauth.us-east-1.aws.neon.tech`;
    const base = `https://${host}/neondb/auth`;
    const issuer = `https://${host}`;
    const jwksUrl = `${base}/.well-known/jwks.json`;
    const jwk = await exportJWK(publicKey);
    const kid = crypto.randomUUID();
    Object.assign(jwk, { kid, alg: "EdDSA", use: "sig" });
    const token = await new SignJWT({ role: "authenticated" })
      .setProtectedHeader({ alg: "EdDSA", kid })
      .setIssuer(issuer)
      .setSubject("user-A")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === jwksUrl) {
        return new Response(JSON.stringify({ keys: [jwk] }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({
        session: { id: "session-A" },
        user: { id: "user-A", emailVerified: true },
      }), {
        headers: { "Content-Type": "application/json", "Set-Auth-Jwt": token },
      });
    }));

    const response = await app.request(
      "https://finance.test/api/v1/session",
      { headers: { Cookie: "__Secure-neonauth.session_token=opaque" } },
      bindings({
        NEON_AUTH_URL: base,
        NEON_AUTH_ISSUER: issuer,
        NEON_AUTH_JWKS_URL: jwksUrl,
      }),
    );
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain('"userId":"user-A"');
    expect(body).not.toContain(token);
    expect(body).not.toContain("providerJwt");
  });

  it("does not accept a bearer JWT when there is no active Neon cookie", async () => {
    const fetcher = vi.fn();
    const result = await resolveNeonSession(
      new Request(`${appOrigin}/api/v1/private`, {
        headers: { Authorization: "Bearer stale-jwt" },
      }),
      bindings(),
      fetcher,
    );
    expect(result).toEqual({ ok: true, session: null, refreshedCookies: [] });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("treats a signed-out or unknown provider cookie as unauthenticated", async () => {
    const host = `ep-${crypto.randomUUID()}.neonauth.us-east-1.aws.neon.tech`;
    const base = `https://${host}/neondb/auth`;
    const issuer = `https://${host}`;
    const jwksUrl = `${base}/.well-known/jwks.json`;
    const authFetch = vi.fn(async () => new Response(JSON.stringify({ session: null, user: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const result = await resolveNeonSession(
      new Request(`${appOrigin}/api/v1/private`, {
        headers: { Cookie: "__Secure-neonauth.session_token=revoked" },
      }),
      bindings({ NEON_AUTH_URL: base, NEON_AUTH_ISSUER: issuer, NEON_AUTH_JWKS_URL: jwksUrl }),
      authFetch,
    );
    expect(result).toEqual({ ok: true, session: null, refreshedCookies: [] });
    expect(authFetch).toHaveBeenCalledTimes(1);
  });
});
