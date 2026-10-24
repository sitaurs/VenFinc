import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import {
  errorEnvelope,
  healthSchema,
  publicConfigSchema,
  successEnvelope,
} from "@venfinance/contracts";
import {
  proxyNeonAuth,
  resolveNeonSession,
  type NeonAuthBindings,
} from "./auth";
import financeRoutes from "./finance";
import type { DataApiBindings } from "./database";

type Env = {
  Bindings: NeonAuthBindings & DataApiBindings & { APP_ENV: string; DATABASE_URL?: string };
  Variables: {
    requestId: string;
    identity: {
      subject: string;
      expiresAt: number;
      emailVerified: true;
      providerJwt: string;
    };
  };
};
export const app = new Hono<Env>();

app.use("/api/*", secureHeaders());
app.use("/api/*", async (c, next) => {
  c.set("requestId", crypto.randomUUID());
  c.header("Cache-Control", "private, no-store");
  c.header("Pragma", "no-cache");
  await next();
  c.header("X-Request-ID", c.get("requestId"));
});
app.use("/api/*", async (c, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    const origin = c.req.header("Origin");
    if (!origin || origin !== new URL(c.req.url).origin) {
      return c.json(
        errorEnvelope(
          "FORBIDDEN",
          "Permintaan tidak diizinkan.",
          c.get("requestId"),
        ),
        403,
      );
    }
  }
  return next();
});

// Auth is proxied same-origin so the managed provider's opaque HttpOnly session
// cookie stays on finance.venlab.tech. No client bearer token reaches private APIs.
app.all("/api/auth/*", (c) =>
  proxyNeonAuth(c.req.raw, c.env, c.get("requestId")),
);

app.use("/api/v1/*", async (c, next) => {
  if (["/api/v1/health", "/api/v1/config/public"].includes(c.req.path)) {
    return next();
  }
  const resolution = await resolveNeonSession(c.req.raw, c.env ?? {});
  if (resolution.ok) {
    for (const cookie of resolution.refreshedCookies) {
      c.header("Set-Cookie", cookie, { append: true });
    }
  }
  if (!resolution.ok) {
    return c.json(
      errorEnvelope(
        "DEPENDENCY_UNAVAILABLE",
        "Layanan autentikasi sementara tidak dapat dijangkau.",
        c.get("requestId"),
      ),
      503,
    );
  }
  if (!resolution.session) {
    return c.json(
      errorEnvelope(
        "AUTH_REQUIRED",
        "Masuk diperlukan untuk mengakses data pribadi.",
        c.get("requestId"),
      ),
      401,
    );
  }
  c.set("identity", resolution.session);
  return next();
});

app.get("/api/v1/health", (c) =>
  c.json(
    successEnvelope(
      healthSchema.parse({
        api: "available",
        checkedAt: new Date().toISOString(),
        services: {
          auth:
            c.env?.AUTH_PROXY_ENABLED === "1" &&
            c.env?.NEON_AUTH_ISSUER &&
            c.env?.NEON_AUTH_JWKS_URL
              ? "unknown"
              : "not_configured",
          database: c.env?.NEON_DATA_API_URL ? "unknown" : "not_configured",
          storage: "unknown",
          whatsapp: "not_configured",
          ai: "not_configured",
        },
      }),
      c.get("requestId"),
    ),
  ),
);

app.get("/api/v1/config/public", (c) =>
  c.json(
    successEnvelope(
      publicConfigSchema.parse({
        authAvailable:
          c.env?.AUTH_PROXY_ENABLED === "1" && Boolean(c.env?.NEON_AUTH_URL),
        registrationOpen:
          c.env?.AUTH_PROXY_ENABLED === "1" &&
          c.env?.PUBLIC_SIGNUP_ENABLED === "1" &&
          c.env?.EMAIL_VERIFICATION_ENABLED === "1",
        personalWhatsAppAvailable: false,
        aiAvailable: false,
        defaultLocale: "id-ID",
        supportedLocales: ["id-ID", "en-US"],
      }),
      c.get("requestId"),
    ),
  ),
);

app.get("/api/v1/session", (c) => {
  const identity = c.get("identity");
  return c.json(
    successEnvelope(
      {
        authenticated: true,
        userId: identity.subject,
        expiresAt: new Date(identity.expiresAt * 1000).toISOString(),
      },
      c.get("requestId"),
    ),
  );
});

app.route("/api/v1", financeRoutes);

// Any route without an explicit handler stays closed by default.
app.all("/api/v1/*", (c) =>
  c.json(
    errorEnvelope(
      "NOT_FOUND",
      "Halaman tidak ditemukan.",
      c.get("requestId"),
    ),
    404,
  ),
);
app.notFound((c) =>
  c.json(
    errorEnvelope(
      "NOT_FOUND",
      "Halaman tidak ditemukan.",
      c.get("requestId") || crypto.randomUUID(),
    ),
    404,
  ),
);
app.onError((_error, c) =>
  c.json(
    errorEnvelope(
      "INTERNAL_ERROR",
      "Permintaan belum dapat diproses.",
      c.get("requestId") || crypto.randomUUID(),
    ),
    500,
  ),
);

export default app;
