CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE SCHEMA "platform";
--> statement-breakpoint
CREATE TYPE "public"."ledger_account_purpose" AS ENUM('wallet', 'income', 'expense', 'liability', 'receivable', 'equity');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('active', 'suspended', 'pending_deletion');--> statement-breakpoint
CREATE TYPE "public"."finance_event_kind" AS ENUM('income', 'expense', 'transfer', 'refund', 'adjustment', 'debt_payment', 'debt_opening', 'loan_disbursement', 'loan_receipt', 'savings_transfer', 'opening');--> statement-breakpoint
CREATE TYPE "public"."finance_event_status" AS ENUM('posted', 'voided');--> statement-breakpoint
CREATE TYPE "platform"."platform_role" AS ENUM('user', 'admin', 'superuser');--> statement-breakpoint
CREATE TYPE "public"."wallet_type" AS ENUM('cash', 'bank', 'e_wallet', 'savings', 'other');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"name" varchar(100) NOT NULL,
	"icon_key" varchar(80),
	"color_token" varchar(80),
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_user_id_id_uq" UNIQUE("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "category_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"finance_event_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"amount_minor" bigint NOT NULL,
	"note" varchar(240),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_allocations_positive_amount" CHECK ("category_allocations"."amount_minor" > 0)
);
--> statement-breakpoint
CREATE TABLE "command_idempotency" (
	"user_id" text NOT NULL,
	"operation" varchar(80) NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"canonical_request" jsonb NOT NULL,
	"result_event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "finance_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" "finance_event_kind" NOT NULL,
	"status" "finance_event_status" DEFAULT 'posted' NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" char(3) DEFAULT 'IDR' NOT NULL,
	"wallet_id" uuid,
	"destination_wallet_id" uuid,
	"category_id" uuid,
	"effective_at" timestamp with time zone NOT NULL,
	"timezone" varchar(100) NOT NULL,
	"note" varchar(500),
	"merchant" varchar(160),
	"source_channel" varchar(30) DEFAULT 'manual' NOT NULL,
	"client_mutation_id" uuid,
	"revision_of" uuid,
	"reversal_of" uuid,
	"refund_of" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "finance_events_user_id_id_uq" UNIQUE("user_id","id"),
	CONSTRAINT "finance_events_positive_amount" CHECK ("finance_events"."amount_minor" > 0),
	CONSTRAINT "finance_events_currency_idr" CHECK ("finance_events"."currency" = 'IDR'),
	CONSTRAINT "finance_events_wallet_shape" CHECK (("finance_events"."kind" IN ('income', 'expense', 'opening', 'adjustment', 'refund', 'debt_payment', 'loan_disbursement', 'loan_receipt') AND "finance_events"."wallet_id" IS NOT NULL) OR ("finance_events"."kind" IN ('transfer', 'savings_transfer') AND "finance_events"."wallet_id" IS NOT NULL AND "finance_events"."destination_wallet_id" IS NOT NULL AND "finance_events"."wallet_id" <> "finance_events"."destination_wallet_id") OR ("finance_events"."kind" IN ('debt_opening') AND "finance_events"."wallet_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "ledger_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"purpose" "ledger_account_purpose" NOT NULL,
	"wallet_id" uuid,
	"currency" char(3) DEFAULT 'IDR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_accounts_user_id_id_uq" UNIQUE("user_id","id"),
	CONSTRAINT "ledger_accounts_wallet_shape" CHECK (("ledger_accounts"."purpose" = 'wallet' AND "ledger_accounts"."wallet_id" IS NOT NULL) OR ("ledger_accounts"."purpose" <> 'wallet' AND "ledger_accounts"."wallet_id" IS NULL)),
	CONSTRAINT "ledger_accounts_currency_idr" CHECK ("ledger_accounts"."currency" = 'IDR')
);
--> statement-breakpoint
CREATE TABLE "ledger_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"finance_event_id" uuid NOT NULL,
	"ledger_account_id" uuid NOT NULL,
	"signed_minor" bigint NOT NULL,
	"currency" char(3) DEFAULT 'IDR' NOT NULL,
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_postings_nonzero" CHECK ("ledger_postings"."signed_minor" <> 0),
	CONSTRAINT "ledger_postings_currency_idr" CHECK ("ledger_postings"."currency" = 'IDR')
);
--> statement-breakpoint
CREATE TABLE "platform"."roles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" "platform"."platform_role" DEFAULT 'user' NOT NULL,
	"assigned_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_roles_version_positive" CHECK ("platform"."roles"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "audit"."security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_user_id" text,
	"actor_user_id" text,
	"action" varchar(80) NOT NULL,
	"resource_type" varchar(80) NOT NULL,
	"masked_resource_id" varchar(120),
	"result" varchar(24) NOT NULL,
	"reason_code" varchar(80),
	"trace_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "security_events_result_valid" CHECK ("audit"."security_events"."result" IN ('allowed', 'denied', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" varchar(100),
	"locale" varchar(10) DEFAULT 'id-ID' NOT NULL,
	"timezone" varchar(100) DEFAULT 'Asia/Jakarta' NOT NULL,
	"preferred_currency" char(3) DEFAULT 'IDR' NOT NULL,
	"account_status" "account_status" DEFAULT 'active' NOT NULL,
	"onboarding_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_locale_supported" CHECK ("user_profiles"."locale" IN ('id-ID', 'en-US')),
	CONSTRAINT "user_profiles_currency_idr" CHECK ("user_profiles"."preferred_currency" = 'IDR')
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "wallet_type" NOT NULL,
	"currency" char(3) DEFAULT 'IDR' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_id_uq" UNIQUE("user_id","id"),
	CONSTRAINT "wallets_currency_idr" CHECK ("wallets"."currency" = 'IDR')
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_same_user_fk" FOREIGN KEY ("user_id","parent_id") REFERENCES "public"."categories"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_allocations" ADD CONSTRAINT "category_allocations_event_same_user_fk" FOREIGN KEY ("user_id","finance_event_id") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_allocations" ADD CONSTRAINT "category_allocations_category_same_user_fk" FOREIGN KEY ("user_id","category_id") REFERENCES "public"."categories"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_idempotency" ADD CONSTRAINT "command_idempotency_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_idempotency" ADD CONSTRAINT "command_idempotency_result_same_user_fk" FOREIGN KEY ("user_id","result_event_id") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_events" ADD CONSTRAINT "finance_events_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_events" ADD CONSTRAINT "finance_events_wallet_same_user_fk" FOREIGN KEY ("user_id","wallet_id") REFERENCES "public"."wallets"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_events" ADD CONSTRAINT "finance_events_destination_wallet_same_user_fk" FOREIGN KEY ("user_id","destination_wallet_id") REFERENCES "public"."wallets"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_events" ADD CONSTRAINT "finance_events_category_same_user_fk" FOREIGN KEY ("user_id","category_id") REFERENCES "public"."categories"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_events" ADD CONSTRAINT "finance_events_revision_same_user_fk" FOREIGN KEY ("user_id","revision_of") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_events" ADD CONSTRAINT "finance_events_reversal_same_user_fk" FOREIGN KEY ("user_id","reversal_of") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_events" ADD CONSTRAINT "finance_events_refund_same_user_fk" FOREIGN KEY ("user_id","refund_of") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_wallet_same_user_fk" FOREIGN KEY ("user_id","wallet_id") REFERENCES "public"."wallets"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_postings" ADD CONSTRAINT "ledger_postings_event_same_user_fk" FOREIGN KEY ("user_id","finance_event_id") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_postings" ADD CONSTRAINT "ledger_postings_account_same_user_fk" FOREIGN KEY ("user_id","ledger_account_id") REFERENCES "public"."ledger_accounts"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."roles" ADD CONSTRAINT "roles_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_active_name_uq" ON "categories" USING btree ("user_id",lower("name")) WHERE "categories"."archived_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "command_idempotency_user_operation_key_uq" ON "command_idempotency" USING btree ("user_id","operation","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "finance_events_idempotency_uq" ON "finance_events" USING btree ("user_id","source_channel","client_mutation_id") WHERE "finance_events"."client_mutation_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "finance_events_user_effective_idx" ON "finance_events" USING btree ("user_id","effective_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "finance_events_user_status_created_idx" ON "finance_events" USING btree ("user_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_accounts_wallet_uq" ON "ledger_accounts" USING btree ("user_id","wallet_id") WHERE "ledger_accounts"."purpose" = 'wallet' AND "ledger_accounts"."wallet_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_accounts_user_contra_uq" ON "ledger_accounts" USING btree ("user_id","purpose") WHERE "ledger_accounts"."purpose" <> 'wallet' AND "ledger_accounts"."wallet_id" IS NULL;--> statement-breakpoint
CREATE INDEX "ledger_postings_user_event_idx" ON "ledger_postings" USING btree ("user_id","finance_event_id");--> statement-breakpoint
CREATE INDEX "ledger_postings_user_account_posted_idx" ON "ledger_postings" USING btree ("user_id","ledger_account_id","posted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "platform_roles_role_idx" ON "platform"."roles" USING btree ("role","created_at");--> statement-breakpoint
CREATE INDEX "security_events_occurred_idx" ON "audit"."security_events" USING btree ("occurred_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "security_events_actor_idx" ON "audit"."security_events" USING btree ("actor_user_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_user_active_name_uq" ON "wallets" USING btree ("user_id",lower("name")) WHERE "wallets"."archived_at" IS NULL;--> statement-breakpoint
CREATE INDEX "wallets_user_order_idx" ON "wallets" USING btree ("user_id","display_order","created_at");