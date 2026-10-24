-- DISPOSABLE LOCAL PROBE ONLY. Not a production migration or Neon auth adapter.
-- session_user is a real PostgreSQL fixture login, NOT a Neon verified subject.
-- Roles are created by the local harness in a fresh, private cluster.
CREATE SCHEMA venfinance_poc AUTHORIZATION poc_executor;
REVOKE ALL ON SCHEMA venfinance_poc FROM PUBLIC;
GRANT USAGE ON SCHEMA venfinance_poc TO poc_a, poc_b;
SET ROLE poc_executor;

CREATE TABLE venfinance_poc.ledger_accounts (
  user_id text NOT NULL,
  id uuid NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('wallet','income','expense','equity','liability','receivable')),
  PRIMARY KEY (user_id,id)
);
CREATE TABLE venfinance_poc.finance_events (
  user_id text NOT NULL,
  id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('opening','income','expense','transfer','refund','debt_opening','debt_payment')),
  PRIMARY KEY (user_id,id)
);
CREATE TABLE venfinance_poc.ledger_postings (
  user_id text NOT NULL,
  finance_event_id uuid NOT NULL,
  ledger_account_id uuid NOT NULL,
  signed_minor bigint NOT NULL CHECK (signed_minor <> 0),
  PRIMARY KEY (user_id,finance_event_id,ledger_account_id),
  FOREIGN KEY (user_id,finance_event_id) REFERENCES venfinance_poc.finance_events(user_id,id),
  FOREIGN KEY (user_id,ledger_account_id) REFERENCES venfinance_poc.ledger_accounts(user_id,id)
);
CREATE TABLE venfinance_poc.command_idempotency (
  user_id text NOT NULL,
  idempotency_key uuid NOT NULL,
  canonical_request jsonb NOT NULL,
  result_ref uuid NOT NULL,
  PRIMARY KEY (user_id,idempotency_key),
  FOREIGN KEY (user_id,result_ref) REFERENCES venfinance_poc.finance_events(user_id,id)
    DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE venfinance_poc.ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE venfinance_poc.ledger_accounts FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_only ON venfinance_poc.ledger_accounts
  USING (user_id = session_user::text) WITH CHECK (user_id = session_user::text);
ALTER TABLE venfinance_poc.finance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venfinance_poc.finance_events FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_only ON venfinance_poc.finance_events
  USING (user_id = session_user::text) WITH CHECK (user_id = session_user::text);
ALTER TABLE venfinance_poc.ledger_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE venfinance_poc.ledger_postings FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_only ON venfinance_poc.ledger_postings
  USING (user_id = session_user::text) WITH CHECK (user_id = session_user::text);
ALTER TABLE venfinance_poc.command_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE venfinance_poc.command_idempotency FORCE ROW LEVEL SECURITY;
CREATE POLICY owner_only ON venfinance_poc.command_idempotency
  USING (user_id = session_user::text) WITH CHECK (user_id = session_user::text);

CREATE FUNCTION venfinance_poc.assert_balanced() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
DECLARE event_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'finance_events' THEN event_id := NEW.id;
  ELSE event_id := NEW.finance_event_id;
  END IF;
  IF (SELECT count(*) < 2 OR coalesce(sum(signed_minor),0) <> 0
      FROM venfinance_poc.ledger_postings
      WHERE user_id=NEW.user_id AND finance_event_id=event_id) THEN
    RAISE EXCEPTION 'UNBALANCED_EVENT' USING ERRCODE='23514';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER event_balance AFTER INSERT ON venfinance_poc.finance_events
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION venfinance_poc.assert_balanced();
CREATE CONSTRAINT TRIGGER posting_balance AFTER INSERT ON venfinance_poc.ledger_postings
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION venfinance_poc.assert_balanced();

CREATE FUNCTION venfinance_poc.post_event(p_key uuid, p_kind text, p_postings jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  subject text := session_user::text;
  canonical jsonb;
  original venfinance_poc.command_idempotency%ROWTYPE;
  new_id uuid := gen_random_uuid();
  inserted integer;
BEGIN
  IF subject NOT IN ('poc_a','poc_b') THEN
    RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE='42501';
  END IF;
  IF p_key IS NULL OR p_kind IS NULL OR p_postings IS NULL
    OR jsonb_typeof(p_postings) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_COMMAND' USING ERRCODE='22023';
  END IF;
  IF jsonb_array_length(p_postings) < 2 OR jsonb_array_length(p_postings) > 100 THEN
    RAISE EXCEPTION 'INVALID_POSTING_COUNT' USING ERRCODE='22023';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_postings) p
    WHERE jsonb_typeof(p)<>'object' OR NOT (p ?& ARRAY['accountId','signedMinor'])
    OR p - ARRAY['accountId','signedMinor'] <> '{}'::jsonb
    OR jsonb_typeof(p->'accountId')<>'string' OR jsonb_typeof(p->'signedMinor')<>'string'
    OR length(p->>'signedMinor') > 20
    OR (p->>'signedMinor') !~ '^-?[1-9][0-9]*$') THEN
    RAISE EXCEPTION 'INVALID_POSTING' USING ERRCODE='22023';
  END IF;
  -- Cast to BIGINT before any write; SUM(bigint) is exact NUMERIC in PostgreSQL.
  IF (SELECT sum((p->>'signedMinor')::bigint) FROM jsonb_array_elements(p_postings) p) <> 0 THEN
    RAISE EXCEPTION 'UNBALANCED_EVENT' USING ERRCODE='23514';
  END IF;
  IF (SELECT count(DISTINCT (p->>'accountId')::uuid) <> count(*)
      FROM jsonb_array_elements(p_postings) p) THEN
    RAISE EXCEPTION 'DUPLICATE_ACCOUNT' USING ERRCODE='22023';
  END IF;
  SELECT jsonb_build_object('kind',p_kind,'postings',jsonb_agg(
    jsonb_build_object('accountId',(p->>'accountId')::uuid,'signedMinor',p->>'signedMinor')
    ORDER BY (p->>'accountId')::uuid)) INTO canonical FROM jsonb_array_elements(p_postings) p;

  INSERT INTO venfinance_poc.command_idempotency VALUES(subject,p_key,canonical,new_id)
    ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted = ROW_COUNT;
  SELECT * INTO STRICT original FROM venfinance_poc.command_idempotency
    WHERE user_id=subject AND idempotency_key=p_key FOR UPDATE;
  IF original.canonical_request <> canonical THEN
    RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT' USING ERRCODE='23505';
  END IF;
  IF inserted = 0 THEN RETURN original.result_ref; END IF;
  INSERT INTO venfinance_poc.finance_events VALUES(subject,new_id,p_kind);
  INSERT INTO venfinance_poc.ledger_postings
    SELECT subject,new_id,(p->>'accountId')::uuid,(p->>'signedMinor')::bigint
    FROM jsonb_array_elements(p_postings) p;
  RETURN new_id;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA venfinance_poc FROM PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA venfinance_poc TO poc_a,poc_b;
GRANT EXECUTE ON FUNCTION venfinance_poc.post_event(uuid,text,jsonb) TO poc_a,poc_b;
RESET ROLE;
