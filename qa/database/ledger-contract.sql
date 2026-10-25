-- Local PostgreSQL contract test. This simulates gateway-verified JWT claims;
-- it does not prove that Neon Data API authenticates or sets those claims.
\set ON_ERROR_STOP on

-- User A owns one household. Inserted ledger data must be visible to A only.
BEGIN;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","sub":"qa-user-a"}', true);
INSERT INTO public.user_profiles (user_id, display_name) VALUES ('qa-user-a', 'QA A');
INSERT INTO public.wallets (user_id, name, type, currency) VALUES
  ('qa-user-a', 'Cash', 'cash', 'IDR'),
  ('qa-user-a', 'Bank', 'bank', 'IDR');
INSERT INTO public.categories (user_id, name) VALUES ('qa-user-a', 'Makan'), ('qa-user-a', 'Cicilan')
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  posted record;
  replayed record;
  large_balance text;
  event_count bigint;
  source_expense_id uuid;
  cash_wallet_id uuid;
  bank_wallet_id uuid;
  makan_category_id uuid;
BEGIN
  IF public.current_platform_role() <> 'user' THEN
    RAISE EXCEPTION 'new profile did not receive the default user role';
  END IF;
  SELECT id INTO STRICT cash_wallet_id FROM public.wallets WHERE user_id = 'qa-user-a' AND name = 'Cash';
  SELECT id INTO STRICT bank_wallet_id FROM public.wallets WHERE user_id = 'qa-user-a' AND name = 'Bank';
  SELECT id INTO STRICT makan_category_id FROM public.categories WHERE user_id = 'qa-user-a' AND name = 'Makan';
  SELECT * INTO STRICT posted FROM public.post_finance_event(
    'opening', cash_wallet_id, NULL, '100000', 'IDR',
    '2026-10-24T00:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000001',
    '[]', NULL, NULL, NULL, NULL, false, NULL
  );
  SELECT * INTO STRICT replayed FROM public.post_finance_event(
    'opening', cash_wallet_id, NULL, '100000', 'IDR',
    '2026-10-24T00:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000001',
    '[]', NULL, NULL, NULL, NULL, false, NULL
  );
  IF posted.event_id <> replayed.event_id THEN RAISE EXCEPTION 'idempotent replay changed event'; END IF;
  SELECT * INTO STRICT posted FROM public.post_finance_event(
    'expense', cash_wallet_id, NULL, '20000', 'IDR',
    '2026-10-24T01:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000002',
    jsonb_build_array(jsonb_build_object('categoryId', makan_category_id::text, 'amountMinor', '20000')),
    'Lunch', 'Warung', NULL, NULL, false, NULL
  );
  SELECT * INTO STRICT posted FROM public.post_finance_event(
    'transfer', cash_wallet_id, bank_wallet_id, '50000', 'IDR',
    '2026-10-24T02:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000003',
    '[]', NULL, NULL, NULL, NULL, false, NULL
  );
  IF (SELECT coalesce(sum(p.signed_minor), 0) FROM public.ledger_postings p
      JOIN public.ledger_accounts a ON a.user_id = p.user_id AND a.id = p.ledger_account_id
      WHERE p.user_id = 'qa-user-a' AND a.purpose = 'wallet') <> 80000
  THEN RAISE EXCEPTION 'transfer changed total wallet balance'; END IF;
  IF (SELECT coalesce(sum(e.amount_minor), 0) FROM public.finance_events e
      WHERE e.user_id = 'qa-user-a' AND e.kind = 'expense') <> 20000
  THEN RAISE EXCEPTION 'transfer was counted as an expense'; END IF;
  SELECT count(*) INTO event_count FROM public.search_finance_events(
    'lunch', 100, NULL, NULL, NULL, NULL, NULL
  );
  IF event_count <> 1 THEN RAISE EXCEPTION 'case-insensitive owner history search expected 1 row, found %', event_count; END IF;
  SELECT count(*) INTO event_count FROM public.search_finance_events(
    'Cash', 100, NULL, NULL, 'expense', NULL, NULL
  );
  IF event_count <> 3 THEN RAISE EXCEPTION 'combined wallet/kind search expected 3 rows, found %', event_count; END IF;
  SELECT count(*) INTO event_count FROM public.search_finance_events(
    'Warung', 100, NULL, NULL, 'income', NULL, NULL
  );
  IF event_count <> 0 THEN RAISE EXCEPTION 'search ignored the combined kind filter'; END IF;

  SELECT * INTO STRICT posted FROM public.post_finance_event(
    'expense', cash_wallet_id, NULL, '5000', 'IDR',
    '2026-10-24T03:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000004',
    jsonb_build_array(jsonb_build_object('categoryId', makan_category_id::text, 'amountMinor', '5000')),
    NULL, NULL, NULL, NULL, false, NULL
  );
  source_expense_id := posted.event_id;
  SELECT * INTO STRICT posted FROM public.post_finance_event(
    'refund', bank_wallet_id, NULL, '2000', 'IDR',
    '2026-10-24T04:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000005',
    jsonb_build_array(jsonb_build_object('categoryId', makan_category_id::text, 'amountMinor', '2000')),
    NULL, NULL, NULL, source_expense_id, false, NULL
  );
END $$;

-- Exact IDR integers beyond IEEE-754's exact range remain exact in PostgreSQL.
INSERT INTO public.wallets (user_id, name, type, currency) VALUES ('qa-user-a', 'Reserve', 'savings', 'IDR');
DO $$
DECLARE posted record; balance_value text; reserve_wallet_id uuid;
BEGIN
  SELECT id INTO STRICT reserve_wallet_id FROM public.wallets WHERE user_id = 'qa-user-a' AND name = 'Reserve';
  SELECT * INTO STRICT posted FROM public.post_finance_event(
    'opening', reserve_wallet_id, NULL, '9007199254740993', 'IDR',
    '2026-10-24T05:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000006',
    '[]', NULL, NULL, NULL, NULL, false, NULL
  );
  SELECT coalesce(sum(p.signed_minor), 0)::text INTO balance_value
  FROM public.ledger_postings p JOIN public.ledger_accounts a
    ON a.user_id = p.user_id AND a.id = p.ledger_account_id
  WHERE p.user_id = 'qa-user-a' AND a.wallet_id = reserve_wallet_id;
  IF balance_value <> '9007199254740993' THEN RAISE EXCEPTION 'BIGINT precision lost: %', balance_value; END IF;
END $$;

-- Negative balances require a separate affirmative command flag and are recorded.
DO $$
DECLARE posted record; cash_wallet_id uuid; wallet_balance text; exact_amount_count bigint;
BEGIN
  SELECT id INTO STRICT cash_wallet_id FROM public.wallets WHERE user_id = 'qa-user-a' AND name = 'Cash';
  BEGIN
    PERFORM * FROM public.post_finance_event(
      'expense', cash_wallet_id, NULL, '40000', 'IDR',
      '2026-10-24T06:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000007',
      '[]', NULL, NULL, NULL, NULL, false, NULL
    );
    RAISE EXCEPTION 'negative balance accepted without confirmation';
  EXCEPTION WHEN check_violation THEN
    IF SQLERRM NOT LIKE '%NEGATIVE_BALANCE_CONFIRMATION_REQUIRED%' THEN RAISE; END IF;
  END;
  SELECT * INTO STRICT posted FROM public.post_finance_event(
    'expense', cash_wallet_id, NULL, '40000', 'IDR',
    '2026-10-24T06:00:00Z', 'Asia/Jakarta', '30000000-0000-4000-8000-000000000008',
    '[]', NULL, NULL, NULL, NULL, true, NULL
  );
  IF NOT posted.negative_balance_confirmed THEN RAISE EXCEPTION 'confirmed negative balance not recorded'; END IF;
  SELECT balance_minor INTO STRICT wallet_balance FROM public.list_wallets() WHERE name='Cash';
  IF wallet_balance <> '-15000' THEN RAISE EXCEPTION 'wallet read model expected -15000, found %', wallet_balance; END IF;
  SELECT count(*) INTO exact_amount_count FROM public.list_finance_events(100, NULL, NULL, NULL, NULL, NULL)
  WHERE amount_minor='9007199254740993';
  IF exact_amount_count <> 1 THEN RAISE EXCEPTION 'exact BIGINT transaction missing from read model'; END IF;
END $$;

COMMIT;
RESET ROLE;

-- Opening balances and payments are balanced ledger events; principal and
-- interest/fees remain separate, and a retry cannot post either twice.
BEGIN;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","sub":"qa-user-a"}', true);
DO $$
DECLARE
  cash_wallet_id uuid;
  makan_category_id uuid;
  installment_category_id uuid;
  created record;
  replayed record;
  payment record;
  payment_replay record;
  bank_before numeric;
  bank_after numeric;
  remaining text;
  category_budget_used text;
  global_budget_used text;
  event_total numeric;
  event_count bigint;
BEGIN
  SELECT id INTO STRICT cash_wallet_id FROM public.wallets WHERE user_id='qa-user-a' AND name='Bank';
  SELECT id INTO STRICT makan_category_id FROM public.categories WHERE user_id='qa-user-a' AND name='Makan';
  SELECT id INTO STRICT installment_category_id FROM public.categories WHERE user_id='qa-user-a' AND name='Cicilan';
  SELECT coalesce(sum(p.signed_minor),0) INTO bank_before
  FROM public.ledger_postings p JOIN public.ledger_accounts a ON a.user_id=p.user_id AND a.id=p.ledger_account_id
  WHERE p.user_id='qa-user-a' AND a.wallet_id=cash_wallet_id;
  SELECT * INTO STRICT created FROM public.create_debt(
    '50000000-0000-4000-8000-000000000001','owed_by_user','opening','Teman','30000',
    '2026-10-24',NULL,'10000',NULL,false,'Asia/Jakarta','Saldo yang sudah ada',NULL
  );
  SELECT * INTO STRICT replayed FROM public.create_debt(
    '50000000-0000-4000-8000-000000000001','owed_by_user','opening','Teman','30000',
    '2026-10-24',NULL,'10000',NULL,false,'Asia/Jakarta','Saldo yang sudah ada',NULL
  );
  IF created.debt_id <> replayed.debt_id OR created.opening_event_id <> replayed.opening_event_id THEN
    RAISE EXCEPTION 'debt opening retry created a duplicate';
  END IF;
  SELECT * INTO STRICT payment FROM public.record_debt_payment(
    created.debt_id,cash_wallet_id,'10000','1500',false,'2026-10-25T02:00:00Z','Asia/Jakarta',
    installment_category_id,makan_category_id,'50000000-0000-4000-8000-000000000002','Cicilan pertama',NULL
  );
  SELECT * INTO STRICT payment_replay FROM public.record_debt_payment(
    created.debt_id,cash_wallet_id,'10000','1500',false,'2026-10-25T02:00:00Z','Asia/Jakarta',
    installment_category_id,makan_category_id,'50000000-0000-4000-8000-000000000002','Cicilan pertama',NULL
  );
  IF payment.payment_id <> payment_replay.payment_id OR payment.event_id <> payment_replay.event_id
     OR payment.fee_event_id <> payment_replay.fee_event_id THEN
    RAISE EXCEPTION 'debt payment retry changed the result';
  END IF;
  SELECT remaining_minor INTO STRICT remaining FROM public.list_debts() WHERE debt_id=created.debt_id;
  IF remaining <> '20000' THEN RAISE EXCEPTION 'debt principal expected 20000 remaining, got %',remaining; END IF;
  SELECT coalesce(sum(p.signed_minor),0) INTO bank_after
  FROM public.ledger_postings p JOIN public.ledger_accounts a ON a.user_id=p.user_id AND a.id=p.ledger_account_id
  WHERE p.user_id='qa-user-a' AND a.wallet_id=cash_wallet_id;
  IF bank_before-bank_after <> 11500 THEN RAISE EXCEPTION 'wallet did not decrease by principal plus fee'; END IF;
  SELECT coalesce(sum(e.amount_minor),0),count(*) INTO event_total,event_count
  FROM public.finance_events e WHERE e.user_id='qa-user-a' AND e.id=payment.fee_event_id AND e.kind='expense';
  IF event_total <> 1500 OR event_count <> 1 THEN RAISE EXCEPTION 'fee was not a separate single expense'; END IF;
  SELECT count(*) INTO event_count FROM public.finance_events e
  WHERE e.user_id='qa-user-a' AND e.kind='debt_payment' AND e.id=payment.event_id;
  IF event_count <> 1 THEN RAISE EXCEPTION 'principal was not represented by one debt_payment event'; END IF;
  SELECT count(*) INTO event_count FROM public.debt_payments dp
  WHERE dp.user_id='qa-user-a' AND dp.debt_id=created.debt_id;
  IF event_count <> 1 THEN RAISE EXCEPTION 'payment retry inserted a duplicate debt payment'; END IF;
  PERFORM 1 FROM public.create_budget(
    '60000000-0000-4000-8000-000000000001','Cicilan','category',installment_category_id,'monthly',
    'Asia/Jakarta','2026-10-01','2026-10-31','100000',false,ARRAY[50,100]::smallint[]
  );
  PERFORM 1 FROM public.create_budget(
    '60000000-0000-4000-8000-000000000002','Konsumsi','global',NULL,'monthly',
    'Asia/Jakarta','2026-10-01','2026-10-31','100000',false,ARRAY[50,100]::smallint[]
  );
  SELECT used_minor INTO STRICT category_budget_used FROM public.list_budgets('2026-10-01','2026-10-31')
    WHERE kind='category' AND category_id=installment_category_id;
  IF category_budget_used <> '10000' THEN RAISE EXCEPTION 'debt principal did not reduce the installment envelope'; END IF;
  SELECT used_minor INTO STRICT global_budget_used FROM public.list_budgets('2026-10-01','2026-10-31') WHERE kind='global';
  IF global_budget_used <> '21500' THEN RAISE EXCEPTION 'principal was incorrectly counted as consumption spending'; END IF;
  BEGIN
    PERFORM * FROM public.create_debt(
      '50000000-0000-4000-8000-000000000003','owed_to_user','loan','Teman','100000',
      '2026-10-25',NULL,NULL,cash_wallet_id,false,'Asia/Jakarta','Pinjaman diberikan',NULL
    );
    RAISE EXCEPTION 'loan disbursement without negative-balance consent was accepted';
  EXCEPTION WHEN check_violation THEN
    IF SQLERRM NOT LIKE '%NEGATIVE_BALANCE_CONFIRMATION_REQUIRED%' THEN RAISE; END IF;
  END;
  PERFORM * FROM public.create_debt(
    '50000000-0000-4000-8000-000000000004','owed_to_user','loan','Teman','100000',
    '2026-10-25',NULL,NULL,cash_wallet_id,true,'Asia/Jakarta','Pinjaman diberikan',NULL
  );
  SELECT count(*) INTO event_count FROM public.finance_events e
    WHERE e.user_id='qa-user-a' AND e.kind='loan_disbursement' AND e.negative_balance_confirmed;
  IF event_count <> 1 THEN RAISE EXCEPTION 'confirmed loan disbursement did not retain its negative-balance flag'; END IF;
END $$;
COMMIT;
RESET ROLE;

-- Tenant B cannot read or mutate A's resources, even with known identifiers.
BEGIN;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","sub":"qa-user-b"}', true);
INSERT INTO public.user_profiles (user_id, display_name) VALUES ('qa-user-b', 'QA B');
DO $$
DECLARE visible_count bigint;
BEGIN
  SELECT count(*) INTO visible_count FROM public.wallets
  WHERE name = 'Cash' AND user_id = 'qa-user-a';
  IF visible_count <> 0 THEN RAISE EXCEPTION 'cross-tenant wallet visible'; END IF;
  SELECT count(*) INTO visible_count FROM public.finance_events WHERE user_id = 'qa-user-a';
  IF visible_count <> 0 THEN RAISE EXCEPTION 'cross-tenant finance event visible'; END IF;
  IF (SELECT count(*) FROM public.list_wallets()) <> 0 THEN RAISE EXCEPTION 'wallet read model crossed tenant'; END IF;
  IF (SELECT count(*) FROM public.list_finance_events(100, NULL, NULL, NULL, NULL, NULL)) <> 0
  THEN RAISE EXCEPTION 'transaction read model crossed tenant'; END IF;
  IF (SELECT count(*) FROM public.search_finance_events('Lunch', 100, NULL, NULL, NULL, NULL, NULL)) <> 0
  THEN RAISE EXCEPTION 'transaction search crossed tenant'; END IF;
  IF (SELECT count(*) FROM public.list_debts()) <> 0
  THEN RAISE EXCEPTION 'debt read model crossed tenant'; END IF;
  BEGIN
    INSERT INTO public.wallets (user_id, name, type) VALUES ('qa-user-a', 'Injected', 'cash');
    RAISE EXCEPTION 'cross-tenant wallet insert accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.finance_events (
      user_id, kind, amount_minor, wallet_id, effective_at, timezone
    ) VALUES (
      'qa-user-b', 'expense', 1, gen_random_uuid(), now(), 'Asia/Jakarta'
    );
    RAISE EXCEPTION 'direct finance-event insert accepted';
  EXCEPTION WHEN insufficient_privilege OR foreign_key_violation THEN NULL;
  END;
END $$;
COMMIT;
RESET ROLE;

-- Role grants are not directly writable by the authenticated app role, and
-- the non-login mutator can only insert the trigger's default `user` role.
BEGIN;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","sub":"qa-user-a"}', true);
DO $$
BEGIN
  IF has_schema_privilege('authenticated', 'platform', 'USAGE') THEN
    RAISE EXCEPTION 'authenticated role can access the platform schema';
  END IF;
  IF has_table_privilege('authenticated', 'platform.roles', 'INSERT') THEN
    RAISE EXCEPTION 'authenticated role can insert its own role';
  END IF;
END $$;
RESET ROLE;
SET ROLE neondb_owner;
SET ROLE venfinance_mutator;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","sub":"qa-user-a"}', true);
DO $$
BEGIN
  BEGIN
    INSERT INTO platform.roles (user_id, role, assigned_by)
    VALUES ('qa-user-a', 'admin', 'qa-user-a');
    RAISE EXCEPTION 'mutator accepted self-assigned admin role';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
ROLLBACK;
RESET ROLE;

-- Anonymous/malformed claims never resolve a tenant identity.
BEGIN;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"role":"anonymous","sub":"qa-user-a"}', true);
DO $$
BEGIN
  IF public.current_app_user_id() IS NOT NULL THEN RAISE EXCEPTION 'anonymous claims resolved a user'; END IF;
  IF (SELECT count(*) FROM public.user_profiles) <> 0 THEN RAISE EXCEPTION 'anonymous claims read profiles'; END IF;
  BEGIN
    PERFORM * FROM public.list_wallets();
    RAISE EXCEPTION 'anonymous wallet read model accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.post_finance_event(
      'income', gen_random_uuid(), NULL, '100', 'IDR',
      now(), 'Asia/Jakarta', '30000000-0000-4000-8000-000000000009',
      '[]', NULL, NULL, NULL, NULL, false, NULL
    );
    RAISE EXCEPTION 'anonymous finance post accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
COMMIT;
RESET ROLE;

SELECT 'LOCAL_LEDGER_CONTRACT_PASS' AS result;
