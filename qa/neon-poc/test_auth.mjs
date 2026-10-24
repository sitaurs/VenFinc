import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/opt/google/chrome/chrome",
  args: ["--no-sandbox"],
});

const safe = {
  workerHealth: false,
  anonymousDenied: false,
  signupA: false,
  signupB: false,
  tamperedDenied: false,
  forgedOwnerDenied: false,
  aSeesOwn: false,
  bCannotSeeA: false,
  bSeesOwn: false,
  aCannotSeeB: false,
  authRoleClaimValid: false,
  sessionRevocationEnforced: false,
  sessionReplayStatus: null,
  workerResponses: {},
  tokenMetadata: [],
  failureStage: null,
};

let stage = "launch";
let contextA;
let pageA;
let contextB;

async function openClient() {
  const context = await browser.newContext();
  context.setDefaultTimeout(15_000);
  const page = await context.newPage();
  page.on("pageerror", () => {
    safe.pageErrors = (safe.pageErrors ?? 0) + 1;
  });
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.hostname.includes("neonauth.")) {
      safe.authResponses ??= [];
      safe.authResponses.push({ path: url.pathname, status: response.status() });
    }
  });
  await page.goto("http://127.0.0.1:5173", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.p0NeonAuth !== undefined);
  return { context, page };
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
    upstreamStatus:
      typeof response.body?.upstreamStatus === "number"
        ? response.body.upstreamStatus
        : null,
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

try {
  stage = "client-A";
  ({ context: contextA, page: pageA } = await openClient());

  stage = "health";
  const health = await pageA.evaluate(() => window.p0NeonAuth.health());
  safe.workerHealth = health.status === 200;

  stage = "anonymous";
  const anonymous = await pageA.evaluate(() => window.p0NeonAuth.anonymous());
  safe.anonymousDenied = anonymous.status === 401;

  stage = "signup-A";
  const authA = await pageA.evaluate(() => window.p0NeonAuth.signupA());
  safe.signupA = authA.signup === "ok";
  if (!safe.signupA) {
    safe.signupFailure = authA.failure ?? { kind: "unknown" };
    throw new Error("Synthetic signup failed.");
  }
  safe.tokenMetadata.push(authA.jwtClaims);
  safe.authRoleClaimValid =
    authA.jwtClaims?.role === "authenticated" &&
    authA.jwtClaims?.subjectPresent === true;

  stage = "create-A";
  const createA = await pageA.evaluate(() =>
    window.p0NeonAuth.createRow("user-A"),
  );
  const tokenA = await pageA.evaluate(() => window.p0NeonAuth.currentToken());
  safe.aSeesOwn =
    createA.status === 201 &&
    createA.body?.inserted?.[0]?.marker === "user-A";
  safe.workerResponses.createA = summarize(createA);

  stage = "list-A";
  const listA = await pageA.evaluate(() => window.p0NeonAuth.list());
  safe.workerResponses.listA = summarize(listA);
  safe.aSeesOwn &&=
    listA.status === 200 &&
    rows(listA.body).length === 1 &&
    rows(listA.body)[0]?.marker === "user-A";

  stage = "tampered";
  const tampered = await pageA.evaluate(() => window.p0NeonAuth.tampered());
  safe.tamperedDenied = tampered.status === 401;

  stage = "forged-owner";
  const forgedOwner = await pageA.evaluate(() =>
    window.p0NeonAuth.forgedOwner(),
  );
  safe.forgedOwnerDenied = forgedOwner.status === 400;

  stage = "client-B";
  ({ context: contextB } = await openClient());
  const pageB = contextB.pages()[0];

  stage = "signup-B";
  const authB = await pageB.evaluate(() => window.p0NeonAuth.signupB());
  safe.signupB = authB.signup === "ok";
  safe.tokenMetadata.push(authB.jwtClaims);
  const emptyB = await pageB.evaluate(() => window.p0NeonAuth.list());
  safe.workerResponses.listBBeforeInsert = summarize(emptyB);
  safe.bCannotSeeA = emptyB.status === 200 && rows(emptyB.body).length === 0;

  stage = "create-B";
  const createB = await pageB.evaluate(() =>
    window.p0NeonAuth.createRow("user-B"),
  );
  safe.workerResponses.createB = summarize(createB);
  safe.bSeesOwn =
    createB.status === 201 &&
    createB.body?.inserted?.[0]?.marker === "user-B";

  stage = "list-B";
  const listB = await pageB.evaluate(() => window.p0NeonAuth.list());
  safe.workerResponses.listB = summarize(listB);
  safe.bSeesOwn &&=
    listB.status === 200 &&
    rows(listB.body).length === 1 &&
    rows(listB.body)[0]?.marker === "user-B";

  stage = "a-cannot-see-B";
  const aAfterB = await pageA.evaluate((token) =>
    window.p0NeonAuth.listAs(token), tokenA);
  safe.workerResponses.listAAfterB = summarize(aAfterB);
  safe.aCannotSeeB =
    aAfterB.status === 200 &&
    rows(aAfterB.body).length === 1 &&
    rows(aAfterB.body)[0]?.marker === "user-A";

  stage = "session-revoke";
  const replay = await pageA.evaluate(() =>
    window.p0NeonAuth.signOutThenReplay(),
  );
  safe.sessionReplayStatus = replay.status;
  safe.sessionRevocationEnforced = replay.status === 401;
  safe.workerResponses.sessionReplay = summarize(replay);
} catch (error) {
  safe.failure = error instanceof Error ? error.name : "unknown";
  safe.failureStage = stage;
} finally {
  await contextB?.close();
  await contextA?.close();
  await browser.close();
}

process.stdout.write(`${JSON.stringify(safe)}\n`);
if (
  !safe.workerHealth ||
  !safe.anonymousDenied ||
  !safe.signupA ||
  !safe.signupB ||
  !safe.tamperedDenied ||
  !safe.forgedOwnerDenied ||
  !safe.aSeesOwn ||
  !safe.bCannotSeeA ||
  !safe.bSeesOwn ||
  !safe.aCannotSeeB ||
  !safe.authRoleClaimValid ||
  !safe.sessionRevocationEnforced
) {
  process.exitCode = 1;
}
