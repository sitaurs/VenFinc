// Synthetic examples only. This module is lazy-loaded exclusively by /demo.
// It is never imported by the edge API or a private /app route.
import { sumMinor, subtractMinor } from "@venfinance/domain";
import {
  positiveMinorAmountSchema,
  localDateSchema,
} from "@venfinance/contracts";
export type CategoryId = "food" | "transport" | "snacks" | "other";
export type WalletId = "cash" | "bank" | "ewallet";
export type DemoEntry = {
  id: string;
  kind: "income" | "expense" | "transfer";
  title: string;
  titleEn: string;
  amountMinor: string;
  wallet: WalletId;
  toWallet?: WalletId;
  category: CategoryId;
  date: string;
};
export const categories: {
  id: CategoryId;
  name: string;
  nameEn: string;
  budgetMinor: string;
  color: string;
}[] = [
  {
    id: "food",
    name: "Makan",
    nameEn: "Food",
    budgetMinor: "400000",
    color: "peach",
  },
  {
    id: "transport",
    name: "Transportasi",
    nameEn: "Transport",
    budgetMinor: "120000",
    color: "mint",
  },
  {
    id: "snacks",
    name: "Jajan",
    nameEn: "Treats",
    budgetMinor: "30000",
    color: "pink",
  },
  {
    id: "other",
    name: "Lainnya",
    nameEn: "Other",
    budgetMinor: "650000",
    color: "lavender",
  },
];
export const wallets: {
  id: WalletId;
  name: string;
  nameEn: string;
  openingMinor: string;
  color: string;
}[] = [
  {
    id: "cash",
    name: "Tunai",
    nameEn: "Cash",
    openingMinor: "95000",
    color: "mint",
  },
  {
    id: "bank",
    name: "Rekening Bank",
    nameEn: "Bank account",
    openingMinor: "250000",
    color: "blue",
  },
  {
    id: "ewallet",
    name: "E-wallet",
    nameEn: "E-wallet",
    openingMinor: "25000",
    color: "lavender",
  },
];
export const fixtureEntries: readonly DemoEntry[] = [
  {
    id: "sample-01",
    kind: "income",
    title: "Pemasukan Oktober",
    titleEn: "October income",
    amountMinor: "1200000",
    wallet: "bank",
    category: "other",
    date: "2026-10-01",
  },
  {
    id: "sample-02",
    kind: "transfer",
    title: "Isi uang tunai",
    titleEn: "Cash withdrawal",
    amountMinor: "100000",
    wallet: "bank",
    toWallet: "cash",
    category: "other",
    date: "2026-10-02",
  },
  {
    id: "sample-03",
    kind: "transfer",
    title: "Isi E-wallet",
    titleEn: "E-wallet top-up",
    amountMinor: "150000",
    wallet: "bank",
    toWallet: "ewallet",
    category: "other",
    date: "2026-10-02",
  },
  {
    id: "sample-04",
    kind: "expense",
    title: "Kebutuhan bulanan",
    titleEn: "Monthly essentials",
    amountMinor: "437000",
    wallet: "bank",
    category: "other",
    date: "2026-10-03",
  },
  {
    id: "sample-05",
    kind: "expense",
    title: "Belanja bahan makanan",
    titleEn: "Groceries",
    amountMinor: "240000",
    wallet: "bank",
    category: "food",
    date: "2026-10-05",
  },
  {
    id: "sample-06",
    kind: "expense",
    title: "Transportasi bulanan",
    titleEn: "Monthly transport",
    amountMinor: "60000",
    wallet: "bank",
    category: "transport",
    date: "2026-10-10",
  },
  {
    id: "sample-07",
    kind: "expense",
    title: "Kopi",
    titleEn: "Coffee",
    amountMinor: "13000",
    wallet: "bank",
    category: "snacks",
    date: "2026-10-15",
  },
  {
    id: "sample-08",
    kind: "expense",
    title: "Makan minggu lalu",
    titleEn: "Previous meals",
    amountMinor: "62000",
    wallet: "cash",
    category: "food",
    date: "2026-10-19",
  },
  {
    id: "sample-09",
    kind: "expense",
    title: "Jajan kecil",
    titleEn: "A small treat",
    amountMinor: "2000",
    wallet: "cash",
    category: "snacks",
    date: "2026-10-21",
  },
  {
    id: "sample-10",
    kind: "expense",
    title: "Pulsa",
    titleEn: "Mobile credit",
    amountMinor: "50000",
    wallet: "ewallet",
    category: "other",
    date: "2026-10-22",
  },
  {
    id: "sample-11",
    kind: "expense",
    title: "Mie ayam",
    titleEn: "Chicken noodles",
    amountMinor: "18000",
    wallet: "cash",
    category: "food",
    date: "2026-10-22",
  },
  {
    id: "sample-12",
    kind: "expense",
    title: "Es teh",
    titleEn: "Iced tea",
    amountMinor: "8000",
    wallet: "cash",
    category: "snacks",
    date: "2026-10-23",
  },
  {
    id: "sample-13",
    kind: "expense",
    title: "Bensin",
    titleEn: "Fuel",
    amountMinor: "20000",
    wallet: "cash",
    category: "transport",
    date: "2026-10-23",
  },
  {
    id: "sample-14",
    kind: "expense",
    title: "Makan siang",
    titleEn: "Lunch",
    amountMinor: "10000",
    wallet: "cash",
    category: "food",
    date: "2026-10-23",
  },
];
export function summarize(entries: readonly DemoEntry[]) {
  const incomeMinor = sumMinor(
    entries.filter((e) => e.kind === "income").map((e) => e.amountMinor),
  );
  const expenseMinor = sumMinor(
    entries.filter((e) => e.kind === "expense").map((e) => e.amountMinor),
  );
  const walletBalances = Object.fromEntries(
    wallets.map((wallet) => [
      wallet.id,
      sumMinor([
        wallet.openingMinor,
        ...entries.flatMap((e) =>
          e.kind === "transfer"
            ? [
                e.wallet === wallet.id ? `-${e.amountMinor}` : "0",
                e.toWallet === wallet.id ? e.amountMinor : "0",
              ]
            : e.wallet === wallet.id
              ? [e.kind === "income" ? e.amountMinor : `-${e.amountMinor}`]
              : [],
        ),
      ]),
    ]),
  ) as Record<WalletId, string>;
  const categorySpending = Object.fromEntries(
    categories.map((category) => [
      category.id,
      sumMinor(
        entries
          .filter((e) => e.kind === "expense" && e.category === category.id)
          .map((e) => e.amountMinor),
      ),
    ]),
  ) as Record<CategoryId, string>;
  const budgetMinor = sumMinor(categories.map((c) => c.budgetMinor));
  return {
    incomeMinor,
    expenseMinor,
    walletBalances,
    categorySpending,
    budgetMinor,
    remainingMinor: subtractMinor(budgetMinor, expenseMinor),
    balanceMinor: sumMinor(Object.values(walletBalances)),
  };
}
export type DemoState = {
  entries: readonly DemoEntry[];
  drafts: readonly DemoEntry[];
  receipts: readonly string[];
};
export const initialDemoState: DemoState = {
  entries: fixtureEntries,
  drafts: [],
  receipts: [],
};
export type DemoAction =
  | { type: "record" | "draft"; entry: DemoEntry }
  | { type: "reset" };
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "reset") return initialDemoState;
  const entry = action.entry;
  positiveMinorAmountSchema.parse(entry.amountMinor);
  localDateSchema.parse(entry.date);
  if (
    !wallets.some((w) => w.id === entry.wallet) ||
    !categories.some((c) => c.id === entry.category)
  )
    throw new Error("Invalid demo object");
  if (
    entry.kind === "transfer" &&
    (!entry.toWallet ||
      entry.toWallet === entry.wallet ||
      !wallets.some((w) => w.id === entry.toWallet))
  )
    throw new Error("Invalid demo transfer");
  if (state.receipts.includes(entry.id)) {
    const previous = [...state.entries, ...state.drafts].find(item => item.id === entry.id);
    const fields = ['kind', 'title', 'titleEn', 'amountMinor', 'wallet', 'toWallet', 'category', 'date'] as const;
    if (!previous || fields.some(field => previous[field] !== entry[field])) throw new Error('Idempotency key reused with a different payload');
    return state;
  }
  // Reject aggregate overflow before producing a new state. A draft has no effect.
  if (action.type === 'record') summarize([...state.entries, entry]);
  return action.type === "draft"
    ? {
        ...state,
        drafts: [...state.drafts, entry],
        receipts: [...state.receipts, entry.id],
      }
    : {
        ...state,
        entries: [...state.entries, entry],
        receipts: [...state.receipts, entry.id],
      };
}
