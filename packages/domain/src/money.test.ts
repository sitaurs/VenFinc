import { describe, expect, it } from "vitest";
import {
  daysInMonth,
  formatIdr,
  parseIdrInput,
  progressPercent,
  subtractMinor,
  sumMinor,
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
});
