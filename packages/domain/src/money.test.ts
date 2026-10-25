import { describe, expect, it } from "vitest";
import {
  daysInMonth,
  formatIdr,
  monthBounds,
  parseIdrInput,
  progressPercent,
  subtractMinor,
  sumMinor,
  shiftMonth,
} from "./index";

describe("exact-money foundation", () => {
  it("retains integers beyond Number safe precision", () => {
    expect(sumMinor(["9007199254740993", "7"])).toBe("9007199254741000");
    expect(subtractMinor("9007199254740993", "9007199254740992")).toBe("1");
    expect(formatIdr("9007199254740993")).toContain("9.007.199.254.740.993");
  });
  it("shows overspend without changing actual money", () => {
    expect(subtractMinor("7000", "8000")).toBe("-1000");
    expect(formatIdr("-1000")).toBe("−Rp1.000");
    expect(progressPercent("31000", "30000")).toBe(100);
    expect(progressPercent("-5000", "30000")).toBe(0);
  });
  it("parses explicit whole rupiah and rejects ambiguous formats", () => {
    expect(parseIdrInput("Rp 10.000")).toBe("10000");
    for (const value of ["1,2", "10,000", "1.00", "-100", "1e5", "01"])
      expect(() => parseIdrInput(value)).toThrow();
  });
  it.each([
    [2025, 2, 28],
    [2024, 2, 29],
    [2026, 4, 30],
    [2026, 10, 31],
    [1900, 2, 28],
    [2000, 2, 29],
  ])("uses calendar days for %i/%i", (year, month, days) => {
    expect(daysInMonth(year, month)).toBe(days);
    expect(sumMinor(Array.from({ length: days }, () => "10000"))).toBe(
      (BigInt(days) * 10000n).toString(),
    );
  });
  it.each([
    ["2024-02", "2024-02-01", "2024-02-29"],
    ["2025-02", "2025-02-01", "2025-02-28"],
    ["2026-04", "2026-04-01", "2026-04-30"],
    ["2026-10", "2026-10-01", "2026-10-31"],
  ])("builds exact month period for %s", (month, startsOn, endsOn) => {
    expect(monthBounds(month)).toEqual({ startsOn, endsOn });
  });
  it("moves calendar months without day overflow", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(() => monthBounds("2026-13")).toThrow();
  });
});
