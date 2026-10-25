CREATE TABLE "savings_goal_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"goal_id" uuid NOT NULL,
	"finance_event_id" uuid NOT NULL,
	"client_mutation_id" uuid NOT NULL,
	"request_payload" jsonb NOT NULL,
	"amount_minor" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "savings_goal_contributions_user_id_id_uq" UNIQUE("user_id","id"),
	CONSTRAINT "savings_goal_contributions_event_uq" UNIQUE("user_id","finance_event_id"),
	CONSTRAINT "savings_goal_contributions_client_mutation_uq" UNIQUE("user_id","client_mutation_id"),
	CONSTRAINT "savings_goal_contributions_amount_positive" CHECK ("savings_goal_contributions"."amount_minor" > 0)
);
--> statement-breakpoint
CREATE TABLE "savings_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"target_minor" bigint NOT NULL,
	"target_date" date,
	"savings_wallet_id" uuid,
	"client_mutation_id" uuid NOT NULL,
	"request_payload" jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "savings_goals_user_id_id_uq" UNIQUE("user_id","id"),
	CONSTRAINT "savings_goals_client_mutation_uq" UNIQUE("user_id","client_mutation_id"),
	CONSTRAINT "savings_goals_name_nonempty" CHECK (length(btrim("savings_goals"."name")) BETWEEN 1 AND 100),
	CONSTRAINT "savings_goals_target_positive" CHECK ("savings_goals"."target_minor" > 0)
);
--> statement-breakpoint
ALTER TABLE "savings_goal_contributions" ADD CONSTRAINT "savings_goal_contributions_goal_same_user_fk" FOREIGN KEY ("user_id","goal_id") REFERENCES "public"."savings_goals"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_goal_contributions" ADD CONSTRAINT "savings_goal_contributions_event_same_user_fk" FOREIGN KEY ("user_id","finance_event_id") REFERENCES "public"."finance_events"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_wallet_same_user_fk" FOREIGN KEY ("user_id","savings_wallet_id") REFERENCES "public"."wallets"("user_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "savings_goal_contributions_goal_date_idx" ON "savings_goal_contributions" USING btree ("user_id","goal_id","created_at");--> statement-breakpoint
CREATE INDEX "savings_goals_user_active_idx" ON "savings_goals" USING btree ("user_id","created_at") WHERE "savings_goals"."archived_at" IS NULL;
--> statement-breakpoint
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.savings_goals FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY savings_goals_owner ON public.savings_goals
  USING (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ))
  WITH CHECK (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ));
--> statement-breakpoint
ALTER TABLE public.savings_goal_contributions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.savings_goal_contributions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY savings_goal_contributions_owner ON public.savings_goal_contributions
  USING (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ))
  WITH CHECK (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ));
--> statement-breakpoint
GRANT SELECT ON public.savings_goals, public.savings_goal_contributions TO authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON public.savings_goals TO venfinance_mutator;
--> statement-breakpoint
GRANT SELECT, INSERT ON public.savings_goal_contributions TO venfinance_mutator;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.post_finance_event(text,uuid,uuid,text,text,timestamptz,text,uuid,jsonb,text,text,text,uuid,boolean,uuid)
  TO venfinance_mutator;
--> statement-breakpoint
CREATE FUNCTION public.create_savings_goal(
  p_idempotency_key uuid,
  p_name text,
  p_target_minor text,
  p_target_date date,
  p_savings_wallet_id uuid
) RETURNS TABLE (goal_id uuid, name text, target_minor text, target_date date, savings_wallet_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE
  subject text := public.current_app_user_id();
  target_value bigint;
  normalized_name text := nullif(btrim(p_name), '');
  canonical jsonb;
  goal_row public.savings_goals%ROWTYPE;
  inserted_rows integer;
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF p_idempotency_key IS NULL OR normalized_name IS NULL OR length(normalized_name) > 100
     OR p_target_minor IS NULL OR p_target_minor !~ '^[1-9][0-9]{0,18}$' THEN
    RAISE EXCEPTION 'INVALID_SAVINGS_GOAL' USING ERRCODE = '22023';
  END IF;
  target_value := p_target_minor::bigint;
  IF p_savings_wallet_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.wallets w WHERE w.user_id = subject AND w.id = p_savings_wallet_id
      AND w.type = 'savings' AND w.archived_at IS NULL
  ) THEN RAISE EXCEPTION 'SAVINGS_WALLET_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  canonical := jsonb_build_object('name', normalized_name, 'targetMinor', target_value::text,
    'targetDate', p_target_date, 'savingsWalletId', p_savings_wallet_id);
  INSERT INTO public.savings_goals (user_id, name, target_minor, target_date, savings_wallet_id,
    client_mutation_id, request_payload)
  VALUES (subject, normalized_name, target_value, p_target_date, p_savings_wallet_id,
    p_idempotency_key, canonical)
  ON CONFLICT (user_id, client_mutation_id) DO NOTHING;
  GET DIAGNOSTICS inserted_rows = ROW_COUNT;
  SELECT * INTO STRICT goal_row FROM public.savings_goals g
  WHERE g.user_id = subject AND g.client_mutation_id = p_idempotency_key FOR UPDATE;
  IF goal_row.request_payload <> canonical THEN
    RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED' USING ERRCODE = '23505';
  END IF;
  RETURN QUERY SELECT goal_row.id, goal_row.name::text, goal_row.target_minor::text,
    goal_row.target_date, goal_row.savings_wallet_id;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.create_savings_goal(uuid,text,text,date,uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_savings_goal(uuid,text,text,date,uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_savings_goal(uuid,text,text,date,uuid) TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.list_savings_goals()
RETURNS TABLE (
  goal_id uuid, name text, target_minor text, target_date date, savings_wallet_id uuid,
  savings_wallet_name text, saved_minor text, remaining_minor text, progress_percent integer, archived_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  SELECT g.id, g.name::text, g.target_minor::text, g.target_date, g.savings_wallet_id,
    w.name::text, totals.saved::text, (g.target_minor::numeric - totals.saved)::text,
    LEAST(100::numeric, floor(totals.saved * 100 / g.target_minor))::integer, g.archived_at
  FROM public.savings_goals g
  LEFT JOIN public.wallets w ON w.user_id = g.user_id AND w.id = g.savings_wallet_id
  CROSS JOIN LATERAL (
    SELECT coalesce(sum(c.amount_minor), 0)::numeric AS saved
    FROM public.savings_goal_contributions c
    JOIN public.finance_events e ON e.user_id = c.user_id AND e.id = c.finance_event_id
    WHERE c.user_id = subject AND c.goal_id = g.id AND e.status = 'posted'
      AND NOT EXISTS (SELECT 1 FROM public.finance_events reversal
        WHERE reversal.user_id = e.user_id AND reversal.reversal_of = e.id AND reversal.status = 'posted')
  ) totals
  WHERE g.user_id = subject
  ORDER BY (g.archived_at IS NOT NULL), g.created_at DESC, g.id;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.list_savings_goals() OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_savings_goals() FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_savings_goals() TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.update_savings_goal(
  p_goal_id uuid, p_name text, p_target_minor text, p_target_date date,
  p_savings_wallet_id uuid, p_archived boolean
) RETURNS TABLE (goal_id uuid, archived_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE
  subject text := public.current_app_user_id();
  normalized_name text := nullif(btrim(p_name), '');
  target_value bigint;
  goal_row public.savings_goals%ROWTYPE;
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF p_goal_id IS NULL OR normalized_name IS NULL OR length(normalized_name) > 100
     OR p_target_minor IS NULL OR p_target_minor !~ '^[1-9][0-9]{0,18}$' OR p_archived IS NULL THEN
    RAISE EXCEPTION 'INVALID_SAVINGS_GOAL' USING ERRCODE = '22023';
  END IF;
  target_value := p_target_minor::bigint;
  IF p_savings_wallet_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.wallets w WHERE w.user_id = subject AND w.id = p_savings_wallet_id
      AND w.type = 'savings' AND w.archived_at IS NULL
  ) THEN RAISE EXCEPTION 'SAVINGS_WALLET_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO goal_row FROM public.savings_goals g
  WHERE g.user_id = subject AND g.id = p_goal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'SAVINGS_GOAL_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  UPDATE public.savings_goals g SET name = normalized_name, target_minor = target_value,
    target_date = p_target_date, savings_wallet_id = p_savings_wallet_id,
    archived_at = CASE WHEN p_archived THEN coalesce(g.archived_at, now()) ELSE NULL END,
    updated_at = now()
  WHERE g.user_id = subject AND g.id = p_goal_id
  RETURNING g.id, g.archived_at INTO goal_row.id, goal_row.archived_at;
  RETURN QUERY SELECT goal_row.id, goal_row.archived_at;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.update_savings_goal(uuid,text,text,date,uuid,boolean) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.update_savings_goal(uuid,text,text,date,uuid,boolean) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.update_savings_goal(uuid,text,text,date,uuid,boolean) TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.contribute_to_savings_goal(
  p_goal_id uuid, p_source_wallet_id uuid, p_destination_wallet_id uuid,
  p_amount_minor text, p_effective_at timestamptz, p_timezone text,
  p_idempotency_key uuid, p_note text, p_allow_negative boolean, p_trace_id uuid
) RETURNS TABLE (
  event_id uuid, amount_minor text, effective_at timestamptz, note text,
  source_wallet_id uuid, source_wallet_name text, destination_wallet_id uuid, destination_wallet_name text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE
  subject text := public.current_app_user_id();
  goal_row public.savings_goals%ROWTYPE;
  posted_event_id uuid;
  contribution_row public.savings_goal_contributions%ROWTYPE;
  canonical jsonb;
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF p_goal_id IS NULL OR p_source_wallet_id IS NULL OR p_destination_wallet_id IS NULL
     OR p_amount_minor IS NULL OR p_amount_minor !~ '^[1-9][0-9]{0,18}$'
     OR p_effective_at IS NULL OR p_timezone IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'INVALID_SAVINGS_CONTRIBUTION' USING ERRCODE = '22023';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(subject || ':savings-contribution:' || p_idempotency_key::text, 0));
  canonical := jsonb_build_object('goalId', p_goal_id, 'sourceWalletId', p_source_wallet_id,
    'destinationWalletId', p_destination_wallet_id, 'amountMinor', p_amount_minor::bigint::text,
    'effectiveAtUtc', (p_effective_at AT TIME ZONE 'UTC')::text, 'timezone', p_timezone,
    'note', nullif(btrim(p_note), ''), 'allowNegative', coalesce(p_allow_negative, false));
  SELECT * INTO contribution_row FROM public.savings_goal_contributions c
  WHERE c.user_id = subject AND c.client_mutation_id = p_idempotency_key FOR UPDATE;
  IF FOUND THEN
    IF contribution_row.request_payload <> canonical OR contribution_row.goal_id <> p_goal_id THEN
      RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED' USING ERRCODE = '23505';
    END IF;
    RETURN QUERY SELECT e.id, e.amount_minor::text, e.effective_at, e.note,
      e.wallet_id, source.name::text, e.destination_wallet_id, destination.name::text
    FROM public.finance_events e
    JOIN public.wallets source ON source.user_id = e.user_id AND source.id = e.wallet_id
    JOIN public.wallets destination ON destination.user_id = e.user_id AND destination.id = e.destination_wallet_id
    WHERE e.user_id = subject AND e.id = contribution_row.finance_event_id
      AND e.kind = 'savings_transfer' AND e.status = 'posted'
      AND NOT EXISTS (SELECT 1 FROM public.finance_events reversal
        WHERE reversal.user_id = e.user_id AND reversal.reversal_of = e.id AND reversal.status = 'posted');
    RETURN;
  END IF;
  SELECT * INTO goal_row FROM public.savings_goals g
  WHERE g.user_id = subject AND g.id = p_goal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'SAVINGS_GOAL_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  IF goal_row.archived_at IS NOT NULL THEN RAISE EXCEPTION 'SAVINGS_GOAL_ARCHIVED' USING ERRCODE = '22023'; END IF;
  IF goal_row.savings_wallet_id IS NOT NULL AND goal_row.savings_wallet_id <> p_destination_wallet_id THEN
    RAISE EXCEPTION 'SAVINGS_WALLET_MISMATCH' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.wallets w WHERE w.user_id = subject
    AND w.id = p_destination_wallet_id AND w.type = 'savings' AND w.archived_at IS NULL) THEN
    RAISE EXCEPTION 'SAVINGS_WALLET_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  SELECT p.event_id INTO posted_event_id FROM public.post_finance_event(
    'savings_transfer', p_source_wallet_id, p_destination_wallet_id, p_amount_minor, 'IDR',
    p_effective_at, p_timezone, p_idempotency_key, '[]'::jsonb,
    nullif(btrim(p_note), ''), NULL, NULL, NULL, coalesce(p_allow_negative, false), p_trace_id
  ) p;
  INSERT INTO public.savings_goal_contributions (
    user_id, goal_id, finance_event_id, client_mutation_id, request_payload, amount_minor
  ) VALUES (subject, p_goal_id, posted_event_id, p_idempotency_key, canonical, p_amount_minor::bigint)
  ON CONFLICT DO NOTHING;
  SELECT * INTO contribution_row FROM public.savings_goal_contributions c
  WHERE c.user_id = subject AND c.client_mutation_id = p_idempotency_key FOR UPDATE;
  IF NOT FOUND OR contribution_row.request_payload <> canonical
     OR contribution_row.goal_id <> p_goal_id OR contribution_row.finance_event_id <> posted_event_id THEN
    RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED' USING ERRCODE = '23505';
  END IF;
  RETURN QUERY SELECT e.id, e.amount_minor::text, e.effective_at, e.note,
    e.wallet_id, source.name::text, e.destination_wallet_id, destination.name::text
  FROM public.finance_events e
  JOIN public.wallets source ON source.user_id = e.user_id AND source.id = e.wallet_id
  JOIN public.wallets destination ON destination.user_id = e.user_id AND destination.id = e.destination_wallet_id
  WHERE e.user_id = subject AND e.id = posted_event_id AND e.kind = 'savings_transfer' AND e.status = 'posted'
    AND NOT EXISTS (SELECT 1 FROM public.finance_events reversal
      WHERE reversal.user_id = e.user_id AND reversal.reversal_of = e.id AND reversal.status = 'posted');
END $$;
--> statement-breakpoint
ALTER FUNCTION public.contribute_to_savings_goal(uuid,uuid,uuid,text,timestamptz,text,uuid,text,boolean,uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.contribute_to_savings_goal(uuid,uuid,uuid,text,timestamptz,text,uuid,text,boolean,uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.contribute_to_savings_goal(uuid,uuid,uuid,text,timestamptz,text,uuid,text,boolean,uuid) TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.list_savings_goal_contributions(p_goal_id uuid)
RETURNS TABLE (
  event_id uuid, amount_minor text, effective_at timestamptz, note text,
  source_wallet_id uuid, source_wallet_name text, destination_wallet_id uuid, destination_wallet_name text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.savings_goals g WHERE g.user_id = subject AND g.id = p_goal_id) THEN
    RAISE EXCEPTION 'SAVINGS_GOAL_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  RETURN QUERY SELECT e.id, e.amount_minor::text, e.effective_at, e.note,
    e.wallet_id, source.name::text, e.destination_wallet_id, destination.name::text
  FROM public.savings_goal_contributions c
  JOIN public.finance_events e ON e.user_id = c.user_id AND e.id = c.finance_event_id
  JOIN public.wallets source ON source.user_id = e.user_id AND source.id = e.wallet_id
  JOIN public.wallets destination ON destination.user_id = e.user_id AND destination.id = e.destination_wallet_id
  WHERE c.user_id = subject AND c.goal_id = p_goal_id AND e.status = 'posted'
    AND NOT EXISTS (SELECT 1 FROM public.finance_events reversal
      WHERE reversal.user_id = e.user_id AND reversal.reversal_of = e.id AND reversal.status = 'posted')
  ORDER BY e.effective_at DESC, e.id DESC LIMIT 100;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.list_savings_goal_contributions(uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_savings_goal_contributions(uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_savings_goal_contributions(uuid) TO authenticated;
