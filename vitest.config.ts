import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/*.test.ts",
      "apps/edge/**/*.test.ts",
      "apps/web/src/demo/**/*.test.ts",
      "qa/fixtures/**/*.test.ts",
    ],
    exclude: ["**/node_modules/**", "**/dist/**"],
    environment: "node",
    testTimeout: 10000,
  },
});
