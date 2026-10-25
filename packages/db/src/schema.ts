import {
  bigint,
  boolean,
  char,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const accountStatus = pgEnum("account_status", [
  "active",
  "suspended",
  "pending_deletion",
]);
export const walletType = pgEnum("wallet_type", [
  "cash",
  "bank",
  "e_wallet",
  "savings",
  "other",
]);
export const accountPurpose = pgEnum("ledger_account_purpose", [
  "wallet",
  "income",
  "expense",
  "liability",
  "receivable",
  "equity",
]);
export const eventKind = pgEnum("finance_event_kind", [
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
export const eventStatus = pgEnum("finance_event_status", ["posted", "voided"]);
export const platform = pgSchema("platform");
export const platformRole = platform.enum("platform_role", ["user", "admin", "superuser"]);
export const audit = pgSchema("audit");

export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: text("user_id").primaryKey(),
    displayName: varchar("display_name", { length: 100 }),
    locale: varchar("locale", { length: 10 }).notNull().default("id-ID"),
    timezone: varchar("timezone", { length: 100 }).notNull().default("Asia/Jakarta"),
    preferredCurrency: char("preferred_currency", { length: 3 }).notNull().default("IDR"),
    accountStatus: accountStatus("account_status").notNull().default("active"),
    onboardingAt: timestamp("onboarding_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("user_profiles_locale_supported", sql`${table.locale} IN ('id-ID', 'en-US')`),
    check("user_profiles_currency_idr", sql`${table.preferredCurrency} = 'IDR'`),
  ],
);

export const platformRoles = platform.table(
  "roles",
  {
    userId: text("user_id").primaryKey().references(() => userProfiles.userId, {
      onDelete: "cascade",
    }),
    role: platformRole("role").notNull().default("user"),
    assignedBy: text("assigned_by"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("platform_roles_version_positive", sql`${table.version} > 0`),
    index("platform_roles_role_idx").on(table.role, table.createdAt),
  ],
);

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => userProfiles.userId, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 100 }).notNull(),
    type: walletType("type").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("IDR"),
    displayOrder: integer("display_order").notNull().default(0),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("wallets_user_id_id_uq").on(table.userId, table.id),
    uniqueIndex("wallets_user_active_name_uq")
      .on(table.userId, sql`lower(${table.name})`)
      .where(sql`${table.archivedAt} IS NULL`),
    index("wallets_user_order_idx").on(table.userId, table.displayOrder, table.createdAt),
    check("wallets_currency_idr", sql`${table.currency} = 'IDR'`),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => userProfiles.userId, {
      onDelete: "cascade",
    }),
    parentId: uuid("parent_id"),
    name: varchar("name", { length: 100 }).notNull(),
    iconKey: varchar("icon_key", { length: 80 }),
    colorToken: varchar("color_token", { length: 80 }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("categories_user_id_id_uq").on(table.userId, table.id),
    uniqueIndex("categories_user_active_name_uq")
      .on(table.userId, sql`lower(${table.name})`)
      .where(sql`${table.archivedAt} IS NULL`),
    foreignKey({
      name: "categories_parent_same_user_fk",
      columns: [table.userId, table.parentId],
      foreignColumns: [table.userId, table.id],
    }),
  ],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => userProfiles.userId, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    kind: text("kind").notNull(),
    categoryId: uuid("category_id"),
    frequency: text("frequency").notNull().default("monthly"),
    timezone: varchar("timezone", { length: 100 }).notNull(),
    rolloverPolicy: boolean("rollover_policy").notNull().default(false),
    warningThresholds: smallint("warning_thresholds").array().notNull().default(sql`ARRAY[50, 75, 90, 100]::smallint[]`),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("budgets_user_id_id_uq").on(table.userId, table.id),
    foreignKey({
      name: "budgets_category_same_user_fk",
      columns: [table.userId, table.categoryId],
      foreignColumns: [categories.userId, categories.id],
    }),
    check("budgets_kind_valid", sql`${table.kind} IN ('category', 'global')`),
    check("budgets_category_shape", sql`(${table.kind} = 'category' AND ${table.categoryId} IS NOT NULL) OR (${table.kind} = 'global' AND ${table.categoryId} IS NULL)`),
    check("budgets_frequency_valid", sql`${table.frequency} IN ('daily', 'weekly', 'monthly', 'custom')`),
    check("budgets_name_nonempty", sql`length(btrim(${table.name})) BETWEEN 1 AND 100`),
    check("budgets_thresholds_valid", sql`cardinality(${table.warningThresholds}) BETWEEN 1 AND 8 AND array_position(${table.warningThresholds}, NULL) IS NULL`),
    uniqueIndex("budgets_active_category_uq").on(table.userId, table.categoryId).where(sql`${table.archivedAt} IS NULL AND ${table.kind} = 'category'`),
    uniqueIndex("budgets_active_global_uq").on(table.userId).where(sql`${table.archivedAt} IS NULL AND ${table.kind} = 'global'`),
  ],
);

export const budgetPeriods = pgTable(
  "budget_periods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    budgetId: uuid("budget_id").notNull(),
    clientMutationId: uuid("client_mutation_id").notNull(),
    requestPayload: jsonb("request_payload").notNull(),
    startsOn: date("starts_on", { mode: "string" }).notNull(),
    endsOn: date("ends_on", { mode: "string" }).notNull(),
    plannedMinor: bigint("planned_minor", { mode: "bigint" }).notNull(),
    rolloverFromPeriodId: uuid("rollover_from_period_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("budget_periods_user_id_id_uq").on(table.userId, table.id),
    unique("budget_periods_client_mutation_uq").on(table.userId, table.clientMutationId),
    unique("budget_periods_budget_range_uq").on(table.userId, table.budgetId, table.startsOn, table.endsOn),
    foreignKey({
      name: "budget_periods_budget_same_user_fk",
      columns: [table.userId, table.budgetId],
      foreignColumns: [budgets.userId, budgets.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "budget_periods_rollover_same_user_fk",
      columns: [table.userId, table.rolloverFromPeriodId],
      foreignColumns: [table.userId, table.id],
    }),
    check("budget_periods_dates_valid", sql`${table.endsOn} >= ${table.startsOn}`),
    check("budget_periods_planned_positive", sql`${table.plannedMinor} > 0`),
    index("budget_periods_user_dates_idx").on(table.userId, table.startsOn, table.endsOn),
  ],
);

export const savingsGoals = pgTable(
  "savings_goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => userProfiles.userId, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    targetMinor: bigint("target_minor", { mode: "bigint" }).notNull(),
    targetDate: date("target_date", { mode: "string" }),
    savingsWalletId: uuid("savings_wallet_id"),
    clientMutationId: uuid("client_mutation_id").notNull(),
    requestPayload: jsonb("request_payload").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("savings_goals_user_id_id_uq").on(table.userId, table.id),
    unique("savings_goals_client_mutation_uq").on(table.userId, table.clientMutationId),
    foreignKey({
      name: "savings_goals_wallet_same_user_fk",
      columns: [table.userId, table.savingsWalletId],
      foreignColumns: [wallets.userId, wallets.id],
    }),
    check("savings_goals_name_nonempty", sql`length(btrim(${table.name})) BETWEEN 1 AND 100`),
    check("savings_goals_target_positive", sql`${table.targetMinor} > 0`),
    index("savings_goals_user_active_idx").on(table.userId, table.createdAt).where(sql`${table.archivedAt} IS NULL`),
  ],
);

export const ledgerAccounts = pgTable(
  "ledger_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => userProfiles.userId, {
      onDelete: "cascade",
    }),
    purpose: accountPurpose("purpose").notNull(),
    walletId: uuid("wallet_id"),
    currency: char("currency", { length: 3 }).notNull().default("IDR"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("ledger_accounts_user_id_id_uq").on(table.userId, table.id),
    uniqueIndex("ledger_accounts_wallet_uq")
      .on(table.userId, table.walletId)
      .where(sql`${table.purpose} = 'wallet' AND ${table.walletId} IS NOT NULL`),
    uniqueIndex("ledger_accounts_user_contra_uq")
      .on(table.userId, table.purpose)
      .where(sql`${table.purpose} <> 'wallet' AND ${table.walletId} IS NULL`),
    foreignKey({
      name: "ledger_accounts_wallet_same_user_fk",
      columns: [table.userId, table.walletId],
      foreignColumns: [wallets.userId, wallets.id],
    }),
    check(
      "ledger_accounts_wallet_shape",
      sql`(${table.purpose} = 'wallet' AND ${table.walletId} IS NOT NULL) OR (${table.purpose} <> 'wallet' AND ${table.walletId} IS NULL)`,
    ),
    check("ledger_accounts_currency_idr", sql`${table.currency} = 'IDR'`),
  ],
);

export const financeEvents = pgTable(
  "finance_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => userProfiles.userId, {
      onDelete: "cascade",
    }),
    kind: eventKind("kind").notNull(),
    status: eventStatus("status").notNull().default("posted"),
    amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
    negativeBalanceConfirmed: boolean("negative_balance_confirmed").notNull().default(false),
    currency: char("currency", { length: 3 }).notNull().default("IDR"),
    walletId: uuid("wallet_id"),
    destinationWalletId: uuid("destination_wallet_id"),
    categoryId: uuid("category_id"),
    effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull(),
    timezone: varchar("timezone", { length: 100 }).notNull(),
    note: varchar("note", { length: 500 }),
    merchant: varchar("merchant", { length: 160 }),
    sourceChannel: varchar("source_channel", { length: 30 }).notNull().default("manual"),
    clientMutationId: uuid("client_mutation_id"),
    revisionOf: uuid("revision_of"),
    reversalOf: uuid("reversal_of"),
    refundOf: uuid("refund_of"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("finance_events_user_id_id_uq").on(table.userId, table.id),
    uniqueIndex("finance_events_idempotency_uq")
      .on(table.userId, table.sourceChannel, table.clientMutationId)
      .where(sql`${table.clientMutationId} IS NOT NULL`),
    uniqueIndex("finance_events_wallet_opening_uq")
      .on(table.userId, table.walletId)
      .where(sql`${table.kind} = 'opening' AND ${table.walletId} IS NOT NULL`),
    index("finance_events_user_effective_idx").on(
      table.userId,
      table.effectiveAt.desc(),
      table.id.desc(),
    ),
    index("finance_events_user_status_created_idx").on(
      table.userId,
      table.status,
      table.createdAt.desc(),
    ),
    foreignKey({
      name: "finance_events_wallet_same_user_fk",
      columns: [table.userId, table.walletId],
      foreignColumns: [wallets.userId, wallets.id],
    }),
    foreignKey({
      name: "finance_events_destination_wallet_same_user_fk",
      columns: [table.userId, table.destinationWalletId],
      foreignColumns: [wallets.userId, wallets.id],
    }),
    foreignKey({
      name: "finance_events_category_same_user_fk",
      columns: [table.userId, table.categoryId],
      foreignColumns: [categories.userId, categories.id],
    }),
    foreignKey({
      name: "finance_events_revision_same_user_fk",
      columns: [table.userId, table.revisionOf],
      foreignColumns: [table.userId, table.id],
    }),
    foreignKey({
      name: "finance_events_reversal_same_user_fk",
      columns: [table.userId, table.reversalOf],
      foreignColumns: [table.userId, table.id],
    }),
    foreignKey({
      name: "finance_events_refund_same_user_fk",
      columns: [table.userId, table.refundOf],
      foreignColumns: [table.userId, table.id],
    }),
    check("finance_events_positive_amount", sql`${table.amountMinor} > 0`),
    check("finance_events_currency_idr", sql`${table.currency} = 'IDR'`),
    check(
      "finance_events_wallet_shape",
      sql`(${table.kind} IN ('income', 'expense', 'opening', 'adjustment', 'refund', 'debt_payment', 'loan_disbursement', 'loan_receipt') AND ${table.walletId} IS NOT NULL) OR (${table.kind} IN ('transfer', 'savings_transfer') AND ${table.walletId} IS NOT NULL AND ${table.destinationWalletId} IS NOT NULL AND ${table.walletId} <> ${table.destinationWalletId}) OR (${table.kind} IN ('debt_opening') AND ${table.walletId} IS NULL)`,
    ),
  ],
);

export const savingsGoalContributions = pgTable(
  "savings_goal_contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    goalId: uuid("goal_id").notNull(),
    financeEventId: uuid("finance_event_id").notNull(),
    clientMutationId: uuid("client_mutation_id").notNull(),
    requestPayload: jsonb("request_payload").notNull(),
    amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("savings_goal_contributions_user_id_id_uq").on(table.userId, table.id),
    unique("savings_goal_contributions_event_uq").on(table.userId, table.financeEventId),
    unique("savings_goal_contributions_client_mutation_uq").on(table.userId, table.clientMutationId),
    foreignKey({
      name: "savings_goal_contributions_goal_same_user_fk",
      columns: [table.userId, table.goalId],
      foreignColumns: [savingsGoals.userId, savingsGoals.id],
    }),
    foreignKey({
      name: "savings_goal_contributions_event_same_user_fk",
      columns: [table.userId, table.financeEventId],
      foreignColumns: [financeEvents.userId, financeEvents.id],
    }),
    check("savings_goal_contributions_amount_positive", sql`${table.amountMinor} > 0`),
    index("savings_goal_contributions_goal_date_idx").on(table.userId, table.goalId, table.createdAt),
  ],
);

export const ledgerPostings = pgTable(
  "ledger_postings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    financeEventId: uuid("finance_event_id").notNull(),
    ledgerAccountId: uuid("ledger_account_id").notNull(),
    signedMinor: bigint("signed_minor", { mode: "bigint" }).notNull(),
    currency: char("currency", { length: 3 }).notNull().default("IDR"),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "ledger_postings_event_same_user_fk",
      columns: [table.userId, table.financeEventId],
      foreignColumns: [financeEvents.userId, financeEvents.id],
    }),
    foreignKey({
      name: "ledger_postings_account_same_user_fk",
      columns: [table.userId, table.ledgerAccountId],
      foreignColumns: [ledgerAccounts.userId, ledgerAccounts.id],
    }),
    index("ledger_postings_user_event_idx").on(table.userId, table.financeEventId),
    index("ledger_postings_user_account_posted_idx").on(
      table.userId,
      table.ledgerAccountId,
      table.postedAt.desc(),
    ),
    check("ledger_postings_nonzero", sql`${table.signedMinor} <> 0`),
    check("ledger_postings_currency_idr", sql`${table.currency} = 'IDR'`),
  ],
);

export const categoryAllocations = pgTable(
  "category_allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    financeEventId: uuid("finance_event_id").notNull(),
    categoryId: uuid("category_id").notNull(),
    amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
    note: varchar("note", { length: 240 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("category_allocations_event_category_uq").on(
      table.userId,
      table.financeEventId,
      table.categoryId,
    ),
    foreignKey({
      name: "category_allocations_event_same_user_fk",
      columns: [table.userId, table.financeEventId],
      foreignColumns: [financeEvents.userId, financeEvents.id],
    }),
    foreignKey({
      name: "category_allocations_category_same_user_fk",
      columns: [table.userId, table.categoryId],
      foreignColumns: [categories.userId, categories.id],
    }),
    check("category_allocations_positive_amount", sql`${table.amountMinor} > 0`),
  ],
);

export const commandIdempotency = pgTable(
  "command_idempotency",
  {
    userId: text("user_id").notNull().references(() => userProfiles.userId, {
      onDelete: "cascade",
    }),
    operation: varchar("operation", { length: 80 }).notNull(),
    idempotencyKey: uuid("idempotency_key").notNull(),
    canonicalRequest: jsonb("canonical_request").notNull(),
    resultEventId: uuid("result_event_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("command_idempotency_user_operation_key_uq").on(
      table.userId,
      table.operation,
      table.idempotencyKey,
    ),
    foreignKey({
      name: "command_idempotency_result_same_user_fk",
      columns: [table.userId, table.resultEventId],
      foreignColumns: [financeEvents.userId, financeEvents.id],
    }),
  ],
);

export const securityEvents = audit.table(
  "security_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectUserId: text("subject_user_id"),
    actorUserId: text("actor_user_id"),
    action: varchar("action", { length: 80 }).notNull(),
    resourceType: varchar("resource_type", { length: 80 }).notNull(),
    maskedResourceId: varchar("masked_resource_id", { length: 120 }),
    result: varchar("result", { length: 24 }).notNull(),
    reasonCode: varchar("reason_code", { length: 80 }),
    traceId: uuid("trace_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata").notNull().default({}),
  },
  (table) => [
    index("security_events_occurred_idx").on(table.occurredAt.desc(), table.id.desc()),
    index("security_events_actor_idx").on(table.actorUserId, table.occurredAt.desc()),
    check("security_events_result_valid", sql`${table.result} IN ('allowed', 'denied', 'failed')`),
  ],
);

export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
export type Wallet = typeof wallets.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type BudgetPeriod = typeof budgetPeriods.$inferSelect;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type SavingsGoalContribution = typeof savingsGoalContributions.$inferSelect;
export type FinanceEvent = typeof financeEvents.$inferSelect;
export type LedgerPosting = typeof ledgerPostings.$inferSelect;
