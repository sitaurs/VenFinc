export {};

const result = document.querySelector<HTMLPreElement>("#result");

type Result = {
  status: number;
  body: unknown;
  authJwtHeaderExposed?: boolean;
};

async function request(
  path: string,
  init: RequestInit = {},
  includeCookies = true,
): Promise<Result> {
  const headers = new Headers(init.headers);
  const response = await fetch(path, {
    ...init,
    headers,
    credentials: includeCookies ? "same-origin" : "omit",
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  return {
    status: response.status,
    body,
    authJwtHeaderExposed: response.headers.has("Set-Auth-Jwt"),
  };
}

async function postJson(path: string, body: unknown): Promise<Result> {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const api = {
  health: () => request("/__p0/health", {}, false),
  anonymous: () => request("/__p0/rows", {}, false),
  signIn: (email: string, password: string) =>
    postJson("/api/auth/sign-in/email", { email, password }),
  signOut: () => postJson("/api/auth/sign-out", {}),
  createRow: (marker: string) => postJson("/__p0/rows", { marker }),
  list: () => request("/__p0/rows"),
  bearerOnly: () =>
    request(
      "/__p0/rows",
      { headers: { Authorization: "Bearer invalid-p0-test-token" } },
      false,
    ),
  forgedOwner: () =>
    postJson("/__p0/rows", {
      marker: "forged-owner",
      owner_user_id: "forged-user-id",
    }),
};

Object.assign(window, { p0NeonAuth: api });

void api.health().then(({ status, body }) => {
  if (result) {
    result.textContent = JSON.stringify(
      { ready: status === 200, worker: body },
      null,
      2,
    );
  }
});

declare global {
  interface Window {
    p0NeonAuth: typeof api;
  }
}
