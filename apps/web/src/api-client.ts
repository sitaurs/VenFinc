import { apiErrorSchema, apiMetaSchema } from "@venfinance/contracts";

type RuntimeSchema<T> = { parse(value: unknown): T };

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly publicMessage?: string,
  ) {
    super(code);
    this.name = "ApiClientError";
  }
}

export async function apiData<T>(
  path: string,
  schema: RuntimeSchema<T>,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new ApiClientError(response.status, "INVALID_RESPONSE");
  }
  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(raw);
    throw new ApiClientError(
      response.status,
      parsed.success ? parsed.data.error.code : "REQUEST_FAILED",
      parsed.success ? parsed.data.error.message : undefined,
    );
  }
  if (!raw || typeof raw !== "object" || !("data" in raw) || !("meta" in raw) || !apiMetaSchema.safeParse(raw.meta).success) {
    throw new ApiClientError(response.status, "INVALID_RESPONSE");
  }
  return schema.parse(raw.data);
}

export async function authPost(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new ApiClientError(response.status, "INVALID_RESPONSE");
  }
  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(value);
    throw new ApiClientError(
      response.status,
      parsed.success ? parsed.data.error.code : "AUTH_FAILED",
      parsed.success ? parsed.data.error.message : undefined,
    );
  }
  return value;
}
