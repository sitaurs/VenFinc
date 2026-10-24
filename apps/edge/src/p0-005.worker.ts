import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type RemoteJWKSetOptions,
} from "jose";

type P0Env = {
  Bindings: {
    P0_ENABLED?: string;
    P0_ALLOWED_ORIGIN?: string;
    NEON_AUTH_ISSUER?: string;
    NEON_AUTH_JWKS_URL?: string;
    NEON_DATA_API_URL?: string;
  };
  Variables: {
    identity: { sub: string; payload: JWTPayload; token: string };
  };
};

const app = new Hono<P0Env>();
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
const jwksOptions: RemoteJWKSetOptions = { cooldownDuration: 30_000 };
const dataApiHost = "ep-rapid-flower-b46lkbp1.apirest.c-6.us-east-2.aws.neon.tech";

app.use("/__p0/*", secureHeaders());
app.use("/__p0/*", async (c, next) => {
  c.header("Cache-Control", "private, no-store");
  c.header("Pragma", "no-cache");
  await next();
});
app.use(
  "/__p0/*",
  cors({
    origin: (origin, c) =>
      origin && origin === c.env.P0_ALLOWED_ORIGIN ? origin : "",
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    maxAge: 300,
  }),
);

app.use("/__p0/*", async (c, next) => {
  if (c.env.P0_ENABLED !== "1") return c.notFound();
  return next();
});

app.get("/__p0/health", (c) => c.json({ status: "ok" }));

app.use("/__p0/rows", async (c, next) => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.match(/^Bearer ([^\s]+)$/)?.[1];
  if (!token || token.length > 8192) {
    return c.json({ error: "AUTH_REQUIRED" }, 401);
  }

  const issuer = c.env.NEON_AUTH_ISSUER;
  const jwksUrl = c.env.NEON_AUTH_JWKS_URL;
  if (!issuer || !jwksUrl) return c.json({ error: "AUTH_NOT_CONFIGURED" }, 503);

  let keySet = jwksCache.get(jwksUrl);
  if (!keySet) {
    const parsedJwksUrl = new URL(jwksUrl);
    if (
      parsedJwksUrl.protocol !== "https:" ||
      !parsedJwksUrl.hostname.includes(".neonauth.") ||
      !parsedJwksUrl.pathname.endsWith("/.well-known/jwks.json")
    ) {
      return c.json({ error: "AUTH_NOT_CONFIGURED" }, 503);
    }
    keySet = createRemoteJWKSet(parsedJwksUrl, jwksOptions);
    jwksCache.set(jwksUrl, keySet);
  }

  try {
    const { payload } = await jwtVerify(token, keySet, {
      issuer,
      algorithms: ["EdDSA"],
      requiredClaims: ["sub", "exp", "iss"],
      clockTolerance: 5,
    });
    if (
      typeof payload.sub !== "string" ||
      payload.sub.length === 0 ||
      payload.sub.length > 255 ||
      payload.role !== "authenticated"
    ) {
      return c.json({ error: "AUTH_INVALID" }, 401);
    }
    c.set("identity", { sub: payload.sub, payload, token });
  } catch {
    return c.json({ error: "AUTH_INVALID" }, 401);
  }
  return next();
});

function getDataApiUrl(c: Context<P0Env>): string {
  const value = c.env.NEON_DATA_API_URL;
  if (!value) throw new Error("Data API is not configured");
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== dataApiHost ||
    parsed.pathname !== "/neondb/rest/v1" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("Data API target is outside the staging POC scope");
  }
  return `${parsed.origin}${parsed.pathname}/owner_probe`;
}

async function dataApiRequest(
  c: Context<P0Env>,
  method: "GET" | "POST",
  payload?: { id: string; owner_user_id: string; marker: string },
) {
  const identity = c.get("identity");
  const headers = new Headers({
    Authorization: `Bearer ${identity.token}`,
    Accept: "application/json",
  });
  if (method === "GET") {
    headers.set("Accept-Profile", "p0_005_poc");
  } else {
    headers.set("Content-Profile", "p0_005_poc");
    headers.set("Content-Type", "application/json");
    headers.set("Prefer", "return=representation");
  }

  const response = await fetch(`${getDataApiUrl(c)}?select=id,marker`, {
    method,
    headers,
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  if (!response.ok) {
    return {
      response: c.json(
        {
          error: response.status === 401 ? "AUTH_REJECTED" : "DATA_API_REJECTED",
          upstreamStatus: response.status,
        },
        response.status === 401 ? 401 : response.status === 403 ? 403 : 502,
      ),
      rows: null,
    };
  }
  const rows = await response.json().catch(() => null);
  if (!Array.isArray(rows)) {
    return {
      response: c.json({ error: "DATA_API_INVALID_RESPONSE" }, 502),
      rows: null,
    };
  }
  return { response: null, rows };
}

app.get("/__p0/rows", async (c) => {
  const result = await dataApiRequest(c, "GET");
  if (result.response) return result.response;
  return c.json({ rows: result.rows, sessionStatus: "jwt-only" });
});

app.post("/__p0/rows", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_BODY" }, 400);
  }
  if (
    !body ||
    typeof body !== "object" ||
    Object.keys(body).length !== 1 ||
    !("marker" in body) ||
    typeof body.marker !== "string" ||
    !/^[A-Za-z0-9_-]{1,48}$/.test(body.marker)
  ) {
    return c.json({ error: "INVALID_BODY" }, 400);
  }

  const identity = c.get("identity");
  const result = await dataApiRequest(c, "POST", {
    id: crypto.randomUUID(),
    owner_user_id: identity.sub,
    marker: body.marker,
  });
  if (result.response) return result.response;
  return c.json(
    { inserted: result.rows, sessionStatus: "jwt-only" },
    201,
  );
});

app.notFound((c) => c.json({ error: "NOT_FOUND" }, 404));
app.onError(() => new Response(JSON.stringify({ error: "INTERNAL_ERROR" }), {
  status: 500,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
}));

export default app;
