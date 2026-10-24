-- Exact, tenant-scoped read models. BIGINT values leave PostgreSQL as text.
GRANT CREATE ON SCHEMA public TO venfinance_mutator;
--> statement-breakpoint
CREATE FUNCTION public.list_wallets() RETURNS TABLE (
  wallet_id uuid,
  name text,
  wallet_type text,
  currency text,
  balance_minor text,
  archived_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.user_id = subject AND p.account_status = 'active'
  ) THEN
    RAISE EXCEPTION 'ACCOUNT_INACTIVE' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT w.id, w.name::text, w.type::text, w.currency::text,
         coalesce(b.balance_minor, 0)::text, w.archived_at, w.created_at, w.updated_at
  FROM public.wallets w
  LEFT JOIN LATERAL (
    SELECT sum(p.signed_minor) AS balance_minor
    FROM public.ledger_accounts a
    JOIN public.ledger_postings p
      ON p.user_id = a.user_id AND p.ledger_account_id = a.id
    WHERE a.user_id = subject AND a.wallet_id = w.id AND a.purpose = 'wallet'
  ) b ON true
  WHERE w.user_id = subject
  ORDER BY w.archived_at NULLS FIRST, w.display_order, w.created_at, w.id;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.list_wallets() OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_wallets() FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_wallets() TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.list_finance_events(
  p_limit integer DEFAULT 20,
  p_before_effective_at timestamptz DEFAULT NULL,
  p_before_id uuid DEFAULT NULL,
  p_kind text DEFAULT NULL,
  p_from timestamptz DEFAULT NULL,
  p_to timestamptz DEFAULT NULL
) RETURNS TABLE (
  event_id uuid,
  kind text,
  status text,
  amount_minor text,
  currency text,
  wallet_id uuid,
  wallet_name text,
  destination_wallet_id uuid,
  destination_wallet_name text,
  category_id uuid,
  category_name text,
  effective_at timestamptz,
  timezone text,
  note text,
  merchant text,
  source_channel text,
  refund_of uuid,
  allocations jsonb,
  negative_balance_confirmed boolean,
  created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles p
    WHERE p.user_id = subject AND p.account_status = 'active'
  ) THEN
    RAISE EXCEPTION 'ACCOUNT_INACTIVE' USING ERRCODE = '42501';
  END IF;
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100
     OR ((p_before_effective_at IS NULL) <> (p_before_id IS NULL))
     OR (p_from IS NOT NULL AND p_to IS NOT NULL AND p_from >= p_to)
     OR (p_kind IS NOT NULL AND p_kind NOT IN (
       'income', 'expense', 'transfer', 'refund', 'adjustment', 'debt_payment',
       'debt_opening', 'loan_disbursement', 'loan_receipt', 'savings_transfer', 'opening'
     )) THEN
    RAISE EXCEPTION 'INVALID_QUERY' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
  SELECT e.id, e.kind::text, e.status::text, e.amount_minor::text,
         e.currency::text, e.wallet_id, source_wallet.name::text,
         e.destination_wallet_id, destination_wallet.name::text,
         e.category_id, c.name::text, e.effective_at, e.timezone::text,
         e.note::text, e.merchant::text, e.source_channel::text, e.refund_of,
         coalesce(split.items, '[]'::jsonb), e.negative_balance_confirmed, e.created_at
  FROM public.finance_events e
  LEFT JOIN public.wallets source_wallet
    ON source_wallet.user_id = subject AND source_wallet.id = e.wallet_id
  LEFT JOIN public.wallets destination_wallet
    ON destination_wallet.user_id = subject AND destination_wallet.id = e.destination_wallet_id
  LEFT JOIN public.categories c
    ON c.user_id = subject AND c.id = e.category_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'categoryId', ca.category_id::text,
        'categoryName', category.name,
        'amountMinor', ca.amount_minor::text,
        'note', ca.note
      ) ORDER BY ca.category_id
    ) AS items
    FROM public.category_allocations ca
    JOIN public.categories category
      ON category.user_id = ca.user_id AND category.id = ca.category_id
    WHERE ca.user_id = subject AND ca.finance_event_id = e.id
  ) split ON true
  WHERE e.user_id = subject
    AND (p_kind IS NULL OR e.kind::text = p_kind)
    AND (p_from IS NULL OR e.effective_at >= p_from)
    AND (p_to IS NULL OR e.effective_at < p_to)
    AND (
      p_before_effective_at IS NULL OR
      (e.effective_at, e.id) < (p_before_effective_at, p_before_id)
    )
  ORDER BY e.effective_at DESC, e.id DESC
  LIMIT p_limit;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.list_finance_events(integer, timestamptz, uuid, text, timestamptz, timestamptz)
  OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_finance_events(integer, timestamptz, uuid, text, timestamptz, timestamptz)
  FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_finance_events(integer, timestamptz, uuid, text, timestamptz, timestamptz)
  TO authenticated;
--> statement-breakpoint
REVOKE CREATE ON SCHEMA public FROM venfinance_mutator;
