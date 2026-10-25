-- Read-only report aggregates use the authenticated tenant from the Neon JWT.
-- Amounts cross the Data API as decimal text to preserve exact BIGINT values.
CREATE FUNCTION public.get_finance_report(p_from date, p_to date)
RETURNS TABLE (
  timezone text,
  period_from date,
  period_to date,
  income_minor text,
  gross_expense_minor text,
  refund_minor text,
  event_count integer,
  previous_income_minor text,
  previous_gross_expense_minor text,
  previous_refund_minor text,
  daily jsonb,
  categories jsonb,
  merchants jsonb
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE
  subject text := public.current_app_user_id();
  subject_timezone text;
  period_days integer;
  previous_from date;
BEGIN
  IF subject IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;
  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from THEN
    RAISE EXCEPTION 'INVALID_REPORT_RANGE' USING ERRCODE = '22023';
  END IF;
  period_days := p_to - p_from + 1;
  IF period_days > 366 THEN
    RAISE EXCEPTION 'INVALID_REPORT_RANGE' USING ERRCODE = '22023';
  END IF;
  SELECT profile.timezone INTO subject_timezone
  FROM public.user_profiles profile
  WHERE profile.user_id = subject AND profile.account_status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;
  previous_from := p_from - period_days;

  RETURN QUERY
  WITH reporting_events AS (
    SELECT event.id, event.kind::text AS kind, event.amount_minor,
      event.effective_at AT TIME ZONE subject_timezone AS local_timestamp,
      (event.effective_at AT TIME ZONE subject_timezone)::date AS local_date,
      event.user_id, event.category_id, event.merchant
    FROM public.finance_events event
    WHERE event.user_id = subject
      AND event.status = 'posted'
      AND event.kind IN ('income', 'expense', 'refund')
      AND event.reversal_of IS NULL
      AND event.effective_at >= (previous_from::timestamp AT TIME ZONE subject_timezone)
      AND event.effective_at < ((p_to + 1)::timestamp AT TIME ZONE subject_timezone)
      AND NOT EXISTS (
        SELECT 1 FROM public.finance_events reversal
        WHERE reversal.user_id = event.user_id
          AND reversal.reversal_of = event.id
          AND reversal.status = 'posted'
      )
  ),
  totals AS (
    SELECT
      coalesce(sum(amount_minor) FILTER (WHERE kind = 'income' AND local_date BETWEEN p_from AND p_to), 0)::text AS income,
      coalesce(sum(amount_minor) FILTER (WHERE kind = 'expense' AND local_date BETWEEN p_from AND p_to), 0)::text AS expense,
      coalesce(sum(amount_minor) FILTER (WHERE kind = 'refund' AND local_date BETWEEN p_from AND p_to), 0)::text AS refund,
      count(*) FILTER (WHERE local_date BETWEEN p_from AND p_to)::integer AS count,
      coalesce(sum(amount_minor) FILTER (WHERE kind = 'income' AND local_date BETWEEN previous_from AND p_from - 1), 0)::text AS previous_income,
      coalesce(sum(amount_minor) FILTER (WHERE kind = 'expense' AND local_date BETWEEN previous_from AND p_from - 1), 0)::text AS previous_expense,
      coalesce(sum(amount_minor) FILTER (WHERE kind = 'refund' AND local_date BETWEEN previous_from AND p_from - 1), 0)::text AS previous_refund
    FROM reporting_events
  ),
  daily_rows AS (
    SELECT day.value::date AS local_date,
      coalesce(sum(event.amount_minor) FILTER (WHERE event.kind = 'income'), 0)::text AS income,
      (coalesce(sum(event.amount_minor) FILTER (WHERE event.kind = 'expense'), 0)
       - coalesce(sum(event.amount_minor) FILTER (WHERE event.kind = 'refund'), 0))::text AS expense
    FROM generate_series(p_from::timestamp, p_to::timestamp, interval '1 day') AS day(value)
    LEFT JOIN reporting_events event
      ON event.local_date = day.value::date
      AND event.local_date BETWEEN p_from AND p_to
    GROUP BY day.value
  ),
  category_lines AS (
    SELECT event.id, event.kind,
      coalesce(allocation.category_id, event.category_id) AS category_id,
      coalesce(category.name, 'Tanpa kategori')::text AS category_name,
      CASE WHEN allocation.id IS NULL THEN event.amount_minor ELSE allocation.amount_minor END AS amount_minor
    FROM reporting_events event
    LEFT JOIN public.category_allocations allocation
      ON allocation.user_id = event.user_id AND allocation.finance_event_id = event.id
    LEFT JOIN public.categories category
      ON category.user_id = event.user_id AND category.id = coalesce(allocation.category_id, event.category_id)
    WHERE event.kind IN ('expense', 'refund')
      AND event.local_date BETWEEN p_from AND p_to
  ),
  category_totals AS (
    SELECT category_id, category_name,
      sum(CASE WHEN kind = 'refund' THEN -amount_minor ELSE amount_minor END)::text AS amount_minor,
      count(DISTINCT id)::integer AS event_count
    FROM category_lines
    GROUP BY category_id, category_name
  ),
  merchant_totals AS (
    SELECT coalesce(nullif(btrim(event.merchant), ''), 'Tanpa merchant') AS merchant,
      sum(CASE WHEN event.kind = 'refund' THEN -event.amount_minor ELSE event.amount_minor END)::text AS amount_minor,
      count(DISTINCT event.id)::integer AS event_count
    FROM reporting_events event
    WHERE event.kind IN ('expense', 'refund')
      AND event.local_date BETWEEN p_from AND p_to
    GROUP BY coalesce(nullif(btrim(event.merchant), ''), 'Tanpa merchant')
  ),
  daily_json AS (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'localDate', local_date::text,
      'incomeMinor', income,
      'expenseMinor', expense
    ) ORDER BY local_date), '[]'::jsonb) AS value FROM daily_rows
  ),
  categories_json AS (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'categoryId', category_id,
      'categoryName', category_name,
      'amountMinor', amount_minor,
      'eventCount', event_count
    ) ORDER BY abs(amount_minor::numeric) DESC, category_name), '[]'::jsonb) AS value
    FROM (SELECT * FROM category_totals ORDER BY abs(amount_minor::numeric) DESC, category_name LIMIT 100) limited
  ),
  merchants_json AS (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'merchant', merchant,
      'amountMinor', amount_minor,
      'eventCount', event_count
    ) ORDER BY abs(amount_minor::numeric) DESC, merchant), '[]'::jsonb) AS value
    FROM (SELECT * FROM merchant_totals ORDER BY abs(amount_minor::numeric) DESC, merchant LIMIT 100) limited
  )
  SELECT subject_timezone, p_from, p_to,
    totals.income, totals.expense, totals.refund, totals.count,
    totals.previous_income, totals.previous_expense, totals.previous_refund,
    daily_json.value, categories_json.value, merchants_json.value
  FROM totals, daily_json, categories_json, merchants_json;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.get_finance_report(date, date) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_finance_report(date, date) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_finance_report(date, date) TO authenticated;
