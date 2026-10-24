import { z } from "zod";

const PG_MAX = 9223372036854775807n;
const PG_MIN = -9223372036854775808n;
const unsignedPattern = /^(0|[1-9]\d*)$/;
const signedPattern = /^(0|-?[1-9]\d*)$/;

/** Exact IDR minor units on the wire. Numbers and formatted amounts are rejected. */
export const minorAmountSchema = z
  .string()
  .max(19)
  .regex(/^(0|[1-9]\d*)$/)
  .refine(
    (value) =>
      value.length <= 19 &&
      unsignedPattern.test(value) &&
      BigInt(value) <= PG_MAX,
    "Nominal melewati batas penyimpanan.",
  );
export const positiveMinorAmountSchema = minorAmountSchema.refine(
  (value) =>
    value.length <= 19 && unsignedPattern.test(value) && BigInt(value) > 0n,
  "Nominal harus lebih dari nol.",
);
export const signedMinorAmountSchema = z
  .string()
  .max(20)
  .regex(/^(0|-?[1-9]\d*)$/)
  .refine(
    (value) =>
      value.length <= 20 &&
      signedPattern.test(value) &&
      BigInt(value) >= PG_MIN &&
      BigInt(value) <= PG_MAX,
    "Nominal melewati batas penyimpanan.",
  );
export const currencySchema = z.literal("IDR");
export const timezoneSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("id-ID", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Zona waktu tidak dikenali.");
export const localDateSchema = z.iso.date();
export const effectiveAtSchema = z.iso.datetime({ offset: true });
export const idempotencyKeySchema = z.uuid();
export const entityVersionSchema = z.number().int().positive().safe();
export const paginationSchema = z.strictObject({
  cursor: z.string().min(1).max(512).optional(),
  // The API requests one extra row to prove whether another page exists.
  // Keep each Data API response below its configured 100-row safety ceiling.
  limit: z.coerce.number().int().min(1).max(99).default(20),
});
export const roleSchema = z.enum(["user", "admin", "superuser"]);
export const transactionKindSchema = z.enum([
  "income",
  "expense",
  "transfer",
  "refund",
  "adjustment",
  "debt_payment",
  "debt_opening",
  "loan_disbursement",
  "loan_receipt",
  "savings_transfer",
  "opening",
]);
export const financeStateSchema = z.enum([
  "LOCAL_DRAFT",
  "SYNCING",
  "SERVER_DRAFT",
  "CANDIDATE_PROVISIONAL",
  "NEEDS_REVIEW",
  "POSTED",
  "VOIDED",
]);
export const dayReportStatusSchema = z.enum([
  "unreported",
  "partial",
  "done",
  "zero",
]);
export const integrationStateSchema = z.enum([
  "not_configured",
  "unknown",
  "available",
  "degraded",
  "unavailable",
]);
export const apiMetaSchema = z.strictObject({
  requestId: z.uuid(),
  version: z.literal(1),
});
export const errorCodeSchema = z.enum([
  "AUTH_REQUIRED",
  "FORBIDDEN",
  "NOT_FOUND",
  "INVALID_INPUT",
  "VERSION_CONFLICT",
  "IDEMPOTENCY_KEY_REUSED",
  "DEPENDENCY_UNAVAILABLE",
  "INTERNAL_ERROR",
]);
export const apiErrorSchema = z.strictObject({
  error: z.strictObject({
    code: errorCodeSchema,
    message: z.string(),
    requestId: z.uuid(),
  }),
});
export const publicConfigSchema = z.strictObject({
  authAvailable: z.boolean(),
  registrationOpen: z.boolean(),
  personalWhatsAppAvailable: z.boolean(),
  aiAvailable: z.boolean(),
  defaultLocale: z.literal("id-ID"),
  supportedLocales: z.array(z.enum(["id-ID", "en-US"])),
});
export const healthSchema = z.strictObject({
  api: z.literal("available"),
  checkedAt: effectiveAtSchema,
  services: z.strictObject({
    auth: integrationStateSchema,
    database: integrationStateSchema,
    storage: integrationStateSchema,
    whatsapp: integrationStateSchema,
    ai: integrationStateSchema,
  }),
});
// Internal contract only; no unsigned/browser heartbeat endpoint is exposed.
export const workerHeartbeatSchema = z.strictObject({
  schemaVersion: z.literal(1),
  service: z.literal('finance-worker'),
  instanceId: z.uuid(),
  checkedAt: effectiveAtSchema,
  state: z.enum(['available', 'degraded', 'unavailable'])
});
export const manualExpenseSchema = z.strictObject({
  kind: z.enum(["income", "expense"]),
  walletId: z.uuid(),
  categoryId: z.uuid().optional(),
  amountMinor: positiveMinorAmountSchema,
  currency: currencySchema,
  effectiveAt: effectiveAtSchema,
  timezone: timezoneSchema,
  note: z.string().max(500).optional(),
});

export const walletTypeSchema = z.enum(["cash", "bank", "e_wallet", "savings", "other"]);
export const walletCreateSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  type: walletTypeSchema,
});
export const walletSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().max(100),
  type: walletTypeSchema,
  currency: currencySchema,
  balanceMinor: signedMinorAmountSchema,
  archivedAt: effectiveAtSchema.nullable(),
  createdAt: effectiveAtSchema,
  updatedAt: effectiveAtSchema,
});
export const userProfileCreateSchema = z.strictObject({
  displayName: z.string().trim().min(1).max(100),
  locale: z.enum(["id-ID", "en-US"]).default("id-ID"),
  timezone: timezoneSchema.default("Asia/Jakarta"),
});
export const userProfileSchema = z.strictObject({
  userId: z.string().min(1).max(255),
  displayName: z.string().nullable(),
  locale: z.enum(["id-ID", "en-US"]),
  timezone: timezoneSchema,
  preferredCurrency: currencySchema,
  accountStatus: z.enum(["active", "suspended", "pending_deletion"]),
  onboardingAt: effectiveAtSchema.nullable(),
  role: roleSchema,
});
export const privateSessionSchema = z.strictObject({
  authenticated: z.literal(true),
  userId: z.string().min(1),
  expiresAt: effectiveAtSchema,
});
export const profileReadResultSchema = z.strictObject({
  profile: userProfileSchema.nullable(),
  role: roleSchema,
});
export const profileCreateResultSchema = z.strictObject({
  profile: userProfileSchema,
});
export const categoryCreateSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  parentId: z.uuid().nullable().optional(),
  iconKey: z.string().trim().max(80).nullable().optional(),
  colorToken: z.string().trim().max(80).nullable().optional(),
});
export const categorySchema = z.strictObject({
  id: z.uuid(),
  name: z.string().max(100),
  parentId: z.uuid().nullable(),
  iconKey: z.string().nullable(),
  colorToken: z.string().nullable(),
  archivedAt: effectiveAtSchema.nullable(),
});
export const financeAllocationSchema = z.strictObject({
  categoryId: z.uuid(),
  amountMinor: positiveMinorAmountSchema,
});
export const financePostSchema = z
  .strictObject({
    kind: z.enum(["income", "expense", "transfer", "savings_transfer", "opening", "adjustment", "refund"]),
    walletId: z.uuid(),
    destinationWalletId: z.uuid().optional(),
    amountMinor: positiveMinorAmountSchema,
    currency: currencySchema,
    effectiveAt: effectiveAtSchema,
    timezone: timezoneSchema,
    allocations: z.array(financeAllocationSchema).max(20).default([]),
    note: z.string().trim().max(500).optional(),
    merchant: z.string().trim().max(160).optional(),
    direction: z.enum(["in", "out"]).optional(),
    refundOf: z.uuid().optional(),
    allowNegative: z.boolean().default(false),
  })
  .superRefine((command, ctx) => {
    const categories = command.allocations.map((allocation) => allocation.categoryId);
    if (new Set(categories).size !== categories.length) {
      ctx.addIssue({ code: "custom", path: ["allocations"], message: "Kategori split tidak boleh berulang." });
    }
    if (command.kind === "expense" && command.allocations.length > 0) {
      const total = command.allocations.reduce((sum, allocation) => sum + BigInt(allocation.amountMinor), 0n);
      if (total !== BigInt(command.amountMinor)) {
        ctx.addIssue({ code: "custom", path: ["allocations"], message: "Jumlah split harus sama dengan nominal transaksi." });
      }
    }
    if (["transfer", "savings_transfer"].includes(command.kind)) {
      if (!command.destinationWalletId || command.destinationWalletId === command.walletId) {
        ctx.addIssue({ code: "custom", path: ["destinationWalletId"], message: "Dompet tujuan harus berbeda dari sumber." });
      }
    } else if (command.destinationWalletId) {
      ctx.addIssue({ code: "custom", path: ["destinationWalletId"], message: "Jenis transaksi ini tidak memakai dompet tujuan." });
    }
    if (command.kind === "adjustment" && !command.direction) {
      ctx.addIssue({ code: "custom", path: ["direction"], message: "Arah penyesuaian harus dipilih." });
    }
    if (command.kind !== "adjustment" && command.direction) {
      ctx.addIssue({ code: "custom", path: ["direction"], message: "Arah hanya tersedia untuk penyesuaian." });
    }
    if (command.kind === "refund" && !command.refundOf) {
      ctx.addIssue({ code: "custom", path: ["refundOf"], message: "Refund harus terhubung ke transaksi asal." });
    }
    if (command.kind !== "refund" && command.refundOf) {
      ctx.addIssue({ code: "custom", path: ["refundOf"], message: "Transaksi ini tidak menerima sumber refund." });
    }
    if (command.kind !== "expense" && command.kind !== "refund" && command.allocations.length) {
      ctx.addIssue({ code: "custom", path: ["allocations"], message: "Split kategori hanya berlaku untuk pengeluaran atau refund." });
    }
  });
export const financeEventSchema = z.strictObject({
  id: z.uuid(),
  kind: transactionKindSchema,
  status: z.enum(["posted", "voided"]),
  amountMinor: positiveMinorAmountSchema,
  currency: currencySchema,
  walletId: z.uuid().nullable(),
  walletName: z.string().nullable(),
  destinationWalletId: z.uuid().nullable(),
  destinationWalletName: z.string().nullable(),
  categoryId: z.uuid().nullable(),
  categoryName: z.string().nullable(),
  effectiveAt: effectiveAtSchema,
  timezone: timezoneSchema,
  note: z.string().nullable(),
  merchant: z.string().nullable(),
  sourceChannel: z.string().max(30),
  refundOf: z.uuid().nullable(),
  allocations: z.array(z.strictObject({
    categoryId: z.uuid(),
    categoryName: z.string(),
    amountMinor: positiveMinorAmountSchema,
    note: z.string().nullable(),
  })),
  negativeBalanceConfirmed: z.boolean(),
  createdAt: effectiveAtSchema,
});
export const financePostResultSchema = z.strictObject({
  id: z.uuid(),
  kind: transactionKindSchema,
  status: z.literal("posted"),
  amountMinor: positiveMinorAmountSchema,
  currency: currencySchema,
  walletId: z.uuid(),
  destinationWalletId: z.uuid().nullable(),
  categoryId: z.uuid().nullable(),
  effectiveAt: effectiveAtSchema,
  timezone: timezoneSchema,
  negativeBalanceConfirmed: z.boolean(),
});
export const financeEventPageSchema = z.strictObject({
  items: z.array(financeEventSchema),
  page: z.strictObject({
    hasMore: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});

export type MinorAmount = z.infer<typeof minorAmountSchema>;
export type FinanceState = z.infer<typeof financeStateSchema>;
export type TransactionKind = z.infer<typeof transactionKindSchema>;
export type PublicConfig = z.infer<typeof publicConfigSchema>;
export type Wallet = z.infer<typeof walletSchema>;
export type FinancePost = z.infer<typeof financePostSchema>;
export type FinanceEvent = z.infer<typeof financeEventSchema>;
export type FinanceEventPage = z.infer<typeof financeEventPageSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type ApiErrorCode = z.infer<typeof errorCodeSchema>;
export type ServiceHealth = z.infer<typeof healthSchema>;

export function successEnvelope<T>(data: T, requestId: string) {
  return { data, meta: apiMetaSchema.parse({ requestId, version: 1 }) };
}

export function errorEnvelope(
  code: ApiErrorCode,
  message: string,
  requestId: string,
) {
  return apiErrorSchema.parse({ error: { code, message, requestId } });
}
