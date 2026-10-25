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
export const walletUpdateSchema = walletCreateSchema.extend({ archived: z.boolean().default(false) });
export const walletUpdateResultSchema = z.strictObject({
  id: z.uuid(),
  archivedAt: effectiveAtSchema.nullable(),
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
export const authDeviceSessionSchema = z.strictObject({
  id: z.string().min(1).max(255),
  createdAt: effectiveAtSchema,
  expiresAt: effectiveAtSchema,
  userAgent: z.string().max(180).nullable(),
  current: z.boolean(),
});
export const authDeviceSessionListSchema = z.array(authDeviceSessionSchema).max(100);
export const authSessionMutationSchema = z.strictObject({
  revoked: z.literal(true),
  currentSessionRevoked: z.boolean(),
});
export const authSessionRevokeRequestSchema = z.strictObject({
  sessionId: z.string().trim().min(1).max(255),
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
export const categoryUpdateSchema = categoryCreateSchema.extend({
  archived: z.boolean().default(false),
});
export const categorySchema = z.strictObject({
  id: z.uuid(),
  name: z.string().max(100),
  parentId: z.uuid().nullable(),
  iconKey: z.string().nullable(),
  colorToken: z.string().nullable(),
  archivedAt: effectiveAtSchema.nullable(),
});
export const budgetKindSchema = z.enum(["category", "global"]);
export const budgetFrequencySchema = z.enum(["daily", "weekly", "monthly", "custom"]);
export const budgetCreateSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  kind: budgetKindSchema,
  categoryId: z.uuid().nullable(),
  frequency: z.literal("monthly").default("monthly"),
  timezone: timezoneSchema,
  startsOn: localDateSchema,
  endsOn: localDateSchema,
  plannedMinor: positiveMinorAmountSchema,
  rolloverPolicy: z.literal(false).default(false),
  warningThresholds: z.array(z.number().int().min(1).max(100)).min(1).max(8).default([50, 75, 90, 100])
    .refine((values) => new Set(values).size === values.length, "Threshold tidak boleh duplikat."),
}).refine((value) => (value.kind === "category") === (value.categoryId !== null), {
  message: "Pilih kategori hanya untuk anggaran kategori.",
  path: ["categoryId"],
});
export const budgetSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().max(100),
  kind: budgetKindSchema,
  categoryId: z.uuid().nullable(),
  categoryName: z.string().max(100).nullable(),
  frequency: budgetFrequencySchema,
  timezone: timezoneSchema,
  rolloverPolicy: z.boolean(),
  warningThresholds: z.array(z.number().int().min(1).max(100)).min(1).max(8),
  startsOn: localDateSchema,
  endsOn: localDateSchema,
  plannedMinor: positiveMinorAmountSchema,
  usedMinor: signedMinorAmountSchema,
  remainingMinor: signedMinorAmountSchema,
});
export const budgetListSchema = z.array(budgetSchema).max(100);
export const budgetCreateResultSchema = z.strictObject({
  id: z.uuid(),
  periodId: z.uuid(),
  name: z.string().max(100),
  kind: budgetKindSchema,
  categoryId: z.uuid().nullable(),
  frequency: budgetFrequencySchema,
  startsOn: localDateSchema,
  endsOn: localDateSchema,
  plannedMinor: positiveMinorAmountSchema,
});
export const savingsGoalCreateSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  targetMinor: positiveMinorAmountSchema,
  targetDate: localDateSchema.nullable().default(null),
  savingsWalletId: z.uuid().nullable().default(null),
});
export const savingsGoalUpdateSchema = savingsGoalCreateSchema.extend({
  archived: z.boolean().default(false),
});
export const savingsGoalSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().max(100),
  targetMinor: positiveMinorAmountSchema,
  targetDate: localDateSchema.nullable(),
  savingsWalletId: z.uuid().nullable(),
  savingsWalletName: z.string().max(100).nullable(),
  savedMinor: signedMinorAmountSchema,
  remainingMinor: signedMinorAmountSchema,
  progressPercent: z.number().int().min(0).max(100),
  archivedAt: effectiveAtSchema.nullable(),
});
export const savingsGoalListSchema = z.array(savingsGoalSchema).max(100);
export const savingsGoalCreateResultSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().max(100),
  targetMinor: positiveMinorAmountSchema,
  targetDate: localDateSchema.nullable(),
  savingsWalletId: z.uuid().nullable(),
});
export const savingsGoalUpdateResultSchema = z.strictObject({
  id: z.uuid(),
  archivedAt: effectiveAtSchema.nullable(),
});
export const savingsContributionCreateSchema = z.strictObject({
  sourceWalletId: z.uuid(),
  destinationWalletId: z.uuid(),
  amountMinor: positiveMinorAmountSchema,
  effectiveAt: effectiveAtSchema,
  timezone: timezoneSchema,
  note: z.string().trim().max(500).optional(),
});
export const savingsContributionSchema = z.strictObject({
  eventId: z.uuid(),
  amountMinor: positiveMinorAmountSchema,
  effectiveAt: effectiveAtSchema,
  note: z.string().max(500).nullable(),
  sourceWalletId: z.uuid(),
  sourceWalletName: z.string().max(100),
  destinationWalletId: z.uuid(),
  destinationWalletName: z.string().max(100),
});
export const savingsContributionListSchema = z.array(savingsContributionSchema).max(100);
export const financeReportDailySchema = z.strictObject({
  localDate: localDateSchema,
  incomeMinor: signedMinorAmountSchema,
  expenseMinor: signedMinorAmountSchema,
});
export const financeReportCategorySchema = z.strictObject({
  categoryId: z.uuid().nullable(),
  categoryName: z.string().max(100),
  amountMinor: signedMinorAmountSchema,
  eventCount: z.number().int().nonnegative().max(2_147_483_647),
});
export const financeReportMerchantSchema = z.strictObject({
  merchant: z.string().max(160),
  amountMinor: signedMinorAmountSchema,
  eventCount: z.number().int().nonnegative().max(2_147_483_647),
});
export const financeReportSchema = z.strictObject({
  timezone: timezoneSchema,
  from: localDateSchema,
  to: localDateSchema,
  current: z.strictObject({
    incomeMinor: signedMinorAmountSchema,
    grossExpenseMinor: signedMinorAmountSchema,
    refundMinor: signedMinorAmountSchema,
    eventCount: z.number().int().nonnegative().max(2_147_483_647),
  }),
  previous: z.strictObject({
    incomeMinor: signedMinorAmountSchema,
    grossExpenseMinor: signedMinorAmountSchema,
    refundMinor: signedMinorAmountSchema,
  }),
  daily: z.array(financeReportDailySchema).max(366),
  categories: z.array(financeReportCategorySchema).max(100),
  merchants: z.array(financeReportMerchantSchema).max(100),
});
export const financeReportQuerySchema = z.strictObject({
  from: localDateSchema,
  to: localDateSchema,
}).refine(({ from, to }) => {
  const duration = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000 + 1;
  return duration >= 1 && duration <= 366;
}, "Rentang laporan harus 1–366 hari.");
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
export type Budget = z.infer<typeof budgetSchema>;
export type BudgetCreate = z.infer<typeof budgetCreateSchema>;
export type SavingsGoal = z.infer<typeof savingsGoalSchema>;
export type SavingsGoalCreate = z.infer<typeof savingsGoalCreateSchema>;
export type SavingsGoalUpdate = z.infer<typeof savingsGoalUpdateSchema>;
export type FinanceReport = z.infer<typeof financeReportSchema>;
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
