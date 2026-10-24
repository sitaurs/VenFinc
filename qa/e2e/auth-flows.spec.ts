import { test, expect, type Page } from "@playwright/test";

const requestId = "90bb7219-cbb1-4a49-9c72-d00e05048d77";
const success = (data: unknown) => ({ data, meta: { requestId, version: 1 } });

async function authReady(page: Page, registrationOpen = true) {
  await page.route("**/api/v1/config/public", (route) => route.fulfill({ json: success({
    authAvailable: true,
    registrationOpen,
    personalWhatsAppAvailable: false,
    aiAvailable: false,
    defaultLocale: "id-ID",
    supportedLocales: ["id-ID", "en-US"],
  }) }));
}

test("registration moves to email verification and only enters the private app after a verified session", async ({ page }) => {
  await authReady(page);
  let signUpBody: Record<string, unknown> | undefined;
  let verifiedOtp = false;
  await page.route("**/api/auth/sign-up/email", async (route) => {
    signUpBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ json: { user: { id: "qa-user-a", emailVerified: false } } });
  });
  await page.route("**/api/auth/email-otp/verify-email", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ email: "qa@example.invalid", otp: "123456" });
    verifiedOtp = true;
    await route.fulfill({ json: { success: true } });
  });
  await page.route("**/api/v1/session", async (route) => {
    if (!verifiedOtp) {
      await route.fulfill({ status: 401, json: { error: { code: "AUTH_REQUIRED", message: "Sign in required.", requestId } } });
      return;
    }
    await route.fulfill({ json: success({ authenticated: true, userId: "qa-user-a", expiresAt: "2026-10-24T18:00:00Z" }) });
  });
  await page.route("**/api/v1/me", (route) => route.fulfill({ json: success({
    profile: null,
    role: "user",
  }) }));

  await page.goto("/register");
  await page.getByLabel("Nama", { exact: true }).fill("QA User");
  await page.getByLabel("Email", { exact: true }).fill("QA@Example.invalid");
  await page.getByLabel("Kata sandi", { exact: true }).fill("Synthetic-QA-Password-01");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Buat akun", exact: true }).click();
  await expect(page).toHaveURL(/\/verify-email$/);
  expect(signUpBody).toEqual({ name: "QA User", email: "qa@example.invalid", password: "Synthetic-QA-Password-01" });

  await page.getByLabel("Kode verifikasi", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verifikasi email", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Kenalan dulu" })).toBeVisible();
});

test("password recovery uses one-use OTP and matching confirmation without exposing account existence", async ({ page }) => {
  await authReady(page, false);
  const calls: Array<{ path: string; body: unknown }> = [];
  await page.route("**/api/auth/forget-password/email-otp", async (route) => {
    calls.push({ path: new URL(route.request().url()).pathname, body: route.request().postDataJSON() });
    await route.fulfill({ json: { success: true } });
  });
  await page.route("**/api/auth/email-otp/check-verification-otp", async (route) => {
    calls.push({ path: new URL(route.request().url()).pathname, body: route.request().postDataJSON() });
    await route.fulfill({ json: { success: true } });
  });
  await page.route("**/api/auth/email-otp/passcode", async (route) => {
    calls.push({ path: new URL(route.request().url()).pathname, body: route.request().postDataJSON() });
    await route.fulfill({ json: { success: true } });
  });
  await page.route("**/api/v1/session", (route) => route.fulfill({
    status: 401,
    json: { error: { code: "AUTH_REQUIRED", message: "Sign in required.", requestId } },
  }));

  await page.goto("/forgot-password");
  await page.getByLabel("Email", { exact: true }).fill("QA@Example.invalid");
  await page.getByRole("button", { name: "Kirim kode pemulihan", exact: true }).click();
  await expect(page).toHaveURL(/\/reset-password$/);
  await expect(page.getByRole("status")).toContainText("Jika akun cocok");

  await page.getByLabel("Kode pemulihan", { exact: true }).fill("654321");
  await page.getByRole("button", { name: "Verifikasi kode", exact: true }).click();
  await expect(page.getByLabel("Kata sandi baru", { exact: true })).toBeVisible();
  await page.getByLabel("Kata sandi baru", { exact: true }).fill("Synthetic-QA-Password-02");
  await page.getByLabel("Konfirmasi kata sandi baru", { exact: true }).fill("different-password");
  await page.getByRole("button", { name: "Simpan kata sandi", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("belum cocok");
  expect(calls).toHaveLength(2);

  await page.getByLabel("Konfirmasi kata sandi baru", { exact: true }).fill("Synthetic-QA-Password-02");
  await page.getByRole("button", { name: "Simpan kata sandi", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("status")).toContainText("berhasil diperbarui");
  expect(calls).toEqual([
    { path: "/api/auth/forget-password/email-otp", body: { email: "qa@example.invalid" } },
    { path: "/api/auth/email-otp/check-verification-otp", body: { email: "qa@example.invalid", otp: "654321", type: "forget-password" } },
    { path: "/api/auth/email-otp/passcode", body: { email: "qa@example.invalid", otp: "654321", password: "Synthetic-QA-Password-02" } },
  ]);
});

test("verification and recovery screens fit supported viewport widths @visual", async ({ page }, testInfo) => {
  await authReady(page, false);
  for (const path of ["/verify-email", "/forgot-password", "/reset-password"]) {
    for (const width of [320, 361, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.locator("#main-content h1")).toBeVisible();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(width);
      if (width === 361) {
        const slug = path.slice(1).replaceAll("/", "-");
        await page.screenshot({ path: testInfo.outputPath(`auth-${slug}-361.png`), fullPage: true });
      }
    }
  }
});
