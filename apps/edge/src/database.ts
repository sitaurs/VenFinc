export type DataApiBindings = {
  NEON_DATA_API_URL?: string;
};

export type PublicTable = "user_profiles" | "wallets" | "categories" | "budgets" | "budget_periods" | "savings_goals" | "savings_goal_contributions";
export type PublicRpc =
  | "current_platform_role"
  | "list_wallets"
  | "list_finance_events"
  | "post_finance_event"
  | "create_budget"
  | "list_budgets"
  | "ensure_default_categories"
  | "create_savings_goal"
  | "list_savings_goals"
  | "update_savings_goal"
  | "contribute_to_savings_goal"
  | "list_savings_goal_contributions"
  | "get_finance_report";

export type DataApiOperation =
  | {
      kind: "select";
      table: PublicTable;
      query: Record<string, string>;
    }
  | {
      kind: "insert";
      table: PublicTable;
      query?: Record<string, string>;
      body: Record<string, unknown>;
      mergeDuplicates?: boolean;
    }
  | {
      kind: "update";
      table: PublicTable;
      query: Record<string, string>;
      body: Record<string, unknown>;
    }
  | {
      kind: "rpc";
      name: PublicRpc;
      body?: Record<string, unknown>;
    };

export type DataApiFailureCode =
  | "not_configured"
  | "unavailable"
  | "unauthorized"
  | "forbidden"
  | "invalid"
  | "conflict"
  | "negative_balance"
  | "not_found";

export class DataApiFailure extends Error {
  constructor(
    readonly code: DataApiFailureCode,
    readonly status: number,
  ) {
    super(code);
    this.name = "DataApiFailure";
  }
}

const MAX_RESPONSE_BYTES = 256 * 1024;
const allowedHostSuffix = ".neon.tech";

function dataApiBase(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.hostname.endsWith(allowedHostSuffix) ||
      !url.hostname.includes(".apirest.") ||
      !/^\/[a-zA-Z0-9_-]+\/rest\/v1\/?$/.test(url.pathname)
    ) {
      return null;
    }
    url.pathname = url.pathname.replace(/\/$/, "");
    return url;
  } catch {
    return null;
  }
}

async function readBoundedText(response: Response): Promise<string | null> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
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
  return new TextDecoder().decode(body);
}

function failureFromResponse(status: number, body: unknown): DataApiFailure {
  const message =
    body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message
      : "";
  const sqlState =
    body && typeof body === "object" && "code" in body && typeof body.code === "string"
      ? body.code
      : "";

  if (message.includes("NEGATIVE_BALANCE_CONFIRMATION_REQUIRED")) {
    return new DataApiFailure("negative_balance", 422);
  }
  if (message.includes("IDEMPOTENCY_KEY_REUSED") || sqlState === "23505") {
    return new DataApiFailure("conflict", 409);
  }
  if (["WALLET_NOT_FOUND", "CATEGORY_NOT_FOUND", "REFUND_SOURCE_NOT_FOUND"].some((code) => message.includes(code))) {
    return new DataApiFailure("not_found", 404);
  }
  if (status === 401) return new DataApiFailure("unauthorized", 401);
  if (status === 403 || sqlState === "42501") return new DataApiFailure("forbidden", 403);
  if (status === 400 || status === 422 || sqlState === "22023" || sqlState === "23514") {
    return new DataApiFailure("invalid", 422);
  }
  return new DataApiFailure("unavailable", 503);
}

export async function callDataApi<T>(
  env: DataApiBindings,
  providerJwt: string,
  operation: DataApiOperation,
  fetcher: typeof fetch = fetch,
): Promise<T> {
  const base = dataApiBase(env.NEON_DATA_API_URL);
  if (!base) throw new DataApiFailure("not_configured", 503);
  if (!providerJwt || providerJwt.length > 16_384 || /\s/.test(providerJwt)) {
    throw new DataApiFailure("unauthorized", 401);
  }

  const target = new URL(base);
  let method: "GET" | "POST" | "PATCH" = "GET";
  let body: string | undefined;
  let query: Record<string, string> | undefined;
  let prefer = "";
  if (operation.kind === "rpc") {
    method = "POST";
    target.pathname = `${base.pathname}/rpc/${operation.name}`;
    body = JSON.stringify(operation.body ?? {});
  } else {
    target.pathname = `${base.pathname}/${operation.table}`;
    query = operation.query;
    if (operation.kind === "insert") {
      method = "POST";
      body = JSON.stringify(operation.body);
      prefer = operation.mergeDuplicates
        ? "resolution=merge-duplicates,return=representation"
        : "return=representation";
    } else if (operation.kind === "update") {
      method = "PATCH";
      body = JSON.stringify(operation.body);
      prefer = "return=representation";
    }
  }
  if (query) {
    for (const [key, value] of Object.entries(query)) target.searchParams.set(key, value);
  }

  const headers = new Headers({
    Accept: "application/json",
    "Accept-Profile": "public",
    "Content-Profile": "public",
    Authorization: `Bearer ${providerJwt}`,
  });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (prefer) headers.set("Prefer", prefer);

  let response: Response;
  try {
    const init: RequestInit = {
      method,
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    };
    if (body !== undefined) init.body = body;
    response = await fetcher(target, init);
  } catch {
    throw new DataApiFailure("unavailable", 503);
  }
  const text = await readBoundedText(response);
  if (text === null) throw new DataApiFailure("unavailable", 502);
  if (!response.ok) {
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    throw failureFromResponse(response.status, parsed);
  }
  if (!text) return null as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new DataApiFailure("unavailable", 502);
  }
}
