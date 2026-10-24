#!/usr/bin/env python3
"""Run migrations and finance-ledger contracts in a disposable local PostgreSQL cluster."""
from __future__ import annotations

import os
import pathlib
import shutil
import socket
import subprocess
import tempfile
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "packages/db/migrations"


def run(
    command: list[str],
    *,
    env: dict[str, str],
    capture: bool = False,
    input_value: str | None = None,
) -> str:
    completed = subprocess.run(
        command,
        check=True,
        env=env,
        text=True,
        input=input_value,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
    )
    return completed.stdout if capture else ""


def main() -> int:
    bin_dir_value = os.environ.get("VENFINANCE_PG_BIN")
    if bin_dir_value:
        bin_dir = pathlib.Path(bin_dir_value)
    else:
        pg_config = shutil.which("pg_config")
        if not pg_config:
            print("Set VENFINANCE_PG_BIN or install PostgreSQL server tools.", file=sys.stderr)
            return 2
        bin_dir = pathlib.Path(subprocess.check_output([pg_config, "--bindir"], text=True).strip())
    initdb, pg_ctl, psql = (bin_dir / name for name in ("initdb", "pg_ctl", "psql"))
    if not all(path.is_file() for path in (initdb, pg_ctl, psql)):
        print(f"PostgreSQL binaries not found in {bin_dir}", file=sys.stderr)
        return 2

    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    temp_root = pathlib.Path(tempfile.mkdtemp(prefix="venfinance-pg-test-"))
    data_dir, socket_dir = temp_root / "data", temp_root / "socket"
    data_dir.mkdir()
    socket_dir.mkdir()
    log_path = temp_root / "postgres.log"
    env = os.environ.copy()
    env.setdefault("LC_ALL", "C")
    try:
        run([str(initdb), "-D", str(data_dir), "--no-locale", "--encoding=UTF8", "--auth-local=trust", "--auth-host=reject"], env=env)
        run(
            [str(pg_ctl), "-D", str(data_dir), "-l", str(log_path), "-o", f"-k {socket_dir} -p {port} -c listen_addresses=''", "-w", "start"],
            env=env,
        )
        psql_base = [str(psql), "-X", "-v", "ON_ERROR_STOP=1", "-h", str(socket_dir), "-p", str(port), "-U", os.environ.get("USER", "postgres"), "-d", "postgres"]
        database_user = os.environ.get("USER", "postgres")
        run(psql_base + ["-c", f"CREATE ROLE authenticated NOLOGIN; CREATE ROLE anonymous NOLOGIN; CREATE ROLE neondb_owner NOLOGIN CREATEROLE CREATEDB NOBYPASSRLS; GRANT authenticated TO \"{database_user}\"; GRANT neondb_owner TO \"{database_user}\"; ALTER DATABASE postgres OWNER TO neondb_owner;"], env=env)
        for migration in sorted(MIGRATIONS.glob("*.sql")):
            if migration.name == "0002_rls_ledger_functions.sql":
                # Migration breakpoints split statements that psql can apply sequentially.
                contents = migration.read_text().replace("--> statement-breakpoint", "")
                temp_migration = temp_root / migration.name
                temp_migration.write_text(contents)
                migration = temp_migration
            print(f"APPLY {migration.name}", flush=True)
            run(psql_base + ["-c", "SET ROLE neondb_owner", "-f", str(migration)], env=env)
        print("RUN qa/database/ledger-contract.sql", flush=True)
        run(psql_base + ["-f", str(ROOT / "qa/database/ledger-contract.sql")], env=env)
        print("RUN concurrent same-key and wallet-balance commands", flush=True)
        setup = """
BEGIN;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{\"role\":\"authenticated\",\"sub\":\"qa-user-c\"}', true);
INSERT INTO public.user_profiles (user_id, display_name) VALUES ('qa-user-c', 'QA C');
INSERT INTO public.wallets (user_id, name, type) VALUES ('qa-user-c', 'Concurrent cash', 'cash');
DO $$ DECLARE wallet_id uuid; posted record; BEGIN
  SELECT id INTO STRICT wallet_id FROM public.wallets WHERE user_id='qa-user-c' AND name='Concurrent cash';
  SELECT * INTO STRICT posted FROM public.post_finance_event(
    'opening', wallet_id, NULL, '10000', 'IDR', '2026-10-24T00:00:00Z', 'Asia/Jakarta',
    '40000000-0000-4000-8000-000000000001', '[]', NULL, NULL, NULL, NULL, false, NULL
  );
END $$;
COMMIT;
"""
        run(psql_base + ["-f", "-"], env=env, input_value=setup)

        def concurrent_command(kind: str, amount: str, idempotency_key: str) -> str:
            command_sql = f"""
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{{\"role\":\"authenticated\",\"sub\":\"qa-user-c\"}}', false);
DO $$ DECLARE wallet_id uuid; posted record; BEGIN
  SELECT id INTO STRICT wallet_id FROM public.wallets WHERE user_id='qa-user-c' AND name='Concurrent cash';
  SELECT * INTO STRICT posted FROM public.post_finance_event(
    '{kind}', wallet_id, NULL, '{amount}', 'IDR', '2026-10-24T01:00:00Z', 'Asia/Jakarta',
    '{idempotency_key}', '[]', NULL, NULL, NULL, NULL, false, NULL
  );
  RAISE NOTICE 'OUTCOME=POSTED:%', posted.event_id;
EXCEPTION WHEN check_violation THEN
  IF SQLERRM LIKE '%NEGATIVE_BALANCE_CONFIRMATION_REQUIRED%' THEN
    RAISE NOTICE 'OUTCOME=NEGATIVE_BLOCKED';
  ELSE
    RAISE;
  END IF;
END $$;
"""
            return run(psql_base + ["-q", "-A", "-t", "-c", command_sql], env=env, capture=True)

        with ThreadPoolExecutor(max_workers=2) as executor:
            same_key = list(executor.map(
                lambda _: concurrent_command("income", "1000", "40000000-0000-4000-8000-000000000002"),
                range(2),
            ))
        posted_ids = []
        for output in same_key:
            posted_ids.extend(
                line.rsplit(":", 1)[-1].strip()
                for line in output.splitlines()
                if "OUTCOME=POSTED:" in line
            )
        if len(posted_ids) != 2 or len(set(posted_ids)) != 1:
            raise RuntimeError(f"same-key concurrency did not replay one event: {same_key}")

        with ThreadPoolExecutor(max_workers=2) as executor:
            balances = list(executor.map(
                lambda key: concurrent_command("expense", "7000", key),
                [
                    "40000000-0000-4000-8000-000000000003",
                    "40000000-0000-4000-8000-000000000004",
                ],
            ))
        outcomes = "\n".join(balances)
        if outcomes.count("OUTCOME=POSTED:") != 1 or outcomes.count("OUTCOME=NEGATIVE_BLOCKED") != 1:
            raise RuntimeError(f"concurrent withdrawals were not serialized: {balances}")
        verify_concurrency = """
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{\"role\":\"authenticated\",\"sub\":\"qa-user-c\"}', false);
DO $$ DECLARE event_count bigint; balance_value bigint; BEGIN
  SELECT count(*) INTO event_count FROM public.finance_events
  WHERE user_id='qa-user-c' AND client_mutation_id='40000000-0000-4000-8000-000000000002';
  IF event_count <> 1 THEN RAISE EXCEPTION 'same idempotency key created % events', event_count; END IF;
  SELECT coalesce(sum(p.signed_minor),0) INTO balance_value
  FROM public.ledger_postings p JOIN public.ledger_accounts a
    ON a.user_id=p.user_id AND a.id=p.ledger_account_id
  WHERE p.user_id='qa-user-c' AND a.wallet_id=(
    SELECT id FROM public.wallets WHERE user_id='qa-user-c' AND name='Concurrent cash'
  );
  IF balance_value <> 4000 THEN RAISE EXCEPTION 'serialized balance expected 4000, found %', balance_value; END IF;
END $$;
"""
        run(psql_base + ["-q", "-f", "-"], env=env, input_value=verify_concurrency)
        print("PASS local PostgreSQL migrations and ledger contracts", flush=True)
        print("PASS concurrent identical replay creates one event; overdraft race posts once", flush=True)
        return 0
    finally:
        subprocess.run([str(pg_ctl), "-D", str(data_dir), "-m", "immediate", "-w", "stop"], env=env, text=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        shutil.rmtree(temp_root, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
