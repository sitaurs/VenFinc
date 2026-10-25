import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium, request } from "@playwright/test";

const origin = "http://127.0.0.1:5173";
const envPath = fileURLToPath(new URL("./.env.local", import.meta.url));
const safe = {
  workerHealth: false,
  anonymousDenied: false,
  bearerOnlyDenied: false,
  signInA: false,
  signInB: false,
  authJwtHidden: false,
  sessionCookieHttpOnly: false,
  browserUsesSameOriginOnly: false,
  forgedOwnerDenied: false,
  aSeesOwn: false,
  bCannotSeeA: false,
  bSeesOwn: false,
  aCannotSeeB: false,
  signOutA: false,
  sessionRevocationEnforced: false,
  sessionReplayStatus: null,
  workerResponses: {},
  failureStage: null,
};

let stage = "environment";
let browser;
let contextA;
let contextB;
let replayContext;
let pageA;
let pageB;
let externalBrowserRequests = 0;

function parseEnv(source) {
  const values = new Map();
  for (const line of source.split(/\r?\n/u)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/u);
    if (!match) continue;
    let value = match[2] ?? "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/u, "").trim();
    }
    values.set(match[1], value);
  }
  return values;
}

function rows(body) {
  return body && typeof body === "object" && Array.isArray(body.rows)
    ? body.rows
    : [];
}

function summarize(response) {
  return {
    status: response.status,
    error: typeof response.body?.error === "string" ? response.body.error : null,
    sessionStatus:
      typeof response.body?.sessionStatus === "string"
        ? response.body.sessionStatus
        : null,
    markers: rows(response.body).map((row) => row.marker),
    insertedMarkers: Array.isArray(response.body?.inserted)
      ? response.body.inserted.map((row) => row.marker)
      : [],
  };
}

async function openClient() {
  const context = await browser.newContext();
  context.setDefaultTimeout(15_000);
  const page = await context.newPage();
  page.on("request", (requestEvent) => {
    if (new URL(requestEvent.url()).origin !== origin) {
      externalBrowserRequests += 1;
    }
  });
  page.on("pageerror", () => {
    safe.pageErrors = (safe.pageErrors ?? 0) + 1;
  });
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.p0NeonAuth !== undefined);
  return { context, page };
}

async function evaluate(page, operation, ...args) {
  return page.evaluate(
    ({ operationName, operationArgs }) =>
      window.p0NeonAuth[operationName](...operationArgs),
    { operationName: operation, operationArgs: args },
  );
}

try {
  const source = await readFile(envPath, "utf8");
  const env = parseEnv(source);
  const userA = {
    email: env.get("P0_TEST_USER_A_EMAIL"),
    password: env.get("P0_TEST_USER_A_PASSWORD"),
  };
  const userB = {
    email: env.get("P0_TEST_USER_B_EMAIL"),
    password: env.get("P0_TEST_USER_B_PASSWORD"),
  };
  if (
    !userA.email ||
    !userA.password ||
    !userB.email ||
    !userB.password ||
    userA.email === userB.email
  ) {
    throw new Error("TEST_ACCOUNTS_NOT_CONFIGURED");
  }

  browser = await chromium.launch({
    headless: true,
    executablePath: "/opt/google/chrome/chrome",
    args: ["--no-sandbox"],
  });

  stage = "client-A";
  ({ context: contextA, page: pageA } = await openClient());

  stage = "health";
  const health = await evaluate(pageA, "health");
  safe.workerHealth = health.status === 200;

  stage = "anonymous";
  const anonymous = await evaluate(pageA, "anonymous");
  safe.anonymousDenied = anonymous.status === 401;

  stage = "bearer-only";
  const bearerOnly = await evaluate(pageA, "bearerOnly");
  safe.bearerOnlyDenied = bearerOnly.status === 401;

  stage = "sign-in-A";
  const authA = await evaluate(pageA, "signIn", userA.email, userA.password);
  safe.signInA = authA.status === 200;
  safe.authJwtHidden = authA.authJwtHeaderExposed === false;
  if (!safe.signInA) throw new Error("SIGN_IN_A_FAILED");

  stage = "cookie-A";
  const sessionCookie = (await contextA.cookies(origin)).find((cookie) =>
    cookie.name.endsWith("neonauth.session_token"),
  );
  safe.sessionCookieHttpOnly = sessionCookie?.httpOnly === true;
  if (!sessionCookie) throw new Error("SESSION_COOKIE_MISSING");
  const staleCookieHeader = `${sessionCookie.name}=${sessionCookie.value}`;

  const runId = crypto.randomUUID().replaceAll("-", "");
  const markerA = `qa_a_${runId}`;
  const markerB = `qa_b_${runId}`;

  stage = "create-A";
  const createA = await evaluate(pageA, "createRow", markerA);
  safe.workerResponses.createA = summarize(createA);
  safe.aSeesOwn =
    createA.status === 201 &&
    createA.body?.sessionStatus === "active-cookie" &&
    createA.body?.inserted?.some((row) => row.marker === markerA) === true;

  stage = "list-A";
  const listA = await evaluate(pageA, "list");
  safe.workerResponses.listA = summarize(listA);
  safe.aSeesOwn &&=
    listA.status === 200 &&
    listA.body?.sessionStatus === "active-cookie" &&
    rows(listA.body).some((row) => row.marker === markerA);

  stage = "forged-owner";
  const forgedOwner = await evaluate(pageA, "forgedOwner");
  safe.forgedOwnerDenied = forgedOwner.status === 400;

  stage = "client-B";
  ({ context: contextB, page: pageB } = await openClient());

  stage = "sign-in-B";
  const authB = await evaluate(pageB, "signIn", userB.email, userB.password);
  safe.signInB = authB.status === 200;
  safe.authJwtHidden &&= authB.authJwtHeaderExposed === false;
  if (!safe.signInB) throw new Error("SIGN_IN_B_FAILED");
  safe.browserUsesSameOriginOnly = externalBrowserRequests === 0;

  stage = "list-B-before-insert";
  const emptyB = await evaluate(pageB, "list");
  safe.workerResponses.listBBeforeInsert = summarize(emptyB);
  safe.bCannotSeeA =
    emptyB.status === 200 && !rows(emptyB.body).some((row) => row.marker === markerA);

  stage = "create-B";
  const createB = await evaluate(pageB, "createRow", markerB);
  safe.workerResponses.createB = summarize(createB);
  safe.bSeesOwn =
    createB.status === 201 &&
    createB.body?.sessionStatus === "active-cookie" &&
    createB.body?.inserted?.some((row) => row.marker === markerB) === true;

  stage = "list-B";
  const listB = await evaluate(pageB, "list");
  safe.workerResponses.listB = summarize(listB);
  safe.bSeesOwn &&=
    listB.status === 200 &&
    rows(listB.body).some((row) => row.marker === markerB);

  stage = "a-cannot-see-B";
  const aAfterB = await evaluate(pageA, "list");
  safe.workerResponses.listAAfterB = summarize(aAfterB);
  safe.aCannotSeeB =
    aAfterB.status === 200 && !rows(aAfterB.body).some((row) => row.marker === markerB);

  stage = "sign-out-A";
  const signOut = await evaluate(pageA, "signOut");
  safe.signOutA = signOut.status === 200;

  stage = "session-replay";
  replayContext = await request.newContext();
  const replay = await replayContext.get(`${origin}/__p0/rows`, {
    headers: { Cookie: staleCookieHeader },
  });
  safe.sessionReplayStatus = replay.status();
  safe.sessionRevocationEnforced = replay.status() === 401;
  const replayBody = await replay.json().catch(() => null);
  safe.workerResponses.sessionReplay = {
    status: replay.status(),
    error: typeof replayBody?.error === "string" ? replayBody.error : null,
  };
  safe.browserUsesSameOriginOnly &&= externalBrowserRequests === 0;
} catch (error) {
  safe.failure = error instanceof Error ? error.name : "unknown";
  safe.failureStage = stage;
} finally {
  await replayContext?.dispose();
  await contextB?.close();
  await contextA?.close();
  await browser?.close();
}

process.stdout.write(`${JSON.stringify(safe)}\n`);
if (
  !safe.workerHealth ||
  !safe.anonymousDenied ||
  !safe.bearerOnlyDenied ||
  !safe.signInA ||
  !safe.signInB ||
  !safe.authJwtHidden ||
  !safe.sessionCookieHttpOnly ||
  !safe.browserUsesSameOriginOnly ||
  !safe.forgedOwnerDenied ||
  !safe.aSeesOwn ||
  !safe.bCannotSeeA ||
  !safe.bSeesOwn ||
  !safe.aCannotSeeB ||
  !safe.signOutA ||
  !safe.sessionRevocationEnforced
) {
  process.exitCode = 1;
}
