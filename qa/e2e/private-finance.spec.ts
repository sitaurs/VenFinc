import { test, expect, type Page } from "@playwright/test";

const requestId = "90bb7219-cbb1-4a49-9c72-d00e05048d77";
const walletId = "7b9be51e-0607-4c60-8315-e57ae8f61aba";
const savingsWalletId = "8d4a5f5d-63e1-43e1-83aa-bd4311e33e51";
const eventId = "12d474d1-0470-4c65-a9c2-15f80b73f72e";

function success(data: unknown) {
  return { data, meta: { requestId, version: 1 } };
}

async function mockPrivateApi(page: Page) {
  let postedCommand: Record<string, unknown> | undefined;
  let postedIdempotencyKey: string | undefined;
  let postedBudget: Record<string, unknown> | undefined;
  const budgets: Array<Record<string, unknown>> = [];
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
      }, {
        id: savingsWalletId,
        name: "Tabungan Tujuan",
        type: "savings",
        currency: "IDR",
        balanceMinor: "0",
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
    if (path === "/api/v1/budgets" && request.method() === "POST") {
      postedBudget = request.postDataJSON() as Record<string, unknown>;
      const id = "c36df782-e943-4ab5-80d5-07b8f6eef620";
      const periodId = "f08fab98-b8ab-4db7-a53c-2215f5b9a76c";
      budgets.push({
        id,
        name: postedBudget.name,
        kind: postedBudget.kind,
        categoryId: postedBudget.categoryId,
        categoryName: null,
        frequency: "monthly",
        timezone: postedBudget.timezone,
        rolloverPolicy: false,
        warningThresholds: postedBudget.warningThresholds,
        startsOn: postedBudget.startsOn,
        endsOn: postedBudget.endsOn,
        plannedMinor: postedBudget.plannedMinor,
        usedMinor: "0",
        remainingMinor: postedBudget.plannedMinor,
      });
      await route.fulfill({ json: success({
        id,
        periodId,
        name: postedBudget.name,
        kind: postedBudget.kind,
        categoryId: postedBudget.categoryId,
        frequency: "monthly",
        startsOn: postedBudget.startsOn,
        endsOn: postedBudget.endsOn,
        plannedMinor: postedBudget.plannedMinor,
      }) });
      return;
    }
    if (path === "/api/v1/budgets") {
      await route.fulfill({ json: success(budgets) });
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
        walletId: postedCommand.walletId,
        destinationWalletId: postedCommand.destinationWalletId ?? null,
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
    postedBudget: () => postedBudget,
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

test("private budget screen creates a monthly plan without posting or changing wallet balances", async ({ page }) => {
  const api = await mockPrivateApi(page);
  await page.goto("/app/budgets");
  await expect(page.getByRole("heading", { name: "Anggaran", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Buat anggaran", exact: true }).first().click();
  await page.getByLabel("Nama anggaran", { exact: true }).fill("Semua kebutuhan");
  await page.getByRole("combobox", { name: "Ruang lingkup", exact: true }).selectOption("global");
  await page.getByLabel("Rencana per bulan (rupiah)", { exact: true }).fill("2.500.000");
  await page.getByRole("button", { name: "Simpan rencana", exact: true }).click();
  await expect(page.locator(".budget-card")).toHaveCount(1);
  expect(api.postedBudget()).toMatchObject({
    name: "Semua kebutuhan",
    kind: "global",
    categoryId: null,
    frequency: "monthly",
    plannedMinor: "2500000",
    rolloverPolicy: false,
  });
  expect(api.postedCommand()).toBeUndefined();
});

test("savings transfer selects a savings wallet and stays out of expense categories", async ({ page }) => {
  const api = await mockPrivateApi(page);
  await page.goto("/app/transactions/new");
  await page.getByRole("combobox", { name: "Jenis", exact: true }).selectOption("savings_transfer");
  await expect(page.getByRole("combobox", { name: "Ke dompet tabungan", exact: true })).toHaveValue(savingsWalletId);
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("100.000");
  await page.getByRole("button", { name: "Simpan transaksi", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Riwayat transaksi" })).toBeVisible();
  expect(api.postedCommand()).toMatchObject({
    kind: "savings_transfer",
    walletId,
    destinationWalletId: savingsWalletId,
    amountMinor: "100000",
    allocations: [],
  });
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
