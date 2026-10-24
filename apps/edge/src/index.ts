import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import {
  errorEnvelope,
  healthSchema,
  publicConfigSchema,
  successEnvelope,
} from "@venfinance/contracts";

type Env = { Bindings: { APP_ENV: string }; Variables: { requestId: string } };
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

app.get("/api/v1/health", (c) =>
  c.json(
    successEnvelope(
      healthSchema.parse({
        api: "available",
        checkedAt: new Date().toISOString(),
        services: {
          auth: "not_configured",
          database: "not_configured",
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
        authAvailable: false,
        registrationOpen: false,
        personalWhatsAppAvailable: false,
        aiAvailable: false,
        defaultLocale: "id-ID",
        supportedLocales: ["id-ID", "en-US"],
      }),
      c.get("requestId"),
    ),
  ),
);

// No identity adapter has passed P0. Cookies, role headers and body user IDs grant no access.
app.all("/api/v1/*", (c) =>
  c.json(
    errorEnvelope(
      "AUTH_REQUIRED",
      "Masuk diperlukan untuk mengakses data pribadi.",
      c.get("requestId"),
    ),
    401,
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
