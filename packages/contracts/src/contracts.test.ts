import { describe, expect, it } from "vitest";
import {
  apiErrorSchema,
  manualExpenseSchema,
  minorAmountSchema,
  paginationSchema,
  positiveMinorAmountSchema,
  signedMinorAmountSchema,
  timezoneSchema,
  workerHeartbeatSchema,
} from "./index";

describe("exact money transport (FIN-010 / TRUST-001)", () => {
  it('rejects oversized or nonnumeric payloads without throwing from a BigInt refinement', () => {
    for (const value of ['9'.repeat(100000), 'not-money', '--1']) {
      expect(minorAmountSchema.safeParse(value).success).toBe(false);
      expect(signedMinorAmountSchema.safeParse(value).success).toBe(false);
    }
  });
  it.each(["0", "1", "8000", "9007199254740993", "9223372036854775807"])(
    "preserves %s exactly",
    (value) => {
      expect(minorAmountSchema.parse(value)).toBe(value);
    },
  );
  it.each([
    8000,
    0.1,
    "8.000",
    "1e3",
    "01",
    "-1",
    "1.5",
    "",
    " 1",
    "9223372036854775808",
  ])("rejects malformed/overflow input %s", (value) => {
    expect(minorAmountSchema.safeParse(value).success).toBe(false);
  });
  it("separates positive input from signed computed balances", () => {
    expect(positiveMinorAmountSchema.safeParse("0").success).toBe(false);
    expect(signedMinorAmountSchema.parse("-1000")).toBe("-1000");
    expect(signedMinorAmountSchema.safeParse("-0").success).toBe(false);
  });
  it("rejects caller-selected identity and role", () => {
    const payload = {
      kind: "expense",
      amountMinor: "10000",
      currency: "IDR",
      walletId: "d63cc8c7-5c5c-4d31-9cc1-239150ecce9a",
      effectiveAt: "2026-10-24T12:00:00+07:00",
      timezone: "Asia/Jakarta",
    };
    expect(manualExpenseSchema.safeParse(payload).success).toBe(true);
    expect(
      manualExpenseSchema.safeParse({
        ...payload,
        userId: "victim",
        role: "superuser",
      }).success,
    ).toBe(false);
  });
});

describe("shared protocol", () => {
  it('versioned heartbeat metadata rejects raw PII and invalid states', () => {
    const heartbeat = { schemaVersion: 1, service: 'finance-worker', instanceId: 'd63cc8c7-5c5c-4d31-9cc1-239150ecce9a', checkedAt: '2026-10-24T04:00:00Z', state: 'available' };
    expect(workerHeartbeatSchema.safeParse(heartbeat).success).toBe(true);
    expect(workerHeartbeatSchema.safeParse({ ...heartbeat, phone: 'synthetic-private-content' }).success).toBe(false);
    expect(workerHeartbeatSchema.safeParse({ ...heartbeat, state: 'always-healthy' }).success).toBe(false);
  });
  it("checks timezone and bounded pagination", () => {
    expect(timezoneSchema.safeParse("Not/AZone").success).toBe(false);
    expect(timezoneSchema.parse("Asia/Makassar")).toBe("Asia/Makassar");
    expect(paginationSchema.parse({})).toEqual({ limit: 20 });
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });
  it("requires stable codes and safe error shape", () => {
    expect(
      apiErrorSchema.safeParse({
        error: { code: "SQL_FAILURE", message: "query", requestId: "bad" },
      }).success,
    ).toBe(false);
  });
});
