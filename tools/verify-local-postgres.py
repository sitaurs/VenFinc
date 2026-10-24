#!/usr/bin/env python3
"""Create a private throwaway PostgreSQL cluster; never accepts a remote DSN.

Usage: PG_BIN=/absolute/path/to/postgresql/18/bin python3 tools/verify-local-postgres.py
Requires official local PostgreSQL executables. No database survives this process.
"""
import concurrent.futures
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import uuid

ROOT = Path(__file__).resolve().parents[1]
BIN = Path(os.environ.get("PG_BIN", "/usr/lib/postgresql/18/bin")).resolve()
SCHEMA = ROOT / "qa/database/ledger-probe.sql"
REPORT = ROOT / "qa/local-postgres-evidence.json"
cases = []
cluster = None
started = False
environment = os.environ.copy()
# Ignore inherited connection/service settings; every connection uses our socket.
for key in list(environment):
    if key.startswith("PG"):
        environment.pop(key)
environment["PGCONNECT_TIMEOUT"] = "5"


def binary(name):
    result = BIN / name
    if not result.is_file():
        raise RuntimeError(f"Missing local PostgreSQL binary: {result}")
    return str(result)


def command(name, args, **kwargs):
    return subprocess.run([binary(name), *args], env=environment, text=True,
                          capture_output=True, timeout=45, **kwargs)


def sql(statement, user="poc_a", database="postgres", succeeds=True, state=None):
    result = command("psql", ["-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-v",
                              "VERBOSITY=verbose", "-h", str(cluster / "socket"),
                              "-U", user, "-d", database], input=statement)
    if succeeds and result.returncode != 0:
        raise AssertionError(result.stderr)
    if not succeeds and (result.returncode == 0 or (state and state not in result.stderr)):
        raise AssertionError(f"Expected SQLSTATE {state}, got {result.returncode}: {result.stderr}")
    return result.stdout.strip()


def literal(value):
    return "'" + str(value).replace("'", "''") + "'"


accounts = {name: str(uuid.UUID(int=i + 1)) for i, name in enumerate([
    "cash", "bank", "equity", "income", "expense", "liability", "other_cash", "other_equity"
])}


def post(kind, entries, key=None, user="poc_a", succeeds=True, state=None):
    payload = [{"accountId": accounts[account], "signedMinor": amount} for account, amount in entries]
    return sql("SELECT venfinance_poc.post_event(" + literal(key or uuid.uuid4()) + "::uuid,"
               + literal(kind) + "," + literal(json.dumps(payload)) + "::jsonb);",
               user=user, succeeds=succeeds, state=state)


def counts():
    return sql("SELECT (SELECT count(*) FROM venfinance_poc.finance_events)||':'||"
               "(SELECT count(*) FROM venfinance_poc.ledger_postings)||':'||"
               "(SELECT count(*) FROM venfinance_poc.command_idempotency);")


def case(name, action):
    start = time.monotonic()
    action()
    cases.append({"name": name, "status": "PASS", "durationMs": round((time.monotonic()-start)*1000)})
    print(f"PASS {name}", flush=True)


def equal(actual, expected):
    if actual != expected:
        raise AssertionError(f"Expected {expected!r}, got {actual!r}")


def rejects_without_change(kind, entries, state):
    before = counts()
    post(kind, entries, succeeds=False, state=state)
    equal(counts(), before)


try:
    version = command("postgres", ["--version"])
    if version.returncode:
        raise RuntimeError(version.stderr)
    with tempfile.TemporaryDirectory(prefix="venfinance-pg-") as temporary:
        cluster = Path(temporary)
        (cluster / "socket").mkdir(mode=0o700)
        bootstrap = os.environ.get("USER") or "zamn"
        share = Path(os.environ.get("PG_SHARE", str(BIN.parents[3] / "share/postgresql/18")))
        init = command("initdb", ["-D", str(cluster / "data"), "-L", str(share),
                                 "--no-locale", "--encoding=UTF8", "--auth-local=trust",
                                 "--auth-host=reject", "-U", bootstrap])
        if init.returncode:
            raise RuntimeError(init.stderr)
        pg = command("pg_ctl", ["-D", str(cluster / "data"), "-l", str(cluster / "server.log"),
                                "-o", f"-c listen_addresses='' -c unix_socket_directories='{cluster / 'socket'}' "
                                "-c unix_socket_permissions=0700 -c max_connections=200", "-w", "start"])
        if pg.returncode:
            raise RuntimeError(pg.stderr + (cluster / "server.log").read_text())
        started = True
        try:
            sql("CREATE ROLE poc_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;"
                "CREATE ROLE poc_a LOGIN NOSUPERUSER NOBYPASSRLS;"
                "CREATE ROLE poc_b LOGIN NOSUPERUSER NOBYPASSRLS;"
                "CREATE ROLE poc_anon LOGIN NOSUPERUSER NOBYPASSRLS;", user=bootstrap)
            schema = SCHEMA.read_text()

            def rollback_schema():
                sql("BEGIN;" + schema + "ROLLBACK;", user=bootstrap)
                equal(sql("SELECT count(*) FROM pg_namespace WHERE nspname='venfinance_poc';", user=bootstrap), "0")
            case("fresh schema transaction rollback leaves no objects", rollback_schema)
            sql(schema, user=bootstrap)
            rows = []
            for name, account in accounts.items():
                owner = "poc_b" if name.startswith("other_") else "poc_a"
                purpose = "wallet" if name in ("cash", "bank", "other_cash") else name.removeprefix("other_")
                rows.append("(" + ",".join(map(literal, [owner, account, purpose])) + ")")
            sql("INSERT INTO venfinance_poc.ledger_accounts VALUES " + ",".join(rows) + ";", user=bootstrap)
            case("runtime roles have no superuser, BYPASSRLS or executor membership", lambda: equal(sql(
                "SELECT bool_and(NOT rolsuper AND NOT rolbypassrls) AND "
                "NOT pg_has_role(current_user,'poc_executor','MEMBER') FROM pg_roles "
                "WHERE rolname IN ('poc_a','poc_b','poc_executor');"), "t"))
            case("all four tables enable and force RLS", lambda: equal(sql(
                "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace "
                "WHERE n.nspname='venfinance_poc' AND c.relkind='r' AND c.relrowsecurity AND c.relforcerowsecurity;"), "4"))
            case("tenant A cannot read tenant B account even with explicit owner filter", lambda: equal(sql(
                "SELECT count(*) FROM venfinance_poc.ledger_accounts WHERE user_id='poc_b';"), "0"))
            case("tenant B sees only its own two accounts", lambda: equal(sql(
                "SELECT count(*)||':'||min(user_id) FROM venfinance_poc.ledger_accounts;", user="poc_b"), "2:poc_b"))
            case("runtime direct event insert denied", lambda: sql(
                "INSERT INTO venfinance_poc.finance_events VALUES('poc_b',gen_random_uuid(),'income');",
                succeeds=False, state="42501"))
            case("anonymous fixture cannot read or execute posting function", lambda: (
                sql("SELECT * FROM venfinance_poc.finance_events;", user="poc_anon", succeeds=False, state="42501"),
                sql("SELECT venfinance_poc.post_event(gen_random_uuid(),'income','[]');",
                    user="poc_anon", succeeds=False, state="42501")))
            case("tenant cannot adopt the executor or another tenant identity", lambda: (
                sql("SET ROLE poc_executor;", succeeds=False, state="42501"),
                sql("SET SESSION AUTHORIZATION poc_b;", succeeds=False, state="42501")))
            case("forged claim setting cannot switch database fixture identity", lambda: equal(sql(
                "BEGIN; SET LOCAL request.jwt.claim.sub='poc_b'; SELECT count(*) FROM "
                "venfinance_poc.ledger_accounts WHERE user_id='poc_b'; COMMIT;"), "0"))
            case("table owner is still constrained by FORCE RLS", lambda: equal(sql(
                "SET ROLE poc_executor; SELECT count(*) FROM venfinance_poc.ledger_accounts; RESET ROLE;", user=bootstrap), "0"))
            case("unbalanced command writes no event, posting or idempotency claim", lambda: rejects_without_change(
                "expense", [("cash","-10"),("expense","9")], "23514"))
            case("deferred constraint rejects event without postings at commit", lambda: sql(
                "BEGIN; INSERT INTO venfinance_poc.finance_events VALUES('poc_a',gen_random_uuid(),'opening'); COMMIT;",
                user=bootstrap, succeeds=False, state="23514"))
            case("cross-tenant foreign key rolls back entire command", lambda: rejects_without_change(
                "transfer", [("cash","-10"),("other_cash","10")], "23503"))
            case("BIGINT overflow rolls back entire command", lambda: rejects_without_change(
                "income", [("cash","9223372036854775808"),("income","-9223372036854775808")], "22003"))
            case("JSON numeric amount rejected instead of rounded", lambda: rejects_without_change(
                "income", [("cash",9007199254740993),("income","-9007199254740993")], "22023"))
            case("unknown event kind rolls back idempotency and event", lambda: rejects_without_change(
                "candidate_provisional", [("cash","10"),("income","-10")], "23514"))
            case("zero and duplicate account postings rejected", lambda: (
                rejects_without_change("income", [("cash","0"),("income","0")], "22023"),
                rejects_without_change("transfer", [("cash","10"),("cash","-10")], "22023")))

            def parallel_replay():
                key = str(uuid.uuid4())
                before = int(sql("SELECT count(*) FROM venfinance_poc.finance_events;"))
                with concurrent.futures.ThreadPoolExecutor(max_workers=100) as pool:
                    results = list(pool.map(lambda _: post("opening", [("cash","9007199254740993"),
                                           ("equity","-9007199254740993")], key=key), range(100)))
                equal(len(set(results)), 1)
                equal(int(sql("SELECT count(*) FROM venfinance_poc.finance_events;")), before + 1)
                equal(sql("SELECT sum(signed_minor)::text FROM venfinance_poc.ledger_postings WHERE ledger_account_id="
                          + literal(accounts['cash']) + ";"), "9007199254740993")
                # Canonical order does not turn the same logical command into a conflict.
                equal(post("opening", [("equity","-9007199254740993"),("cash","9007199254740993")], key=key), results[0])
                snapshot = counts()
                post("opening", [("cash","10"),("equity","-10")], key=key, succeeds=False, state="23505")
                equal(counts(), snapshot)
                # A separate owner may use the same key without receiving A's event.
                other = post("opening", [("other_cash","10"),("other_equity","-10")], key=key, user="poc_b")
                if other == results[0]:
                    raise AssertionError("cross-tenant idempotency result leaked")
            case("100 concurrent retries post once, preserve exact large IDR, conflict and owner scope", parallel_replay)

            def transfer_and_principal():
                post("transfer", [("cash","-100000"),("bank","100000")])
                post("debt_opening", [("equity","300000"),("liability","-300000")])
                post("debt_payment", [("bank","-100000"),("liability","100000")])
                equal(sql("SELECT coalesce(sum(p.signed_minor),0)::text FROM venfinance_poc.ledger_postings p "
                          "JOIN venfinance_poc.ledger_accounts a ON (a.user_id,a.id)=(p.user_id,p.ledger_account_id) "
                          "WHERE a.purpose IN ('income','expense');"), "0")
                equal(sql("SELECT sum(signed_minor)::text FROM venfinance_poc.ledger_postings WHERE ledger_account_id="
                          + literal(accounts['liability']) + ";"), "-200000")
            case("transfer and debt principal affect accounts without consumption entries", transfer_and_principal)
            case("every committed event has at least two postings and zero exact sum", lambda: equal(sql(
                "SELECT count(*) FROM (SELECT finance_event_id FROM venfinance_poc.ledger_postings "
                "GROUP BY finance_event_id HAVING sum(signed_minor)<>0 OR count(*)<2) broken;"), "0"))
            case("runtime cannot update, delete, truncate ledger or invoke helper", lambda: (
                sql("UPDATE venfinance_poc.ledger_postings SET signed_minor=1;", succeeds=False, state="42501"),
                sql("DELETE FROM venfinance_poc.finance_events;", succeeds=False, state="42501"),
                sql("TRUNCATE venfinance_poc.finance_events CASCADE;", succeeds=False, state="42501"),
                sql("SELECT venfinance_poc.assert_balanced();", succeeds=False, state="42501")))

            def dump_restore():
                before = counts()
                dump = cluster / "synthetic.dump"
                result = command("pg_dump", ["-h", str(cluster / "socket"), "-U", bootstrap,
                                              "-d", "postgres", "-Fc", "-f", str(dump)])
                if result.returncode:
                    raise AssertionError(result.stderr)
                sql("CREATE DATABASE restored;", user=bootstrap)
                restored = command("pg_restore", ["--exit-on-error", "-h", str(cluster / "socket"), "-U",
                                                   bootstrap, "-d", "restored", str(dump)])
                if restored.returncode:
                    raise AssertionError(restored.stderr)
                equal(sql("SELECT (SELECT count(*) FROM venfinance_poc.finance_events)||':'||"
                          "(SELECT count(*) FROM venfinance_poc.ledger_postings)||':'||"
                          "(SELECT count(*) FROM venfinance_poc.command_idempotency);", database="restored"), before)
                equal(sql("SELECT count(*) FROM venfinance_poc.ledger_accounts WHERE user_id='poc_b';", database="restored"), "0")
                equal(sql("SELECT count(*) FROM (SELECT user_id,finance_event_id FROM venfinance_poc.ledger_postings "
                          "GROUP BY user_id,finance_event_id HAVING sum(signed_minor)<>0) b;", database="restored", user=bootstrap), "0")
            case("synthetic dump restore retains counts, balance and tenant isolation", dump_restore)
        finally:
            stop = command("pg_ctl", ["-D", str(cluster / "data"), "-m", "immediate", "-w", "stop"])
            if stop.returncode:
                raise RuntimeError("Disposable cluster could not be stopped: " + stop.stderr)
            started = False
    report = {
        "checkedAt": datetime.now(timezone.utc).isoformat(), "status": "PASS_LOCAL_POSTGRES_ONLY",
        "postgresVersion": version.stdout.strip(), "schemaSha256": hashlib.sha256(SCHEMA.read_bytes()).hexdigest(),
        "harnessSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "command": "PG_BIN=<official-local-postgres-bin> python3 tools/verify-local-postgres.py",
        "exitCode": 0,
        "passed": len(cases), "cases": cases, "concurrentReplaySubmissions": 100,
        "localSocketOnly": True, "temporaryClusterRemoved": not cluster.exists(),
        "productionReady": False, "neonAuthVerified": False, "cloudflareIdentityPropagationVerified": False,
        "productionMigration": False, "remoteResourcesAccessed": False,
        "limitations": ["Fixture PostgreSQL login roles are not Neon JWT identities.",
                        "Generic balanced-posting probe does not implement business commands, negative-balance policy, budgets, void/restore or account lifecycle.",
                        "Synthetic local dump/restore is not an encrypted production backup/restore rehearsal.",
                        "P0-005, P1-007 and P3 tasks remain blocked by their actual dependencies."]}
    REPORT.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"status": report['status'], "passed": len(cases), "evidence": str(REPORT)}))
except Exception:
    REPORT.write_text(json.dumps({"checkedAt": datetime.now(timezone.utc).isoformat(), "status": "FAILED",
                                 "completedCases": cases, "productionReady": False,
                                 "clusterRunning": started}, indent=2) + "\n")
    raise
