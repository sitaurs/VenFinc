CREATE TABLE "debt_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"debt_id" uuid NOT NULL,
	"finance_event_id" uuid NOT NULL,
	"fee_event_id" uuid,
	"principal_minor" bigint NOT NULL,
	"fee_minor" bigint NOT NULL,
	"client_mutation_id" uuid NOT NULL,
	"request_payload" jsonb NOT NULL,
	"memo" varchar(500),
	"effective_at" timestamp with time zone NOT NULL,
	"timezone" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "debt_payments_user_id_id_uq" UNIQUE("user_id","id"),
	CONSTRAINT "debt_payments_event_uq" UNIQUE("user_id","finance_event_id"),
	CONSTRAINT "debt_payments_client_mutation_uq" UNIQUE("user_id","client_mutation_id"),
	CONSTRAINT "debt_payments_principal_positive" CHECK ("debt_payments"."principal_minor" > 0),
	CONSTRAINT "debt_payments_fee_nonnegative" CHECK ("debt_payments"."fee_minor" >= 0),
	CONSTRAINT "debt_payments_timezone_valid_shape" CHECK (length("debt_payments"."timezone") BETWEEN 1 AND 100)
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"direction" text NOT NULL,
	"origin" text NOT NULL,
	"counterparty_label" varchar(100),
	"principal_minor" bigint NOT NULL,
	"opening_date" date NOT NULL,
	"due_date" date,
	"installment_minor" bigint,
	"ledger_account_id" uuid NOT NULL,
	"opening_event_id" uuid NOT NULL,
	"wallet_id" uuid,
	"client_mutation_id" uuid NOT NULL,
	"request_payload" jsonb NOT NULL,
	"note" varchar(500),
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "debts_user_id_id_uq" UNIQUE("user_id","id"),
	CONSTRAINT "debts_opening_event_uq" UNIQUE("user_id","opening_event_id"),
	CONSTRAINT "debts_client_mutation_uq" UNIQUE("user_id","client_mutation_id"),
	CONSTRAINT "debts_direction_valid" CHECK ("debts"."direction" IN ('owed_by_user', 'owed_to_user')),
	CONSTRAINT "debts_origin_valid" CHECK ("debts"."origin" IN ('opening', 'loan')),
	CONSTRAINT "debts_origin_wallet_shape" CHECK (("debts"."origin" = 'opening' AND "debts"."wallet_id" IS NULL) OR ("debts"."origin" = 'loan' AND "debts"."wallet_id" IS NOT NULL)),
	CONSTRAINT "debts_label_nonempty" CHECK ("debts"."counterparty_label" IS NULL OR length(btrim("debts"."counterparty_label")) BETWEEN 1 AND 100),
	CONSTRAINT "debts_principal_positive" CHECK ("debts"."principal_minor" > 0),
	CONSTRAINT "debts_installment_positive" CHECK ("debts"."installment_minor" IS NULL OR "debts"."installment_minor" > 0),
	CONSTRAINT "debts_dates_valid" CHECK ("debts"."due_date" IS NULL OR "debts"."due_date" >= "debts"."opening_date")
);
--> statement-breakpoint
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_debt_same_user_fk" FOREIGN KEY ("user_id","debt_id") REFERENCES "public"."debts"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_event_same_user_fk" FOREIGN KEY ("user_id","finance_event_id") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_fee_event_same_user_fk" FOREIGN KEY ("user_id","fee_event_id") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_ledger_account_same_user_fk" FOREIGN KEY ("user_id","ledger_account_id") REFERENCES "public"."ledger_accounts"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_opening_event_same_user_fk" FOREIGN KEY ("user_id","opening_event_id") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_wallet_same_user_fk" FOREIGN KEY ("user_id","wallet_id") REFERENCES "public"."wallets"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "debt_payments_debt_date_idx" ON "debt_payments" USING btree ("user_id","debt_id","effective_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "debts_user_opening_idx" ON "debts" USING btree ("user_id","opening_date" DESC NULLS LAST,"id");
--> statement-breakpoint
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.debts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY debts_owner ON public.debts
  USING (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ))
  WITH CHECK (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ));
--> statement-breakpoint
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.debt_payments FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY debt_payments_owner ON public.debt_payments
  USING (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ))
  WITH CHECK (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ));
--> statement-breakpoint
GRANT SELECT ON public.debts, public.debt_payments TO authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON public.debts, public.debt_payments TO venfinance_mutator;
--> statement-breakpoint
GRANT UPDATE (id) ON public.debts, public.wallets TO venfinance_mutator;
--> statement-breakpoint
GRANT UPDATE (id) ON public.finance_events TO venfinance_mutator;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.list_budgets(p_starts_on date, p_ends_on date)
RETURNS TABLE (
  budget_id uuid, name text, kind text, category_id uuid, category_name text, frequency text, timezone text,
  rollover_policy boolean, warning_thresholds smallint[], period_starts_on date, period_ends_on date,
  planned_minor text, used_minor text, remaining_minor text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id=subject AND p.account_status='active'
  ) THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  IF p_starts_on IS NULL OR p_ends_on IS NULL
     OR p_starts_on <> date_trunc('month',p_starts_on)::date
     OR p_ends_on <> (p_starts_on + interval '1 month' - interval '1 day')::date
  THEN RAISE EXCEPTION 'INVALID_BUDGET_RANGE' USING ERRCODE='22023'; END IF;
  RETURN QUERY
  WITH selected AS (
    SELECT b.id,b.user_id,b.name::text AS name,b.kind,b.category_id,category.name::text AS category_name,
      b.frequency,b.timezone::text AS timezone,b.rollover_policy,b.warning_thresholds,
      min(bp.starts_on) AS period_starts_on,max(bp.ends_on) AS period_ends_on,
      sum(bp.planned_minor)::numeric AS planned_minor
    FROM public.budgets b
    JOIN public.budget_periods bp ON bp.user_id=b.user_id AND bp.budget_id=b.id
      AND bp.starts_on<=p_ends_on AND bp.ends_on>=p_starts_on
    LEFT JOIN public.categories category ON category.user_id=b.user_id AND category.id=b.category_id
    WHERE b.user_id=subject AND b.archived_at IS NULL
    GROUP BY b.id,b.user_id,b.name,b.kind,b.category_id,category.name,b.frequency,b.timezone,b.rollover_policy,b.warning_thresholds
  ),
  totals AS (
    SELECT s.id AS budget_id,
      coalesce(sum(
        CASE
          WHEN e.kind='expense' AND s.kind='global' THEN e.amount_minor::numeric
          WHEN e.kind='refund' AND s.kind='global' THEN -e.amount_minor::numeric
          WHEN e.kind='expense' AND s.kind='category' THEN
            CASE WHEN EXISTS (SELECT 1 FROM public.category_allocations any_a
              WHERE any_a.user_id=subject AND any_a.finance_event_id=e.id)
              THEN (SELECT coalesce(sum(a.amount_minor),0)::numeric FROM public.category_allocations a
                WHERE a.user_id=subject AND a.finance_event_id=e.id AND a.category_id=s.category_id)
              WHEN e.category_id=s.category_id THEN e.amount_minor::numeric ELSE 0 END
          WHEN e.kind='refund' AND s.kind='category' THEN
            CASE WHEN EXISTS (SELECT 1 FROM public.category_allocations refund_a
              WHERE refund_a.user_id=subject AND refund_a.finance_event_id=e.id)
              THEN -(SELECT coalesce(sum(a.amount_minor),0)::numeric FROM public.category_allocations a
                WHERE a.user_id=subject AND a.finance_event_id=e.id AND a.category_id=s.category_id)
              WHEN NOT EXISTS (SELECT 1 FROM public.category_allocations source_a
                WHERE source_a.user_id=subject AND source_a.finance_event_id=e.refund_of)
                AND EXISTS (SELECT 1 FROM public.finance_events source_e
                  WHERE source_e.user_id=subject AND source_e.id=e.refund_of AND source_e.category_id=s.category_id)
              THEN -e.amount_minor::numeric ELSE 0 END
          WHEN e.kind='debt_payment' AND s.kind='category' THEN
            CASE WHEN EXISTS (SELECT 1 FROM public.category_allocations debt_a
              WHERE debt_a.user_id=subject AND debt_a.finance_event_id=e.id)
              THEN (SELECT coalesce(sum(a.amount_minor),0)::numeric FROM public.category_allocations a
                WHERE a.user_id=subject AND a.finance_event_id=e.id AND a.category_id=s.category_id)
              WHEN e.category_id=s.category_id THEN e.amount_minor::numeric ELSE 0 END
          ELSE 0
        END
      ),0)::numeric AS used_minor
    FROM selected s
    LEFT JOIN public.finance_events e ON e.user_id=subject AND e.status='posted'
      AND e.kind IN ('expense','refund','debt_payment')
      AND (e.effective_at AT TIME ZONE s.timezone)::date BETWEEN p_starts_on AND p_ends_on
    GROUP BY s.id
  )
  SELECT s.id,s.name,s.kind,s.category_id,s.category_name,s.frequency,s.timezone,s.rollover_policy,
    s.warning_thresholds,s.period_starts_on,s.period_ends_on,s.planned_minor::bigint::text,
    t.used_minor::bigint::text,(s.planned_minor-t.used_minor)::bigint::text
  FROM selected s JOIN totals t ON t.budget_id=s.id
  ORDER BY s.kind,s.name,s.id;
END $$;
--> statement-breakpoint
CREATE FUNCTION public.create_debt(
  p_idempotency_key uuid, p_direction text, p_origin text, p_counterparty_label text,
  p_principal_minor text, p_opening_date date, p_due_date date, p_installment_minor text,
  p_wallet_id uuid, p_allow_negative boolean, p_timezone text, p_note text, p_trace_id uuid
) RETURNS TABLE (debt_id uuid, opening_event_id uuid, direction text, principal_minor text, remaining_minor text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, audit AS $$
DECLARE
  subject text := public.current_app_user_id();
  principal_value bigint;
  installment_value bigint;
  normalized_label text := nullif(btrim(p_counterparty_label), '');
  normalized_note text := nullif(btrim(p_note), '');
  canonical jsonb;
  debt_row public.debts%ROWTYPE;
  wallet_account_id uuid;
  contra_account_id uuid;
  equity_account_id uuid;
  new_event_id uuid;
  balance_value numeric;
  loan_negative boolean := false;
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF p_idempotency_key IS NULL OR p_direction IS NULL OR p_direction NOT IN ('owed_by_user', 'owed_to_user')
     OR p_origin IS NULL OR p_origin NOT IN ('opening', 'loan') OR p_principal_minor IS NULL
     OR p_principal_minor !~ '^[1-9][0-9]{0,18}$' OR p_opening_date IS NULL
     OR p_timezone IS NULL OR p_timezone NOT IN (SELECT z.name FROM pg_catalog.pg_timezone_names z)
     OR length(coalesce(normalized_label, '')) > 100 OR length(coalesce(normalized_note, '')) > 500
     OR (p_due_date IS NOT NULL AND p_due_date < p_opening_date)
     OR ((p_origin = 'opening') <> (p_wallet_id IS NULL))
     OR (p_installment_minor IS NOT NULL AND p_installment_minor !~ '^[1-9][0-9]{0,18}$') THEN
    RAISE EXCEPTION 'INVALID_DEBT' USING ERRCODE = '22023';
  END IF;
  principal_value := p_principal_minor::bigint;
  installment_value := CASE WHEN p_installment_minor IS NULL THEN NULL ELSE p_installment_minor::bigint END;
  canonical := jsonb_build_object('direction',p_direction,'origin',p_origin,'counterpartyLabel',normalized_label,
    'principalMinor',principal_value::text,'openingDate',p_opening_date,'dueDate',p_due_date,
    'installmentMinor',installment_value::text,'walletId',p_wallet_id,'allowNegative',coalesce(p_allow_negative,false),
    'timezone',p_timezone,'note',normalized_note);
  PERFORM pg_advisory_xact_lock(hashtextextended(subject || ':create-debt:' || p_idempotency_key::text, 0));
  SELECT * INTO debt_row FROM public.debts d
    WHERE d.user_id=subject AND d.client_mutation_id=p_idempotency_key FOR UPDATE;
  IF FOUND THEN
    IF debt_row.request_payload <> canonical THEN RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED' USING ERRCODE = '23505'; END IF;
    RETURN QUERY SELECT debt_row.id,debt_row.opening_event_id,debt_row.direction,debt_row.principal_minor::text,
      (debt_row.principal_minor-coalesce((SELECT sum(dp.principal_minor) FROM public.debt_payments dp
        JOIN public.finance_events e ON e.user_id=dp.user_id AND e.id=dp.finance_event_id
        WHERE dp.user_id=subject AND dp.debt_id=debt_row.id AND e.status='posted'
          AND NOT EXISTS (SELECT 1 FROM public.finance_events r WHERE r.user_id=e.user_id AND r.reversal_of=e.id AND r.status='posted')),0))::text;
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.user_id=subject AND p.account_status='active') THEN
    RAISE EXCEPTION 'ACCOUNT_INACTIVE' USING ERRCODE = '42501';
  END IF;
  IF p_wallet_id IS NOT NULL THEN
    PERFORM 1 FROM public.wallets w WHERE w.user_id=subject AND w.id=p_wallet_id AND w.archived_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'WALLET_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
    INSERT INTO public.ledger_accounts (user_id,purpose,wallet_id,currency)
      VALUES (subject,'wallet',p_wallet_id,'IDR') ON CONFLICT DO NOTHING;
    SELECT a.id INTO STRICT wallet_account_id FROM public.ledger_accounts a
      WHERE a.user_id=subject AND a.purpose='wallet' AND a.wallet_id=p_wallet_id;
    IF p_direction='owed_to_user' THEN
      SELECT coalesce(sum(lp.signed_minor),0) INTO balance_value FROM public.ledger_postings lp
        WHERE lp.user_id=subject AND lp.ledger_account_id=wallet_account_id;
      loan_negative := balance_value < principal_value;
      IF loan_negative AND NOT coalesce(p_allow_negative,false) THEN
        RAISE EXCEPTION 'NEGATIVE_BALANCE_CONFIRMATION_REQUIRED' USING ERRCODE = '23514';
      END IF;
    END IF;
  END IF;
  INSERT INTO public.ledger_accounts (user_id,purpose,wallet_id,currency)
    VALUES (subject,CASE WHEN p_direction='owed_by_user' THEN 'liability'::public.ledger_account_purpose ELSE 'receivable'::public.ledger_account_purpose END,NULL,'IDR')
    ON CONFLICT DO NOTHING;
  SELECT a.id INTO STRICT contra_account_id FROM public.ledger_accounts a WHERE a.user_id=subject
    AND a.purpose=CASE WHEN p_direction='owed_by_user' THEN 'liability'::public.ledger_account_purpose ELSE 'receivable'::public.ledger_account_purpose END
    AND a.wallet_id IS NULL;
  INSERT INTO public.ledger_accounts (user_id,purpose,wallet_id,currency)
    VALUES (subject,'equity',NULL,'IDR') ON CONFLICT DO NOTHING;
  SELECT a.id INTO STRICT equity_account_id FROM public.ledger_accounts a
    WHERE a.user_id=subject AND a.purpose='equity' AND a.wallet_id IS NULL;
  INSERT INTO public.finance_events (user_id,kind,status,amount_minor,negative_balance_confirmed,currency,wallet_id,effective_at,timezone,note,merchant,source_channel,client_mutation_id)
    VALUES (subject,
      CASE WHEN p_origin='opening' THEN 'debt_opening'::public.finance_event_kind
        WHEN p_direction='owed_by_user' THEN 'loan_receipt'::public.finance_event_kind
        ELSE 'loan_disbursement'::public.finance_event_kind END,
      'posted',principal_value,loan_negative,'IDR',p_wallet_id,p_opening_date::timestamp AT TIME ZONE p_timezone,
      p_timezone,normalized_note,normalized_label,'manual',gen_random_uuid())
    RETURNING id INTO new_event_id;
  IF p_origin='opening' AND p_direction='owed_by_user' THEN
    INSERT INTO public.ledger_postings (user_id,finance_event_id,ledger_account_id,signed_minor,currency)
      VALUES (subject,new_event_id,contra_account_id,-principal_value,'IDR'),(subject,new_event_id,equity_account_id,principal_value,'IDR');
  ELSIF p_origin='opening' THEN
    INSERT INTO public.ledger_postings (user_id,finance_event_id,ledger_account_id,signed_minor,currency)
      VALUES (subject,new_event_id,contra_account_id,principal_value,'IDR'),(subject,new_event_id,equity_account_id,-principal_value,'IDR');
  ELSIF p_direction='owed_by_user' THEN
    INSERT INTO public.ledger_postings (user_id,finance_event_id,ledger_account_id,signed_minor,currency)
      VALUES (subject,new_event_id,wallet_account_id,principal_value,'IDR'),(subject,new_event_id,contra_account_id,-principal_value,'IDR');
  ELSE
    INSERT INTO public.ledger_postings (user_id,finance_event_id,ledger_account_id,signed_minor,currency)
      VALUES (subject,new_event_id,wallet_account_id,-principal_value,'IDR'),(subject,new_event_id,contra_account_id,principal_value,'IDR');
  END IF;
  INSERT INTO public.debts (user_id,direction,origin,counterparty_label,principal_minor,opening_date,due_date,installment_minor,
    ledger_account_id,opening_event_id,wallet_id,client_mutation_id,request_payload,note)
    VALUES (subject,p_direction,p_origin,normalized_label,principal_value,p_opening_date,p_due_date,installment_value,
      contra_account_id,new_event_id,p_wallet_id,p_idempotency_key,canonical,normalized_note)
    RETURNING * INTO debt_row;
  INSERT INTO audit.security_events (subject_user_id,actor_user_id,action,resource_type,result,trace_id,metadata)
    VALUES (subject,subject,'finance.debt.create','debt','allowed',coalesce(p_trace_id,gen_random_uuid()),jsonb_build_object('direction',p_direction,'origin',p_origin));
  RETURN QUERY SELECT debt_row.id,new_event_id,p_direction,principal_value::text,principal_value::text;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.create_debt(uuid,text,text,text,text,date,date,text,uuid,boolean,text,text,uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_debt(uuid,text,text,text,text,date,date,text,uuid,boolean,text,text,uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_debt(uuid,text,text,text,text,date,date,text,uuid,boolean,text,text,uuid) TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.list_debts()
RETURNS TABLE (debt_id uuid,direction text,origin text,counterparty_label text,principal_minor text,paid_minor text,
  remaining_minor text,opening_date date,due_date date,installment_minor text,opening_event_id uuid,
  wallet_id uuid,wallet_name text,note text,archived_at timestamptz,status text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  RETURN QUERY SELECT d.id,d.direction,d.origin,d.counterparty_label,d.principal_minor::text,totals.paid::text,
    (d.principal_minor::numeric-totals.paid)::text,d.opening_date,d.due_date,d.installment_minor::text,
    d.opening_event_id,d.wallet_id,w.name::text,d.note,d.archived_at,
    CASE WHEN d.principal_minor::numeric-totals.paid=0 THEN 'settled' ELSE 'active' END
  FROM public.debts d LEFT JOIN public.wallets w ON w.user_id=d.user_id AND w.id=d.wallet_id
  CROSS JOIN LATERAL (
    SELECT coalesce(sum(dp.principal_minor),0)::numeric AS paid
    FROM public.debt_payments dp JOIN public.finance_events e ON e.user_id=dp.user_id AND e.id=dp.finance_event_id
    WHERE dp.user_id=subject AND dp.debt_id=d.id AND e.status='posted'
      AND NOT EXISTS (SELECT 1 FROM public.finance_events r WHERE r.user_id=e.user_id AND r.reversal_of=e.id AND r.status='posted')
  ) totals
  WHERE d.user_id=subject ORDER BY (d.archived_at IS NOT NULL),(d.due_date IS NULL),d.due_date,d.opening_date DESC,d.id;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.list_debts() OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_debts() FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_debts() TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.record_debt_payment(
  p_debt_id uuid,p_wallet_id uuid,p_principal_minor text,p_fee_minor text,p_allow_negative boolean,p_effective_at timestamptz,
  p_timezone text,p_principal_category_id uuid,p_fee_category_id uuid,p_idempotency_key uuid,p_note text,p_trace_id uuid
) RETURNS TABLE (
  payment_id uuid,event_id uuid,fee_event_id uuid,principal_minor text,fee_minor text,negative_balance_confirmed boolean,
  effective_at timestamptz,timezone text,note text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, audit AS $$
DECLARE
  subject text := public.current_app_user_id();
  debt_row public.debts%ROWTYPE;
  payment_row public.debt_payments%ROWTYPE;
  principal_value bigint;
  fee_value bigint;
  remaining_value numeric;
  wallet_account_id uuid;
  contra_account_id uuid;
  fee_account_id uuid;
  principal_event_id uuid;
  fee_event_id_value uuid;
  normalized_note text := nullif(btrim(p_note), '');
  canonical jsonb;
  fee_kind public.finance_event_kind;
  balance_value numeric;
  actual_negative boolean := false;
  fee_negative boolean := false;
  fee_purpose public.ledger_account_purpose;
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF p_debt_id IS NULL OR p_wallet_id IS NULL OR p_idempotency_key IS NULL OR p_principal_minor IS NULL
     OR p_principal_minor !~ '^[1-9][0-9]{0,18}$' OR p_fee_minor IS NULL
     OR p_fee_minor !~ '^(0|[1-9][0-9]{0,18})$' OR p_effective_at IS NULL OR p_timezone IS NULL
     OR p_timezone NOT IN (SELECT z.name FROM pg_catalog.pg_timezone_names z)
     OR length(coalesce(normalized_note,'')) > 500 THEN
    RAISE EXCEPTION 'INVALID_DEBT_PAYMENT' USING ERRCODE = '22023';
  END IF;
  principal_value := p_principal_minor::bigint;
  fee_value := p_fee_minor::bigint;
  IF fee_value::numeric + principal_value::numeric > 9223372036854775807 THEN
    RAISE EXCEPTION 'INVALID_DEBT_PAYMENT' USING ERRCODE = '22023';
  END IF;
  canonical := jsonb_build_object('debtId',p_debt_id,'walletId',p_wallet_id,'principalMinor',principal_value::text,
    'feeMinor',fee_value::text,'effectiveAtUtc',(p_effective_at AT TIME ZONE 'UTC')::text,'timezone',p_timezone,
    'principalCategoryId',p_principal_category_id,'feeCategoryId',p_fee_category_id,'note',normalized_note,
    'allowNegative',coalesce(p_allow_negative,false));
  PERFORM pg_advisory_xact_lock(hashtextextended(subject || ':debt-payment:' || p_idempotency_key::text,0));
  SELECT * INTO payment_row FROM public.debt_payments dp
    WHERE dp.user_id=subject AND dp.client_mutation_id=p_idempotency_key FOR UPDATE;
  IF FOUND THEN
    IF payment_row.request_payload <> canonical OR payment_row.debt_id <> p_debt_id THEN
      RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED' USING ERRCODE = '23505';
    END IF;
    SELECT coalesce(e.negative_balance_confirmed,false) OR coalesce(fe.negative_balance_confirmed,false)
      INTO actual_negative
    FROM public.finance_events e LEFT JOIN public.finance_events fe
      ON fe.user_id=e.user_id AND fe.id=payment_row.fee_event_id
    WHERE e.user_id=subject AND e.id=payment_row.finance_event_id;
    RETURN QUERY SELECT payment_row.id,payment_row.finance_event_id,payment_row.fee_event_id,
      payment_row.principal_minor::text,payment_row.fee_minor::text,coalesce(actual_negative,false),payment_row.effective_at,
      payment_row.timezone,payment_row.memo::text;
    RETURN;
  END IF;
  SELECT * INTO debt_row FROM public.debts d
    WHERE d.user_id=subject AND d.id=p_debt_id AND d.archived_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'DEBT_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  SELECT d.principal_minor::numeric-coalesce(sum(dp.principal_minor) FILTER (
      WHERE e.status='posted' AND NOT EXISTS (SELECT 1 FROM public.finance_events r
        WHERE r.user_id=e.user_id AND r.reversal_of=e.id AND r.status='posted')
    ),0)
    INTO remaining_value
  FROM public.debts d
  LEFT JOIN public.debt_payments dp ON dp.user_id=d.user_id AND dp.debt_id=d.id
  LEFT JOIN public.finance_events e ON e.user_id=dp.user_id AND e.id=dp.finance_event_id
  WHERE d.user_id=subject AND d.id=p_debt_id GROUP BY d.principal_minor;
  IF principal_value::numeric > remaining_value THEN
    RAISE EXCEPTION 'DEBT_PAYMENT_EXCEEDS_REMAINING' USING ERRCODE = '23514';
  END IF;
  PERFORM 1 FROM public.wallets w WHERE w.user_id=subject AND w.id=p_wallet_id AND w.archived_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'WALLET_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  INSERT INTO public.ledger_accounts (user_id,purpose,wallet_id,currency)
    VALUES (subject,'wallet',p_wallet_id,'IDR') ON CONFLICT DO NOTHING;
  SELECT a.id INTO STRICT wallet_account_id FROM public.ledger_accounts a
    WHERE a.user_id=subject AND a.purpose='wallet' AND a.wallet_id=p_wallet_id;
  IF debt_row.direction='owed_by_user' THEN
    SELECT coalesce(sum(lp.signed_minor),0) INTO balance_value FROM public.ledger_postings lp
      WHERE lp.user_id=subject AND lp.ledger_account_id=wallet_account_id;
    actual_negative := balance_value < principal_value::numeric+fee_value::numeric;
    fee_negative := balance_value-principal_value::numeric-fee_value::numeric < 0;
    IF actual_negative AND NOT coalesce(p_allow_negative,false) THEN
      RAISE EXCEPTION 'NEGATIVE_BALANCE_CONFIRMATION_REQUIRED' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF p_principal_category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.categories c WHERE c.user_id=subject AND c.id=p_principal_category_id AND c.archived_at IS NULL
  ) THEN RAISE EXCEPTION 'CATEGORY_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  IF p_fee_category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.categories c WHERE c.user_id=subject AND c.id=p_fee_category_id AND c.archived_at IS NULL
  ) THEN RAISE EXCEPTION 'CATEGORY_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  SELECT a.id INTO STRICT contra_account_id FROM public.ledger_accounts a
    WHERE a.user_id=subject AND a.id=debt_row.ledger_account_id;
  INSERT INTO public.finance_events (
    user_id,kind,status,amount_minor,negative_balance_confirmed,currency,wallet_id,category_id,effective_at,timezone,note,merchant,source_channel,client_mutation_id
  ) VALUES (
    subject,'debt_payment','posted',principal_value,actual_negative AND debt_row.direction='owed_by_user','IDR',p_wallet_id,p_principal_category_id,
    p_effective_at,p_timezone,normalized_note,debt_row.counterparty_label,'manual',gen_random_uuid()
  ) RETURNING id INTO principal_event_id;
  IF debt_row.direction='owed_by_user' THEN
    INSERT INTO public.ledger_postings (user_id,finance_event_id,ledger_account_id,signed_minor,currency)
      VALUES (subject,principal_event_id,wallet_account_id,-principal_value,'IDR'),
        (subject,principal_event_id,contra_account_id,principal_value,'IDR');
  ELSE
    INSERT INTO public.ledger_postings (user_id,finance_event_id,ledger_account_id,signed_minor,currency)
      VALUES (subject,principal_event_id,wallet_account_id,principal_value,'IDR'),
        (subject,principal_event_id,contra_account_id,-principal_value,'IDR');
  END IF;
  IF p_principal_category_id IS NOT NULL THEN
    INSERT INTO public.category_allocations (user_id,finance_event_id,category_id,amount_minor)
      VALUES (subject,principal_event_id,p_principal_category_id,principal_value);
  END IF;
  IF fee_value > 0 THEN
    fee_kind := CASE WHEN debt_row.direction='owed_by_user' THEN 'expense'::public.finance_event_kind ELSE 'income'::public.finance_event_kind END;
    fee_purpose := CASE WHEN debt_row.direction='owed_by_user' THEN 'expense'::public.ledger_account_purpose ELSE 'income'::public.ledger_account_purpose END;
    INSERT INTO public.ledger_accounts (user_id,purpose,wallet_id,currency)
      VALUES (subject,fee_purpose,NULL,'IDR') ON CONFLICT DO NOTHING;
    SELECT a.id INTO STRICT fee_account_id FROM public.ledger_accounts a
      WHERE a.user_id=subject AND a.wallet_id IS NULL AND a.purpose=fee_purpose;
    fee_event_id_value := gen_random_uuid();
    INSERT INTO public.finance_events (
      id,user_id,kind,status,amount_minor,negative_balance_confirmed,currency,wallet_id,category_id,effective_at,timezone,note,merchant,source_channel,client_mutation_id
    ) VALUES (
      fee_event_id_value,subject,fee_kind,'posted',fee_value,fee_negative,'IDR',p_wallet_id,p_fee_category_id,
      p_effective_at,p_timezone,normalized_note,debt_row.counterparty_label,'manual',gen_random_uuid()
    );
    IF debt_row.direction='owed_by_user' THEN
      INSERT INTO public.ledger_postings (user_id,finance_event_id,ledger_account_id,signed_minor,currency)
        VALUES (subject,fee_event_id_value,wallet_account_id,-fee_value,'IDR'),
          (subject,fee_event_id_value,fee_account_id,fee_value,'IDR');
    ELSE
      INSERT INTO public.ledger_postings (user_id,finance_event_id,ledger_account_id,signed_minor,currency)
        VALUES (subject,fee_event_id_value,wallet_account_id,fee_value,'IDR'),
          (subject,fee_event_id_value,fee_account_id,-fee_value,'IDR');
    END IF;
    IF p_fee_category_id IS NOT NULL THEN
      INSERT INTO public.category_allocations (user_id,finance_event_id,category_id,amount_minor)
        VALUES (subject,fee_event_id_value,p_fee_category_id,fee_value);
    END IF;
  END IF;
  INSERT INTO public.debt_payments (
    user_id,debt_id,finance_event_id,fee_event_id,principal_minor,fee_minor,client_mutation_id,
    request_payload,memo,effective_at,timezone
  ) VALUES (
    subject,p_debt_id,principal_event_id,fee_event_id_value,principal_value,fee_value,p_idempotency_key,
    canonical,normalized_note,p_effective_at,p_timezone
  ) RETURNING * INTO payment_row;
  INSERT INTO audit.security_events (subject_user_id,actor_user_id,action,resource_type,result,trace_id,metadata)
    VALUES (subject,subject,'finance.debt.payment','debt','allowed',coalesce(p_trace_id,gen_random_uuid()),
      jsonb_build_object('debtId',p_debt_id,'principalMinor',principal_value::text,'feeMinor',fee_value::text));
  RETURN QUERY SELECT payment_row.id,payment_row.finance_event_id,payment_row.fee_event_id,
    payment_row.principal_minor::text,payment_row.fee_minor::text,actual_negative,payment_row.effective_at,payment_row.timezone,payment_row.memo::text;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.record_debt_payment(uuid,uuid,text,text,boolean,timestamptz,text,uuid,uuid,uuid,text,uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.record_debt_payment(uuid,uuid,text,text,boolean,timestamptz,text,uuid,uuid,uuid,text,uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.record_debt_payment(uuid,uuid,text,text,boolean,timestamptz,text,uuid,uuid,uuid,text,uuid) TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.list_debt_payments(p_debt_id uuid)
RETURNS TABLE (payment_id uuid,event_id uuid,fee_event_id uuid,principal_minor text,fee_minor text,
  negative_balance_confirmed boolean,effective_at timestamptz,timezone text,note text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.debts d WHERE d.user_id=subject AND d.id=p_debt_id) THEN
    RAISE EXCEPTION 'DEBT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  RETURN QUERY SELECT dp.id,dp.finance_event_id,dp.fee_event_id,dp.principal_minor::text,dp.fee_minor::text,
    coalesce(e.negative_balance_confirmed,false) OR coalesce(fe.negative_balance_confirmed,false),
    dp.effective_at,dp.timezone,dp.memo::text
  FROM public.debt_payments dp JOIN public.finance_events e ON e.user_id=dp.user_id AND e.id=dp.finance_event_id
  LEFT JOIN public.finance_events fe ON fe.user_id=dp.user_id AND fe.id=dp.fee_event_id
  WHERE dp.user_id=subject AND dp.debt_id=p_debt_id AND e.status='posted'
    AND NOT EXISTS (SELECT 1 FROM public.finance_events r WHERE r.user_id=e.user_id AND r.reversal_of=e.id AND r.status='posted')
  ORDER BY dp.effective_at DESC,dp.id;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.list_debt_payments(uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_debt_payments(uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_debt_payments(uuid) TO authenticated;
