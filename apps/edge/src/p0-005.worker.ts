import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import {
  proxyNeonAuth,
  resolveNeonSession,
  type NeonAuthBindings,
  type VerifiedNeonSession,
} from "./auth";

type P0Env = {
  Bindings: NeonAuthBindings & {
    P0_ENABLED?: string;
    P0_ALLOWED_ORIGIN?: string;
    NEON_DATA_API_URL?: string;
  };
  Variables: {
    identity: VerifiedNeonSession;
  };
};

const app = new Hono<P0Env>();
const dataApiHost = "ep-rapid-flower-b46lkbp1.apirest.c-6.us-east-2.aws.neon.tech";

app.use("/api/auth/*", async (c, next) => {
  if (c.env.P0_ENABLED !== "1") return c.notFound();
  return next();
});
app.all("/api/auth/*", (c) =>
  proxyNeonAuth(c.req.raw, c.env, crypto.randomUUID()),
);

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
    allowHeaders: ["Content-Type"],
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
  const resolution = await resolveNeonSession(c.req.raw, c.env);
  if (!resolution.ok) {
    return c.json({ error: "AUTH_UNAVAILABLE" }, 503);
  }

  for (const cookie of resolution.refreshedCookies) {
    c.header("Set-Cookie", cookie, { append: true });
  }
  if (!resolution.session) return c.json({ error: "AUTH_REQUIRED" }, 401);

  c.set("identity", resolution.session);
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
    Authorization: `Bearer ${identity.providerJwt}`,
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
  return c.json({ rows: result.rows, sessionStatus: "active-cookie" });
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
    owner_user_id: identity.subject,
    marker: body.marker,
  });
  if (result.response) return result.response;
  return c.json(
    { inserted: result.rows, sessionStatus: "active-cookie" },
    201,
  );
});

app.notFound((c) => c.json({ error: "NOT_FOUND" }, 404));
app.onError(() => new Response(JSON.stringify({ error: "INTERNAL_ERROR" }), {
  status: 500,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
}));

export default app;
