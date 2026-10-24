import {
  minorAmountSchema,
  signedMinorAmountSchema,
  workerHeartbeatSchema,
} from "@venfinance/contracts";

export function formatIdr(
  amount: string,
  locale: "id-ID" | "en-US" = "id-ID",
): string {
  const value = BigInt(signedMinorAmountSchema.parse(amount));
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
    .format(value)
    .replace(/\u00a0/g, "")
    .replace(/^-/, "−");
}

export function sumMinor(values: readonly string[]): string {
  return signedMinorAmountSchema.parse(
    values
      .reduce(
        (sum, value) => sum + BigInt(signedMinorAmountSchema.parse(value)),
        0n,
      )
      .toString(),
  );
}

export function subtractMinor(a: string, b: string): string {
  return signedMinorAmountSchema.parse(
    (
      BigInt(signedMinorAmountSchema.parse(a)) -
      BigInt(signedMinorAmountSchema.parse(b))
    ).toString(),
  );
}

/** IDR form syntax, never Number()/parseFloat(). Commas are not IDR decimals. */
export function parseIdrInput(raw: string): string {
  const value = raw.trim().replace(/^Rp\s*/i, "");
  if (!/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:\.\d{3})+)$/.test(value)) {
    throw new Error("Masukkan rupiah bulat, misalnya 10000 atau 10.000.");
  }
  return minorAmountSchema.parse(value.replaceAll(".", ""));
}

/** A visual percentage only; it is never used to calculate money. */
export function progressPercent(used: string, planned: string): number {
  const total = BigInt(minorAmountSchema.parse(planned));
  if (total === 0n) return 0;
  const ratio = (BigInt(minorAmountSchema.parse(used)) * 100n) / total;
  return Number(ratio > 100n ? 100n : ratio);
}

export function daysInMonth(year: number, month: number): number {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  )
    throw new Error("Periode tidak valid.");
  if (month === 2)
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Freshness policy must be supplied by the operator; there is no invented TTL. */
export function assessHeartbeat(payload: unknown, nowMs: number, maxAgeMs: number) {
  if (!Number.isSafeInteger(nowMs) || !Number.isSafeInteger(maxAgeMs) || maxAgeMs <= 0) throw new Error('Invalid heartbeat freshness policy');
  const parsed = workerHeartbeatSchema.safeParse(payload);
  if (!parsed.success) return { state: 'unknown' as const, checkedAt: null };
  const age = nowMs - Date.parse(parsed.data.checkedAt);
  if (age < 0 || age > maxAgeMs) return { state: 'unknown' as const, checkedAt: parsed.data.checkedAt };
  return { state: parsed.data.state, checkedAt: parsed.data.checkedAt };
}
