import { createInternalNeonAuth } from "@neondatabase/auth";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
const workerUrl = import.meta.env.VITE_P0_WORKER_URL;
const result = document.querySelector<HTMLPreElement>("#result");

if (!result || !authUrl || !workerUrl) {
  throw new Error("Local P0-005 settings are incomplete.");
}

const authClient = createInternalNeonAuth(authUrl);
const auth = authClient.adapter;
let latestJwt: string | undefined;

type WorkerResult = {
  status: number;
  body: unknown;
};

async function requestWorker(
  path: string,
  token = latestJwt,
  init: RequestInit = {},
): Promise<WorkerResult> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${workerUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

async function signup(label: "A" | "B") {
  const password = `P0-${crypto.randomUUID()}-${crypto.randomUUID()}!`;
  const email = `venfinance-p0-${crypto.randomUUID()}-${label.toLowerCase()}@example.invalid`;
  const signUp = await auth.signUp.email({
    email,
    password,
    name: `POC User ${label}`,
  });
  if (signUp.error) {
    const error = signUp.error as typeof signUp.error & {
      status?: number;
      statusCode?: number;
      code?: string;
      response?: Response;
    };
    return {
      signup: "failed",
      failure: {
        keys: Object.keys(error).sort(),
        status: error.status ?? error.statusCode ?? error.response?.status ?? null,
        code: typeof error.code === "string" ? error.code : null,
      },
    };
  }

  const token = await authClient.getJWTToken();
  if (!token) throw new Error("Neon Auth did not provide a JWT.");
  latestJwt = token;

  const [headerPart, payloadPart] = token.split(".");
  if (!headerPart || !payloadPart) throw new Error("Malformed JWT.");
  const header = JSON.parse(atob(headerPart.replaceAll("-", "+").replaceAll("_", "/")));
  const payload = JSON.parse(atob(payloadPart.replaceAll("-", "+").replaceAll("_", "/")));

  return {
    signup: "ok",
    jwtHeader: { alg: header.alg, kidPresent: typeof header.kid === "string" },
    jwtClaims: {
      keys: Object.keys(payload).sort(),
      issuer: payload.iss,
      audiencePresent: payload.aud !== undefined,
      role: payload.role,
      subjectPresent: typeof payload.sub === "string",
      sessionIdPresent: typeof payload.sid === "string",
      sessionIdClaimKeys: Object.keys(payload).filter((key) =>
        /session|sid/i.test(key),
      ),
      lifetimeSeconds:
        typeof payload.exp === "number" && typeof payload.iat === "number"
          ? payload.exp - payload.iat
          : null,
    },
    tokenAvailable: token.length > 0,
  };
}

async function createRow(marker: string, token = latestJwt) {
  return requestWorker("/__p0/rows", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marker }),
  });
}

const api = {
  health: () => requestWorker("/__p0/health", undefined),
  anonymous: () => requestWorker("/__p0/rows", undefined),
  signupA: () => signup("A"),
  signupB: () => signup("B"),
  currentToken: () => latestJwt,
  createRow,
  list: () => requestWorker("/__p0/rows"),
  listAs: (token: string) => requestWorker("/__p0/rows", token),
  tampered: async () => {
    if (!latestJwt) throw new Error("Create a test user first.");
    const parts = latestJwt.split(".");
    const finalCharacter = parts[1]?.slice(-1);
    parts[1] = `${parts[1]?.slice(0, -1)}${finalCharacter === "x" ? "y" : "x"}`;
    return requestWorker("/__p0/rows", parts.join("."));
  },
  forgedOwner: () =>
    requestWorker("/__p0/rows", latestJwt, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marker: "forged-owner", owner_user_id: "user-B" }),
    }),
  signOutThenReplay: async () => {
    const token = latestJwt;
    if (!token) throw new Error("Create a test user first.");
    await auth.signOut();
    return requestWorker("/__p0/rows", token);
  },
};

Object.assign(window, { p0NeonAuth: api });

void requestWorker("/__p0/health", undefined).then(({ status, body }) => {
  result.textContent = JSON.stringify({ ready: status === 200, worker: body }, null, 2);
});

declare global {
  interface Window {
    p0NeonAuth: typeof api;
  }
}
