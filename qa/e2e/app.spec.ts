import { test, expect, type Page } from "@playwright/test";
async function openDemo(page: Page) {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Demo interaktif", exact: true }),
  ).toBeVisible();
}
test("manual sample entry updates exact balance; draft and reload are isolated", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(request.method()) &&
      request.url().includes("/api/v1/")
    )
      writes.push(request.url());
  });
  await openDemo(page);
  const balance = page.locator(".balance-card .balance-value");
  await expect(balance).toHaveText("Rp650.000");
  await page.getByRole("button", { name: "Catat contoh", exact: true }).click();
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("10000");
  await page.getByRole("button", { name: "Simpan draf", exact: true }).click();
  await expect(balance).toHaveText("Rp650.000");
  await expect(page.getByRole("status")).toContainText("Saldo tidak berubah");
  await page.getByRole("button", { name: "Catat contoh", exact: true }).click();
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("10.000");
  await page
    .getByLabel("Catatan (opsional)", { exact: true })
    .fill("Makan test");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Catat contoh", exact: true })
    .click();
  await expect(balance).toHaveText("Rp640.000");
  await page.reload();
  await expect(balance).toHaveText("Rp650.000");
  expect(writes).toEqual([]);
});
test('large exact amounts remain readable, and aggregate overflow preserves the form', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Catat contoh', exact: true }).click();
  const input = page.getByLabel('Nominal rupiah', { exact: true });
  await input.fill('9223372036854775807');
  await page.getByRole('dialog').getByRole('button', { name: 'Catat contoh', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('batas penyimpanan');
  await expect(input).toHaveValue('9223372036854775807');
  await page.getByRole('dialog').getByRole('button', { name: 'Pemasukan', exact: true }).click();
  await input.fill('9007199254740993');
  await page.getByRole('dialog').getByRole('button', { name: 'Catat contoh', exact: true }).click();
  await expect(page.locator('.balance-card .balance-value')).toHaveText('Rp9.007.199.255.390.993');
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
test("invalid amounts retain input; dialog supports keyboard close and focus return", async ({
  page,
}) => {
  await openDemo(page);
  const add = page.getByRole("button", { name: "Catat contoh", exact: true });
  await add.click();
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("1.50");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Catat contoh", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("rupiah bulat");
  await expect(page.getByLabel("Nominal rupiah", { exact: true })).toHaveValue(
    "1.50",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(add).toBeFocused();
});
test("search and combined filters show a real empty state and can reset", async ({
  page,
}) => {
  await page.goto("/demo/transactions");
  await page.getByLabel("Cari transaksi", { exact: true }).fill("Makan siang");
  await expect(page.locator(".transaction-row")).toHaveCount(1);
  await page
    .getByLabel("Jenis transaksi", { exact: true })
    .selectOption("income");
  await expect(
    page.getByRole("heading", { name: "Tidak ada transaksi yang cocok" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hapus filter" }).click();
  await expect(page.locator(".transaction-row")).toHaveCount(14);
});
test("private routes stay closed and public service status does not fabricate health", async ({
  page,
  request,
}) => {
  for (const route of ["/app", "/admin", "/system"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByText("Akses akun belum dibuka", { exact: true }),
    ).toBeVisible();
  }
  const response = await request.get("/api/v1/transactions/other-owner", {
    headers: {
      "X-Role": "superuser",
      "X-User-Id": "victim",
      "Sec-Fetch-Mode": "navigate",
    },
  });
  expect(response.status()).toBe(401);
  expect((await response.json()).error.code).toBe("AUTH_REQUIRED");
  expect(response.headers()["cache-control"]).toContain("no-store");
  await page.goto("/status");
  await expect(
    page.getByText("Belum dikonfigurasi", { exact: true }),
  ).toHaveCount(4);
  await expect(
    page.getByText("Belum diverifikasi", { exact: true }),
  ).toBeVisible();
});
test("theme and language persist without persisting financial example data", async ({
  page,
}) => {
  await openDemo(page);
  await page.getByRole("button", { name: "Ganti tema" }).click();
  await page.getByRole("button", { name: "Ganti bahasa" }).click();
  await expect(
    page.getByRole("heading", { name: "Interactive demo" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.sort()).toEqual([
    "venfinance:preferences:locale",
    "venfinance:preferences:theme",
  ]);
});
test("open demo remains usable offline without claiming sync or provider status", async ({
  page,
  context,
}) => {
  await openDemo(page);
  await context.setOffline(true);
  await expect(page.getByRole("status")).toContainText(
    "Perangkat sedang offline",
  );
  await page.getByRole("button", { name: "Catat contoh", exact: true }).click();
  await page.getByLabel("Nominal rupiah", { exact: true }).fill("5000");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Catat contoh", exact: true })
    .click();
  await expect(page.locator(".balance-card .balance-value")).toHaveText(
    "Rp645.000",
  );
  await context.setOffline(false);
});
test("navigation has no browser errors across implemented demo routes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "",
    "/transactions",
    "/budgets",
    "/wallets",
    "/goals",
    "/debts",
    "/recurring",
    "/insights",
    "/review",
    "/settings",
    "/whatsapp",
  ]) {
    await page.goto(`/demo${path}`);
    await expect(page.locator("main h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
for (const width of [320, 360, 361, 390, 768, 1024, 1211, 1440, 1920]) {
  test(`@visual layout capture ${width}px; source comparison remains separate`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/demo",
      "/demo/transactions",
      "/demo/budgets",
      "/demo/settings",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("main h1")).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
      await page.screenshot({
        path: testInfo.outputPath(
          `${route.replaceAll("/", "_") || "landing"}-${width}.png`,
        ),
        fullPage: true,
      });
    }
    if (width <= 900)
      await expect(
        page.getByRole("navigation", { name: "Navigasi demo mobile" }),
      ).toBeVisible();
    else
      await expect(
        page.getByRole("navigation", { name: "Navigasi demo desktop" }),
      ).toBeVisible();
    await page.getByRole("button", { name: "Ganti tema" }).click();
    await page.getByRole("button", { name: "Ganti bahasa" }).click();
    await expect(
      page.getByRole("heading", { name: "More", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`settings-dark-en-${width}.png`),
      fullPage: true,
    });
    const font = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font).toContain("Inter");
  });
}
