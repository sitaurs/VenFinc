import { test, expect, type Page } from "@playwright/test";

const requestId = "90bb7219-cbb1-4a49-9c72-d00e05048d77";
const walletId = "7b9be51e-0607-4c60-8315-e57ae8f61aba";
const eventId = "12d474d1-0470-4c65-a9c2-15f80b73f72e";

function success(data: unknown) {
  return { data, meta: { requestId, version: 1 } };
}

async function mockPrivateApi(page: Page) {
  let postedCommand: Record<string, unknown> | undefined;
  let postedIdempotencyKey: string | undefined;
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path === "/api/v1/config/public") {
      await route.fulfill({ json: success({
        authAvailable: true,
        registrationOpen: false,
        personalWhatsAppAvailable: false,
        aiAvailable: false,
        defaultLocale: "id-ID",
        supportedLocales: ["id-ID", "en-US"],
      }) });
      return;
    }
    if (path === "/api/v1/session") {
      await route.fulfill({ json: success({
        authenticated: true,
        userId: "qa-owner-a",
        expiresAt: "2026-10-24T18:00:00Z",
      }) });
      return;
    }
    if (path === "/api/v1/me") {
      await route.fulfill({ json: success({
        profile: {
          userId: "qa-owner-a",
          displayName: "Pemilik Uji",
          locale: "id-ID",
          timezone: "Asia/Jakarta",
          preferredCurrency: "IDR",
          accountStatus: "active",
          onboardingAt: null,
          role: "user",
        },
        role: "user",
      }) });
      return;
    }
    if (path === "/api/v1/wallets") {
      await route.fulfill({ json: success([{
        id: walletId,
        name: "Rekening Utama",
        type: "bank",
        currency: "IDR",
        balanceMinor: "9007199254740993",
        archivedAt: null,
        createdAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-24T00:00:00Z",
      }]) });
      return;
    }
    if (path === "/api/v1/categories") {
      await route.fulfill({ json: success([]) });
      return;
    }
    if (path === "/api/v1/transactions" && request.method() === "POST") {
      postedCommand = request.postDataJSON() as Record<string, unknown>;
      postedIdempotencyKey = request.headers()["idempotency-key"];
      await route.fulfill({ json: success({
        id: eventId,
        kind: postedCommand.kind,
        status: "posted",
        amountMinor: postedCommand.amountMinor,
        currency: "IDR",
        walletId,
        destinationWalletId: null,
        categoryId: null,
        effectiveAt: postedCommand.effectiveAt,
        timezone: "Asia/Jakarta",
        negativeBalanceConfirmed: false,
      }) });
      return;
    }
    if (path === "/api/v1/transactions") {
      await route.fulfill({ json: success({
        items: [{
          id: eventId,
          kind: "income",
          status: "posted",
          amountMinor: "9007199254740993",
          currency: "IDR",
          walletId,
          walletName: "Rekening Utama",
          destinationWalletId: null,
          destinationWalletName: null,
          categoryId: null,
          categoryName: null,
          effectiveAt: "2026-10-24T07:30:00Z",
          timezone: "Asia/Jakarta",
          note: null,
          merchant: "Penerimaan Uji",
          sourceChannel: "manual",
          refundOf: null,
          allocations: [],
          negativeBalanceConfirmed: false,
          createdAt: "2026-10-24T07:30:00Z",
        }],
        page: { hasMore: false, nextCursor: null },
      }) });
      return;
    }
    await route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND", message: "Not found", requestId } } });
  });
  return {
    postedCommand: () => postedCommand,
    postedIdempotencyKey: () => postedIdempotencyKey,
  };
}

test("private dashboard uses owner API values and records an exact idempotent transaction", async ({ page }) => {
  const api = await mockPrivateApi(page);
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Ringkasan keuangan" })).toBeVisible();
  await expect(page.locator(".private-balance-card > strong")).toHaveText("Rp9.007.199.254.740.993");
  await expect(page.getByText("Penerimaan Uji", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Catat transaksi", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Catat transaksi", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Jenis", exact: true }).selectOption("income");
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("9007199254740993");
  await page.getByLabel("Waktu transaksi", { exact: true }).fill("2026-10-24T09:30");
  await page.getByLabel("Catatan (opsional)", { exact: true }).fill("Pemasukan uji");
  await page.getByRole("button", { name: "Simpan transaksi", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Riwayat transaksi" })).toBeVisible();
  expect(api.postedCommand()).toMatchObject({
    kind: "income",
    walletId,
    amountMinor: "9007199254740993",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    note: "Pemasukan uji",
  });
  expect(api.postedCommand()).not.toHaveProperty("user_id");
  expect(api.postedIdempotencyKey()).toMatch(/^[0-9a-f-]{36}$/i);
});

test("a provider sign-in without a verified application session cannot open private data", async ({ page }) => {
  await page.route("**/api/v1/config/public", (route) => route.fulfill({ json: success({
    authAvailable: true,
    registrationOpen: false,
    personalWhatsAppAvailable: false,
    aiAvailable: false,
    defaultLocale: "id-ID",
    supportedLocales: ["id-ID", "en-US"],
  }) }));
  await page.route("**/api/auth/sign-in/email", (route) => route.fulfill({ json: { user: { id: "unverified-user", emailVerified: false } } }));
  await page.route("**/api/v1/session", (route) => route.fulfill({
    status: 401,
    json: { error: { code: "AUTH_REQUIRED", message: "Masuk diperlukan.", requestId } },
  }));
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("unverified@example.invalid");
  await page.getByLabel("Kata sandi", { exact: true }).fill("Synthetic-QA-Password-01");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Email akun ini belum terverifikasi");
  await expect(page).toHaveURL(/\/login$/);
});
