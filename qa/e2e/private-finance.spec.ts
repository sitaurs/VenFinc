import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const requestId = "90bb7219-cbb1-4a49-9c72-d00e05048d77";
const walletId = "7b9be51e-0607-4c60-8315-e57ae8f61aba";
const savingsWalletId = "8d4a5f5d-63e1-43e1-83aa-bd4311e33e51";
const eventId = "12d474d1-0470-4c65-a9c2-15f80b73f72e";
const goalId = "3bf4f79b-fdbc-43ee-9726-c5784e550704";
const savingsEventId = "d96f06d6-107d-4f87-99c8-36d1475b203b";

function success(data: unknown) {
  return { data, meta: { requestId, version: 1 } };
}

async function mockPrivateApi(page: Page, options: { includeRefundableExpense?: boolean } = {}) {
  let postedCommand: Record<string, unknown> | undefined;
  let postedIdempotencyKey: string | undefined;
  let postedBudget: Record<string, unknown> | undefined;
  let postedGoal: Record<string, unknown> | undefined;
  let postedContribution: Record<string, unknown> | undefined;
  const transactionQueries: URLSearchParams[] = [];
  const budgets: Array<Record<string, unknown>> = [];
  const categories: Array<Record<string, unknown>> = [];
  const goals: Array<Record<string, unknown>> = [];
  const contributions: Array<Record<string, unknown>> = [];
  const wallets: Array<Record<string, unknown>> = [{
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
  }];
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
    if (path === "/api/v1/wallets" && request.method() === "POST") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      const wallet = {
        id: "5e95dfcf-6d42-4e9f-8bf2-c88d0be6a335",
        name: payload.name,
        type: payload.type,
        currency: "IDR",
        balanceMinor: "0",
        archivedAt: null,
        createdAt: "2026-10-25T00:00:00Z",
        updatedAt: "2026-10-25T00:00:00Z",
      };
      wallets.push(wallet);
      await route.fulfill({ status: 201, json: success(wallet) });
      return;
    }
    if (path.startsWith("/api/v1/wallets/") && request.method() === "PATCH") {
      const id = path.split("/").at(-1);
      const payload = request.postDataJSON() as Record<string, unknown>;
      const wallet = wallets.find((item) => item.id === id);
      if (wallet) {
        const { archived, ...fields } = payload;
        Object.assign(wallet, fields, {
          archivedAt: archived ? "2026-10-25T00:00:00Z" : null,
          updatedAt: "2026-10-25T00:00:00Z",
        });
      }
      await route.fulfill({ json: success({ id, archivedAt: wallet?.archivedAt ?? null }) });
      return;
    }
    if (path === "/api/v1/wallets") {
      await route.fulfill({ json: success(wallets) });
      return;
    }
    if (path === "/api/v1/categories" && request.method() === "POST") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      const category = {
        id: "d1f78cc6-1fc6-45c7-831d-f626171990de",
        name: payload.name,
        parentId: payload.parentId ?? null,
        iconKey: payload.iconKey ?? null,
        colorToken: payload.colorToken ?? null,
        archivedAt: null,
      };
      categories.push(category);
      await route.fulfill({ json: success(category) });
      return;
    }
    if (path.startsWith("/api/v1/categories/") && request.method() === "PATCH") {
      const categoryId = path.split("/").at(-1);
      const payload = request.postDataJSON() as Record<string, unknown>;
      const category = categories.find((item) => item.id === categoryId);
      if (category) {
        const { archived, ...fields } = payload;
        Object.assign(category, fields, { archivedAt: archived ? "2026-10-25T00:00:00Z" : null });
      }
      await route.fulfill({ json: success(category) });
      return;
    }
    if (path === "/api/v1/categories") {
      const includeArchived = url.searchParams.get("includeArchived") === "true";
      await route.fulfill({ json: success(categories.filter((category) => includeArchived || !category.archivedAt)) });
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
    if (path === "/api/v1/savings-goals" && request.method() === "POST") {
      postedGoal = request.postDataJSON() as Record<string, unknown>;
      const goal = {
        id: goalId,
        name: postedGoal.name,
        targetMinor: postedGoal.targetMinor,
        targetDate: postedGoal.targetDate,
        savingsWalletId: postedGoal.savingsWalletId,
      };
      goals.push({
        ...goal,
        savingsWalletName: postedGoal.savingsWalletId ? "Tabungan Tujuan" : null,
        savedMinor: "0",
        remainingMinor: postedGoal.targetMinor,
        progressPercent: 0,
        archivedAt: null,
      });
      await route.fulfill({ json: success(goal) });
      return;
    }
    if (path === "/api/v1/savings-goals") {
      await route.fulfill({ json: success(goals) });
      return;
    }
    if (path === `/api/v1/savings-goals/${goalId}/contributions` && request.method() === "POST") {
      postedContribution = request.postDataJSON() as Record<string, unknown>;
      const goal = goals.find((item) => item.id === goalId);
      if (goal) {
        const saved = BigInt(String(goal.savedMinor)) + BigInt(String(postedContribution.amountMinor));
        const target = BigInt(String(goal.targetMinor));
        goal.savedMinor = saved.toString();
        goal.remainingMinor = (target - saved).toString();
        goal.progressPercent = Number(saved * 100n / target > 100n ? 100n : saved * 100n / target);
      }
      const contribution = {
        eventId: savingsEventId,
        amountMinor: postedContribution.amountMinor,
        effectiveAt: postedContribution.effectiveAt,
        note: postedContribution.note ?? null,
        sourceWalletId: postedContribution.sourceWalletId,
        sourceWalletName: "Rekening Utama",
        destinationWalletId: postedContribution.destinationWalletId,
        destinationWalletName: "Tabungan Tujuan",
      };
      contributions.push(contribution);
      await route.fulfill({ json: success(contribution) });
      return;
    }
    if (path === `/api/v1/savings-goals/${goalId}/contributions`) {
      await route.fulfill({ json: success(contributions) });
      return;
    }
    if (path === `/api/v1/savings-goals/${goalId}` && request.method() === "PATCH") {
      const update = request.postDataJSON() as Record<string, unknown>;
      const goal = goals.find((item) => item.id === goalId);
      if (goal) {
        goal.name = update.name;
        goal.targetMinor = update.targetMinor;
        goal.targetDate = update.targetDate;
        goal.savingsWalletId = update.savingsWalletId;
        goal.archivedAt = update.archived ? "2026-10-25T00:00:00Z" : null;
      }
      await route.fulfill({ json: success({ id: goalId, archivedAt: goal?.archivedAt ?? null }) });
      return;
    }
    if (path === "/api/v1/reports/summary") {
      const from = url.searchParams.get("from") ?? "2026-10-01";
      const to = url.searchParams.get("to") ?? "2026-10-25";
      const daily = from === to
        ? [{ localDate: from, incomeMinor: "1200000", expenseMinor: "918000" }]
        : [
          { localDate: from, incomeMinor: "1200000", expenseMinor: "918000" },
          { localDate: to, incomeMinor: "0", expenseMinor: "0" },
        ];
      await route.fulfill({ json: success({
        timezone: "Asia/Jakarta",
        from,
        to,
        current: { incomeMinor: "1200000", grossExpenseMinor: "920000", refundMinor: "2000", eventCount: 3 },
        previous: { incomeMinor: "1100000", grossExpenseMinor: "800000", refundMinor: "0" },
        daily,
        categories: [
          { categoryId: "a764be58-2faf-47d9-9776-c6a9c8ce9c4a", categoryName: "Makan", amountMinor: "620000", eventCount: 2 },
          { categoryId: null, categoryName: "Tanpa kategori", amountMinor: "298000", eventCount: 1 },
        ],
        merchants: [{ merchant: "Kantin", amountMinor: "620000", eventCount: 2 }],
      }) });
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
      transactionQueries.push(new URLSearchParams(url.searchParams));
      const cursor = url.searchParams.get("cursor");
      const rows: Array<Record<string, unknown>> = [{
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
      }];
      if (options.includeRefundableExpense) rows.push({
        ...rows[0]!,
        id: "8134f43e-49ac-44fd-b6ba-5a8d51aa4118",
        kind: "expense",
        amountMinor: "125000",
        categoryId: "a764be58-2faf-47d9-9776-c6a9c8ce9c4a",
        categoryName: "Makan",
        note: "Makan siang",
        merchant: "Kantin",
        allocations: [{ categoryId: "a764be58-2faf-47d9-9776-c6a9c8ce9c4a", categoryName: "Makan", amountMinor: "125000", note: null }],
        createdAt: "2026-10-24T08:30:00Z",
      });
      const paginated = url.searchParams.get("limit") === "99";
      if (paginated && cursor) rows.push({
        ...rows[0]!,
        id: "8134f43e-49ac-44fd-b6ba-5a8d51aa4118",
        kind: "expense",
        amountMinor: "125000",
        categoryId: "a764be58-2faf-47d9-9776-c6a9c8ce9c4a",
        categoryName: "Makan",
        note: "=2+2",
        merchant: "Kantin",
        createdAt: "2026-10-24T08:30:00Z",
      });
      await route.fulfill({ json: success({
        items: paginated && !cursor ? rows : paginated ? rows.slice(1) : rows,
        page: { hasMore: paginated && !cursor, nextCursor: paginated && !cursor ? "next-page" : null },
      }) });
      return;
    }
    await route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND", message: "Not found", requestId } } });
  });
  return {
    postedCommand: () => postedCommand,
    postedIdempotencyKey: () => postedIdempotencyKey,
    postedBudget: () => postedBudget,
    postedGoal: () => postedGoal,
    postedContribution: () => postedContribution,
    transactionQueries: () => transactionQueries,
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

test("owner transaction exports include every page, preserve exact money, and disclose JSON scope", async ({ page }) => {
  await mockPrivateApi(page);
  await page.goto("/app/transactions");
  await expect(page.getByRole("heading", { name: "Riwayat transaksi", exact: true })).toBeVisible();

  const csvPending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor semua CSV", exact: true }).click();
  const csvDownload = await csvPending;
  expect(csvDownload.suggestedFilename()).toMatch(/^venfinance-transaksi-\d{4}-\d{2}-\d{2}\.csv$/);
  const csvPath = await csvDownload.path();
  expect(csvPath).toBeTruthy();
  const csv = await readFile(csvPath!, "utf8");
  expect(csv).toContain("9007199254740993");
  expect(csv).toContain("125000");
  expect(csv).toContain("'=2+2");
  expect(csv).toContain("8134f43e-49ac-44fd-b6ba-5a8d51aa4118");

  const jsonPending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor data JSON", exact: true }).click();
  const jsonDownload = await jsonPending;
  expect(jsonDownload.suggestedFilename()).toMatch(/^venfinance-export-v1-\d{4}-\d{2}-\d{2}\.json$/);
  const jsonPath = await jsonDownload.path();
  expect(jsonPath).toBeTruthy();
  const backup = JSON.parse(await readFile(jsonPath!, "utf8")) as Record<string, unknown>;
  expect(backup.schemaVersion).toBe(1);
  expect(backup.scope).toEqual({
    included: ["profile", "wallets", "categories", "transactions"],
    excluded: ["budget_periods", "debts", "attachments"],
  });
  expect(backup.wallets).toHaveLength(2);
  expect(backup.transactions).toHaveLength(2);
  expect(backup).not.toHaveProperty("userId");
  expect(backup.profile).not.toHaveProperty("userId");
  expect(backup.transactions).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: "8134f43e-49ac-44fd-b6ba-5a8d51aa4118", amountMinor: "125000", note: "=2+2" }),
  ]));
  await page.setViewportSize({ width: 361, height: 867 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
});

test("transaction date filters use the account timezone and request all matching pages", async ({ page }) => {
  const api = await mockPrivateApi(page);
  await page.goto("/app/transactions");
  await page.getByLabel("Dari tanggal", { exact: true }).fill("2026-10-20");
  await page.getByLabel("Sampai tanggal", { exact: true }).fill("2026-10-24");
  await expect.poll(() => api.transactionQueries().some((params) =>
    params.get("from") === "2026-10-19T17:00:00.000Z" && params.get("to") === "2026-10-24T17:00:00.000Z",
  )).toBe(true);
  await expect(page.getByLabel("Dari tanggal", { exact: true })).toHaveValue("2026-10-20");
});

test("refund starts from its posted expense and submits a linked exact partial amount", async ({ page }) => {
  const api = await mockPrivateApi(page, { includeRefundableExpense: true });
  await page.goto("/app/transactions");
  await page.getByRole("button", { name: "Catat refund", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Catat pengembalian dana", exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Sisa yang dapat dikembalikan" })).toBeVisible();
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("45.000");
  await page.getByLabel("Catatan (opsional)", { exact: true }).fill("Pengembalian sebagian");
  await page.getByRole("button", { name: "Simpan transaksi", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Riwayat transaksi", exact: true })).toBeVisible();
  expect(api.postedCommand()).toMatchObject({
    kind: "refund",
    walletId,
    amountMinor: "45000",
    refundOf: "8134f43e-49ac-44fd-b6ba-5a8d51aa4118",
    allocations: [{ categoryId: "a764be58-2faf-47d9-9776-c6a9c8ce9c4a", amountMinor: "45000" }],
  });
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

test("wallets can be created, renamed, archived, and restored while preserving exact balances", async ({ page }) => {
  await mockPrivateApi(page);
  await page.goto("/app/wallets");
  await expect(page.getByRole("heading", { name: "Daftar dompet", exact: true })).toBeVisible();
  await expect(page.locator(".private-wallet-total > strong")).toHaveText("Rp9.007.199.254.740.993");
  await page.getByRole("button", { name: "Tambah dompet", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Dompet baru", exact: true })).toBeVisible();
  await page.locator(".wallet-editor select").selectOption("cash");
  await page.getByLabel("Nama dompet", { exact: true }).fill("Tunai Harian");
  await page.getByRole("button", { name: "Buat dompet", exact: true }).click();
  await expect(page.getByText("Tunai Harian", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Rekening Utama", exact: true }).click();
  await page.getByLabel("Nama dompet", { exact: true }).fill("Rekening Gaji");
  await page.getByRole("button", { name: "Simpan perubahan", exact: true }).click();
  await expect(page.getByText("Rekening Gaji", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Arsipkan", exact: true }).first().click();
  await page.getByRole("button", { name: "Konfirmasi arsip", exact: true }).click();
  await expect(page.getByText("2 sumber uang", { exact: true })).toBeVisible();
  await page.getByText("Dompet arsip · 1", { exact: true }).click();
  await page.getByRole("button", { name: "Pulihkan", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit Rekening Gaji", exact: true })).toBeVisible();
  await expect(page.locator(".private-wallet-total > strong")).toHaveText("Rp9.007.199.254.740.993");
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

test("savings goal progress follows a confirmed transfer and preserves exact IDR", async ({ page }) => {
  const api = await mockPrivateApi(page);
  await page.goto("/app/goals");
  await expect(page.getByRole("heading", { name: "Daftar target tabungan", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tambah target tabungan", exact: true }).first().click();
  await page.getByLabel("Nama target", { exact: true }).fill("Dana darurat");
  await page.getByLabel("Nominal target (rupiah)", { exact: true }).fill("5.000.000");
  await page.getByLabel("Tanggal target (opsional)", { exact: true }).fill("2027-06-30");
  await page.getByRole("combobox", { name: "Dompet tabungan khusus (opsional)", exact: true }).selectOption(savingsWalletId);
  await page.getByRole("button", { name: "Simpan target", exact: true }).click();
  await expect(page.getByRole("link", { name: /Dana darurat/ })).toBeVisible();
  expect(api.postedGoal()).toMatchObject({ name: "Dana darurat", targetMinor: "5000000", savingsWalletId });
  await page.getByRole("link", { name: "Kelola", exact: true }).click();
  await page.getByRole("button", { name: "Catat setoran", exact: true }).click();
  await page.getByLabel("Nominal setoran (rupiah)", { exact: true }).fill("200.000");
  await page.getByLabel("Catatan (opsional)", { exact: true }).fill("Setoran awal");
  await page.getByRole("button", { name: "Konfirmasi setoran", exact: true }).click();
  await expect(page.getByText("Rekening Utama → Tabungan Tujuan", { exact: true })).toBeVisible();
  expect(api.postedContribution()).toMatchObject({
    sourceWalletId: walletId,
    destinationWalletId: savingsWalletId,
    amountMinor: "200000",
    note: "Setoran awal",
    timezone: "Asia/Jakarta",
  });
});

test("savings goals can be edited, archived, and restored without deleting their history", async ({ page }) => {
  await mockPrivateApi(page);
  await page.goto("/app/goals");
  await page.getByRole("button", { name: "Tambah target tabungan", exact: true }).first().click();
  await page.getByLabel("Nama target", { exact: true }).fill("Dana liburan");
  await page.getByLabel("Nominal target (rupiah)", { exact: true }).fill("2.000.000");
  await page.getByRole("button", { name: "Simpan target", exact: true }).click();
  await page.getByRole("link", { name: "Kelola", exact: true }).click();
  await page.getByRole("button", { name: "Edit target", exact: true }).click();
  await page.getByLabel("Nama target", { exact: true }).fill("Liburan keluarga");
  await page.getByLabel("Nominal target (rupiah)", { exact: true }).fill("2.500.000");
  await page.getByRole("button", { name: "Simpan target", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Liburan keluarga", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Arsipkan", exact: true }).click();
  await page.getByRole("button", { name: "Konfirmasi arsip", exact: true }).click();
  await expect(page.getByText("Diarsipkan", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Semua target", exact: true }).click();
  await page.getByText("Target arsip · 1", { exact: true }).click();
  await page.getByRole("button", { name: "Pulihkan", exact: true }).click();
  await expect(page.getByRole("link", { name: /Liburan keluarga/ })).toBeVisible();
});

test("finance reports use confirmed data, compare equal periods, and export only the selected summary", async ({ page }) => {
  await mockPrivateApi(page);
  await page.goto("/app/insights");
  await expect(page.getByRole("heading", { name: "Laporan & insight", exact: true })).toBeVisible();
  await expect(page.locator(".report-metric-income > strong")).toHaveText("Rp1.200.000");
  await expect(page.locator(".report-metric-expense > strong")).toHaveText("Rp918.000");
  await expect(page.getByRole("heading", { name: "Pengeluaran per kategori", exact: true })).toBeVisible();
  await expect(page.getByText("Kantin", { exact: true })).toBeVisible();
  await expect(page.getByText(/transfer dan setoran tabungan tidak dihitung/)).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh ringkasan CSV", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/^venfinance-laporan-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.csv$/);
  await page.getByRole("button", { name: "7 hari", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Laporan & insight", exact: true })).toBeVisible();
  await expect(page.locator(".report-daily-chart [role=listitem]")).toHaveCount(2);
  await page.setViewportSize({ width: 361, height: 867 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
});

test("categories can be added, edited, archived, and restored without changing transaction history", async ({ page }) => {
  await mockPrivateApi(page);
  await page.goto("/app/categories");
  await expect(page.getByRole("heading", { name: "Kategori transaksi", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tambah kategori", exact: true }).click();
  await page.getByLabel("Nama kategori", { exact: true }).fill("Perawatan");
  await page.getByRole("combobox", { name: "Warna kategori", exact: true }).selectOption("mint");
  await page.getByRole("button", { name: "Simpan kategori", exact: true }).click();
  await expect(page.locator(".category-manager-copy > strong")).toHaveText("Perawatan");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Nama kategori", { exact: true }).fill("Kesehatan");
  await page.getByRole("button", { name: "Simpan kategori", exact: true }).click();
  await expect(page.locator(".category-manager-copy > strong")).toHaveText("Kesehatan");
  await page.getByRole("button", { name: "Arsipkan", exact: true }).click();
  await page.getByRole("button", { name: "Konfirmasi arsip", exact: true }).click();
  await expect(page.getByText("0 kategori aktif", { exact: true })).toBeVisible();
  await page.getByText("Kategori arsip · 1", { exact: true }).click();
  await page.getByRole("button", { name: "Pulihkan", exact: true }).click();
  await expect(page.locator(".category-manager-copy > strong")).toHaveText("Kesehatan");
  await expect(page.getByText("1 kategori aktif", { exact: true })).toBeVisible();
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
