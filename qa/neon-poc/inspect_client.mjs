import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/opt/google/chrome/chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const pageErrors = [];
const requestFailures = [];
page.on("pageerror", (error) => pageErrors.push(error.message.split("\n")[0]));
page.on("requestfailed", (request) => {
  const url = new URL(request.url());
  requestFailures.push(`${url.origin}${url.pathname}: ${request.failure()?.errorText ?? "failed"}`);
});

try {
  await page.goto("http://127.0.0.1:5173", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2_000);
  const state = await page.evaluate(() => ({
    title: document.title,
    resultText: document.querySelector("#result")?.textContent ?? null,
    clientAvailable: window.p0NeonAuth !== undefined,
    scripts: [...document.scripts].map((script) => script.src.split("?")[0]),
  }));
  process.stdout.write(
    `${JSON.stringify({ state, pageErrors, requestFailures })}\n`,
  );
} finally {
  await browser.close();
}
