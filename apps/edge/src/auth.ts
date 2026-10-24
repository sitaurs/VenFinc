import {
  createRemoteJWKSet,
  jwtVerify,
  type RemoteJWKSetOptions,
} from "jose";
import { errorEnvelope } from "@venfinance/contracts";

export type NeonAuthBindings = {
  APP_ENV?: string;
  APP_ORIGIN?: string;
  AUTH_PROXY_ENABLED?: string;
  PUBLIC_SIGNUP_ENABLED?: string;
  EMAIL_VERIFICATION_ENABLED?: string;
  NEON_AUTH_URL?: string;
  NEON_AUTH_ISSUER?: string;
  NEON_AUTH_JWKS_URL?: string;
};

export type VerifiedNeonSession = {
  subject: string;
  expiresAt: number;
  emailVerified: true;
  /** Server-only bearer used to establish the Neon RLS context. Never return it to a client. */
  providerJwt: string;
};

export type SessionResolution =
  | { ok: true; session: null; refreshedCookies: string[] }
  | {
      ok: true;
      session: VerifiedNeonSession;
      refreshedCookies: string[];
    }
  | { ok: false; reason: "not_configured" | "upstream_unavailable" };

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const AUTH_PREFIX = "/api/auth";
const MAX_AUTH_BODY_BYTES = 64 * 1024;
const MAX_COOKIE_BYTES = 8 * 1024;
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
const jwksOptions: RemoteJWKSetOptions = { cooldownDuration: 30_000 };

const allowedAuthRoutes = new Map<string, string>([
  ["GET /get-session", "session"],
  ["POST /sign-in/email", "sign-in"],
  ["POST /sign-out", "sign-out"],
  ["POST /sign-up/email", "sign-up"],
  ["POST /email-otp/send-verification-otp", "verification-otp-send"],
  ["POST /email-otp/verify-email", "verification-otp-verify"],
  ["POST /email-otp/check-verification-otp", "verification-otp-check"],
  ["POST /forget-password/email-otp", "password-reset-otp-send"],
  // @neondatabase/auth 0.7 exposes emailOtp.resetPassword via the Managed Auth
  // `email-otp/passcode` route (the Better Auth plugin's lower-level route is
  // different, so do not proxy that uncontracted endpoint).
  ["POST /email-otp/passcode", "password-reset-otp-apply"],
]);

const emailPattern = /^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/u;
const otpPattern = /^[0-9]{4,12}$/u;

function jsonError(
  code: "AUTH_REQUIRED" | "FORBIDDEN" | "DEPENDENCY_UNAVAILABLE" | "NOT_FOUND" | "INVALID_INPUT",
  message: string,
  requestId: string,
  status: number,
): Response {
  return new Response(JSON.stringify(errorEnvelope(code, message, requestId)), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function trustedAuthBase(env: NeonAuthBindings): URL | null {
  if (env.AUTH_PROXY_ENABLED !== "1" || !env.NEON_AUTH_URL) return null;
  try {
    const value = new URL(env.NEON_AUTH_URL);
    if (
      value.protocol !== "https:" ||
      value.username ||
      value.password ||
      value.search ||
      value.hash ||
      !value.hostname.includes(".neonauth.") ||
      !(value.hostname.endsWith(".neon.tech") || value.hostname.endsWith(".neon.build")) ||
      !value.pathname.replace(/\/$/, "").endsWith("/auth")
    ) {
      return null;
    }
    value.pathname = value.pathname.replace(/\/$/, "");
    return value;
  } catch {
    return null;
  }
}

function appOrigin(request: Request, env: NeonAuthBindings): string {
  try {
    const configured = env.APP_ORIGIN ? new URL(env.APP_ORIGIN) : new URL(request.url);
    if (
      (configured.protocol !== "https:" && configured.hostname !== "127.0.0.1" && configured.hostname !== "localhost") ||
      configured.username ||
      configured.password ||
      configured.pathname !== "/" ||
      configured.search ||
      configured.hash
    ) {
      return "";
    }
    return configured.origin;
  } catch {
    return "";
  }
}

function getNeonSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader || cookieHeader.length > MAX_COOKIE_BYTES) return null;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    if (name === "__Secure-neonauth.session_token" || name === "neonauth.session_token") {
      const value = part.slice(separator + 1).trim();
      if (!value || /[\r\n;]/.test(value)) return null;
      return `${name}=${value}`;
    }
  }
  return null;
}

function getSetCookieLines(headers: Headers): string[] {
  return typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : headers.get("Set-Cookie")
      ? [headers.get("Set-Cookie") as string]
      : [];
}

function normalizeAuthCookie(line: string, authHost: string, production: boolean): string | null {
  const parts = line.split(";");
  const pair = parts.shift()?.trim();
  if (!pair) return null;
  const separator = pair.indexOf("=");
  if (separator < 1) return null;
  const name = pair.slice(0, separator).trim();
  const value = pair.slice(separator + 1);
  if (name !== "__Secure-neonauth.session_token" && name !== "neonauth.session_token") {
    return null;
  }
  if (/[\r\n;]/.test(value)) return null;

  let sameSite: string | undefined;
  let expires: string | undefined;
  let maxAge: string | undefined;
  for (const part of parts) {
    const [rawName, ...rawValue] = part.trim().split("=");
    const key = rawName?.toLowerCase();
    const value = rawValue.join("=").trim();
    if (key === "domain") {
      const domain = value.replace(/^\./, "").toLowerCase();
      if (
        domain !== authHost.toLowerCase() &&
        domain !== "neon.tech" &&
        !domain.endsWith(".neon.tech") &&
        domain !== "neon.build" &&
        !domain.endsWith(".neon.build")
      ) {
        return null;
      }
    } else if (key === "samesite" && value) {
      sameSite = /^(?:strict|lax|none)$/i.test(value) ? value : undefined;
    } else if (key === "expires" && value) {
      expires = value;
    } else if (key === "max-age" && value) {
      maxAge = /^-?\d+$/.test(value) ? value : undefined;
    }
  }

  const attributes = ["Path=/", "HttpOnly"];
  if (production || parts.some((part) => part.trim().toLowerCase() === "secure")) {
    attributes.push("Secure");
  }
  if (maxAge) attributes.push(`Max-Age=${maxAge}`);
  if (expires) attributes.push(`Expires=${expires}`);
  attributes.push(`SameSite=${sameSite ?? "None"}`);
  return `${pair}; ${attributes.join("; ")}`;
}

function sanitizeAuthResponseBody(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeAuthResponseBody);
  if (!value || typeof value !== "object") return value;
  const safe: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (/(?:token|secret|password|authorization)/i.test(key)) {
      continue;
    }
    safe[key] = sanitizeAuthResponseBody(child);
  }
  return safe;
}

function responseHeaders(
  upstream: Response,
  authHost: string,
  production: boolean,
): Headers {
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  const contentType = upstream.headers.get("Content-Type");
  if (contentType?.toLowerCase().startsWith("application/json")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  } else if (contentType) {
    headers.set("Content-Type", contentType);
  }
  for (const cookie of getSetCookieLines(upstream.headers)) {
    const safeCookie = normalizeAuthCookie(cookie, authHost, production);
    if (safeCookie) headers.append("Set-Cookie", safeCookie);
  }
  return headers;
}

function authTarget(base: URL, route: string): URL {
  const target = new URL(base);
  target.pathname = `${base.pathname}${route}`;
  return target;
}

function readRequestRoute(request: Request): { method: string; route: string } | null {
  const url = new URL(request.url);
  if (url.search || url.hash) return null;
  const rawPath = url.pathname;
  if (/%(?:2f|2e|5c)/i.test(rawPath) || rawPath.includes("\\") || rawPath.includes("//")) {
    return null;
  }
  const route = rawPath.slice(AUTH_PREFIX.length);
  const method = request.method.toUpperCase();
  return allowedAuthRoutes.has(`${method} ${route}`) ? { method, route } : null;
}

async function readBoundedBody(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<Uint8Array | null> {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > maxBytes) {
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
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function normalizedAuthBody(route: string, bytes: Uint8Array): string | null {
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const exactKeys = (allowed: string[]) =>
    Object.keys(input).length === allowed.length && Object.keys(input).every((key) => allowed.includes(key));
  if (route === "/sign-out") return exactKeys([]) ? "{}" : null;
  const email = input.email;
  if (typeof email !== "string" || email.length > 254 || !emailPattern.test(email.trim())) {
    return null;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const password = input.password;
  const otp = input.otp;

  switch (route) {
    case "/sign-in/email":
      return exactKeys(["email", "password"]) && typeof password === "string" && password.length <= 128
        ? JSON.stringify({ email: normalizedEmail, password })
        : null;
    case "/sign-up/email": {
      const name = input.name;
      return exactKeys(["name", "email", "password"]) && typeof name === "string" &&
        name.trim().length > 0 && name.trim().length <= 100 &&
        typeof password === "string" && password.length >= 8 && password.length <= 128
        ? JSON.stringify({ name: name.trim(), email: normalizedEmail, password })
        : null;
    }
    case "/email-otp/send-verification-otp":
      return exactKeys(["email", "type"]) && input.type === "email-verification"
        ? JSON.stringify({ email: normalizedEmail, type: "email-verification" })
        : null;
    case "/email-otp/verify-email":
      return exactKeys(["email", "otp"]) && typeof otp === "string" && otpPattern.test(otp)
        ? JSON.stringify({ email: normalizedEmail, otp })
        : null;
    case "/email-otp/check-verification-otp":
      return exactKeys(["email", "otp", "type"]) && typeof otp === "string" &&
        otpPattern.test(otp) && input.type === "forget-password"
        ? JSON.stringify({ email: normalizedEmail, otp, type: "forget-password" })
        : null;
    case "/forget-password/email-otp":
      return exactKeys(["email"]) ? JSON.stringify({ email: normalizedEmail }) : null;
    case "/email-otp/passcode":
      return exactKeys(["email", "otp", "password"]) && typeof otp === "string" &&
        otpPattern.test(otp) && typeof password === "string" &&
        password.length >= 8 && password.length <= 128
        ? JSON.stringify({ email: normalizedEmail, otp, password })
        : null;
    default:
      return null;
  }
}

function safeProviderFailure(
  route: string,
  status: number,
  requestId: string,
): Response {
  if (status === 429) {
    return jsonError(
      "INVALID_INPUT",
      "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
      requestId,
      429,
    );
  }
  if (status >= 500) {
    return jsonError(
      "DEPENDENCY_UNAVAILABLE",
      "Layanan autentikasi sementara tidak dapat dijangkau.",
      requestId,
      503,
    );
  }
  if (route === "/forget-password/email-otp" || route === "/email-otp/send-verification-otp") {
    // The caller must not learn whether an email has an account or a pending verification.
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "private, no-store",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (route === "/sign-in/email") {
    return jsonError("AUTH_REQUIRED", "Email atau kata sandi belum cocok.", requestId, 401);
  }
  if (route === "/email-otp/verify-email" || route === "/email-otp/check-verification-otp" || route === "/email-otp/passcode") {
    return jsonError("INVALID_INPUT", "Kode tidak valid atau sudah kedaluwarsa.", requestId, 400);
  }
  return jsonError("INVALID_INPUT", "Permintaan autentikasi tidak dapat diproses.", requestId, 400);
}

export async function proxyNeonAuth(
  request: Request,
  env: NeonAuthBindings,
  requestId: string,
  fetcher: Fetcher = fetch,
): Promise<Response> {
  const base = trustedAuthBase(env);
  if (!base) {
    return jsonError(
      "DEPENDENCY_UNAVAILABLE",
      "Autentikasi belum tersedia.",
      requestId,
      503,
    );
  }

  const route = readRequestRoute(request);
  if (!route) return jsonError("NOT_FOUND", "Halaman tidak ditemukan.", requestId, 404);

  if (
    route.route === "/sign-up/email" &&
    (env.PUBLIC_SIGNUP_ENABLED !== "1" || env.EMAIL_VERIFICATION_ENABLED !== "1")
  ) {
    return jsonError("FORBIDDEN", "Pendaftaran belum dibuka.", requestId, 403);
  }

  const expectedOrigin = appOrigin(request, env);
  const suppliedOrigin = request.headers.get("Origin");
  if (!expectedOrigin || (suppliedOrigin && suppliedOrigin !== expectedOrigin)) {
    return jsonError("FORBIDDEN", "Permintaan tidak diizinkan.", requestId, 403);
  }
  if (route.method !== "GET" && suppliedOrigin !== expectedOrigin) {
    return jsonError("FORBIDDEN", "Permintaan tidak diizinkan.", requestId, 403);
  }

  let body: Uint8Array | undefined;
  if (route.method !== "GET") {
    const contentType = request.headers.get("Content-Type")?.split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== "application/json") {
      return jsonError("INVALID_INPUT", "Format permintaan tidak valid.", requestId, 400);
    }
    const advertisedLength = Number(request.headers.get("Content-Length") ?? 0);
    if (advertisedLength > MAX_AUTH_BODY_BYTES) {
      return jsonError("INVALID_INPUT", "Permintaan terlalu besar.", requestId, 413);
    }
    const bounded = await readBoundedBody(request.body, MAX_AUTH_BODY_BYTES);
    if (!bounded) {
      return jsonError("INVALID_INPUT", "Permintaan terlalu besar.", requestId, 413);
    }
    const normalized = normalizedAuthBody(route.route, bounded);
    if (!normalized) {
      return jsonError("INVALID_INPUT", "Data autentikasi tidak valid.", requestId, 400);
    }
    body = new TextEncoder().encode(normalized);
  }

  const headers = new Headers({
    Accept: "application/json",
    Origin: expectedOrigin,
    "X-Request-ID": requestId,
  });
  if (route.method !== "GET") headers.set("Content-Type", "application/json");
  const sessionCookie = getNeonSessionCookie(request.headers.get("Cookie"));
  if (sessionCookie) headers.set("Cookie", sessionCookie);

  let upstream: Response;
  try {
    upstream = await fetcher(authTarget(base, route.route), {
      method: route.method,
      headers,
      ...(body ? { body: new TextDecoder().decode(body) } : {}),
      redirect: "manual",
    });
  } catch {
    return jsonError(
      "DEPENDENCY_UNAVAILABLE",
      "Layanan autentikasi sementara tidak dapat dijangkau.",
      requestId,
      503,
    );
  }

  if (upstream.status >= 300 && upstream.status < 400) {
    return jsonError(
      "DEPENDENCY_UNAVAILABLE",
      "Alur autentikasi belum dapat diproses.",
      requestId,
      502,
    );
  }

  if (!upstream.ok) return safeProviderFailure(route.route, upstream.status, requestId);

  if (route.route === "/forget-password/email-otp") {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "private, no-store",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const response = responseHeaders(upstream, base.hostname, env.APP_ENV === "production");
  let responseBody: BodyInit | null = null;
  if (upstream.status !== 204 && upstream.status !== 304) {
    const bounded = await readBoundedBody(upstream.body, MAX_AUTH_BODY_BYTES);
    if (!bounded) {
      return jsonError(
        "DEPENDENCY_UNAVAILABLE",
        "Respons autentikasi tidak dapat diproses.",
        requestId,
        502,
      );
    }
    if (!response.get("Content-Type")?.startsWith("application/json")) {
      return jsonError(
        "DEPENDENCY_UNAVAILABLE",
        "Respons autentikasi tidak dapat diproses.",
        requestId,
        502,
      );
    }
    try {
      const raw = new TextDecoder().decode(bounded);
      responseBody = JSON.stringify(sanitizeAuthResponseBody(JSON.parse(raw)));
    } catch {
      return jsonError(
        "DEPENDENCY_UNAVAILABLE",
        "Respons autentikasi tidak dapat diproses.",
        requestId,
        502,
      );
    }
  }

  return new Response(responseBody, { status: upstream.status, headers: response });
}

function getJwks(url: string) {
  let keySet = jwksCache.get(url);
  if (!keySet) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (
      parsed.protocol !== "https:" ||
      !parsed.hostname.includes(".neonauth.") ||
      !(parsed.hostname.endsWith(".neon.tech") || parsed.hostname.endsWith(".neon.build")) ||
      !parsed.pathname.endsWith("/.well-known/jwks.json") ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }
    keySet = createRemoteJWKSet(parsed, jwksOptions);
    jwksCache.set(url, keySet);
  }
  return keySet;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getActiveUser(value: unknown): { id: string; emailVerified: boolean } | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const nested = record.data && typeof record.data === "object"
    ? (record.data as Record<string, unknown>)
    : record;
  const session = nested.session;
  const user = nested.user;
  if (
    !session ||
    typeof session !== "object" ||
    typeof (session as Record<string, unknown>).id !== "string" ||
    !user ||
    typeof user !== "object"
  ) return null;
  const userRecord = user as Record<string, unknown>;
  const id = userRecord.id;
  return typeof id === "string" && id.length > 0 && id.length <= 255
    ? { id, emailVerified: userRecord.emailVerified === true }
    : null;
}

function normalizeRefreshedCookies(response: Response, authHost: string, production: boolean) {
  return getSetCookieLines(response.headers)
    .map((cookie) => normalizeAuthCookie(cookie, authHost, production))
    .filter((cookie): cookie is string => cookie !== null);
}

export async function resolveNeonSession(
  request: Request,
  env: NeonAuthBindings,
  fetcher: Fetcher = fetch,
): Promise<SessionResolution> {
  const base = trustedAuthBase(env);
  const issuer = env.NEON_AUTH_ISSUER;
  const jwksUrl = env.NEON_AUTH_JWKS_URL;
  const keySet = jwksUrl ? getJwks(jwksUrl) : null;
  if (!base || !issuer || !keySet) {
    return { ok: false, reason: "not_configured" };
  }

  const cookie = getNeonSessionCookie(request.headers.get("Cookie"));
  if (!cookie) return { ok: true, session: null, refreshedCookies: [] };

  const origin = appOrigin(request, env);
  if (!origin) return { ok: false, reason: "not_configured" };
  let upstream: Response;
  try {
    upstream = await fetcher(authTarget(base, "/get-session"), {
      method: "GET",
      headers: { Accept: "application/json", Cookie: cookie, Origin: origin },
      redirect: "manual",
    });
  } catch {
    return { ok: false, reason: "upstream_unavailable" };
  }

  const refreshedCookies = normalizeRefreshedCookies(
    upstream,
    base.hostname,
    env.APP_ENV === "production",
  );
  if (upstream.status === 401 || upstream.status === 403) {
    return { ok: true, session: null, refreshedCookies };
  }
  if (!upstream.ok || upstream.status >= 300) {
    return { ok: false, reason: "upstream_unavailable" };
  }

  const activeUser = getActiveUser(await readJson(upstream));
  const providerJwt = upstream.headers.get("Set-Auth-Jwt");
  if (!activeUser || !activeUser.emailVerified || !providerJwt || providerJwt.length > 8192) {
    return { ok: true, session: null, refreshedCookies };
  }

  try {
    const { payload } = await jwtVerify(providerJwt, keySet, {
      issuer,
      algorithms: ["EdDSA"],
      requiredClaims: ["sub", "exp", "iss"],
      clockTolerance: 5,
    });
    if (
      typeof payload.sub !== "string" ||
      payload.sub !== activeUser.id ||
      payload.role !== "authenticated" ||
      typeof payload.exp !== "number"
    ) {
      return { ok: true, session: null, refreshedCookies };
    }
    return {
      ok: true,
      session: {
        subject: payload.sub,
        expiresAt: payload.exp,
        emailVerified: true,
        providerJwt,
      },
      refreshedCookies,
    };
  } catch {
    return { ok: true, session: null, refreshedCookies };
  }
}

