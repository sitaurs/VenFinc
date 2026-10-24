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
  limit: z.coerce.number().int().min(1).max(100).default(20),
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

export type MinorAmount = z.infer<typeof minorAmountSchema>;
export type FinanceState = z.infer<typeof financeStateSchema>;
export type TransactionKind = z.infer<typeof transactionKindSchema>;
export type PublicConfig = z.infer<typeof publicConfigSchema>;
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
