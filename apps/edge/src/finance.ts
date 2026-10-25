import { Hono, type Context } from "hono";
import {
  categoryCreateSchema,
  categorySchema,
  categoryUpdateSchema,
  financeReportQuerySchema,
  financeReportSchema,
  budgetCreateSchema,
  budgetCreateResultSchema,
  budgetListSchema,
  savingsContributionCreateSchema,
  savingsContributionListSchema,
  savingsContributionSchema,
  savingsGoalCreateSchema,
  savingsGoalCreateResultSchema,
  savingsGoalListSchema,
  savingsGoalUpdateSchema,
  savingsGoalUpdateResultSchema,
  localDateSchema,
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
  walletUpdateResultSchema,
  walletUpdateSchema,
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

function mapBudget(row: DbRow) {
  const thresholds = Array.isArray(row.warning_thresholds)
    ? row.warning_thresholds.map(Number)
    : [50, 75, 90, 100];
  return {
    id: row.budget_id ?? row.id,
    name: row.name,
    kind: row.kind,
    categoryId: row.category_id ?? null,
    categoryName: row.category_name ?? null,
    frequency: row.frequency,
    timezone: row.timezone,
    rolloverPolicy: row.rollover_policy,
    warningThresholds: thresholds,
    startsOn: row.period_starts_on ?? row.starts_on,
    endsOn: row.period_ends_on ?? row.ends_on,
    plannedMinor: row.planned_minor,
    ...(row.used_minor !== undefined ? { usedMinor: row.used_minor } : {}),
    ...(row.remaining_minor !== undefined ? { remainingMinor: row.remaining_minor } : {}),
  };
}

function mapSavingsGoal(row: DbRow) {
  const targetMinor = String(row.target_minor);
  const savedMinor = String(row.saved_minor ?? "0");
  const ratio = BigInt(savedMinor) * 100n / BigInt(targetMinor);
  return {
    id: row.goal_id ?? row.id,
    name: row.name,
    targetMinor,
    targetDate: row.target_date ?? null,
    savingsWalletId: row.savings_wallet_id ?? null,
    savingsWalletName: row.savings_wallet_name ?? null,
    savedMinor,
    remainingMinor: String(row.remaining_minor ?? targetMinor),
    progressPercent: Number(ratio > 100n ? 100n : ratio),
    archivedAt: row.archived_at ?? null,
  };
}

function mapSavingsContribution(row: DbRow) {
  return savingsContributionSchema.parse({
    eventId: row.event_id,
    amountMinor: row.amount_minor,
    effectiveAt: row.effective_at,
    note: row.note ?? null,
    sourceWalletId: row.source_wallet_id,
    sourceWalletName: row.source_wallet_name,
    destinationWalletId: row.destination_wallet_id,
    destinationWalletName: row.destination_wallet_name,
  });
}

function isValidDateRange(startsOn: string, endsOn: string): boolean {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-01$/.exec(startsOn);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const days = month === 2 ? (leap ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  return endsOn === `${match[1]}-${match[2]}-${String(days).padStart(2, "0")}`;
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

api.patch("/wallets/:walletId", async (c) => {
  const walletId = c.req.param("walletId");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(walletId)) {
    return fail(c, "INVALID_INPUT", "Dompet tidak valid.", 400);
  }
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Perubahan dompet tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = walletUpdateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Perubahan dompet tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const updated = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "update",
      table: "wallets",
      query: { id: `eq.${walletId}`, select: "id,archived_at" },
      body: {
        name: parsed.data.name,
        type: parsed.data.type,
        archived_at: parsed.data.archived ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
    }));
    if (updated.length !== 1) return fail(c, "NOT_FOUND", "Dompet tidak ditemukan.", 404);
    return c.json(successEnvelope(walletUpdateResultSchema.parse({
      id: updated[0]!.id,
      archivedAt: updated[0]!.archived_at ?? null,
    }), c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.get("/categories", async (c) => {
  const params = new URL(c.req.url).searchParams;
  if ([...params.keys()].some((key) => key !== "includeArchived")) {
    return fail(c, "INVALID_INPUT", "Filter kategori tidak valid.", 400);
  }
  const includeArchived = params.get("includeArchived");
  if (includeArchived !== null && includeArchived !== "true" && includeArchived !== "false") {
    return fail(c, "INVALID_INPUT", "Filter kategori tidak valid.", 400);
  }
  try {
    const identity = c.get("identity");
    await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "ensure_default_categories",
    });
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "select",
      table: "categories",
      query: {
        select: "id,name,parent_id,icon_key,color_token,archived_at",
        ...(includeArchived === "true" ? {} : { archived_at: "is.null" }),
        order: "name.asc,id.asc",
        limit: "100",
      },
    })).map(mapCategory);
    return c.json(successEnvelope(result, c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.get("/budgets", async (c) => {
  const params = new URL(c.req.url).searchParams;
  if ([...params.keys()].some((key) => !["startsOn", "endsOn"].includes(key))) {
    return fail(c, "INVALID_INPUT", "Rentang anggaran tidak valid.", 400);
  }
  const startsOn = localDateSchema.safeParse(params.get("startsOn"));
  const endsOn = localDateSchema.safeParse(params.get("endsOn"));
  if (!startsOn.success || !endsOn.success || !isValidDateRange(startsOn.data, endsOn.data)) {
    return fail(c, "INVALID_INPUT", "Rentang anggaran tidak valid.", 400);
  }
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "list_budgets",
      body: { p_starts_on: startsOn.data, p_ends_on: endsOn.data },
    })).map(mapBudget);
    return c.json(successEnvelope(budgetListSchema.parse(result), c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.post("/budgets", async (c) => {
  const idempotencyKey = idempotencyKeySchema.safeParse(c.req.header("Idempotency-Key"));
  if (!idempotencyKey.success) return fail(c, "INVALID_INPUT", "Kunci pengiriman anggaran wajib berupa UUID.", 400);
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Data anggaran tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = budgetCreateSchema.safeParse(body.value);
  if (!parsed.success || !isValidDateRange(parsed.data.startsOn, parsed.data.endsOn)) {
    return fail(c, "INVALID_INPUT", "Data anggaran tidak valid.", 400);
  }
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "create_budget",
      body: {
        p_idempotency_key: idempotencyKey.data,
        p_name: parsed.data.name,
        p_kind: parsed.data.kind,
        p_category_id: parsed.data.categoryId,
        p_frequency: parsed.data.frequency,
        p_timezone: parsed.data.timezone,
        p_starts_on: parsed.data.startsOn,
        p_ends_on: parsed.data.endsOn,
        p_planned_minor: parsed.data.plannedMinor,
        p_rollover_policy: parsed.data.rolloverPolicy,
        p_warning_thresholds: parsed.data.warningThresholds,
      },
    }));
    if (result.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Anggaran belum dapat disimpan.", 503);
    const row = result[0]!;
    const data = budgetCreateResultSchema.parse({
      id: row.budget_id,
      periodId: row.period_id,
      name: row.name,
      kind: row.kind,
      categoryId: row.category_id ?? null,
      frequency: row.frequency,
      startsOn: row.starts_on,
      endsOn: row.ends_on,
      plannedMinor: row.planned_minor,
    });
    return c.json(successEnvelope(data, c.get("requestId")), 201);
  } catch (error) {
    return dataFailure(c, error, true);
  }
});

api.get("/savings-goals", async (c) => {
  if ([...new URL(c.req.url).searchParams.keys()].length) {
    return fail(c, "INVALID_INPUT", "Filter tujuan tabungan tidak valid.", 400);
  }
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "list_savings_goals",
    })).map(mapSavingsGoal);
    return c.json(successEnvelope(savingsGoalListSchema.parse(result), c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.post("/savings-goals", async (c) => {
  const idempotencyKey = idempotencyKeySchema.safeParse(c.req.header("Idempotency-Key"));
  if (!idempotencyKey.success) return fail(c, "INVALID_INPUT", "Kunci tujuan tabungan wajib berupa UUID.", 400);
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Data tujuan tabungan tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = savingsGoalCreateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Data tujuan tabungan tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "create_savings_goal",
      body: {
        p_idempotency_key: idempotencyKey.data,
        p_name: parsed.data.name,
        p_target_minor: parsed.data.targetMinor,
        p_target_date: parsed.data.targetDate,
        p_savings_wallet_id: parsed.data.savingsWalletId,
      },
    }));
    if (result.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Tujuan tabungan belum dapat dibuat.", 503);
    const row = result[0]!;
    return c.json(successEnvelope(savingsGoalCreateResultSchema.parse({
      id: row.goal_id,
      name: row.name,
      targetMinor: row.target_minor,
      targetDate: row.target_date ?? null,
      savingsWalletId: row.savings_wallet_id ?? null,
    }), c.get("requestId")), 201);
  } catch (error) {
    return dataFailure(c, error, true);
  }
});

api.patch("/savings-goals/:goalId", async (c) => {
  const goalId = c.req.param("goalId");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(goalId)) {
    return fail(c, "INVALID_INPUT", "Tujuan tabungan tidak valid.", 400);
  }
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Perubahan tujuan tabungan tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = savingsGoalUpdateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Perubahan tujuan tabungan tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "update_savings_goal",
      body: {
        p_goal_id: goalId,
        p_name: parsed.data.name,
        p_target_minor: parsed.data.targetMinor,
        p_target_date: parsed.data.targetDate,
        p_savings_wallet_id: parsed.data.savingsWalletId,
        p_archived: parsed.data.archived,
      },
    }));
    if (result.length !== 1) return fail(c, "NOT_FOUND", "Tujuan tabungan tidak ditemukan.", 404);
    return c.json(successEnvelope(savingsGoalUpdateResultSchema.parse({
      id: result[0]!.goal_id,
      archivedAt: result[0]!.archived_at ?? null,
    }), c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.get("/savings-goals/:goalId/contributions", async (c) => {
  const goalId = c.req.param("goalId");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(goalId)) {
    return fail(c, "INVALID_INPUT", "Tujuan tabungan tidak valid.", 400);
  }
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "list_savings_goal_contributions",
      body: { p_goal_id: goalId },
    })).map(mapSavingsContribution);
    return c.json(successEnvelope(savingsContributionListSchema.parse(result), c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.post("/savings-goals/:goalId/contributions", async (c) => {
  const goalId = c.req.param("goalId");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(goalId)) {
    return fail(c, "INVALID_INPUT", "Tujuan tabungan tidak valid.", 400);
  }
  const idempotencyKey = idempotencyKeySchema.safeParse(c.req.header("Idempotency-Key"));
  if (!idempotencyKey.success) return fail(c, "INVALID_INPUT", "Kunci setoran tabungan wajib berupa UUID.", 400);
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Data setoran tabungan tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = savingsContributionCreateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Data setoran tabungan tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "contribute_to_savings_goal",
      body: {
        p_goal_id: goalId,
        p_source_wallet_id: parsed.data.sourceWalletId,
        p_destination_wallet_id: parsed.data.destinationWalletId,
        p_amount_minor: parsed.data.amountMinor,
        p_effective_at: parsed.data.effectiveAt,
        p_timezone: parsed.data.timezone,
        p_idempotency_key: idempotencyKey.data,
        p_note: parsed.data.note ?? null,
        p_allow_negative: false,
        p_trace_id: c.get("requestId"),
      },
    }));
    if (result.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Setoran tabungan belum dapat dikonfirmasi.", 503);
    return c.json(successEnvelope(mapSavingsContribution(result[0]!), c.get("requestId")), 201);
  } catch (error) {
    return dataFailure(c, error, true);
  }
});

api.get("/reports/summary", async (c) => {
  const params = new URL(c.req.url).searchParams;
  if ([...params.keys()].some((key) => key !== "from" && key !== "to")) {
    return fail(c, "INVALID_INPUT", "Rentang laporan tidak valid.", 400);
  }
  const parsed = financeReportQuerySchema.safeParse({
    from: params.get("from"),
    to: params.get("to"),
  });
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Rentang laporan harus antara 1 dan 366 hari.", 400);
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "get_finance_report",
      body: { p_from: parsed.data.from, p_to: parsed.data.to },
    }));
    if (result.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Laporan belum dapat dimuat.", 503);
    const row = result[0]!;
    const report = financeReportSchema.parse({
      timezone: row.timezone,
      from: row.period_from,
      to: row.period_to,
      current: {
        incomeMinor: row.income_minor,
        grossExpenseMinor: row.gross_expense_minor,
        refundMinor: row.refund_minor,
        eventCount: row.event_count,
      },
      previous: {
        incomeMinor: row.previous_income_minor,
        grossExpenseMinor: row.previous_gross_expense_minor,
        refundMinor: row.previous_refund_minor,
      },
      daily: row.daily,
      categories: row.categories,
      merchants: row.merchants,
    });
    return c.json(successEnvelope(report, c.get("requestId")));
  } catch (error) {
    if (error instanceof DataApiFailure) return dataFailure(c, error);
    return fail(c, "DEPENDENCY_UNAVAILABLE", "Laporan belum dapat dimuat.", 503);
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

api.patch("/categories/:categoryId", async (c) => {
  const categoryId = c.req.param("categoryId");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(categoryId)) {
    return fail(c, "INVALID_INPUT", "Kategori tidak valid.", 400);
  }
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Perubahan kategori tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = categoryUpdateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Perubahan kategori tidak valid.", 400);
  try {
    const identity = c.get("identity");
    if (parsed.data.parentId === categoryId) {
      return fail(c, "INVALID_INPUT", "Kategori tidak dapat menjadi induknya sendiri.", 400);
    }
    if (parsed.data.parentId) {
      const parent = rows(await callDataApi(c.env, identity.providerJwt, {
        kind: "select",
        table: "categories",
        query: {
          id: `eq.${parsed.data.parentId}`,
          archived_at: "is.null",
          select: "id,parent_id",
          limit: "1",
        },
      }))[0];
      if (!parent || parent.parent_id !== null) {
        return fail(c, "INVALID_INPUT", "Pilih kategori induk aktif tanpa induk lain.", 400);
      }
    }
    if (parsed.data.archived) {
      const activeChild = rows(await callDataApi(c.env, identity.providerJwt, {
        kind: "select",
        table: "categories",
        query: {
          parent_id: `eq.${categoryId}`,
          archived_at: "is.null",
          select: "id",
          limit: "1",
        },
      }))[0];
      if (activeChild) return fail(c, "VERSION_CONFLICT", "Arsipkan subkategori aktif terlebih dahulu.", 409);
    }
    const updated = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "update",
      table: "categories",
      query: {
        id: `eq.${categoryId}`,
        select: "id,name,parent_id,icon_key,color_token,archived_at",
      },
      body: {
        name: parsed.data.name,
        parent_id: parsed.data.parentId ?? null,
        icon_key: parsed.data.iconKey ?? null,
        color_token: parsed.data.colorToken ?? null,
        archived_at: parsed.data.archived ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
    }));
    if (updated.length !== 1) return fail(c, "NOT_FOUND", "Kategori tidak ditemukan.", 404);
    return c.json(successEnvelope(mapCategory(updated[0]!), c.get("requestId")));
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
