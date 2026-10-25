import { createHash } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";

const requestId = "90bb7219-cbb1-4a49-9c72-d00e05048d77";
const proofId = "b7e62e84-91b9-4a76-b811-74216f068108";
const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==",
  "base64",
);

const success = (data: unknown) => ({ data, meta: { requestId, version: 1 } });

async function mockPrivateSession(page: Page, proofUploadsAvailable: boolean) {
  const proofRequests: Array<{ path: string; method: string }> = [];
  let intentBody: Record<string, unknown> | undefined;
  let uploadedBody: Buffer | undefined;
  let uploadedType = "";

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path.startsWith("/api/v1/proofs")) proofRequests.push({ path, method: request.method() });

    if (path === "/api/v1/config/public") {
      await route.fulfill({ json: success({
        authAvailable: true,
        registrationOpen: false,
        personalWhatsAppAvailable: false,
        aiAvailable: false,
        proofUploadsAvailable,
        defaultLocale: "id-ID",
        supportedLocales: ["id-ID", "en-US"],
      }) });
      return;
    }
    if (path === "/api/v1/session") {
      await route.fulfill({ json: success({
        authenticated: true,
        userId: "qa-owner-a",
        expiresAt: "2026-10-26T00:00:00Z",
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
          onboardingAt: "2026-10-24T00:00:00Z",
          role: "user",
        },
        role: "user",
      }) });
      return;
    }
    if (path === "/api/v1/proofs/uploads" && request.method() === "POST") {
      intentBody = request.postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, json: success({
        id: proofId,
        uploadToken: "a".repeat(43),
        uploadPath: `/api/v1/proofs/uploads/${proofId}/content`,
        uploadExpiresAt: "2026-10-25T03:10:00.000Z",
      }) });
      return;
    }
    if (path === `/api/v1/proofs/uploads/${proofId}/content` && request.method() === "PUT") {
      uploadedBody = request.postDataBuffer() ?? undefined;
      uploadedType = request.headers()["content-type"] ?? "";
      expect(request.headers()["x-proof-upload-token"]).toBe("a".repeat(43));
      await route.fulfill({ status: 201, json: success({ id: proofId, status: "uploaded" }) });
      return;
    }
    if (path === `/api/v1/proofs/uploads/${proofId}/complete` && request.method() === "POST") {
      await route.fulfill({ json: success({ id: proofId, status: "stored" }) });
      return;
    }
    if (path === `/api/v1/proofs/${proofId}` && request.method() === "DELETE") {
      await route.fulfill({ json: success({ id: proofId, status: "deleted" }) });
      return;
    }
    await route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND", message: "Not found", requestId } } });
  });

  return {
    proofRequests,
    intentBody: () => intentBody,
    uploadedBody: () => uploadedBody,
    uploadedType: () => uploadedType,
  };
}

test("proof upload remains local and offers manual entry while private storage is disabled", async ({ page }, testInfo) => {
  const api = await mockPrivateSession(page, false);
  await page.goto("/app/review/upload");
  await expect(page.getByRole("heading", { name: "Unggah & proses bukti", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("retensi dan penghapusan otomatis diverifikasi");
  await page.getByLabel("Pilih file bukti", { exact: true }).setInputFiles({
    name: "receipt.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });
  await expect(page.getByText("receipt.png", { exact: true })).toBeVisible();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("button", { name: "Kirim bukti berikutnya", exact: true })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Tambah manual", exact: true })).toHaveAttribute("href", "/app/transactions/new");

  for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `overflow at ${width}px`).toBeLessThanOrEqual(width);
    if (width === 360) await page.screenshot({ path: testInfo.outputPath("proof-upload-360.png"), fullPage: true });
  }
  expect(api.proofRequests.filter((request) => request.method !== "GET")).toEqual([]);
});

test("proof upload requires consent, re-encodes locally, verifies exact bytes, and never posts a transaction", async ({ page }) => {
  const api = await mockPrivateSession(page, true);
  await page.goto("/app/review/upload");
  await page.getByLabel("Pilih file bukti", { exact: true }).setInputFiles({
    name: "private-receipt.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });
  const submit = page.getByRole("button", { name: "Kirim bukti berikutnya", exact: true });
  await expect(submit).toBeDisabled();
  await page.getByRole("checkbox").check();
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page.getByText("Tersimpan privat · belum dianalisis", { exact: true })).toBeVisible();
  expect(api.intentBody()).toMatchObject({ contentType: "image/webp", consentAccepted: true });
  expect(api.intentBody()?.sizeBytes).toBeGreaterThan(0);
  expect(api.intentBody()?.sha256).toBe(createHash("sha256").update(api.uploadedBody() ?? Buffer.alloc(0)).digest("hex"));
  expect(api.intentBody()).not.toHaveProperty("filename");
  expect(api.uploadedType()).toBe("image/webp");
  expect(api.proofRequests.map((request) => request.path)).toContain(`/api/v1/proofs/uploads/${proofId}/complete`);
  expect(api.proofRequests.some((request) => request.path === "/api/v1/transactions")).toBe(false);

  await page.getByRole("button", { name: "Hapus bukti", exact: true }).click();
  await expect(page.getByText("Belum ada bukti di antrean.", { exact: true })).toBeVisible();
  expect(api.proofRequests.at(-1)).toEqual({ path: `/api/v1/proofs/${proofId}`, method: "DELETE" });
});
