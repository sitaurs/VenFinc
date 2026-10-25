import { test, expect, type Page } from "@playwright/test";

const requestId = "1a893c11-4d70-4cb0-bcae-4d9c5b858db8";
const success = (data: unknown) => ({ data, meta: { requestId, version: 1 } });

const activeSession = {
  id: "session-current",
  createdAt: "2026-10-23T10:00:00.000Z",
  expiresAt: "2026-11-23T10:00:00.000Z",
  userAgent: "Chrome 130 · Windows",
  current: true,
};
const otherSession = {
  id: "session-other",
  createdAt: "2026-10-22T10:00:00.000Z",
  expiresAt: "2026-11-22T10:00:00.000Z",
  userAgent: "Pixel 7 · Android 14",
  current: false,
};

async function readySecurityScreen(page: Page) {
  let sessions = [activeSession, otherSession];
  const actions: Array<{ path: string; body: unknown }> = [];
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === "/api/v1/config/public") {
      await route.fulfill({ json: success({
        authAvailable: true,
        registrationOpen: false,
        personalWhatsAppAvailable: false,
        aiAvailable: false,
        proofUploadsAvailable: false,
        defaultLocale: "id-ID",
        supportedLocales: ["id-ID", "en-US"],
      }) });
      return;
    }
    if (path === "/api/v1/session") {
      await route.fulfill({ json: success({
        authenticated: true,
        userId: "security-qa-owner",
        expiresAt: "2026-11-23T10:00:00.000Z",
      }) });
      return;
    }
    if (path === "/api/v1/me") {
      await route.fulfill({ json: success({
        profile: {
          userId: "security-qa-owner",
          displayName: "Akun QA",
          locale: "id-ID",
          timezone: "Asia/Jakarta",
          preferredCurrency: "IDR",
          accountStatus: "active",
          onboardingAt: "2026-10-23T10:00:00.000Z",
          role: "user",
        },
        role: "user",
      }) });
      return;
    }
    if (path === "/api/v1/security/sessions" && request.method() === "GET") {
      await route.fulfill({ json: success(sessions) });
      return;
    }
    if (path.startsWith("/api/v1/security/sessions/") && request.method() === "POST") {
      const body = request.postDataJSON();
      actions.push({ path, body });
      if (path.endsWith("/revoke")) {
        sessions = sessions.filter((session) => session.id !== (body as { sessionId: string }).sessionId);
        await route.fulfill({ json: success({ revoked: true, currentSessionRevoked: false }) });
        return;
      }
      if (path.endsWith("/revoke-others")) {
        sessions = sessions.filter((session) => session.current);
        await route.fulfill({ json: success({ revoked: true, currentSessionRevoked: false }) });
        return;
      }
      if (path.endsWith("/revoke-all")) {
        await route.fulfill({ json: success({ revoked: true, currentSessionRevoked: true }) });
        return;
      }
    }
    await route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND", message: "Not found", requestId } } });
  });
  return actions;
}

test("security settings revoke other sessions without ending the current session", async ({ page }) => {
  const actions = await readySecurityScreen(page);
  await page.goto("/app/settings/security");
  await expect(page.getByRole("heading", { name: "Keamanan & perangkat" })).toBeVisible();
  await expect(page.getByText("Chrome 130 · Windows")).toBeVisible();
  await expect(page.getByText("Pixel 7 · Android 14")).toBeVisible();
  await page.getByRole("button", { name: "Logout dari perangkat lain" }).click();
  await expect(page.getByRole("group", { name: "Konfirmasi pencabutan sesi" })).toContainText("Sesi perangkat ini tetap aktif");
  await page.getByRole("button", { name: "Konfirmasi", exact: true }).click();
  await expect(page.getByText("Pixel 7 · Android 14")).toHaveCount(0);
  await expect(page.getByText("Chrome 130 · Windows")).toBeVisible();
  expect(actions).toEqual([{ path: "/api/v1/security/sessions/revoke-others", body: {} }]);
});

test("one device can be revoked by its safe session ID and needs an explicit confirmation", async ({ page }) => {
  const actions = await readySecurityScreen(page);
  await page.goto("/app/settings/security");
  const device = page.locator(".security-session-row").filter({ hasText: "Pixel 7 · Android 14" });
  await device.getByRole("button", { name: "Keluarkan" }).click();
  await expect(device.getByRole("group", { name: "Konfirmasi keluarkan perangkat" })).toBeVisible();
  await device.getByRole("button", { name: "Ya, keluarkan" }).click();
  await expect(page.getByText("Pixel 7 · Android 14")).toHaveCount(0);
  expect(actions).toEqual([{ path: "/api/v1/security/sessions/revoke", body: { sessionId: "session-other" } }]);
});

test("signing out all devices explains that the current device will also be signed out", async ({ page }) => {
  const actions = await readySecurityScreen(page);
  await page.goto("/app/settings/security");
  await page.getByRole("button", { name: "Logout dari semua perangkat" }).click();
  await expect(page.getByRole("group", { name: "Konfirmasi pencabutan sesi" })).toContainText("termasuk perangkat ini");
  await page.getByRole("button", { name: "Konfirmasi", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(actions).toEqual([{ path: "/api/v1/security/sessions/revoke-all", body: {} }]);
});

test("settings and security screens fit supported phone, tablet, and desktop widths @visual", async ({ page }, testInfo) => {
  await readySecurityScreen(page);
  for (const path of ["/app/settings", "/app/settings/security"]) {
    for (const width of [320, 361, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.locator(".private-content h1")).toBeVisible();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(width);
      if (width === 361) {
        const slug = path.slice("/app/".length).replaceAll("/", "-");
        await page.screenshot({ path: testInfo.outputPath(`settings-${slug}-361.png`), fullPage: true });
      }
    }
  }
});
