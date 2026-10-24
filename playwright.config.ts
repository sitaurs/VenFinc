import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./qa/e2e",
  timeout: 60_000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "qa/e2e-results.json" }],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1050 },
      },
    },
  ],
  webServer: {
    command: "./tools/pnpm.sh dev",
    url: "http://127.0.0.1:5173/api/v1/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
