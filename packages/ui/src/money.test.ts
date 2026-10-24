import { describe, expect, it } from "vitest";
import { formatRupiah } from "./index";

describe("formatRupiah", () => {
  it("keeps rupiah exact beyond JavaScript's safe integer range", () => {
    expect(formatRupiah("9007199254740993")).toContain("9.007.199.254.740.993");
  });

  it("formats negative values without converting through floating point", () => {
    expect(formatRupiah(-3250n)).toContain("3.250");
    expect(formatRupiah(-3250n)).toMatch(/-/);
  });

  it("rejects decimal and non-numeric strings", () => {
    expect(() => formatRupiah("12.5")).toThrow(/exact integer/);
    expect(() => formatRupiah("Rp 12.500")).toThrow(/exact integer/);
  });
});
