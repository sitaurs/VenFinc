import { Hono, type Context } from "hono";
import {
  categoryCreateSchema,
  categorySchema,
  categoryUpdateSchema,
  debtCreateResultSchema,
  debtCreateSchema,
  debtListSchema,
  debtPaymentCreateSchema,
  debtPaymentListSchema,
  debtPaymentSchema,
  proofMetadataSchema,
  proofUploadCompletionSchema,
  proofUploadCreateSchema,
  proofUploadCreatedSchema,
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
import {
  completeOwnedProofUpload,
  createProofObjectKey,
  createProofUploadCapability,
  deleteOwnedProof,
  proofRetentionDays,
  proofStorageAvailable,
  readOwnedProof,
  uploadOwnedProofContent,
  type ProofRecord,
  type ProofRepository,
  type ProofStoragePolicy,
  type R2ProofBucket,
} from "./proof-storage";

type FinanceEnv = {
  Bindings: DataApiBindings & {
    PROOFS?: R2ProofBucket;
    PROOF_STORAGE_ENABLED?: string;
    PROOF_RETENTION_CLEANUP_READY?: string;
    PROOF_RETENTION_DAYS?: string;
  };
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

const PROOF_MAX_FILE_BYTES = 5 * 1024 * 1024;
const PROOF_UPLOAD_TTL_MS = 10 * 60 * 1000;
const PROOF_STORAGE_CONSENT_VERSION = "proof-storage-v1";

function requiredText(row: DbRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error("Invalid proof record");
  return value;
}

function mapProofRecord(row: DbRow): ProofRecord {
  const sizeBytes = Number(row.size_bytes);
  const uploadState = row.upload_state;
  const storedAt = row.stored_at;
  if (
    !Number.isSafeInteger(sizeBytes) ||
    !["pending", "stored", "expired", "deleted"].includes(String(uploadState)) ||
    (storedAt !== null && typeof storedAt !== "string")
  ) {
    throw new Error("Invalid proof record");
  }
  return {
    id: requiredText(row, "id"),
    ownerId: requiredText(row, "user_id"),
    objectKey: requiredText(row, "object_key"),
    contentType: requiredText(row, "content_type"),
    sizeBytes,
    sha256: requiredText(row, "sha256"),
    uploadTokenHash: requiredText(row, "upload_token_hash"),
    uploadExpiresAt: requiredText(row, "upload_expires_at"),
    expiresAt: requiredText(row, "expires_at"),
    uploadState: uploadState as ProofRecord["uploadState"],
    createdAt: requiredText(row, "created_at"),
    storedAt: typeof storedAt === "string" ? storedAt : null,
  };
}

function proofRepository(c: FinanceContext): ProofRepository {
  const providerJwt = c.get("identity").providerJwt;
  return {
    async findOwned(proofId, ownerId) {
      const result = await callDataApi<unknown>(c.env, providerJwt, {
        kind: "rpc",
        name: "get_proof_upload",
        body: { p_proof_id: proofId },
      });
      const row = rows(result)[0];
      if (!row) return null;
      const proof = mapProofRecord(row);
      return proof.id === proofId && proof.ownerId === ownerId ? proof : null;
    },
    async markStored(proofId, ownerId) {
      const result = await callDataApi<unknown>(c.env, providerJwt, {
        kind: "rpc",
        name: "mark_proof_stored",
        body: { p_proof_id: proofId },
      });
      const row = rows(result)[0];
      return Boolean(row && row.ok === true && ownerId === c.get("identity").subject);
    },
    async markDeleted(proofId, ownerId) {
      const result = await callDataApi<unknown>(c.env, providerJwt, {
        kind: "rpc",
        name: "mark_proof_deleted",
        body: { p_proof_id: proofId },
      });
      const row = rows(result)[0];
      return Boolean(row && row.ok === true && ownerId === c.get("identity").subject);
    },
  };
}

function proofPolicy(c: FinanceContext): ProofStoragePolicy | null {
  if (!proofStorageAvailable({
    enabled: c.env.PROOF_STORAGE_ENABLED,
    cleanupReady: c.env.PROOF_RETENTION_CLEANUP_READY,
    retentionDays: c.env.PROOF_RETENTION_DAYS,
    bucket: c.env.PROOFS,
  })) return null;
  return { maxFileBytes: PROOF_MAX_FILE_BYTES };
}

function proofExpiresAt(c: FinanceContext, now: Date): string | null {
  const days = proofRetentionDays(c.env.PROOF_RETENTION_DAYS);
  if (days === null) return null;
  const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return Number.isFinite(expiry.getTime()) ? expiry.toISOString() : null;
}

function proofFailure(c: FinanceContext, reason: string) {
  if (reason === "not_found") return fail(c, "NOT_FOUND", "Bukti tidak ditemukan.", 404);
  if (reason === "forbidden") return fail(c, "FORBIDDEN", "Izin upload tidak berlaku.", 403);
  if (reason === "conflict") return fail(c, "VERSION_CONFLICT", "Bukti sudah tersimpan dengan isi berbeda.", 409);
  if (reason === "expired") return fail(c, "INVALID_INPUT", "Waktu upload bukti sudah habis.", 422);
  if (reason === "invalid") return fail(c, "INVALID_INPUT", "File bukti tidak sesuai validasi.", 422);
  return fail(c, "DEPENDENCY_UNAVAILABLE", "Penyimpanan bukti sementara tidak dapat dijangkau.", 503);
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

function mapDebt(row: DbRow) {
  return {
    id: row.debt_id,
    direction: row.direction,
    origin: row.origin,
    counterpartyLabel: row.counterparty_label ?? null,
    principalMinor: String(row.principal_minor),
    paidMinor: String(row.paid_minor),
    remainingMinor: String(row.remaining_minor),
    openingDate: row.opening_date,
    dueDate: row.due_date ?? null,
    installmentMinor: row.installment_minor == null ? null : String(row.installment_minor),
    openingEventId: row.opening_event_id,
    walletId: row.wallet_id ?? null,
    walletName: row.wallet_name ?? null,
    note: row.note ?? null,
    archivedAt: row.archived_at ?? null,
    status: row.status,
  };
}

function mapDebtPayment(row: DbRow) {
  return debtPaymentSchema.parse({
    id: row.payment_id,
    eventId: row.event_id,
    feeEventId: row.fee_event_id ?? null,
    principalMinor: String(row.principal_minor),
    feeMinor: String(row.fee_minor),
    negativeBalanceConfirmed: row.negative_balance_confirmed,
    effectiveAt: row.effective_at,
    timezone: row.timezone,
    note: row.note ?? null,
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

api.get("/debts", async (c) => {
  if ([...new URL(c.req.url).searchParams.keys()].length) {
    return fail(c, "INVALID_INPUT", "Filter utang/piutang tidak valid.", 400);
  }
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "list_debts",
    })).map(mapDebt);
    return c.json(successEnvelope(debtListSchema.parse(result), c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.post("/debts", async (c) => {
  const idempotencyKey = idempotencyKeySchema.safeParse(c.req.header("Idempotency-Key"));
  if (!idempotencyKey.success) return fail(c, "INVALID_INPUT", "Kunci utang/piutang wajib berupa UUID.", 400);
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Data utang/piutang tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = debtCreateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Data utang/piutang tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const command = parsed.data;
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "create_debt",
      body: {
        p_idempotency_key: idempotencyKey.data,
        p_direction: command.direction,
        p_origin: command.origin,
        p_counterparty_label: command.counterpartyLabel,
        p_principal_minor: command.principalMinor,
        p_opening_date: command.openingDate,
        p_due_date: command.dueDate,
        p_installment_minor: command.installmentMinor,
        p_wallet_id: command.walletId,
        p_allow_negative: command.allowNegative,
        p_timezone: command.timezone,
        p_note: command.note ?? null,
        p_trace_id: c.get("requestId"),
      },
    }));
    if (result.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Utang/piutang belum dapat dicatat.", 503);
    const row = result[0]!;
    return c.json(successEnvelope(debtCreateResultSchema.parse({
      id: row.debt_id,
      openingEventId: row.opening_event_id,
      direction: row.direction,
      principalMinor: String(row.principal_minor),
      remainingMinor: String(row.remaining_minor),
    }), c.get("requestId")), 201);
  } catch (error) {
    return dataFailure(c, error, true);
  }
});

api.get("/debts/:debtId/payments", async (c) => {
  const debtId = c.req.param("debtId");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(debtId)) {
    return fail(c, "INVALID_INPUT", "Utang/piutang tidak valid.", 400);
  }
  if ([...new URL(c.req.url).searchParams.keys()].length) {
    return fail(c, "INVALID_INPUT", "Filter pembayaran tidak valid.", 400);
  }
  try {
    const identity = c.get("identity");
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "list_debt_payments",
      body: { p_debt_id: debtId },
    })).map(mapDebtPayment);
    return c.json(successEnvelope(debtPaymentListSchema.parse(result), c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.post("/debts/:debtId/payments", async (c) => {
  const debtId = c.req.param("debtId");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(debtId)) {
    return fail(c, "INVALID_INPUT", "Utang/piutang tidak valid.", 400);
  }
  const idempotencyKey = idempotencyKeySchema.safeParse(c.req.header("Idempotency-Key"));
  if (!idempotencyKey.success) return fail(c, "INVALID_INPUT", "Kunci pembayaran wajib berupa UUID.", 400);
  const body = await requestJson(c, 8 * 1024);
  if (!body.ok) return fail(c, "INVALID_INPUT", "Data pembayaran tidak valid.", body.tooLarge ? 413 : 400);
  const parsed = debtPaymentCreateSchema.safeParse(body.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Data pembayaran tidak valid.", 400);
  try {
    const identity = c.get("identity");
    const command = parsed.data;
    const result = rows(await callDataApi(c.env, identity.providerJwt, {
      kind: "rpc",
      name: "record_debt_payment",
      body: {
        p_debt_id: debtId,
        p_wallet_id: command.walletId,
        p_principal_minor: command.principalMinor,
        p_fee_minor: command.feeMinor,
        p_allow_negative: command.allowNegative,
        p_effective_at: command.effectiveAt,
        p_timezone: command.timezone,
        p_principal_category_id: command.principalCategoryId,
        p_fee_category_id: command.feeCategoryId,
        p_idempotency_key: idempotencyKey.data,
        p_note: command.note ?? null,
        p_trace_id: c.get("requestId"),
      },
    }));
    if (result.length !== 1) return fail(c, "DEPENDENCY_UNAVAILABLE", "Pembayaran belum dapat dicatat.", 503);
    return c.json(successEnvelope(mapDebtPayment(result[0]!), c.get("requestId")), 201);
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
  const allowed = new Set(["cursor", "limit", "kind", "from", "to", "q"]);
  if ([...params.keys()].some((key) => !allowed.has(key))) {
    return fail(c, "INVALID_INPUT", "Filter transaksi tidak valid.", 400);
  }
  const pageParsed = paginationSchema.safeParse({
    cursor: params.get("cursor") ?? undefined,
    limit: params.get("limit") ?? undefined,
  });
  if (!pageParsed.success) return fail(c, "INVALID_INPUT", "Halaman transaksi tidak valid.", 400);
  const kind = params.get("kind");
  const searchTerm = params.has("q") ? (params.get("q") ?? "").trim() : null;
  const from = params.get("from");
  const to = params.get("to");
  const cursorValue = (() => {
    try {
      return readCursor(pageParsed.data.cursor);
    } catch {
      return undefined;
    }
  })();
  if (cursorValue === undefined || (searchTerm !== null && (searchTerm.length < 1 || searchTerm.length > 80)) || (kind && !["income", "expense", "transfer", "refund", "adjustment", "debt_payment", "debt_opening", "loan_disbursement", "loan_receipt", "savings_transfer", "opening"].includes(kind))) {
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
      name: searchTerm ? "search_finance_events" : "list_finance_events",
      body: {
        ...(searchTerm ? { p_search: searchTerm } : {}),
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

api.post("/proofs/uploads", async (c) => {
  const policy = proofPolicy(c);
  const now = new Date();
  const expiresAt = proofExpiresAt(c, now);
  if (!policy || !expiresAt) {
    return fail(c, "DEPENDENCY_UNAVAILABLE", "Unggah bukti belum diaktifkan karena kebijakan penyimpanan belum tersedia.", 503);
  }

  const parsedBody = await requestJson(c, 2_048);
  if (!parsedBody.ok) {
    return fail(
      c,
      "INVALID_INPUT",
      parsedBody.tooLarge ? "Data upload terlalu besar." : "Permintaan upload tidak valid.",
      parsedBody.tooLarge ? 413 : 400,
    );
  }
  const parsed = proofUploadCreateSchema.safeParse(parsedBody.value);
  if (!parsed.success) return fail(c, "INVALID_INPUT", "Tipe, ukuran, atau checksum bukti tidak valid.", 400);

  const id = crypto.randomUUID();
  const objectKey = createProofObjectKey();
  const capability = await createProofUploadCapability();
  const uploadExpiresAt = new Date(now.getTime() + PROOF_UPLOAD_TTL_MS).toISOString();
  try {
    const result = await callDataApi<unknown>(c.env, c.get("identity").providerJwt, {
      kind: "rpc",
      name: "create_proof_upload",
      body: {
        p_proof_id: id,
        p_object_key: objectKey,
        p_content_type: parsed.data.contentType,
        p_size_bytes: parsed.data.sizeBytes,
        p_sha256: parsed.data.sha256,
        p_upload_token_hash: capability.tokenHash,
        p_upload_expires_at: uploadExpiresAt,
        p_expires_at: expiresAt,
        p_consent_version: PROOF_STORAGE_CONSENT_VERSION,
      },
    });
    const row = rows(result)[0];
    if (!row) return fail(c, "DEPENDENCY_UNAVAILABLE", "Izin upload belum dapat dibuat.", 503);
    const proof = mapProofRecord(row);
    if (proof.id !== id || proof.ownerId !== c.get("identity").subject || proof.objectKey !== objectKey) {
      return fail(c, "DEPENDENCY_UNAVAILABLE", "Izin upload belum dapat dibuat.", 503);
    }
    const response = proofUploadCreatedSchema.parse({
      id,
      uploadToken: capability.token,
      uploadPath: `/api/v1/proofs/uploads/${id}/content`,
      uploadExpiresAt: proof.uploadExpiresAt,
    });
    return c.json(successEnvelope(response, c.get("requestId")), 201);
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.put("/proofs/uploads/:id/content", async (c) => {
  const policy = proofPolicy(c);
  if (!policy) return fail(c, "DEPENDENCY_UNAVAILABLE", "Unggah bukti belum diaktifkan.", 503);
  const proofId = c.req.param("id");
  if (!idempotencyKeySchema.safeParse(proofId).success) return fail(c, "NOT_FOUND", "Bukti tidak ditemukan.", 404);
  const contentLength = c.req.header("Content-Length");
  if (contentLength !== undefined && (!/^\d+$/.test(contentLength) || Number(contentLength) > policy.maxFileBytes)) {
    return fail(c, "INVALID_INPUT", "File bukti melampaui batas ukuran.", 413);
  }
  const contentEncoding = c.req.header("Content-Encoding");
  const contentType = c.req.header("Content-Type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  const uploadToken = c.req.header("X-Proof-Upload-Token") ?? "";
  if (contentEncoding && contentEncoding.toLowerCase() !== "identity") {
    return fail(c, "INVALID_INPUT", "File terkompresi tidak didukung.", 422);
  }
  const result = await uploadOwnedProofContent({
    actorId: c.get("identity").subject,
    proofId,
    uploadToken,
    declaredContentType: contentType,
    body: c.req.raw.body,
    policy,
    repository: proofRepository(c),
    bucket: c.env.PROOFS ?? null,
  });
  if (!result.ok) return proofFailure(c, result.reason);
  return c.json(successEnvelope({ id: proofId, status: result.state }, c.get("requestId")), result.state === "uploaded" ? 201 : 200);
});

api.post("/proofs/uploads/:id/complete", async (c) => {
  const policy = proofPolicy(c);
  if (!policy) return fail(c, "DEPENDENCY_UNAVAILABLE", "Penyimpanan bukti belum diaktifkan.", 503);
  const proofId = c.req.param("id");
  if (!idempotencyKeySchema.safeParse(proofId).success) return fail(c, "NOT_FOUND", "Bukti tidak ditemukan.", 404);
  const result = await completeOwnedProofUpload({
    actorId: c.get("identity").subject,
    proofId,
    policy,
    repository: proofRepository(c),
    bucket: c.env.PROOFS ?? null,
  });
  if (!result.ok) return proofFailure(c, result.reason);
  const data = proofUploadCompletionSchema.parse({ id: proofId, status: result.state });
  return c.json(successEnvelope(data, c.get("requestId")));
});

api.get("/proofs/:id/content", async (c) => {
  const proofId = c.req.param("id");
  if (!idempotencyKeySchema.safeParse(proofId).success) return fail(c, "NOT_FOUND", "Bukti tidak ditemukan.", 404);
  const result = await readOwnedProof({
    actorId: c.get("identity").subject,
    proofId,
    repository: proofRepository(c),
    bucket: c.env.PROOFS ?? null,
  });
  if (!result.ok) {
    return result.reason === "not_found" || result.reason === "expired"
      ? fail(c, "NOT_FOUND", "Bukti tidak ditemukan.", 404)
      : proofFailure(c, result.reason);
  }
  return new Response(result.body, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": "inline",
      "Content-Length": String(result.sizeBytes),
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Type": result.contentType,
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

api.get("/proofs/:id", async (c) => {
  const proofId = c.req.param("id");
  if (!idempotencyKeySchema.safeParse(proofId).success) return fail(c, "NOT_FOUND", "Bukti tidak ditemukan.", 404);
  try {
    const proof = await proofRepository(c).findOwned(proofId, c.get("identity").subject);
    if (!proof) return fail(c, "NOT_FOUND", "Bukti tidak ditemukan.", 404);
    const now = Date.now();
    const expired = Date.parse(proof.expiresAt) <= now ||
      (proof.uploadState === "pending" && Date.parse(proof.uploadExpiresAt) <= now);
    const status = proof.uploadState === "deleted" ? "deleted" : expired ? "expired" : proof.uploadState;
    const data = proofMetadataSchema.parse({
      id: proof.id,
      contentType: proof.contentType,
      sizeBytes: proof.sizeBytes,
      status,
      createdAt: proof.createdAt,
      expiresAt: proof.expiresAt,
      storedAt: proof.storedAt,
    });
    return c.json(successEnvelope(data, c.get("requestId")));
  } catch (error) {
    return dataFailure(c, error);
  }
});

api.delete("/proofs/:id", async (c) => {
  const proofId = c.req.param("id");
  if (!idempotencyKeySchema.safeParse(proofId).success) return fail(c, "NOT_FOUND", "Bukti tidak ditemukan.", 404);
  const result = await deleteOwnedProof({
    actorId: c.get("identity").subject,
    proofId,
    repository: proofRepository(c),
    bucket: c.env.PROOFS ?? null,
  });
  if (!result.ok) return proofFailure(c, result.reason);
  return c.json(successEnvelope({ id: proofId, status: result.state }, c.get("requestId")));
});

export default api;
