import { Hono, type Context, type Next } from "hono";
import { secureHeaders } from "hono/secure-headers";
import {
  authDeviceSessionListSchema,
  authSessionMutationSchema,
  authSessionRevokeRequestSchema,
  errorEnvelope,
  healthSchema,
  roleSchema,
  publicConfigSchema,
  successEnvelope,
} from "@venfinance/contracts";
import {
  proxyNeonAuth,
  resolveNeonSession,
  type NeonAuthBindings,
  type VerifiedNeonSession,
} from "./auth";
import { manageNeonSessions } from "./session-management";
import financeRoutes from "./finance";
import { callDataApi, DataApiFailure, type DataApiBindings } from "./database";
import type { R2ProofBucket } from "./proof-storage";
import { proofStorageAvailable } from "./proof-storage";

type PlatformRole = "user" | "admin" | "superuser";

type Env = {
  Bindings: NeonAuthBindings & DataApiBindings & {
    APP_ENV: string;
    DATABASE_URL?: string;
    PROOFS?: R2ProofBucket;
    PROOF_STORAGE_ENABLED?: string;
    PROOF_RETENTION_CLEANUP_READY?: string;
    PROOF_RETENTION_DAYS?: string;
  };
  Variables: {
    requestId: string;
    identity: VerifiedNeonSession;
    platformRole: PlatformRole;
  };
};
export const app = new Hono<Env>();

function parsePlatformRole(value: unknown): PlatformRole | null {
  if (roleSchema.safeParse(value).success) return value as PlatformRole;
  if (Array.isArray(value)) return value.length === 1 ? parsePlatformRole(value[0]) : null;
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  for (const key of ["current_platform_role", "currentPlatformRole", "role"]) {
    if (key in row) return parsePlatformRole(row[key]);
  }
  return null;
}

function roleGuard(allowed: readonly PlatformRole[]) {
  return async (c: Context<Env>, next: Next) => {
    const identity = c.get("identity");
    let role: PlatformRole | null;
    try {
      const result = await callDataApi<unknown>(
        c.env,
        identity.providerJwt,
        { kind: "rpc", name: "current_platform_role" },
      );
      // A user with no row is treated as the least-privileged public role.
      role = result === null ? "user" : parsePlatformRole(result);
    } catch (error) {
      const status = error instanceof DataApiFailure ? error.status : 503;
      if (status === 401) {
        return c.json(
          errorEnvelope("AUTH_REQUIRED", "Sesi perlu diperiksa kembali.", c.get("requestId")),
          401,
        );
      }
      return c.json(
        errorEnvelope(
          "DEPENDENCY_UNAVAILABLE",
          "Hak akses belum dapat diverifikasi.",
          c.get("requestId"),
        ),
        503,
      );
    }
    if (!role || !allowed.includes(role)) {
      return c.json(
        errorEnvelope("FORBIDDEN", "Akses tidak diizinkan.", c.get("requestId")),
        403,
      );
    }
    c.set("platformRole", role);
    return next();
  };
}

async function readSessionCommand(request: Request): Promise<unknown | null> {
  if (request.headers.get("Content-Type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return null;
  }
  if (Number(request.headers.get("Content-Length") ?? 0) > 4096) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return null;
      }
      chunks.push(result.value);
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    return null;
  }
}

function sessionManagementError(c: Context<Env>, reason: "not_found" | "unavailable") {
  return c.json(
    errorEnvelope(
      reason === "not_found" ? "NOT_FOUND" : "DEPENDENCY_UNAVAILABLE",
      reason === "not_found" ? "Sesi tidak ditemukan." : "Pengaturan sesi sementara tidak dapat dimuat.",
      c.get("requestId"),
    ),
    reason === "not_found" ? 404 : 503,
  );
}

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

app.use("/api/v1/admin", roleGuard(["admin", "superuser"]));
app.use("/api/v1/admin/*", roleGuard(["admin", "superuser"]));
app.use("/api/v1/system", roleGuard(["superuser"]));
app.use("/api/v1/system/*", roleGuard(["superuser"]));

app.get("/api/v1/security/sessions", async (c) => {
  const result = await manageNeonSessions(c.req.raw, c.env, c.get("identity"), { type: "list" });
  if (!result.ok) return sessionManagementError(c, result.reason);
  if (result.kind !== "list") return sessionManagementError(c, "unavailable");
  return c.json(
    successEnvelope(authDeviceSessionListSchema.parse(result.sessions), c.get("requestId")),
  );
});

app.post("/api/v1/security/sessions/revoke", async (c) => {
  const parsed = authSessionRevokeRequestSchema.safeParse(await readSessionCommand(c.req.raw));
  if (!parsed.success) {
    return c.json(errorEnvelope("INVALID_INPUT", "Perangkat yang dipilih tidak valid.", c.get("requestId")), 400);
  }
  const result = await manageNeonSessions(c.req.raw, c.env, c.get("identity"), {
    type: "revoke",
    sessionId: parsed.data.sessionId,
  });
  if (!result.ok) return sessionManagementError(c, result.reason);
  if (result.kind !== "mutation") return sessionManagementError(c, "unavailable");
  if (result.clearCookie) c.header("Set-Cookie", result.clearCookie, { append: true });
  return c.json(
    successEnvelope(authSessionMutationSchema.parse({
      revoked: result.revoked,
      currentSessionRevoked: result.currentSessionRevoked,
    }), c.get("requestId")),
  );
});

app.post("/api/v1/security/sessions/revoke-others", async (c) => {
  const parsed = await readSessionCommand(c.req.raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.keys(parsed).length !== 0) {
    return c.json(errorEnvelope("INVALID_INPUT", "Permintaan tidak valid.", c.get("requestId")), 400);
  }
  const result = await manageNeonSessions(c.req.raw, c.env, c.get("identity"), { type: "revoke-others" });
  if (!result.ok) return sessionManagementError(c, result.reason);
  if (result.kind !== "mutation") return sessionManagementError(c, "unavailable");
  return c.json(
    successEnvelope(authSessionMutationSchema.parse({
      revoked: result.revoked,
      currentSessionRevoked: result.currentSessionRevoked,
    }), c.get("requestId")),
  );
});

app.post("/api/v1/security/sessions/revoke-all", async (c) => {
  const parsed = await readSessionCommand(c.req.raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.keys(parsed).length !== 0) {
    return c.json(errorEnvelope("INVALID_INPUT", "Permintaan tidak valid.", c.get("requestId")), 400);
  }
  const result = await manageNeonSessions(c.req.raw, c.env, c.get("identity"), { type: "revoke-all" });
  if (!result.ok) return sessionManagementError(c, result.reason);
  if (result.kind !== "mutation") return sessionManagementError(c, "unavailable");
  if (result.clearCookie) c.header("Set-Cookie", result.clearCookie, { append: true });
  return c.json(
    successEnvelope(authSessionMutationSchema.parse({
      revoked: result.revoked,
      currentSessionRevoked: result.currentSessionRevoked,
    }), c.get("requestId")),
  );
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
        proofUploadsAvailable: proofStorageAvailable({
          enabled: c.env?.PROOF_STORAGE_ENABLED,
          cleanupReady: c.env?.PROOF_RETENTION_CLEANUP_READY,
          retentionDays: c.env?.PROOF_RETENTION_DAYS,
          bucket: c.env?.PROOFS,
        }),
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
