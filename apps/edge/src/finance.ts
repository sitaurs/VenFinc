import { Hono, type Context } from "hono";
import {
  categoryCreateSchema,
  categorySchema,
  effectiveAtSchema,
  errorEnvelope,
  financeEventSchema,
  financePostResultSchema,
  financePostSchema,
  idempotencyKeySchema,
  paginationSchema,
  roleSchema,
  successEnvelope,
  userProfileCreateSchema,
  walletCreateSchema,
  walletSchema,
} from "@venfinance/contracts";
import {
  callDataApi,
  DataApiFailure,
  type DataApiBindings,
} from "./database";
import type { VerifiedNeonSession } from "./auth";

type FinanceEnv = {
  Bindings: DataApiBindings;
  Variables: {
    requestId: string;
    identity: VerifiedNeonSession;
  };
};
type FinanceContext = Context<FinanceEnv>;

type DbRow = Record<string, unknown>;
const api = new Hono<FinanceEnv>();

function fail(
  c: FinanceContext,
  code: Parameters<typeof errorEnvelope>[0],
  message: string,
  status: 400 | 401 | 403 | 404 | 409 | 413 | 422 | 503,
) {
  return c.json(errorEnvelope(code, message, c.get("requestId")), status);
}

function dataFailure(
  c: FinanceContext,
  error: unknown,
  idempotent = false,
) {
  if (!(error instanceof DataApiFailure)) {
    return fail(c, "DEPENDENCY_UNAVAILABLE", "Data belum dapat dimuat. Coba lagi.", 503);
  }
  switch (error.code) {
    case "unauthorized":
      return fail(c, "AUTH_REQUIRED", "Sesi berakhir. Masuk kembali untuk melanjutkan.", 401);
    case "forbidden":
      return fail(c, "FORBIDDEN", "Tindakan tidak diizinkan.", 403);
    case "not_found":
      return fail(c, "NOT_FOUND", "Data tidak ditemukan.", 404);
    case "invalid":
      return fail(c, "INVALID_INPUT", "Data tidak dapat diproses.", 422);
    case "negative_balance":
      return fail(c, "INVALID_INPUT", "Saldo akan menjadi minus. Konfirmasikan untuk tetap mencatat.", 422);
    case "conflict":
      return fail(
        c,
        idempotent ? "IDEMPOTENCY_KEY_REUSED" : "VERSION_CONFLICT",
        idempotent
          ? "Kunci pengiriman yang sama sudah dipakai untuk data berbeda."
          : "Data berubah. Muat ulang lalu coba kembali.",
        409,
      );
    case "not_configured":
    case "unavailable":
      return fail(c, "DEPENDENCY_UNAVAILABLE", "Data sementara tidak dapat dijangkau.", 503);
  }
}

async function requestJson(c: FinanceContext, maxBytes = 16 * 1024) {
  const contentType = c.req.header("Content-Type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return { ok: false as const, value: undefined };
  const contentLength = Number(c.req.header("Content-Length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false as const, value: undefined, tooLarge: true };
  }
  const stream = c.req.raw.body;
  if (!stream) return { ok: false as const, value: undefined };
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
        return { ok: false as const, value: undefined, tooLarge: true };
      }
      chunks.push(result.value);
    }
  } catch {
    return { ok: false as const, value: undefined };
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
    return { ok: true as const, value: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { ok: false as const, value: undefined };
  }
}

function rows(value: unknown): DbRow[] {
  if (!Array.isArray(value)) throw new Error("Invalid database response");
  return value.filter((item): item is DbRow => Boolean(item) && typeof item === "object" && !Array.isArray(item));
}

function mapWallet(row: DbRow) {
  return walletSchema.parse({
    id: row.wallet_id ?? row.id,
    name: row.name,
    type: row.wallet_type ?? row.type,
    currency: row.currency,
    balanceMinor: row.balance_minor ?? "0",
    archivedAt: row.archived_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function mapCategory(row: DbRow) {
  return categorySchema.parse({
    id: row.id,
    name: row.name,
    parentId: row.parent_id ?? null,
    iconKey: row.icon_key ?? null,
    colorToken: row.color_token ?? null,
    archivedAt: row.archived_at ?? null,
  });
}

function mapFinanceEvent(row: DbRow) {
  const allocations = Array.isArray(row.allocations) ? row.allocations : [];
  return financeEventSchema.parse({
    id: row.event_id,
    kind: row.kind,
    status: row.status,
    amountMinor: row.amount_minor,
    currency: row.currency,
    walletId: row.wallet_id ?? null,
    walletName: row.wallet_name ?? null,
    destinationWalletId: row.destination_wallet_id ?? null,
    destinationWalletName: row.destination_wallet_name ?? null,
    categoryId: row.category_id ?? null,
    categoryName: row.category_name ?? null,
    effectiveAt: row.effective_at,
    timezone: row.timezone,
    note: row.note ?? null,
    merchant: row.merchant ?? null,
    sourceChannel: row.source_channel,
    refundOf: row.refund_of ?? null,
    allocations: allocations.map((allocation) => {
      if (!allocation || typeof allocation !== "object") throw new Error("Invalid allocation response");
      const item = allocation as DbRow;
      return {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        amountMinor: item.amountMinor,
        note: item.note ?? null,
      };
    }),
    negativeBalanceConfirmed: row.negative_balance_confirmed,
    createdAt: row.created_at,
  });
}

function base64Url(value: string): string {
  const encoded = btoa(value);
  return encoded.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function readCursor(value: string | undefined): { effectiveAt: string; id: string } | null {
  if (!value) return null;
  if (value.length > 512 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid cursor");
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const decoded = JSON.parse(atob(base64)) as unknown;
    if (!decoded || typeof decoded !== "object") throw new Error("invalid cursor");
    const cursor = decoded as Record<string, unknown>;
    if (typeof cursor.effectiveAt !== "string" || typeof cursor.id !== "string") throw new Error("invalid cursor");
    return {
      effectiveAt: effectiveAtSchema.parse(cursor.effectiveAt),
      id: idempotencyKeySchema.parse(cursor.id),
    };
  } catch {
    throw new Error("invalid cursor");
  }
}

api.get("/me", async (c) => {
  const identity = c.get("identity");
  try {
    const profileRows = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "select",
      table: "user_profiles",
      query: {
        select: "user_id,display_name,locale,timezone,preferred_currency,account_status,onboarding_at",
        user_id: `eq.${identity.subject}`,
        limit: "1",
      },
    }));
    const roleValue = await callDataApi<unknown>(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "current_platform_role",
    });
    const role = roleValue === null ? "user" : roleSchema.parse(roleValue);
    if (profileRows.length === 0) {
      return c.json(successEnvelope({ profile: null, role }, c.get("requestId")));
    }
    const row = profileRows[0]!;
    const profile = {
      userId: row.user_id,
      displayName: row.display_name ?? null,
      locale: row.locale,
      timezone: row.timezone,
      preferredCurrency: row.preferred_currency,
      accountStatus: row.account_status,
      onboardingAt: row.onboarding_at ?? null,
      role,
    };
    return c.json(successEnvelope(profile, c.get("requestId")));
  } catch (error) {
    if (error instanceof DataApiFailure) return dataFailure(c, error);
    return fail(c, "DEPENDENCY_UNAVAILABLE", "Profil belum dapat dimuat.", 503);
  }
});

api.post("/me", async (c) => {
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, body.tooLarge ? "INVALID_INPUT" : "INVALID_INPUT", "Data profil tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = userProfileCreateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Data profil tidak valid.", 400);
  const identity = c.get("identity");
  try {
    const inserted = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "insert",
      table: "user_profiles",
      query: {
        on_conflict: "user_id",
        select: "user_id,display_name,locale,timezone,preferred_currency,account_status,onboarding_at",
      },
      mergeDuplicates: true,
      body: {
        user_id: identity.subject,
        display_name: parsed.data.displayName,
        locale: parsed.data.locale,
        timezone: parsed.data.timezone,
      },
    }));
    if (inserted.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Profil belum dapat disimpan.", 503);
    const role = roleSchema.parse(await callDataApi<unknown>(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "current_platform_role",
    }));
    const row = inserted[0]!;
    return c.json(successEnvelope({
      profile: {
        userId: row.user_id,
        displayName: row.display_name ?? null,
        locale: row.locale,
        timezone: row.timezone,
        preferredCurrency: row.preferred_currency,
        accountStatus: row.account_status,
        onboardingAt: row.onboarding_at ?? null,
        role,
      },
    }, c.get("requestId")), 201);
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.get("/wallets", async (c) => {
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "list_wallets",
    })).map(mapWallet);
    return c.json(successEnvelope(result, c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.post("/wallets", async (c) => {
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Data dompet tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = walletCreateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Data dompet tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const inserted = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "insert",
      table: "wallets",
      query: { select: "id,name,type,currency,archived_at,created_at,updated_at" },
      body: { user_id: identity.subject, name: parsed.data.name, type: parsed.data.type, currency: "IDR" },
    }));
    if (inserted.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Dompet belum dapat dibuat.", 503);
    return c.json(successEnvelope(mapWallet(inserted[0]!), c.get("requestId")), 201);
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.get("/categories", async (c) => {
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "select",
      table: "categories",
      query: {
        select: "id,name,parent_id,icon_key,color_token,archived_at",
        archived_at: "is.null",
        order: "name.asc,id.asc",
        limit: "100",
      },
    })).map(mapCategory);
    return c.json(successEnvelope(result, c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.post("/categories", async (c) => {
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Data kategori tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = categoryCreateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Data kategori tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const inserted = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "insert",
      table: "categories",
      query: { select: "id,name,parent_id,icon_key,color_token,archived_at" },
      body: {
        user_id: identity.subject,
        name: parsed.data.name,
        parent_id: parsed.data.parentId ?? null,
        icon_key: parsed.data.iconKey ?? null,
        color_token: parsed.data.colorToken ?? null,
      },
    }));
    if (inserted.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Kategori belum dapat dibuat.", 503);
    return c.json(successEnvelope(mapCategory(inserted[0]!), c.get("requestId")), 201);
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.get("/transactions", async (c) => {
  const params = new URL(c.req.url).searchParams;
  const allowed = new Set(["cursor", "limit", "kind", "from", "to"]);
  if ([...params.keys()].some((key) => !allowed.has(key))) {
    return fail(c, "INVALID_INPUT", "Filter transaksi tidak valid.", 400);
  }
  const pageParsed = paginationSchema.safeParse({
    cursor: params.get("cursor") ?? undefined,
    limit: params.get("limit") ?? undefined,
  });
  if (!pageParsed.success) return fail(c, "INVALID_INPUT", "Halaman transaksi tidak valid.", 400);
  const kind = params.get("kind");
  const from = params.get("from");
  const to = params.get("to");
  const cursorValue = (() => {
    try {
      return readCursor(pageParsed.data.cursor);
    } catch {
      return undefined;
    }
  })();
  if (cursorValue === undefined || (kind && !["income", "expense", "transfer", "refund", "adjustment", "debt_payment", "debt_opening", "loan_disbursement", "loan_receipt", "savings_transfer", "opening"].includes(kind))) {
    return fail(c, "INVALID_INPUT", "Filter transaksi tidak valid.", 400);
  }
  const parsedFrom = from ? effectiveAtSchema.safeParse(from) : null;
  const parsedTo = to ? effectiveAtSchema.safeParse(to) : null;
  if (
    (from && !parsedFrom?.success) ||
    (to && !parsedTo?.success) ||
    (from && to && parsedFrom?.success && parsedTo?.success && Date.parse(parsedFrom.data) >= Date.parse(parsedTo.data))
  ) {
    return fail(c, "INVALID_INPUT", "Rentang waktu transaksi tidak valid.", 400);
  }
  try {
    const identity = c.get("identity");
    const requestedLimit = pageParsed.data.limit;
    const raw = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "list_finance_events",
      body: {
        p_limit: Math.min(requestedLimit + 1, 100),
        p_before_effective_at: cursorValue?.effectiveAt ?? null,
        p_before_id: cursorValue?.id ?? null,
        p_kind: kind || null,
        p_from: from || null,
        p_to: to || null,
      },
    }));
    const hasMore = raw.length > requestedLimit;
    const items = raw.slice(0, requestedLimit).map(mapFinanceEvent);
    const last = items.at(-1);
    return c.json(successEnvelope({
      items,
      page: {
        hasMore,
        nextCursor: hasMore && last
          ? base64Url(JSON.stringify({ effectiveAt: last.effectiveAt, id: last.id }))
          : null,
      },
    }, c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.post("/transactions", async (c) => {
  const idempotencyKey = idempotencyKeySchema.safeParse(c.req.header("Idempotency-Key"));
  if (!idempotencyKey.success) return fail(c, "INVALID_INPUT", "Kunci idempotensi wajib berupa UUID.", 400);
  const body = await requestJson(c, 16 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Data transaksi tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = financePostSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Data transaksi tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const command = parsed.data;
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "post_finance_event",
      body: {
        p_kind: command.kind,
        p_wallet_id: command.walletId,
        p_destination_wallet_id: command.destinationWalletId ?? null,
        p_amount_minor: command.amountMinor,
        p_currency: command.currency,
        p_effective_at: command.effectiveAt,
        p_timezone: command.timezone,
        p_idempotency_key: idempotencyKey.data,
        p_allocations: command.allocations.map((allocation) => ({
          categoryId: allocation.categoryId,
          amountMinor: allocation.amountMinor,
        })),
        p_note: command.note ?? null,
        p_merchant: command.merchant ?? null,
        p_direction: command.direction ?? null,
        p_refunds_event_id: command.refundOf ?? null,
        p_allow_negative: command.allowNegative,
        p_trace_id: c.get("requestId"),
      },
    }));
    if (result.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Transaksi belum dapat dikonfirmasi.", 503);
    const row = result[0]!;
    const categoryId = command.allocations.length === 1 ? command.allocations[0]?.categoryId ?? null : null;
    const data = financePostResultSchema.parse({
      id: row.event_id,
      kind: row.kind,
      status: "posted",
      amountMinor: row.amount_minor,
      currency: row.currency,
      walletId: command.walletId,
      destinationWalletId: command.destinationWalletId ?? null,
      categoryId,
      effectiveAt: row.effective_at,
      timezone: command.timezone,
      negativeBalanceConfirmed: row.negative_balance_confirmed,
    });
    return c.json(successEnvelope(data, c.get("requestId")), 200);
  } catch (error) {
    return dataFailure(c, error, true);
  }
});

export default api;
