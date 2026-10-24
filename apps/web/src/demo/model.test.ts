import { describe, expect, it } from "vitest";
import {
  demoReducer,
  fixtureEntries,
  initialDemoState,
  summarize,
  type DemoEntry,
} from "./model";
const expense: DemoEntry = {
  id: "retry-command",
  kind: "expense",
  title: "Test",
  titleEn: "Test",
  amountMinor: "10000",
  wallet: "cash",
  category: "food",
  date: "2026-10-24",
};
describe("isolated synthetic demo", () => {
  it('rejects aggregate overflow atomically, while an unposted draft remains separate', () => {
    expect(() => demoReducer(initialDemoState, { type: 'record', entry: { ...expense, amountMinor: '9223372036854775807' } })).toThrow();
    expect(summarize(initialDemoState.entries).balanceMinor).toBe('650000');
    expect(demoReducer(initialDemoState, { type: 'draft', entry: { ...expense, amountMinor: '9223372036854775807' } }).drafts).toHaveLength(1);
  });
  it('rejects a replay whose payload differs from the original command', () => {
    const state = demoReducer(initialDemoState, { type: 'record', entry: expense });
    expect(() => demoReducer(state, { type: 'record', entry: { ...expense, amountMinor: '20000' } })).toThrow('Idempotency key reused');
    expect(summarize(state.entries).balanceMinor).toBe('640000');
  });
  it("reconciles every wallet with source fixture, income and expense", () => {
    expect(summarize(fixtureEntries)).toMatchObject({
      balanceMinor: "650000",
      incomeMinor: "1200000",
      expenseMinor: "920000",
      remainingMinor: "280000",
      walletBalances: { cash: "75000", bank: "450000", ewallet: "125000" },
      categorySpending: {
        food: "330000",
        transport: "80000",
        snacks: "23000",
        other: "487000",
      },
    });
  });
  it("a saved draft and a provisional receipt do not change balances", () => {
    const next = demoReducer(initialDemoState, {
      type: "draft",
      entry: expense,
    });
    expect(summarize(next.entries).balanceMinor).toBe("650000");
    expect(next.drafts).toHaveLength(1);
    expect(summarize(next.entries).expenseMinor).toBe("920000");
  });
  it("100 replays of a confirmed sample action affect the demo exactly once", () => {
    let state = initialDemoState;
    for (let i = 0; i < 100; i++)
      state = demoReducer(state, { type: "record", entry: expense });
    expect(summarize(state.entries).balanceMinor).toBe("640000");
    expect(state.entries).toHaveLength(fixtureEntries.length + 1);
  });
  it("a transfer moves the exact amount without income or consumption effects", () => {
    const state = demoReducer(initialDemoState, {
      type: "record",
      entry: {
        ...expense,
        kind: "transfer",
        wallet: "bank",
        toWallet: "cash",
        amountMinor: "50000",
      },
    });
    expect(summarize(state.entries)).toMatchObject({
      balanceMinor: "650000",
      incomeMinor: "1200000",
      expenseMinor: "920000",
      walletBalances: { bank: "400000", cash: "125000" },
    });
  });
  it("rejects malformed money and transfers to the same wallet", () => {
    expect(() =>
      demoReducer(initialDemoState, {
        type: "record",
        entry: { ...expense, amountMinor: "1.5" },
      }),
    ).toThrow();
    expect(() =>
      demoReducer(initialDemoState, {
        type: "record",
        entry: { ...expense, kind: "transfer", toWallet: "cash" },
      }),
    ).toThrow();
  });
});
