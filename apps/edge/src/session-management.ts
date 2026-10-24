import {
  appOrigin,
  authTarget,
  trustedAuthBase,
  type NeonAuthBindings,
  type VerifiedNeonSession,
} from "./auth";

const MAX_PROVIDER_BODY_BYTES = 64 * 1024;
const MAX_SESSIONS = 100;

export type SafeAuthSession = {
  id: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string | null;
  current: boolean;
};

export type SessionManagementResult =
  | { ok: true; kind: "list"; sessions: SafeAuthSession[] }
  | {
      ok: true;
      kind: "mutation";
      revoked: true;
      currentSessionRevoked: boolean;
      clearCookie?: string;
    }
  | { ok: false; reason: "not_found" | "unavailable" };

type ProviderSession = {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string | null;
};

type Action =
  | { type: "list" }
  | { type: "revoke"; sessionId: string }
  | { type: "revoke-others" }
  | { type: "revoke-all" };

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 64) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

async function readBoundedJson(response: Response): Promise<unknown | null> {
  if (!response.headers.get("Content-Type")?.toLowerCase().includes("application/json")) return null;
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > MAX_PROVIDER_BODY_BYTES) {
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

function sessionRows(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (Array.isArray(record.sessions)) return record.sessions;
  if (Array.isArray(record.data)) return record.data;
  if (record.data && typeof record.data === "object") {
    const data = record.data as Record<string, unknown>;
    if (Array.isArray(data.sessions)) return data.sessions;
  }
  return null;
}

function parseProviderSessions(value: unknown, ownerId: string): ProviderSession[] | null {
  const rows = sessionRows(value);
  if (!rows || rows.length > MAX_SESSIONS) return null;
  const sessions: ProviderSession[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    const item = row as Record<string, unknown>;
    if (item.userId !== ownerId) continue;
    const createdAt = normalizeDate(item.createdAt);
    const expiresAt = normalizeDate(item.expiresAt);
    if (
      typeof item.id !== "string" || !item.id || item.id.length > 255 ||
      typeof item.token !== "string" || !item.token || item.token.length > 4096 ||
      !createdAt || !expiresAt
    ) return null;
    const userAgent = typeof item.userAgent === "string"
      ? [...item.userAgent]
        .map((character) => {
          const code = character.charCodeAt(0);
          return code < 32 || code === 127 ? " " : character;
        })
        .join("")
        .replace(/\s+/gu, " ")
        .trim()
        .slice(0, 180) || null
      : null;
    sessions.push({ id: item.id, userId: ownerId, token: item.token, createdAt, expiresAt, userAgent });
  }
  return sessions;
}

function clearSessionCookie(identity: VerifiedNeonSession, production: boolean): string {
  const name = identity.authCookie.slice(0, identity.authCookie.indexOf("="));
  const secure = production || name.startsWith("__Secure-") ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly${secure}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None`;
}

async function providerRequest(
  request: Request,
  env: NeonAuthBindings,
  identity: VerifiedNeonSession,
  route: string,
  method: "GET" | "POST",
  fetcher: Fetcher,
): Promise<Response | null> {
  const base = trustedAuthBase(env);
  const origin = appOrigin(request, env);
  if (!base || !origin || !identity.authCookie.includes("=")) return null;
  try {
    return await fetcher(authTarget(base, route), {
      method,
      headers: {
        Accept: "application/json",
        Origin: origin,
        Cookie: identity.authCookie,
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "POST" ? { body: "{}" } : {}),
      redirect: "manual",
    });
  } catch {
    return null;
  }
}

async function getOwnSessions(
  request: Request,
  env: NeonAuthBindings,
  identity: VerifiedNeonSession,
  fetcher: Fetcher,
): Promise<ProviderSession[] | null> {
  const response = await providerRequest(request, env, identity, "/list-sessions", "GET", fetcher);
  if (!response?.ok || response.status >= 300) return null;
  const parsed = parseProviderSessions(await readBoundedJson(response), identity.subject);
  if (!parsed || !parsed.some((session) => session.id === identity.providerSessionId)) return null;
  return parsed;
}

export async function manageNeonSessions(
  request: Request,
  env: NeonAuthBindings,
  identity: VerifiedNeonSession,
  action: Action,
  fetcher: Fetcher = fetch,
): Promise<SessionManagementResult> {
  if (action.type === "list") {
    const sessions = await getOwnSessions(request, env, identity, fetcher);
    if (!sessions) return { ok: false, reason: "unavailable" };
    return {
      ok: true,
      kind: "list",
      sessions: sessions
        .map((session) => ({
          id: session.id,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          userAgent: session.userAgent,
          current: session.id === identity.providerSessionId,
        }))
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    };
  }

  if (action.type === "revoke") {
    const sessions = await getOwnSessions(request, env, identity, fetcher);
    if (!sessions) return { ok: false, reason: "unavailable" };
    const target = sessions.find((session) => session.id === action.sessionId);
    if (!target) return { ok: false, reason: "not_found" };
    const route = "/revoke-session";
    const currentSessionRevoked = target.id === identity.providerSessionId;

    const base = trustedAuthBase(env);
    const origin = appOrigin(request, env);
    if (!base || !origin) return { ok: false, reason: "unavailable" };
    let response: Response;
    try {
      response = await fetcher(authTarget(base, route), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Origin: origin,
          Cookie: identity.authCookie,
        },
        body: JSON.stringify({ token: target.token }),
        redirect: "manual",
      });
    } catch {
      return { ok: false, reason: "unavailable" };
    }
    if (!response.ok || response.status >= 300) return { ok: false, reason: "unavailable" };
    return {
      ok: true,
      kind: "mutation",
      revoked: true,
      currentSessionRevoked,
      ...(currentSessionRevoked ? { clearCookie: clearSessionCookie(identity, env.APP_ENV === "production") } : {}),
    };
  }

  const route = action.type === "revoke-others" ? "/revoke-other-sessions" : "/revoke-sessions";
  const response = await providerRequest(request, env, identity, route, "POST", fetcher);
  if (!response?.ok || response.status >= 300) return { ok: false, reason: "unavailable" };
  const currentSessionRevoked = action.type === "revoke-all";
  return {
    ok: true,
    kind: "mutation",
    revoked: true,
    currentSessionRevoked,
    ...(currentSessionRevoked ? { clearCookie: clearSessionCookie(identity, env.APP_ENV === "production") } : {}),
  };
}
