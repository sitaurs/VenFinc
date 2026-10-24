import { expect, test, type Page } from "@playwright/test";

async function openComponentFixture(page: Page) {
  await page.goto("/__qa/ui-components");
  await expect(page.getByRole("heading", { name: "Komponen VenFinance" })).toBeVisible();
}

test("P4-002 buttons expose disabled/loading, hover, and keyboard focus states", async ({
  page,
}) => {
  await openComponentFixture(page);

  const save = page.getByRole("button", { name: "Simpan perubahan" });
  const unavailable = page.getByRole("button", {
    name: "Hapus tidak tersedia",
  });
  const loading = page.getByRole("button", {
    name: "Simpan sedang diproses",
  });
  const loadingLink = page.getByRole("link", {
    name: "Buka demo sedang diproses",
  });

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(save).toBeFocused();
  await expect
    .poll(() => save.evaluate((element) => getComputedStyle(element).outlineWidth))
    .toBe("3px");

  await expect(save).toBeEnabled();
  await expect(unavailable).toBeDisabled();
  await expect(loading).toBeDisabled();
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(loadingLink).toHaveAttribute("aria-disabled", "true");
  await expect(loadingLink).toHaveAttribute("aria-busy", "true");
  await loadingLink.focus();
  await loadingLink.press("Enter");
  await expect(page).toHaveURL(/__qa\/ui-components$/);
  await expect(page.locator("body")).not.toHaveAttribute(
    "data-navigation-attempted",
    "true",
  );

  await save.hover();
  await expect
    .poll(() => save.evaluate((element) => getComputedStyle(element).boxShadow))
    .not.toBe("none");
});

test("P4-002 navigation names its landmark and marks the current page", async ({
  page,
}) => {
  await openComponentFixture(page);

  const navigation = page.getByRole("navigation", {
    name: "Navigasi komponen",
  });
  await expect(navigation).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Ringkasan" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    navigation.getByRole("link", { name: "Status" }),
  ).not.toHaveAttribute("aria-current", "page");
});

test("P4-002 text fields connect labels, help, and validation errors", async ({
  page,
}) => {
  await openComponentFixture(page);

  const nickname = page.getByRole("textbox", { name: "Nama panggilan" });
  await expect(nickname).toHaveAttribute("aria-invalid", "true");
  await expect(nickname).toHaveAccessibleDescription(
    "Nama ini hanya tampil pada akunmu. Nama panggilan wajib diisi.",
  );
  await expect(
    page.getByText("Nama panggilan wajib diisi.", { exact: true }),
  ).toBeVisible();
});

test("P4-002 tabs support arrow keys and keep the selected panel associated", async ({
  page,
}) => {
  await openComponentFixture(page);

  const summary = page.getByRole("tab", { name: "Ringkasan" });
  const activity = page.getByRole("tab", { name: "Aktivitas" });
  await expect(summary).toHaveAttribute("aria-selected", "true");
  await summary.focus();
  await page.keyboard.press("ArrowRight");

  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveText("Konten aktivitas.");
});

test("P4-002 dialog opens from keyboard and returns focus after Escape", async ({
  page,
}) => {
  await openComponentFixture(page);

  const trigger = page.getByRole("button", { name: "Buka konfirmasi" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Konfirmasi tindakan" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("P4-002 exact money, masked privacy, status, toast, and skeleton semantics", async ({
  page,
}) => {
  await openComponentFixture(page);

  await expect(
    page.locator(".component-money-values").getByText(/9\.007\.199\.254\.740\.993/),
  ).toBeVisible();
  await expect(
    page.locator('.money[aria-label="Jumlah disembunyikan"]'),
  ).toHaveText("Rp ••••••");
  await expect(
    page.getByText("Menunggu verifikasi", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Perlu diperbaiki");
  await expect(page.getByRole("status").filter({ hasText: "Perubahan lokal disimpan." }))
    .toHaveAttribute("aria-live", "polite");

  const loadingRegion = page.getByRole("status", { name: "Memuat transaksi" });
  await expect(loadingRegion).toHaveAttribute("aria-busy", "true");
  const skeleton = loadingRegion.locator(".skeleton");
  await expect(skeleton).toHaveAttribute("aria-hidden", "true");
  await expect
    .poll(() => skeleton.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThan(0);
});

test("P4-006 charts expose exact values in a semantic table", async ({ page }) => {
  await openComponentFixture(page);
  await page.emulateMedia({ reducedMotion: "reduce" });

  const chart = page.getByRole("region", { name: "Arus kas uji" });
  const table = chart.getByRole("table", { name: "Nilai tepat arus kas uji" });
  await expect(chart.locator(".chart-visual")).toHaveAttribute("aria-hidden", "true");
  await expect(chart.locator(".chart-legend li").nth(0)).toHaveClass(
    /chart-tone-teal/,
  );
  await expect(chart.locator(".chart-legend li").nth(1)).toHaveClass(
    /chart-tone-pink/,
  );
  await expect(table.getByRole("columnheader", { name: "Arus kas" })).toBeVisible();
  await expect(table.getByRole("columnheader", { name: "Nominal" })).toBeVisible();
  await expect(
    table.getByRole("row", { name: /Pemasukan.*9\.007\.199\.254\.740\.993/ }),
  ).toBeVisible();
  await expect(
    table.getByRole("row", {
      name: /Pengeluaran.*[-−].*4\.000\.000\.000\.000\.000/,
    }),
  ).toBeVisible();

  const bars = chart.locator(".chart-bar");
  await expect(bars.nth(0)).toHaveAttribute("style", /width: 50%/);
  await expect(bars.nth(1)).toHaveAttribute("style", /width: 22\.2%/);
  await expect(bars.nth(1)).toHaveClass(/chart-bar-negative/);
  await expect(bars.nth(2)).toHaveAttribute("style", /width: 0%/);
  await expect(bars.first()).toHaveCSS("animation-name", "none");

  const singlePointChart = page.getByRole("region", { name: "Grafik satu titik" });
  await expect(
    singlePointChart.getByText("Grafik memerlukan dua nilai pembanding."),
  ).toBeVisible();
  await expect(singlePointChart.locator(".chart-visual")).toHaveCount(0);
  await expect(singlePointChart.getByRole("table", { name: "Satu nilai uji" })).toBeVisible();

  const emptyChart = page.getByRole("region", { name: "Grafik kosong" });
  await expect(emptyChart.getByText("Belum ada nilai untuk ditampilkan.")).toBeVisible();
  await expect(emptyChart.getByRole("table")).toHaveCount(0);
});

for (const width of [320, 390, 1440]) {
  test(`@visual P4-002 component gallery fits ${width}px`, async (
    { page },
    testInfo,
  ) => {
    await page.setViewportSize({ width, height: 900 });
    await openComponentFixture(page);
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
    await page.screenshot({
      path: testInfo.outputPath(`ui-components-${width}.png`),
      fullPage: true,
    });
  });
}
