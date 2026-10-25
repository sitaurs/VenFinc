-- Tenant-owned budget plans. Budgets are plans only; this migration does not
-- create ledger postings or change wallet balances.
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  kind text NOT NULL,
  category_id uuid,
  frequency text NOT NULL DEFAULT 'monthly',
  timezone varchar(100) NOT NULL,
  rollover_policy boolean NOT NULL DEFAULT false,
  warning_thresholds smallint[] NOT NULL DEFAULT ARRAY[50,75,90,100]::smallint[],
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT budgets_user_id_id_uq UNIQUE (user_id, id),
  CONSTRAINT budgets_category_same_user_fk FOREIGN KEY (user_id, category_id)
    REFERENCES public.categories(user_id, id) ON DELETE NO ACTION,
  CONSTRAINT budgets_kind_valid CHECK (kind IN ('category', 'global')),
  CONSTRAINT budgets_category_shape CHECK
    ((kind = 'category' AND category_id IS NOT NULL) OR (kind = 'global' AND category_id IS NULL)),
  CONSTRAINT budgets_frequency_valid CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  CONSTRAINT budgets_name_nonempty CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  CONSTRAINT budgets_thresholds_valid CHECK (
    cardinality(warning_thresholds) BETWEEN 1 AND 8 AND
    array_position(warning_thresholds, NULL) IS NULL
  )
);
--> statement-breakpoint
CREATE UNIQUE INDEX budgets_active_category_uq ON public.budgets(user_id, category_id)
  WHERE archived_at IS NULL AND kind = 'category';
--> statement-breakpoint
CREATE UNIQUE INDEX budgets_active_global_uq ON public.budgets(user_id)
  WHERE archived_at IS NULL AND kind = 'global';
--> statement-breakpoint
CREATE TABLE public.budget_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  budget_id uuid NOT NULL,
  client_mutation_id uuid NOT NULL,
  request_payload jsonb NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  planned_minor bigint NOT NULL,
  rollover_from_period_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT budget_periods_user_id_id_uq UNIQUE (user_id, id),
  CONSTRAINT budget_periods_client_mutation_uq UNIQUE (user_id, client_mutation_id),
  CONSTRAINT budget_periods_budget_range_uq UNIQUE (user_id, budget_id, starts_on, ends_on),
  CONSTRAINT budget_periods_budget_same_user_fk FOREIGN KEY (user_id, budget_id)
    REFERENCES public.budgets(user_id, id) ON DELETE CASCADE,
  CONSTRAINT budget_periods_rollover_same_user_fk FOREIGN KEY (user_id, rollover_from_period_id)
    REFERENCES public.budget_periods(user_id, id) ON DELETE NO ACTION,
  CONSTRAINT budget_periods_dates_valid CHECK (ends_on >= starts_on),
  CONSTRAINT budget_periods_planned_positive CHECK (planned_minor > 0)
);
--> statement-breakpoint
CREATE INDEX budget_periods_user_dates_idx ON public.budget_periods(user_id, starts_on, ends_on);
--> statement-breakpoint
CREATE UNIQUE INDEX category_allocations_event_category_uq
  ON public.category_allocations(user_id, finance_event_id, category_id);
--> statement-breakpoint
CREATE FUNCTION public.seed_default_categories_for_user(p_user_id text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
BEGIN
  IF p_user_id IS NULL OR p_user_id IS DISTINCT FROM public.current_app_user_id()
     OR NOT EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.user_id = p_user_id AND p.account_status = 'active')
  THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id || ':default-categories', 0));
  IF EXISTS (SELECT 1 FROM public.categories c WHERE c.user_id = p_user_id) THEN RETURN; END IF;
  INSERT INTO public.categories (user_id, name, icon_key, color_token)
  SELECT p_user_id, template.name, template.icon_key, template.color_token
  FROM (VALUES
    ('Makan', 'utensils', 'peach'),
    ('Transportasi', 'bus', 'mint'),
    ('Tagihan', 'receipt', 'blue'),
    ('Belanja', 'shopping-bag', 'lavender'),
    ('Jajan', 'sparkles', 'pink'),
    ('Kesehatan', 'heart', 'mint'),
    ('Pendidikan', 'book-open', 'blue'),
    ('Rumah tangga', 'house', 'peach'),
    ('Cicilan', 'credit-card', 'lavender'),
    ('Tabungan', 'piggy-bank', 'mint'),
    ('Hiburan', 'gamepad-2', 'pink'),
    ('Lainnya', 'circle-ellipsis', 'lavender')
  ) AS template(name, icon_key, color_token);
END $$;
--> statement-breakpoint
ALTER FUNCTION public.seed_default_categories_for_user(text) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.seed_default_categories_for_user(text) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.seed_default_categories_for_user(text) TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.ensure_default_categories() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.seed_default_categories_for_user(public.current_app_user_id());
END $$;
--> statement-breakpoint
ALTER FUNCTION public.ensure_default_categories() OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.ensure_default_categories() FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.ensure_default_categories() TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.seed_categories_after_profile_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.seed_default_categories_for_user(NEW.user_id);
  RETURN NEW;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.seed_categories_after_profile_insert() OWNER TO venfinance_mutator;
--> statement-breakpoint
CREATE TRIGGER user_profiles_seed_categories
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_categories_after_profile_insert();
--> statement-breakpoint
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.budgets FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY budgets_owner ON public.budgets
  USING (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ))
  WITH CHECK (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ));
--> statement-breakpoint
ALTER TABLE public.budget_periods ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.budget_periods FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY budget_periods_owner ON public.budget_periods
  USING (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ))
  WITH CHECK (user_id = public.current_app_user_id() AND EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
  ));
--> statement-breakpoint
GRANT SELECT ON public.budgets, public.budget_periods TO authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT ON public.budgets, public.budget_periods TO venfinance_mutator;
--> statement-breakpoint
GRANT INSERT (user_id, parent_id, name, icon_key, color_token)
  ON public.categories TO venfinance_mutator;
--> statement-breakpoint
GRANT UPDATE (id) ON public.budget_periods TO venfinance_mutator;
--> statement-breakpoint
GRANT UPDATE (id, name, frequency, timezone, rollover_policy, warning_thresholds, updated_at)
  ON public.budgets TO venfinance_mutator;
--> statement-breakpoint
CREATE FUNCTION public.create_budget(
  p_idempotency_key uuid,
  p_name text,
  p_kind text,
  p_category_id uuid,
  p_frequency text,
  p_timezone text,
  p_starts_on date,
  p_ends_on date,
  p_planned_minor text,
  p_rollover_policy boolean DEFAULT false,
  p_warning_thresholds smallint[] DEFAULT ARRAY[50,75,90,100]::smallint[]
) RETURNS TABLE (
  budget_id uuid,
  period_id uuid,
  name text,
  kind text,
  category_id uuid,
  frequency text,
  starts_on date,
  ends_on date,
  planned_minor text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE
  subject text := public.current_app_user_id();
  canonical jsonb;
  existing_budget public.budgets%ROWTYPE;
  existing_period public.budget_periods%ROWTYPE;
  new_budget_id uuid;
  new_period_id uuid;
BEGIN
  IF subject IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = subject AND p.account_status = 'active'
  ) THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF p_idempotency_key IS NULL OR p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 1 AND 100
     OR p_kind IS NULL OR p_kind NOT IN ('category','global')
     OR (p_kind = 'category' AND p_category_id IS NULL)
     OR (p_kind = 'global' AND p_category_id IS NOT NULL)
     OR p_frequency IS DISTINCT FROM 'monthly'
     OR p_timezone IS NULL OR p_timezone NOT IN (SELECT z.name FROM pg_catalog.pg_timezone_names z)
     OR p_starts_on IS NULL OR p_ends_on IS NULL
     OR p_starts_on <> date_trunc('month', p_starts_on)::date
     OR p_ends_on <> (p_starts_on + interval '1 month' - interval '1 day')::date
     OR p_planned_minor IS NULL OR p_planned_minor !~ '^[1-9][0-9]{0,18}$'
     OR p_rollover_policy IS DISTINCT FROM false
     OR p_warning_thresholds IS NULL OR cardinality(p_warning_thresholds) NOT BETWEEN 1 AND 8
     OR array_position(p_warning_thresholds, NULL) IS NOT NULL
     OR EXISTS (SELECT 1 FROM unnest(p_warning_thresholds) v WHERE v < 1 OR v > 100)
     OR cardinality(p_warning_thresholds) <> (SELECT count(DISTINCT v) FROM unnest(p_warning_thresholds) v)
  THEN RAISE EXCEPTION 'INVALID_BUDGET' USING ERRCODE = '22023'; END IF;
  IF p_planned_minor::numeric > 9223372036854775807
  THEN RAISE EXCEPTION 'INVALID_BUDGET' USING ERRCODE = '22023'; END IF;
  canonical := jsonb_build_object(
    'name', btrim(p_name), 'kind', p_kind, 'categoryId', p_category_id,
    'frequency', p_frequency, 'timezone', p_timezone, 'startsOn', p_starts_on,
    'endsOn', p_ends_on, 'plannedMinor', p_planned_minor::bigint::text,
    'rolloverPolicy', p_rollover_policy, 'warningThresholds', to_jsonb(p_warning_thresholds)
  );
  PERFORM pg_advisory_xact_lock(hashtextextended(
    subject || ':budget-scope:' || p_kind || ':' || coalesce(p_category_id::text, 'global'), 0
  ));
  PERFORM pg_advisory_xact_lock(hashtextextended(subject || ':budget-key:' || p_idempotency_key::text, 0));
  SELECT bp.* INTO existing_period FROM public.budget_periods bp
   WHERE bp.user_id = subject AND bp.client_mutation_id = p_idempotency_key FOR UPDATE;
  IF FOUND THEN
    IF existing_period.request_payload IS DISTINCT FROM canonical THEN
      RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED' USING ERRCODE = '23505';
    END IF;
    RETURN QUERY SELECT b.id, existing_period.id, b.name::text, b.kind,
      b.category_id, b.frequency, existing_period.starts_on, existing_period.ends_on,
      existing_period.planned_minor::text
    FROM public.budgets b WHERE b.user_id = subject AND b.id = existing_period.budget_id;
    RETURN;
  END IF;
  IF p_kind = 'category' AND NOT EXISTS (
    SELECT 1 FROM public.categories c WHERE c.user_id = subject AND c.id = p_category_id AND c.archived_at IS NULL
  ) THEN RAISE EXCEPTION 'CATEGORY_NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  SELECT b.* INTO existing_budget FROM public.budgets b
   WHERE b.user_id = subject AND b.archived_at IS NULL
     AND b.kind = p_kind AND b.category_id IS NOT DISTINCT FROM p_category_id
   FOR UPDATE;
  IF FOUND THEN
    new_budget_id := existing_budget.id;
    UPDATE public.budgets b SET name = btrim(p_name), frequency = p_frequency,
      timezone = p_timezone, rollover_policy = p_rollover_policy,
      warning_thresholds = p_warning_thresholds, updated_at = now()
    WHERE b.user_id = subject AND b.id = new_budget_id;
  ELSE
    INSERT INTO public.budgets (
      user_id, name, kind, category_id, frequency, timezone, rollover_policy, warning_thresholds
    ) VALUES (
      subject, btrim(p_name), p_kind, p_category_id, p_frequency, p_timezone,
      p_rollover_policy, p_warning_thresholds
    ) RETURNING id INTO new_budget_id;
  END IF;
  INSERT INTO public.budget_periods (
    user_id, budget_id, client_mutation_id, request_payload, starts_on, ends_on, planned_minor
  ) VALUES (
    subject, new_budget_id, p_idempotency_key, canonical, p_starts_on, p_ends_on, p_planned_minor::bigint
  )
    RETURNING id INTO new_period_id;
  RETURN QUERY SELECT new_budget_id, new_period_id, btrim(p_name), p_kind,
    p_category_id, p_frequency, p_starts_on, p_ends_on, p_planned_minor::bigint::text;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.create_budget(uuid,text,text,uuid,text,text,date,date,text,boolean,smallint[])
  OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_budget(uuid,text,text,uuid,text,text,date,date,text,boolean,smallint[])
  FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_budget(uuid,text,text,uuid,text,text,date,date,text,boolean,smallint[])
  TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.list_budgets(p_starts_on date, p_ends_on date)
RETURNS TABLE (
  budget_id uuid,
  name text,
  kind text,
  category_id uuid,
  category_name text,
  frequency text,
  timezone text,
  rollover_policy boolean,
  warning_thresholds smallint[],
  period_starts_on date,
  period_ends_on date,
  planned_minor text,
  used_minor text,
  remaining_minor text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = subject AND p.account_status = 'active'
  ) THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  IF p_starts_on IS NULL OR p_ends_on IS NULL
     OR p_starts_on <> date_trunc('month', p_starts_on)::date
     OR p_ends_on <> (p_starts_on + interval '1 month' - interval '1 day')::date
  THEN RAISE EXCEPTION 'INVALID_BUDGET_RANGE' USING ERRCODE = '22023'; END IF;
  RETURN QUERY
  WITH selected AS (
    SELECT b.id, b.user_id, b.name::text AS name, b.kind, b.category_id,
      category.name::text AS category_name, b.frequency, b.timezone::text AS timezone,
      b.rollover_policy, b.warning_thresholds,
      min(bp.starts_on) AS period_starts_on, max(bp.ends_on) AS period_ends_on,
      sum(bp.planned_minor)::numeric AS planned_minor
    FROM public.budgets b
    JOIN public.budget_periods bp ON bp.user_id = b.user_id AND bp.budget_id = b.id
      AND bp.starts_on <= p_ends_on AND bp.ends_on >= p_starts_on
    LEFT JOIN public.categories category ON category.user_id = b.user_id AND category.id = b.category_id
    WHERE b.user_id = subject AND b.archived_at IS NULL
    GROUP BY b.id, b.user_id, b.name, b.kind, b.category_id, category.name,
      b.frequency, b.timezone, b.rollover_policy, b.warning_thresholds
  ),
  totals AS (
    SELECT s.id AS budget_id,
      coalesce(sum(
        CASE
          WHEN e.kind = 'expense' AND s.kind = 'global' THEN e.amount_minor::numeric
          WHEN e.kind = 'refund' AND s.kind = 'global' THEN -e.amount_minor::numeric
          WHEN e.kind = 'expense' AND s.kind = 'category' THEN
            CASE WHEN EXISTS (SELECT 1 FROM public.category_allocations any_a
              WHERE any_a.user_id = subject AND any_a.finance_event_id = e.id)
              THEN (SELECT coalesce(sum(a.amount_minor), 0)::numeric FROM public.category_allocations a
                WHERE a.user_id = subject AND a.finance_event_id = e.id AND a.category_id = s.category_id)
              WHEN e.category_id = s.category_id THEN e.amount_minor::numeric ELSE 0 END
          WHEN e.kind = 'refund' AND s.kind = 'category' THEN
            CASE WHEN EXISTS (SELECT 1 FROM public.category_allocations refund_a
              WHERE refund_a.user_id = subject AND refund_a.finance_event_id = e.id)
              THEN -(SELECT coalesce(sum(a.amount_minor), 0)::numeric FROM public.category_allocations a
                WHERE a.user_id = subject AND a.finance_event_id = e.id AND a.category_id = s.category_id)
              WHEN NOT EXISTS (SELECT 1 FROM public.category_allocations source_a
                WHERE source_a.user_id = subject AND source_a.finance_event_id = e.refund_of)
                AND EXISTS (SELECT 1 FROM public.finance_events source_e
                  WHERE source_e.user_id = subject AND source_e.id = e.refund_of AND source_e.category_id = s.category_id)
              THEN -e.amount_minor::numeric ELSE 0 END
          ELSE 0
        END
      ), 0) AS used_minor
    FROM selected s
    LEFT JOIN public.finance_events e ON e.user_id = subject AND e.status = 'posted'
      AND e.kind IN ('expense','refund')
      AND (e.effective_at AT TIME ZONE s.timezone)::date BETWEEN p_starts_on AND p_ends_on
    GROUP BY s.id
  )
  SELECT s.id, s.name, s.kind, s.category_id, s.category_name, s.frequency, s.timezone,
    s.rollover_policy, s.warning_thresholds, s.period_starts_on, s.period_ends_on,
    s.planned_minor::bigint::text, t.used_minor::bigint::text,
    (s.planned_minor - t.used_minor)::bigint::text
  FROM selected s JOIN totals t ON t.budget_id = s.id
  ORDER BY s.kind, s.name, s.id;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.list_budgets(date,date) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_budgets(date,date) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_budgets(date,date) TO authenticated;
