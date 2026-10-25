-- Tenant-scoped full-history search. Amounts remain decimal text across the
-- Neon Data API; search is exact substring matching and treats %/_ literally.
CREATE FUNCTION public.search_finance_events(
  p_search text,
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
DECLARE
  subject text := public.current_app_user_id();
  normalized_search text := lower(btrim(p_search));
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
  IF normalized_search IS NULL OR length(normalized_search) NOT BETWEEN 1 AND 80
     OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100
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
      ON category.user_id = subject AND category.id = ca.category_id
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
    AND (
      strpos(lower(coalesce(e.note, '')), normalized_search) > 0 OR
      strpos(lower(coalesce(e.merchant, '')), normalized_search) > 0 OR
      strpos(lower(e.kind::text), normalized_search) > 0 OR
      strpos(lower(e.amount_minor::text), normalized_search) > 0 OR
      strpos(lower(coalesce(source_wallet.name, '')), normalized_search) > 0 OR
      strpos(lower(coalesce(destination_wallet.name, '')), normalized_search) > 0 OR
      strpos(lower(coalesce(c.name, '')), normalized_search) > 0 OR
      EXISTS (
        SELECT 1 FROM public.category_allocations ca
        JOIN public.categories category
          ON category.user_id = subject AND category.id = ca.category_id
        WHERE ca.user_id = subject AND ca.finance_event_id = e.id
          AND strpos(lower(category.name), normalized_search) > 0
      )
    )
  ORDER BY e.effective_at DESC, e.id DESC
  LIMIT p_limit;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.search_finance_events(text, integer, timestamptz, uuid, text, timestamptz, timestamptz)
  OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.search_finance_events(text, integer, timestamptz, uuid, text, timestamptz, timestamptz)
  FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.search_finance_events(text, integer, timestamptz, uuid, text, timestamptz, timestamptz)
  TO authenticated;
