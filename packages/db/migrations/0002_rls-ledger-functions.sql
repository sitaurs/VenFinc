-- Tenant identity is established by Neon Data API after JWT verification.
-- The Worker is the only application client allowed to attach that JWT.
CREATE ROLE venfinance_mutator
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
--> statement-breakpoint
-- CREATEROLE migration owners must be explicit members before changing a function owner.
GRANT venfinance_mutator TO neondb_owner;
--> statement-breakpoint
GRANT CREATE ON SCHEMA public TO venfinance_mutator;
--> statement-breakpoint
CREATE FUNCTION public.current_app_user_id() RETURNS text
LANGUAGE plpgsql STABLE PARALLEL SAFE
SET search_path = pg_catalog AS $$
DECLARE
  claims jsonb;
  subject text;
BEGIN
  IF coalesce(current_setting('request.jwt.claims', true), '') = '' THEN
    RETURN NULL;
  END IF;
  BEGIN
    claims := current_setting('request.jwt.claims', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  IF claims->>'role' <> 'authenticated' THEN
    RETURN NULL;
  END IF;
  subject := claims->>'sub';
  IF subject IS NULL OR length(subject) = 0 OR length(subject) > 255 THEN
    RETURN NULL;
  END IF;
  RETURN subject;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.current_app_user_id() OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO authenticated, venfinance_mutator;
--> statement-breakpoint
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO authenticated, venfinance_mutator;
--> statement-breakpoint
GRANT USAGE ON SCHEMA platform, audit TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON SCHEMA platform, audit FROM PUBLIC, anonymous, authenticated;
--> statement-breakpoint
GRANT SELECT ON public.user_profiles TO authenticated;
--> statement-breakpoint
GRANT INSERT (user_id, display_name, locale, timezone, preferred_currency, onboarding_at)
  ON public.user_profiles TO authenticated;
--> statement-breakpoint
GRANT UPDATE (display_name, locale, timezone, preferred_currency, onboarding_at, updated_at)
  ON public.user_profiles TO authenticated;
--> statement-breakpoint
GRANT SELECT ON public.wallets, public.categories TO authenticated;
--> statement-breakpoint
GRANT INSERT (user_id, name, type, currency, display_order)
  ON public.wallets TO authenticated;
--> statement-breakpoint
GRANT UPDATE (name, type, display_order, archived_at, updated_at)
  ON public.wallets TO authenticated;
--> statement-breakpoint
GRANT INSERT (user_id, parent_id, name, icon_key, color_token)
  ON public.categories TO authenticated;
--> statement-breakpoint
GRANT UPDATE (parent_id, name, icon_key, color_token, archived_at, updated_at)
  ON public.categories TO authenticated;
--> statement-breakpoint
GRANT SELECT ON public.ledger_accounts, public.finance_events,
  public.ledger_postings, public.category_allocations TO authenticated;
--> statement-breakpoint
GRANT SELECT ON public.user_profiles, public.wallets, public.categories,
  public.ledger_accounts, public.finance_events, public.ledger_postings,
  public.category_allocations, public.command_idempotency TO venfinance_mutator;
--> statement-breakpoint
-- PostgreSQL requires UPDATE privilege to take a row-level FOR UPDATE lock.
-- The non-login definer role only uses this for serializing wallet balance checks.
GRANT UPDATE (id) ON public.wallets TO venfinance_mutator;
--> statement-breakpoint
-- Refund source events are locked while remaining refundable value is checked.
GRANT UPDATE (id) ON public.finance_events TO venfinance_mutator;
--> statement-breakpoint
GRANT INSERT ON public.ledger_accounts, public.finance_events,
  public.ledger_postings, public.category_allocations, public.command_idempotency TO venfinance_mutator;
--> statement-breakpoint
GRANT UPDATE (result_event_id) ON public.command_idempotency TO venfinance_mutator;
--> statement-breakpoint
GRANT SELECT, INSERT ON platform.roles TO venfinance_mutator;
--> statement-breakpoint
GRANT INSERT ON audit.security_events TO venfinance_mutator;
--> statement-breakpoint
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY user_profiles_self_select ON public.user_profiles
  FOR SELECT USING (user_id = public.current_app_user_id());
--> statement-breakpoint
CREATE POLICY user_profiles_self_insert ON public.user_profiles
  FOR INSERT WITH CHECK (
    user_id = public.current_app_user_id() AND account_status = 'active'
  );
--> statement-breakpoint
CREATE POLICY user_profiles_self_update ON public.user_profiles
  FOR UPDATE USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());
--> statement-breakpoint
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.wallets FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY wallets_owner ON public.wallets
  USING (
    user_id = public.current_app_user_id() AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
    )
  )
  WITH CHECK (
    user_id = public.current_app_user_id() AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
    )
  );
--> statement-breakpoint
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY categories_owner ON public.categories
  USING (
    user_id = public.current_app_user_id() AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
    )
  )
  WITH CHECK (
    user_id = public.current_app_user_id() AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
    )
  );
--> statement-breakpoint
ALTER TABLE public.ledger_accounts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.ledger_accounts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY ledger_accounts_owner ON public.ledger_accounts
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());
--> statement-breakpoint
ALTER TABLE public.finance_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.finance_events FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY finance_events_owner ON public.finance_events
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());
--> statement-breakpoint
ALTER TABLE public.ledger_postings ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.ledger_postings FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY ledger_postings_owner ON public.ledger_postings
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());
--> statement-breakpoint
ALTER TABLE public.category_allocations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.category_allocations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY category_allocations_owner ON public.category_allocations
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());
--> statement-breakpoint
ALTER TABLE public.command_idempotency ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.command_idempotency FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY command_idempotency_owner ON public.command_idempotency
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());
--> statement-breakpoint
ALTER TABLE platform.roles ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE platform.roles FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY platform_roles_mutator ON platform.roles
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());
--> statement-breakpoint
ALTER TABLE audit.security_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit.security_events FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY security_events_actor ON audit.security_events
  USING (actor_user_id = public.current_app_user_id())
  WITH CHECK (actor_user_id = public.current_app_user_id());
--> statement-breakpoint
CREATE FUNCTION public.ensure_profile_role() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, platform AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM public.current_app_user_id() THEN
    RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '42501';
  END IF;
  INSERT INTO platform.roles (user_id, role, assigned_by)
  VALUES (NEW.user_id, 'user', NULL)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.ensure_profile_role() OWNER TO venfinance_mutator;
--> statement-breakpoint
CREATE TRIGGER user_profiles_assign_default_role
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_profile_role();
--> statement-breakpoint
CREATE FUNCTION public.ensure_wallet_ledger_account() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM public.current_app_user_id() THEN
    RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.ledger_accounts (user_id, purpose, wallet_id, currency)
  VALUES (NEW.user_id, 'wallet', NEW.id, NEW.currency)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.ensure_wallet_ledger_account() OWNER TO venfinance_mutator;
--> statement-breakpoint
CREATE TRIGGER wallets_create_ledger_account
  AFTER INSERT ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.ensure_wallet_ledger_account();
--> statement-breakpoint
CREATE FUNCTION public.enforce_finance_event_balance() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public AS $$
DECLARE
  event_user text;
  event_uuid uuid;
  posting_count bigint;
  posting_total numeric;
BEGIN
  IF TG_TABLE_NAME = 'finance_events' THEN
    event_user := NEW.user_id;
    event_uuid := NEW.id;
  ELSE
    event_user := NEW.user_id;
    event_uuid := NEW.finance_event_id;
  END IF;
  SELECT count(*), coalesce(sum(p.signed_minor), 0)
  INTO posting_count, posting_total
  FROM public.ledger_postings p
  WHERE p.user_id = event_user AND p.finance_event_id = event_uuid;
  IF posting_count < 2 OR posting_total <> 0 THEN
    RAISE EXCEPTION 'UNBALANCED_EVENT' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER finance_events_balanced
  AFTER INSERT ON public.finance_events
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.enforce_finance_event_balance();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER ledger_postings_event_balanced
  AFTER INSERT ON public.ledger_postings
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.enforce_finance_event_balance();
--> statement-breakpoint
CREATE FUNCTION public.current_platform_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, platform AS $$
  SELECT r.role::text
  FROM platform.roles r
  WHERE r.user_id = public.current_app_user_id()
  LIMIT 1
$$;
--> statement-breakpoint
ALTER FUNCTION public.current_platform_role() OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.current_platform_role() FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.current_platform_role() TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.post_finance_event(
  p_kind text,
  p_wallet_id uuid,
  p_destination_wallet_id uuid,
  p_amount_minor text,
  p_currency text,
  p_effective_at timestamptz,
  p_timezone text,
  p_idempotency_key uuid,
  p_allocations jsonb DEFAULT '[]'::jsonb,
  p_note text DEFAULT NULL,
  p_merchant text DEFAULT NULL,
  p_direction text DEFAULT NULL,
  p_refunds_event_id uuid DEFAULT NULL,
  p_allow_negative boolean DEFAULT false,
  p_trace_id uuid DEFAULT NULL
) RETURNS TABLE (
  event_id uuid,
  kind text,
  amount_minor text,
  currency text,
  effective_at timestamptz,
  negative_balance_confirmed boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, platform, audit AS $$
DECLARE
  subject text := public.current_app_user_id();
  amount_value bigint;
  balance_value numeric;
  canonical_allocations jsonb;
  canonical_request jsonb;
  idempotency_row public.command_idempotency%ROWTYPE;
  new_event_id uuid;
  inserted_rows integer;
  source_wallet_type public.wallet_type;
  destination_wallet_type public.wallet_type;
  source_account_id uuid;
  destination_account_id uuid;
  contra_account_id uuid;
  contra_purpose public.ledger_account_purpose;
  allocation_row jsonb;
  allocation_category_id uuid;
  allocation_amount bigint;
  allocation_total numeric := 0;
  allocation_count integer := 0;
  refund_total numeric := 0;
  original_amount bigint;
  original_category_count integer := 0;
  original_category_id uuid;
  actual_negative boolean := false;
  normalized_note text := nullif(btrim(p_note), '');
  normalized_merchant text := nullif(btrim(p_merchant), '');
  normalized_trace_id uuid := coalesce(p_trace_id, gen_random_uuid());
BEGIN
  IF subject IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;
  IF p_idempotency_key IS NULL OR p_wallet_id IS NULL OR p_effective_at IS NULL
     OR p_timezone IS NULL OR p_amount_minor IS NULL
     OR p_amount_minor !~ '^(0|[1-9][0-9]{0,18})$' THEN
    RAISE EXCEPTION 'INVALID_COMMAND' USING ERRCODE = '22023';
  END IF;
  amount_value := p_amount_minor::bigint;
  IF amount_value <= 0 OR p_currency <> 'IDR' OR p_kind NOT IN
     ('income', 'expense', 'transfer', 'savings_transfer', 'opening', 'adjustment', 'refund') THEN
    RAISE EXCEPTION 'INVALID_COMMAND' USING ERRCODE = '22023';
  END IF;
  IF p_timezone NOT IN (SELECT z.name FROM pg_catalog.pg_timezone_names z)
     OR length(coalesce(normalized_note, '')) > 500
     OR length(coalesce(normalized_merchant, '')) > 160 THEN
    RAISE EXCEPTION 'INVALID_COMMAND' USING ERRCODE = '22023';
  END IF;
  IF p_allocations IS NULL OR jsonb_typeof(p_allocations) <> 'array'
     OR jsonb_array_length(p_allocations) > 20 THEN
    RAISE EXCEPTION 'INVALID_ALLOCATIONS' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_allocations) a
    WHERE jsonb_typeof(a) <> 'object'
       OR NOT (a ?& ARRAY['categoryId', 'amountMinor'])
       OR a - ARRAY['categoryId', 'amountMinor'] <> '{}'::jsonb
       OR jsonb_typeof(a->'categoryId') <> 'string'
       OR jsonb_typeof(a->'amountMinor') <> 'string'
       OR (a->>'amountMinor') !~ '^[1-9][0-9]{0,18}$'
  ) THEN
    RAISE EXCEPTION 'INVALID_ALLOCATIONS' USING ERRCODE = '22023';
  END IF;
  SELECT coalesce(jsonb_agg(x.item ORDER BY x.category_id), '[]'::jsonb),
         coalesce(sum(x.amount_minor), 0), count(*), count(DISTINCT x.category_id)
  INTO canonical_allocations, allocation_total, allocation_count, inserted_rows
  FROM (
    SELECT (a->>'categoryId')::uuid AS category_id,
           (a->>'amountMinor')::bigint AS amount_minor,
           jsonb_build_object(
             'categoryId', (a->>'categoryId')::uuid::text,
             'amountMinor', (a->>'amountMinor')::bigint::text
           ) AS item
    FROM jsonb_array_elements(p_allocations) a
  ) x;
  IF allocation_count <> inserted_rows THEN
    RAISE EXCEPTION 'DUPLICATE_ALLOCATION_CATEGORY' USING ERRCODE = '22023';
  END IF;
  IF p_kind = 'expense' AND allocation_count > 0 AND allocation_total <> amount_value THEN
    RAISE EXCEPTION 'ALLOCATION_TOTAL_MISMATCH' USING ERRCODE = '23514';
  END IF;
  IF p_kind <> 'expense' AND p_kind <> 'refund' AND allocation_count <> 0 THEN
    RAISE EXCEPTION 'ALLOCATIONS_NOT_ALLOWED' USING ERRCODE = '22023';
  END IF;
  IF p_kind = 'adjustment' AND p_direction NOT IN ('in', 'out') THEN
    RAISE EXCEPTION 'ADJUSTMENT_DIRECTION_REQUIRED' USING ERRCODE = '22023';
  END IF;
  IF p_kind <> 'adjustment' AND p_direction IS NOT NULL THEN
    RAISE EXCEPTION 'UNEXPECTED_DIRECTION' USING ERRCODE = '22023';
  END IF;
  IF p_kind = 'refund' AND p_refunds_event_id IS NULL THEN
    RAISE EXCEPTION 'REFUND_SOURCE_REQUIRED' USING ERRCODE = '22023';
  END IF;
  IF p_kind <> 'refund' AND p_refunds_event_id IS NOT NULL THEN
    RAISE EXCEPTION 'UNEXPECTED_REFUND_SOURCE' USING ERRCODE = '22023';
  END IF;
  IF p_kind IN ('transfer', 'savings_transfer') THEN
    IF p_destination_wallet_id IS NULL OR p_destination_wallet_id = p_wallet_id THEN
      RAISE EXCEPTION 'INVALID_TRANSFER_WALLETS' USING ERRCODE = '22023';
    END IF;
  ELSIF p_destination_wallet_id IS NOT NULL THEN
    RAISE EXCEPTION 'UNEXPECTED_DESTINATION_WALLET' USING ERRCODE = '22023';
  END IF;

  canonical_request := jsonb_build_object(
    'kind', p_kind,
    'walletId', p_wallet_id::text,
    'destinationWalletId', p_destination_wallet_id::text,
    'amountMinor', amount_value::text,
    'currency', p_currency,
    'effectiveAtUtc', (p_effective_at AT TIME ZONE 'UTC')::text,
    'timezone', p_timezone,
    'allocations', canonical_allocations,
    'note', normalized_note,
    'merchant', normalized_merchant,
    'direction', p_direction,
    'refundsEventId', p_refunds_event_id::text,
    'allowNegative', coalesce(p_allow_negative, false)
  );
  INSERT INTO public.command_idempotency (
    user_id, operation, idempotency_key, canonical_request
  ) VALUES (
    subject, 'post_finance_event', p_idempotency_key, canonical_request
  ) ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted_rows = ROW_COUNT;
  SELECT * INTO STRICT idempotency_row
  FROM public.command_idempotency ci
  WHERE ci.user_id = subject
    AND ci.operation = 'post_finance_event'
    AND ci.idempotency_key = p_idempotency_key
  FOR UPDATE;
  IF idempotency_row.canonical_request <> canonical_request THEN
    RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED' USING ERRCODE = '23505';
  END IF;
  IF inserted_rows = 0 THEN
    IF idempotency_row.result_event_id IS NULL THEN
      RAISE EXCEPTION 'IDEMPOTENCY_RESULT_MISSING' USING ERRCODE = '40001';
    END IF;
    RETURN QUERY
      SELECT e.id, e.kind::text, e.amount_minor::text, e.currency::text,
             e.effective_at, e.negative_balance_confirmed
      FROM public.finance_events e
      WHERE e.user_id = subject AND e.id = idempotency_row.result_event_id;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.user_id = subject AND p.account_status = 'active'
  ) THEN
    RAISE EXCEPTION 'ACCOUNT_INACTIVE' USING ERRCODE = '42501';
  END IF;
  SELECT w.type INTO source_wallet_type
  FROM public.wallets w
  WHERE w.id = p_wallet_id AND w.user_id = subject AND w.archived_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WALLET_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF p_destination_wallet_id IS NOT NULL THEN
    SELECT w.type INTO destination_wallet_type
    FROM public.wallets w
    WHERE w.id = p_destination_wallet_id AND w.user_id = subject AND w.archived_at IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'WALLET_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;
    IF p_kind = 'savings_transfer' AND destination_wallet_type <> 'savings' THEN
      RAISE EXCEPTION 'SAVINGS_WALLET_REQUIRED' USING ERRCODE = '22023';
    END IF;
  END IF;

  IF allocation_count > 0 THEN
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(canonical_allocations) a
      WHERE NOT EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.user_id = subject AND c.id = (a->>'categoryId')::uuid AND c.archived_at IS NULL
      )
    ) THEN
      RAISE EXCEPTION 'CATEGORY_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;
  END IF;
  IF p_kind = 'refund' THEN
    PERFORM 1 FROM public.finance_events e
    WHERE e.user_id = subject AND e.id = p_refunds_event_id
      AND e.kind = 'expense' AND e.status = 'posted'
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'REFUND_SOURCE_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;
    SELECT e.amount_minor INTO original_amount
    FROM public.finance_events e
    WHERE e.user_id = subject AND e.id = p_refunds_event_id;
    SELECT coalesce(sum(e.amount_minor), 0) INTO refund_total
    FROM public.finance_events e
    WHERE e.user_id = subject AND e.refund_of = p_refunds_event_id AND e.status = 'posted';
    IF refund_total + amount_value > original_amount THEN
      RAISE EXCEPTION 'REFUND_EXCEEDS_REMAINING' USING ERRCODE = '23514';
    END IF;
    IF allocation_count > 0 AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(canonical_allocations) a
      WHERE NOT EXISTS (
        SELECT 1 FROM public.category_allocations ca
        WHERE ca.user_id = subject AND ca.finance_event_id = p_refunds_event_id
          AND ca.category_id = (a->>'categoryId')::uuid
      )
    ) THEN
      RAISE EXCEPTION 'REFUND_CATEGORY_NOT_IN_SOURCE' USING ERRCODE = '22023';
    END IF;
    IF allocation_count > 0 AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(canonical_allocations) a
      WHERE (
        SELECT coalesce(sum(refund_alloc.amount_minor), 0)
        FROM public.category_allocations refund_alloc
        JOIN public.finance_events refund_event
          ON refund_event.user_id = refund_alloc.user_id AND refund_event.id = refund_alloc.finance_event_id
        WHERE refund_event.user_id = subject AND refund_event.refund_of = p_refunds_event_id
          AND refund_event.status = 'posted'
          AND refund_alloc.category_id = (a->>'categoryId')::uuid
      ) + (a->>'amountMinor')::bigint > (
        SELECT ca.amount_minor
        FROM public.category_allocations ca
        WHERE ca.user_id = subject AND ca.finance_event_id = p_refunds_event_id
          AND ca.category_id = (a->>'categoryId')::uuid
      )
    ) THEN
      RAISE EXCEPTION 'REFUND_ALLOCATION_EXCEEDS_SOURCE' USING ERRCODE = '23514';
    END IF;
    IF allocation_count > 0 AND allocation_total <> amount_value THEN
      RAISE EXCEPTION 'ALLOCATION_TOTAL_MISMATCH' USING ERRCODE = '23514';
    END IF;
  END IF;

  INSERT INTO public.ledger_accounts (user_id, purpose, wallet_id, currency)
  VALUES (subject, 'wallet', p_wallet_id, 'IDR') ON CONFLICT DO NOTHING;
  SELECT a.id INTO STRICT source_account_id
  FROM public.ledger_accounts a
  WHERE a.user_id = subject AND a.purpose = 'wallet' AND a.wallet_id = p_wallet_id;
  IF p_destination_wallet_id IS NOT NULL THEN
    INSERT INTO public.ledger_accounts (user_id, purpose, wallet_id, currency)
    VALUES (subject, 'wallet', p_destination_wallet_id, 'IDR') ON CONFLICT DO NOTHING;
    SELECT a.id INTO STRICT destination_account_id
    FROM public.ledger_accounts a
    WHERE a.user_id = subject AND a.purpose = 'wallet' AND a.wallet_id = p_destination_wallet_id;
  END IF;

  IF p_kind IN ('expense', 'refund') THEN
    contra_purpose := 'expense';
  ELSIF p_kind = 'income' THEN
    contra_purpose := 'income';
  ELSE
    contra_purpose := 'equity';
  END IF;
  INSERT INTO public.ledger_accounts (user_id, purpose, wallet_id, currency)
  VALUES (subject, contra_purpose, NULL, 'IDR') ON CONFLICT DO NOTHING;
  SELECT a.id INTO STRICT contra_account_id
  FROM public.ledger_accounts a
  WHERE a.user_id = subject AND a.purpose = contra_purpose AND a.wallet_id IS NULL;

  IF p_kind IN ('expense', 'transfer', 'savings_transfer') OR
     (p_kind = 'adjustment' AND p_direction = 'out') THEN
    PERFORM 1 FROM public.wallets w
      WHERE w.user_id = subject AND w.id IN (p_wallet_id, p_destination_wallet_id)
      ORDER BY w.id FOR UPDATE;
    SELECT coalesce(sum(p.signed_minor), 0) INTO balance_value
    FROM public.ledger_postings p
    WHERE p.user_id = subject AND p.ledger_account_id = source_account_id;
    IF balance_value - amount_value < 0 AND NOT coalesce(p_allow_negative, false) THEN
      RAISE EXCEPTION 'NEGATIVE_BALANCE_CONFIRMATION_REQUIRED' USING ERRCODE = '23514';
    END IF;
    actual_negative := balance_value - amount_value < 0;
  END IF;

  IF p_kind = 'opening' AND EXISTS (
    SELECT 1 FROM public.finance_events e
    WHERE e.user_id = subject AND e.wallet_id = p_wallet_id AND e.kind = 'opening'
  ) THEN
    RAISE EXCEPTION 'OPENING_ALREADY_POSTED' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.finance_events (
    user_id, kind, status, amount_minor, negative_balance_confirmed, currency,
    wallet_id, destination_wallet_id, category_id, effective_at, timezone,
    note, merchant, source_channel, client_mutation_id, refund_of
  ) VALUES (
    subject,
    p_kind::public.finance_event_kind,
    'posted',
    amount_value,
    actual_negative,
    'IDR',
    p_wallet_id,
    p_destination_wallet_id,
    CASE WHEN allocation_count = 1 THEN (canonical_allocations->0->>'categoryId')::uuid ELSE NULL END,
    p_effective_at,
    p_timezone,
    normalized_note,
    normalized_merchant,
    'manual',
    p_idempotency_key,
    p_refunds_event_id
  ) RETURNING id INTO new_event_id;

  IF p_kind = 'income' THEN
    INSERT INTO public.ledger_postings (user_id, finance_event_id, ledger_account_id, signed_minor, currency)
    VALUES (subject, new_event_id, source_account_id, amount_value, 'IDR'),
           (subject, new_event_id, contra_account_id, -amount_value, 'IDR');
  ELSIF p_kind = 'expense' THEN
    INSERT INTO public.ledger_postings (user_id, finance_event_id, ledger_account_id, signed_minor, currency)
    VALUES (subject, new_event_id, source_account_id, -amount_value, 'IDR'),
           (subject, new_event_id, contra_account_id, amount_value, 'IDR');
  ELSIF p_kind IN ('transfer', 'savings_transfer') THEN
    INSERT INTO public.ledger_postings (user_id, finance_event_id, ledger_account_id, signed_minor, currency)
    VALUES (subject, new_event_id, source_account_id, -amount_value, 'IDR'),
           (subject, new_event_id, destination_account_id, amount_value, 'IDR');
  ELSIF p_kind = 'opening' THEN
    INSERT INTO public.ledger_postings (user_id, finance_event_id, ledger_account_id, signed_minor, currency)
    VALUES (subject, new_event_id, source_account_id, amount_value, 'IDR'),
           (subject, new_event_id, contra_account_id, -amount_value, 'IDR');
  ELSIF p_kind = 'adjustment' AND p_direction = 'in' THEN
    INSERT INTO public.ledger_postings (user_id, finance_event_id, ledger_account_id, signed_minor, currency)
    VALUES (subject, new_event_id, source_account_id, amount_value, 'IDR'),
           (subject, new_event_id, contra_account_id, -amount_value, 'IDR');
  ELSIF p_kind = 'adjustment' AND p_direction = 'out' THEN
    INSERT INTO public.ledger_postings (user_id, finance_event_id, ledger_account_id, signed_minor, currency)
    VALUES (subject, new_event_id, source_account_id, -amount_value, 'IDR'),
           (subject, new_event_id, contra_account_id, amount_value, 'IDR');
  ELSIF p_kind = 'refund' THEN
    INSERT INTO public.ledger_postings (user_id, finance_event_id, ledger_account_id, signed_minor, currency)
    VALUES (subject, new_event_id, source_account_id, amount_value, 'IDR'),
           (subject, new_event_id, contra_account_id, -amount_value, 'IDR');
  END IF;

  IF allocation_count > 0 THEN
    INSERT INTO public.category_allocations (user_id, finance_event_id, category_id, amount_minor)
    SELECT subject, new_event_id, (a->>'categoryId')::uuid, (a->>'amountMinor')::bigint
    FROM jsonb_array_elements(canonical_allocations) a;
  END IF;
  UPDATE public.command_idempotency ci SET result_event_id = new_event_id
  WHERE ci.user_id = subject AND ci.operation = 'post_finance_event'
    AND ci.idempotency_key = p_idempotency_key;
  INSERT INTO audit.security_events (
    subject_user_id, actor_user_id, action, resource_type, result, trace_id, metadata
  ) VALUES (
    subject, subject, 'finance.event.post', 'finance_event', 'allowed', normalized_trace_id,
    jsonb_build_object('operation', 'post_finance_event')
  );
  RETURN QUERY
    SELECT e.id, e.kind::text, e.amount_minor::text, e.currency::text,
           e.effective_at, e.negative_balance_confirmed
    FROM public.finance_events e
    WHERE e.user_id = subject AND e.id = new_event_id;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.post_finance_event(
  text, uuid, uuid, text, text, timestamptz, text, uuid, jsonb, text, text, text, uuid, boolean, uuid
) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.post_finance_event(
  text, uuid, uuid, text, text, timestamptz, text, uuid, jsonb, text, text, text, uuid, boolean, uuid
) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.post_finance_event(
  text, uuid, uuid, text, text, timestamptz, text, uuid, jsonb, text, text, text, uuid, boolean, uuid
) TO authenticated;
--> statement-breakpoint
REVOKE CREATE ON SCHEMA public FROM venfinance_mutator;
