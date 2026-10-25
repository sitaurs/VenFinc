import { test, expect, type Page } from "@playwright/test";

const ownerA = "qa-offline-owner-a";
const ownerB = "qa-offline-owner-b";
const walletA = "f8f671a0-3f42-44d8-b7cf-327dcaa863cb";
const walletB = "fb52f3a7-91c3-4d48-9f4e-6b52da3e2f17";
const firstIdempotencyKey = "1d34862d-3a64-4cbc-ae24-6020a96e2011";

function success(data: unknown) {
  return { data, meta: { requestId: firstIdempotencyKey, version: 1 } };
}

async function mockOfflineSession(page: Page) {
  let ownerId = ownerA;
  let failFirstPost = true;
  const postKeys: string[] = [];
  const postCommands: Record<string, unknown>[] = [];
  const acceptedByKey = new Map<string, Record<string, unknown>>();
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    if (pathname === "/api/v1/config/public") {
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
    if (pathname === "/api/v1/session") {
      await route.fulfill({ json: success({ authenticated: true, userId: ownerId, expiresAt: "2026-10-24T18:00:00Z" }) });
      return;
    }
    if (pathname === "/api/v1/me") {
      await route.fulfill({ json: success({ profile: {
        userId: ownerId,
        displayName: ownerId === ownerA ? "Pemilik Offline A" : "Pemilik Offline B",
        locale: "id-ID",
        timezone: "Asia/Jakarta",
        preferredCurrency: "IDR",
        accountStatus: "active",
        onboardingAt: "2026-10-01T00:00:00Z",
        role: "user",
      }, role: "user" }) });
      return;
    }
    if (pathname === "/api/v1/wallets") {
      await route.fulfill({ json: success(ownerId === ownerA ? [{
        id: walletA,
        name: "Dompet Pribadi A",
        type: "bank",
        currency: "IDR",
        balanceMinor: "500000",
        archivedAt: null,
        createdAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-24T00:00:00Z",
      }] : [{
        id: walletB,
        name: "Dompet Pribadi B",
        type: "cash",
        currency: "IDR",
        balanceMinor: "25000",
        archivedAt: null,
        createdAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-24T00:00:00Z",
      }]) });
      return;
    }
    if (pathname === "/api/v1/categories") {
      await route.fulfill({ json: success([]) });
      return;
    }
    if (pathname === "/api/v1/transactions" && request.method() === "POST") {
      const command = request.postDataJSON() as Record<string, unknown>;
      const key = request.headers()["idempotency-key"] ?? "";
      postKeys.push(key);
      postCommands.push(command);
      if (!acceptedByKey.has(key)) {
        acceptedByKey.set(key, {
          id: firstIdempotencyKey,
          kind: command.kind,
          status: "posted",
          amountMinor: command.amountMinor,
          currency: "IDR",
          walletId: command.walletId,
          destinationWalletId: null,
          categoryId: null,
          effectiveAt: command.effectiveAt,
          timezone: command.timezone,
          negativeBalanceConfirmed: false,
        });
      }
      if (failFirstPost) {
        failFirstPost = false;
        // Simulate the origin committing before its response is lost upstream.
        await route.fulfill({ status: 503, json: { error: { code: "DEPENDENCY_UNAVAILABLE", message: "Data sementara tidak dapat dijangkau.", requestId: firstIdempotencyKey } } });
        return;
      }
      await route.fulfill({ json: success(acceptedByKey.get(key)) });
      return;
    }
    if (pathname === "/api/v1/transactions") {
      await route.fulfill({ json: success({ items: [], page: { hasMore: false, nextCursor: null } }) });
      return;
    }
    await route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND", message: "Not found", requestId: firstIdempotencyKey } } });
  });
  await page.route("**/api/auth/sign-out", (route) => route.fulfill({ json: { success: true } }));
  return {
    setOwner(owner: string) { ownerId = owner; },
    postKeys,
    postCommands,
    postedEventCount() { return acceptedByKey.size; },
  };
}

test("encrypted offline draft requires explicit posting and retry reuses one idempotency key", async ({ page }) => {
  const api = await mockOfflineSession(page);
  await page.goto("/app/offline");
  await expect(page.getByRole("heading", { name: "Buat kunci perangkat" })).toBeVisible();
  await page.getByLabel("Frasa sandi perangkat", { exact: true }).fill("offline key phrase for qa");
  await page.getByLabel("Ulangi frasa sandi", { exact: true }).fill("offline key phrase for qa");
  await page.getByRole("button", { name: "Buat kunci", exact: true }).click();
  await expect(page.getByText("Kunci perangkat terbuka", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Transaksi", exact: true }).click();
  await page.getByRole("button", { name: "Catat transaksi", exact: true }).click();
  await expect(page.getByLabel("Nominal rupiah", { exact: true })).toBeVisible();
  await page.context().setOffline(true);
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);
  await page.getByRole("combobox", { name: "Jenis", exact: true }).selectOption("income");
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("9007199254740993");
  await page.getByLabel("Catatan (opsional)", { exact: true }).fill("Pemasukan offline privat");
  await page.getByRole("button", { name: "Simpan draf offline", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saldo belum berubah");
  expect(api.postKeys).toHaveLength(0);

  await page.getByRole("link", { name: "Draf offline", exact: true }).click();
  await expect(page.locator(".offline-connection")).toHaveText("Offline");
  await expect(page.locator(".offline-draft-main")).toContainText("Rp9.007.199.254.740.993");
  const plaintextAtRest = await page.evaluate(async () => {
    const request = indexedDB.open("venfinance-private-offline-v1");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const records = await Promise.all(Array.from(db.objectStoreNames, (name) => new Promise<unknown[]>((resolve, reject) => {
      const transaction = db.transaction(name, "readonly");
      const get = transaction.objectStore(name).getAll();
      get.onsuccess = () => resolve(get.result as unknown[]);
      get.onerror = () => reject(get.error);
    })));
    db.close();
    return JSON.stringify(records);
  });
  expect(plaintextAtRest).not.toContain("Pemasukan offline privat");
  expect(plaintextAtRest).not.toContain("9007199254740993");

  await page.evaluate(async () => {
    const request = indexedDB.open("venfinance-private-offline-v1");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("drafts", "readwrite");
      const store = transaction.objectStore("drafts");
      const get = store.getAll();
      get.onsuccess = () => {
        for (const row of get.result as Record<string, unknown>[]) store.put({ ...row, status: "syncing" });
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  });
  await page.context().setOffline(false);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Buka kunci draf" })).toBeVisible();
  await page.getByLabel("Frasa sandi perangkat", { exact: true }).fill("offline key phrase for qa");
  await page.getByRole("button", { name: "Buka draf", exact: true }).click();
  await expect(page.locator(".offline-draft-status")).toContainText("Tersimpan di perangkat");
  await expect(page.getByRole("button", { name: "Tinjau & catat", exact: true })).toBeVisible();
  expect(api.postKeys).toHaveLength(0);
  await page.getByRole("button", { name: "Tinjau & catat", exact: true }).click();
  await expect(page.getByRole("group", { name: "Konfirmasi pencatatan transaksi" })).toContainText("mengubah saldo server");
  await page.getByRole("button", { name: "Catat transaksi", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Draf tetap tersimpan");
  await expect.poll(() => api.postKeys.length).toBe(1);
  expect(api.postedEventCount()).toBe(1);
  await page.getByRole("button", { name: "Catat transaksi", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Transaksi berhasil dicatat");
  expect(api.postKeys).toHaveLength(2);
  expect(api.postedEventCount()).toBe(1);
  expect(api.postKeys[1]).toMatch(/^[0-9a-f-]{36}$/i);
  expect(api.postKeys[1]).toBe(api.postKeys[0]);
  expect(api.postCommands[0]).toMatchObject({
    kind: "income",
    walletId: walletA,
    amountMinor: "9007199254740993",
    timezone: "Asia/Jakarta",
    note: "Pemasukan offline privat",
  });
});

test("device unlock can recover local drafts after sign-out without exposing them to another owner", async ({ page }) => {
  const api = await mockOfflineSession(page);
  await page.goto("/app/offline");
  await expect(page.getByRole("heading", { name: "Buat kunci perangkat" })).toBeVisible();
  await page.getByLabel("Frasa sandi perangkat", { exact: true }).fill("offline key phrase for qa");
  await page.getByLabel("Ulangi frasa sandi", { exact: true }).fill("offline key phrase for qa");
  await page.getByRole("button", { name: "Buat kunci", exact: true }).click();
  await expect(page.getByText("Kunci perangkat terbuka", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Transaksi", exact: true }).click();
  await page.getByRole("button", { name: "Catat transaksi", exact: true }).click();
  await page.getByRole("combobox", { name: "Jenis", exact: true }).selectOption("expense");
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("25000");
  await page.getByLabel("Catatan (opsional)", { exact: true }).fill("Catatan untuk ruang offline A");
  await page.getByRole("button", { name: "Simpan draf offline", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saldo belum berubah");

  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("link", { name: "Buka draf offline di perangkat ini", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Buka kunci draf" })).toBeVisible();
  await page.getByLabel("Frasa sandi perangkat", { exact: true }).fill("wrong local unlock phrase");
  await page.getByRole("button", { name: "Buka draf", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Frasa sandi tidak cocok");
  await page.getByLabel("Frasa sandi perangkat", { exact: true }).fill("offline key phrase for qa");
  await page.getByRole("button", { name: "Buka draf", exact: true }).click();
  await expect(page.getByText("Catatan untuk ruang offline A", { exact: true })).toBeVisible();
  await expect(page.getByText("Catat saat offline", { exact: true })).toBeVisible();

  api.setOwner(ownerB);
  await page.goto("/app/offline");
  await expect(page.getByRole("heading", { name: "Buat kunci perangkat" })).toBeVisible();
  await expect(page.getByText("Catatan untuk ruang offline A", { exact: true })).toHaveCount(0);
  expect(api.postKeys).toHaveLength(0);
});
