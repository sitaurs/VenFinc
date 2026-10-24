import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { Link, NavLink, Route, Routes } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Car,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Coffee,
  Ellipsis,
  Eye,
  EyeOff,
  FlaskConical,
  Home,
  Info,
  Landmark,
  List,
  LoaderCircle,
  MessageCircle,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Utensils,
  Wallet,
  WalletCards,
  WifiOff,
  X,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, cn } from "@venfinance/ui";
import {
  formatIdr,
  parseIdrInput,
  progressPercent,
  subtractMinor,
  sumMinor,
} from "@venfinance/domain";
import {
  positiveMinorAmountSchema,
  localDateSchema,
} from "@venfinance/contracts";
import { Brand, AppearanceControls } from "../app";
import { usePreferences } from "../preferences";
import {
  categories,
  demoReducer,
  initialDemoState,
  summarize,
  wallets,
  type CategoryId,
  type DemoEntry,
  type DemoState,
  type DemoAction,
  type WalletId,
} from "./model";

type DemoContextValue = {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
  openEntry: () => void;
  notify: (text: string) => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);
function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("Demo context missing");
  return value;
}
function Money({
  amount,
  className = "",
}: {
  amount: string;
  className?: string;
}) {
  const { locale, hidden } = usePreferences();
  return (
    <span className={cn("money", className)}>
      {hidden ? "Rp••••••" : formatIdr(amount, locale)}
    </span>
  );
}
const categoryIcons = {
  food: Utensils,
  transport: Car,
  snacks: Coffee,
  other: WalletCards,
};
function CategoryIcon({ category }: { category: CategoryId }) {
  const Icon = categoryIcons[category];
  return (
    <span
      className={`category-icon ${categories.find((c) => c.id === category)?.color ?? "lavender"}`}
    >
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}
function WalletIcon({ wallet }: { wallet: WalletId }) {
  const Icon =
    wallet === "cash" ? Wallet : wallet === "bank" ? Landmark : WalletCards;
  return (
    <span
      className={`category-icon ${wallets.find((w) => w.id === wallet)?.color ?? "lavender"}`}
    >
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}
function Progress({
  used,
  total,
  label,
  color = "",
}: {
  used: string;
  total: string;
  label: string;
  color?: string;
}) {
  const percent = progressPercent(used, total);
  return (
    <div
      className={`progress ${color}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
function SectionHeader({
  title,
  to,
  label,
}: {
  title: string;
  to?: string;
  label?: string;
}) {
  const { t } = usePreferences();
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {to && (
        <Link to={to}>
          {label ?? t("Lihat semua", "View all")}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading demo-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
function TransactionRows({
  entries,
  compact = false,
}: {
  entries: readonly DemoEntry[];
  compact?: boolean;
}) {
  const { t, locale } = usePreferences();
  return (
    <div
      className={cn("transaction-list", compact && "transaction-list-compact")}
    >
      {[...entries].reverse().map((entry) => (
        <div className="transaction-row" key={entry.id}>
          {entry.kind === "transfer" ? (
            <span className="category-icon lavender">
              <ArrowLeftRight size={20} />
            </span>
          ) : entry.kind === "income" ? (
            <span className="category-icon mint">
              <ArrowDownLeft size={20} />
            </span>
          ) : (
            <CategoryIcon category={entry.category} />
          )}
          <div className="transaction-label">
            <strong>{t(entry.title, entry.titleEn)}</strong>
            <span>
              {new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "short",
                timeZone: "Asia/Jakarta",
              }).format(new Date(`${entry.date}T12:00:00+07:00`))}
              <i>·</i>
              {t(
                wallets.find((w) => w.id === entry.wallet)?.name ?? "",
                wallets.find((w) => w.id === entry.wallet)?.nameEn ?? "",
              )}
            </span>
          </div>
          <div
            className={cn(
              "transaction-amount",
              entry.kind === "income" && "positive",
            )}
          >
            <Money
              amount={
                entry.kind === "expense"
                  ? `-${entry.amountMinor}`
                  : entry.amountMinor
              }
            />
            <span>
              {entry.kind === "transfer"
                ? t("Transfer internal", "Internal transfer")
                : t("Tercatat · contoh", "Recorded · sample")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
function BudgetRows() {
  const { state } = useDemo();
  const summary = summarize(state.entries);
  const { t } = usePreferences();
  return (
    <div className="budget-rows">
      {categories.map((category) => (
        <div className="budget-row" key={category.id}>
          <CategoryIcon category={category.id} />
          <div>
            <div className="budget-row-heading">
              <strong>{t(category.name, category.nameEn)}</strong>
              <span>
                <Money amount={summary.categorySpending[category.id]} />{" "}
                <span className="muted">
                  / <Money amount={category.budgetMinor} />
                </span>
              </span>
            </div>
            <Progress
              used={summary.categorySpending[category.id]}
              total={category.budgetMinor}
              label={t(
                `Pemakaian anggaran ${category.name}`,
                `${category.nameEn} budget used`,
              )}
              color={category.color}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
function SummaryCards() {
  const { state } = useDemo();
  const s = summarize(state.entries);
  const { hidden, toggleHidden, t } = usePreferences();
  const remaining = BigInt(s.remainingMinor) < 0n ? "0" : s.remainingMinor;
  return (
    <div className="summary-grid">
      <section className="balance-card">
        <div className="balance-top">
          <span>
            {t("Saldo total", "Total balance")}{" "}
            <span className="example-label">({t("contoh", "sample")})</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleHidden}
            aria-label={
              hidden
                ? t("Tampilkan nominal", "Show amounts")
                : t("Sembunyikan nominal", "Hide amounts")
            }
          >
            {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>
        <Money amount={s.balanceMinor} className="balance-value" />
        <div className="balance-bottom">
          <WalletCards size={17} />
          <span>{t("3 sumber uang", "3 wallets")}</span>
          <Link
            to="/demo/wallets"
            aria-label={t("Lihat dompet", "View wallets")}
          >
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
      <Card className="stat-card">
        <div className="stat-title">
          <span className="category-icon mint">
            <ArrowDownLeft size={20} />
          </span>
          {t("Pemasukan", "Income")}
        </div>
        <Money amount={s.incomeMinor} className="stat-value positive" />
        <span className="muted">
          {t("Oktober 2026 · contoh", "October 2026 · sample")}
        </span>
      </Card>
      <Card className="stat-card">
        <div className="stat-title">
          <span className="category-icon pink">
            <ArrowUpRight size={20} />
          </span>
          {t("Pengeluaran", "Expenses")}
        </div>
        <Money amount={s.expenseMinor} className="stat-value expense-color" />
        <span className="muted">
          {t("Transaksi terkonfirmasi · contoh", "Confirmed entries · sample")}
        </span>
      </Card>
      <Card className="stat-card budget-stat">
        <h2>{t("Sisa anggaran", "Budget remaining")}</h2>
        <div className="budget-stat-content">
          <div
            className="budget-ring"
            style={{
              background: `conic-gradient(var(--teal) 0 ${progressPercent(remaining, s.budgetMinor)}%, var(--line) 0 100%)`,
            }}
            aria-hidden="true"
          >
            <span>{progressPercent(remaining, s.budgetMinor)}%</span>
          </div>
          <div>
            <Money amount={s.remainingMinor} className="remaining-value" />
            <p className="muted">
              {t("dari", "of")} <Money amount={s.budgetMinor} />
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
function Dashboard() {
  const { state } = useDemo();
  const s = summarize(state.entries);
  const { t } = usePreferences();
  return (
    <>
      <PageHeading
        title={t("Demo interaktif", "Interactive demo")}
        description={t(
          "Lihat bagaimana catatan kecil membuat keuangan lebih terarah.",
          "See how small entries bring more direction to your finances.",
        )}
      >
        <span className="period-label">
          <CalendarDays size={16} />
          {t("Oktober 2026", "October 2026")}
        </span>
      </PageHeading>
      <SummaryCards />
      <div className="dashboard-middle">
        <Card>
          <SectionHeader title={t("Dompet", "Wallets")} to="/demo/wallets" />
          {wallets.map((wallet) => (
            <Link className="wallet-row" key={wallet.id} to="/demo/wallets">
              <WalletIcon wallet={wallet.id} />
              <div>
                <strong>{t(wallet.name, wallet.nameEn)}</strong>
                {wallet.id === "bank" && (
                  <span>
                    {t("Termasuk dana target", "Includes goal funds")}
                  </span>
                )}
              </div>
              <Money amount={s.walletBalances[wallet.id]} />
            </Link>
          ))}
        </Card>
        <Card className="goal-card">
          <SectionHeader
            title={t("Tujuan menabung", "Savings goal")}
            to="/demo/goals"
          />
          <div className="goal-main">
            <span className="category-icon mint">
              <Target size={23} />
            </span>
            <div>
              <h3>{t("Dana darurat", "Emergency fund")}</h3>
              <p>
                <Money amount="250000" />{" "}
                <span className="muted">
                  / <Money amount="1000000" />
                </span>
              </p>
              <Progress
                used="250000"
                total="1000000"
                label={t("Dana darurat 25 persen", "Emergency fund 25 percent")}
                color="mint"
              />
            </div>
            <strong className="muted">25%</strong>
          </div>
          <div className="goal-note">
            <Info size={17} />
            <p>
              {t(
                "Rp250.000 sudah termasuk dalam saldo rekening bank.",
                "IDR250,000 is already included in the bank balance.",
              )}
            </p>
          </div>
          <p className="goal-date">
            {t("Target: 31 Januari 2027", "Target: 31 January 2027")}
          </p>
        </Card>
        <Card className="debt-card">
          <SectionHeader title={t("Utang", "Debt")} to="/demo/debts" />
          <div className="debt-main">
            <span className="category-icon lavender">
              <Wallet size={24} />
            </span>
            <div>
              <span className="muted">
                {t("Sisa pokok · contoh", "Principal remaining · sample")}
              </span>
              <Money amount="300000" />
            </div>
          </div>
          <Link className="debt-next" to="/demo/debts">
            <CalendarDays size={23} />
            <div>
              <span>{t("Pembayaran berikutnya", "Next payment")}</span>
              <Money amount="100000" />
              <span className="muted">
                {t(
                  "1 November 2026 · belum dibayar",
                  "1 November 2026 · unpaid",
                )}
              </span>
            </div>
            <ChevronRight size={17} />
          </Link>
        </Card>
      </div>
      <div className="dashboard-bottom">
        <Card>
          <SectionHeader
            title={t("Anggaran kategori", "Category budgets")}
            to="/demo/budgets"
          />
          <BudgetRows />
        </Card>
        <Card>
          <SectionHeader
            title={t("Transaksi terbaru", "Recent transactions")}
            to="/demo/transactions"
          />
          <TransactionRows entries={state.entries.slice(-4)} compact />
        </Card>
      </div>
      <Link to="/demo/review" className="review-strip">
        <span className="category-icon pink">
          <ReceiptText size={21} />
        </span>
        <div>
          <strong>
            {t(
              "2 bukti contoh perlu ditinjau",
              "2 sample receipts need review",
            )}
          </strong>
          <p>
            {t(
              "Rp18.000 belum masuk saldo dan pengeluaran.",
              "IDR18,000 is excluded from balances and expenses.",
            )}
          </p>
        </div>
        <ChevronRight size={21} />
      </Link>
    </>
  );
}
function Transactions() {
  const { state, openEntry } = useDemo();
  const { t, locale } = usePreferences();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [wallet, setWallet] = useState("all");
  const entries = useMemo(
    () =>
      state.entries.filter(
        (e) =>
          (kind === "all" || e.kind === kind) &&
          (wallet === "all" || e.wallet === wallet || e.toWallet === wallet) &&
          `${e.title} ${e.titleEn}`
            .toLocaleLowerCase(locale)
            .includes(search.toLocaleLowerCase(locale)),
      ),
    [state.entries, search, kind, wallet, locale],
  );
  return (
    <>
      <PageHeading
        title={t("Riwayat transaksi", "Transaction history")}
        description={t(
          "Catatan contoh, termasuk transfer yang tidak dihitung sebagai pengeluaran.",
          "Sample records, including transfers excluded from expenses.",
        )}
      >
        <Button onClick={openEntry}>
          <Plus size={18} />
          {t("Catat contoh", "Add sample entry")}
        </Button>
      </PageHeading>
      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label={t("Cari transaksi", "Search transactions")}
            placeholder={t("Cari transaksi…", "Search transactions…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label={t("Jenis transaksi", "Transaction type")}
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="all">{t("Semua jenis", "All types")}</option>
          <option value="expense">{t("Pengeluaran", "Expenses")}</option>
          <option value="income">{t("Pemasukan", "Income")}</option>
          <option value="transfer">{t("Transfer", "Transfers")}</option>
        </select>
        <select
          aria-label={t("Sumber uang", "Wallet")}
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        >
          <option value="all">{t("Semua dompet", "All wallets")}</option>
          {wallets.map((w) => (
            <option value={w.id} key={w.id}>
              {t(w.name, w.nameEn)}
            </option>
          ))}
        </select>
      </div>
      <Card>
        <SectionHeader
          title={t(
            `${entries.length} transaksi contoh`,
            `${entries.length} sample transactions`,
          )}
        />
        {entries.length ? (
          <TransactionRows entries={entries} />
        ) : (
          <EmptyState
            icon={<Search size={28} />}
            title={t(
              "Tidak ada transaksi yang cocok",
              "No matching transactions",
            )}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setKind("all");
                  setWallet("all");
                }}
              >
                {t("Hapus filter", "Clear filters")}
              </Button>
            }
          >
            {t(
              "Coba kata kunci atau filter lain.",
              "Try a different search or filter.",
            )}
          </EmptyState>
        )}
      </Card>
      {state.drafts.length > 0 && (
        <Card className="draft-card">
          <SectionHeader
            title={t(
              "Draf contoh · belum tercatat",
              "Sample drafts · not posted",
            )}
          />
          <TransactionRows entries={state.drafts} />
          <p className="muted">
            {t(
              "Draf tidak mengubah saldo. Seluruh data contoh hilang saat halaman dimuat ulang.",
              "Drafts do not affect balances. All sample changes reset on reload.",
            )}
          </p>
        </Card>
      )}
    </>
  );
}
function Budgets() {
  const { state } = useDemo();
  const { t } = usePreferences();
  const s = summarize(state.entries);
  return (
    <>
      <PageHeading
        title={t("Anggaran", "Budgets")}
        description={t(
          "Rencana Oktober 2026 · semua angka adalah contoh.",
          "October 2026 plan · all amounts are examples.",
        )}
      />
      <div className="budget-overview">
        <Card>
          <span className="muted">
            {t("Rencana anggaran", "Planned budget")}
          </span>
          <Money amount={s.budgetMinor} className="stat-value" />
        </Card>
        <Card>
          <span className="muted">
            {t("Pengeluaran terkonfirmasi", "Confirmed spending")}
          </span>
          <Money amount={s.expenseMinor} className="stat-value" />
        </Card>
        <Card>
          <span className="muted">
            {t("Sisa anggaran", "Remaining budget")}
          </span>
          <Money amount={s.remainingMinor} className="stat-value positive" />
        </Card>
      </div>
      <Card>
        <SectionHeader title={t("Kantong anggaran", "Budget categories")} />
        <BudgetRows />
      </Card>
      <div className="grid-two budget-detail-grid">
        {categories.map((category) => {
          const spent = s.categorySpending[category.id];
          const remaining = subtractMinor(category.budgetMinor, spent);
          return (
            <Card key={category.id}>
              <div className="section-header">
                <div className="inline-label">
                  <CategoryIcon category={category.id} />
                  <h2>{t(category.name, category.nameEn)}</h2>
                </div>
                <Badge tone={BigInt(remaining) < 0n ? "warning" : "neutral"}>
                  {progressPercent(spent, category.budgetMinor)}%{" "}
                  {t("terpakai", "used")}
                </Badge>
              </div>
              <Money amount={remaining} className="stat-value" />
              <p className="muted">
                {BigInt(remaining) < 0n
                  ? t("Melebihi anggaran contoh", "Over the sample budget")
                  : t(
                      "Masih tersedia dari rencana",
                      "Still available in the plan",
                    )}
              </p>
              <Progress
                used={spent}
                total={category.budgetMinor}
                label={t(category.name, category.nameEn)}
                color={category.color}
              />
            </Card>
          );
        })}
      </div>
      <div className="notice">
        <Info size={21} />
        <p>
          {t(
            "Anggaran adalah batas rencana virtual. Peringatan tidak memblokir pembayaran bank atau QRIS.",
            "Budgets are virtual planning limits. Warnings do not block bank or QRIS payments.",
          )}
        </p>
      </div>
    </>
  );
}
function WalletsPage() {
  const { state } = useDemo();
  const { t } = usePreferences();
  const s = summarize(state.entries);
  return (
    <>
      <PageHeading
        title={t("Sumber uang", "Your wallets")}
        description={t(
          "Saldo virtual dari transaksi contoh. Tidak terhubung ke bank.",
          "Virtual balances from sample transactions. No bank connection.",
        )}
      />
      <Card className="wallet-total">
        <span>
          {t(
            "Total saldo tercatat · contoh",
            "Total recorded balance · sample",
          )}
        </span>
        <Money amount={s.balanceMinor} className="stat-value" />
      </Card>
      <div className="wallet-grid">
        {wallets.map((w) => (
          <Card key={w.id}>
            <div className="section-header">
              <WalletIcon wallet={w.id} />
              <Badge>{t("Contoh", "Sample")}</Badge>
            </div>
            <h2>{t(w.name, w.nameEn)}</h2>
            <Money amount={s.walletBalances[w.id]} className="stat-value" />
            <p className="muted">
              {w.id === "bank"
                ? t(
                    "Termasuk Rp250.000 alokasi dana darurat.",
                    "Includes IDR250,000 allocated to the emergency fund.",
                  )
                : t(
                    "Catatan virtual, bukan saldo dari penyedia.",
                    "A virtual record, not a provider balance.",
                  )}
            </p>
          </Card>
        ))}
      </div>
      <Card>
        <SectionHeader
          title={t("Transfer antardompet", "Transfers between wallets")}
        />
        <TransactionRows
          entries={state.entries.filter((e) => e.kind === "transfer")}
        />
        <div className="notice">
          <ArrowLeftRight size={20} />
          <p>
            {t(
              "Transfer mengubah sumber uang tanpa menambah pemasukan atau pengeluaran konsumsi.",
              "Transfers move balances between wallets without increasing income or consumption expenses.",
            )}
          </p>
        </div>
      </Card>
    </>
  );
}
function GoalsPage({ debts = false }: { debts?: boolean }) {
  const { t } = usePreferences();
  return (
    <>
      <PageHeading
        title={
          debts
            ? t("Utang & piutang", "Debts & receivables")
            : t("Target tabungan", "Savings goals")
        }
        description={t(
          "Skenario contoh, terpisah dari akun pribadi.",
          "A sample scenario, separate from personal accounts.",
        )}
      />
      <Card className="goal-detail">
        <span className="category-icon mint">
          {debts ? <Wallet size={28} /> : <Target size={28} />}
        </span>
        <Badge tone="brand">{t("Data contoh", "Sample data")}</Badge>
        <h2>
          {debts
            ? t("Utang contoh", "Sample debt")
            : t("Dana darurat", "Emergency fund")}
        </h2>
        <Money amount={debts ? "300000" : "250000"} className="balance-value" />
        <p className="muted">
          {debts
            ? t(
                "Sisa pokok dari Rp500.000 · Rp200.000 sudah dibayar dalam skenario.",
                "Principal remaining from IDR500,000 · IDR200,000 paid in this scenario.",
              )
            : t(
                "Terkumpul dari target Rp1.000.000 · 25%",
                "Saved toward an IDR1,000,000 target · 25%",
              )}
        </p>
        <Progress
          used={debts ? "200000" : "250000"}
          total={debts ? "500000" : "1000000"}
          label={
            debts
              ? t("Pokok dibayar", "Principal repaid")
              : t("Target terkumpul", "Goal saved")
          }
          color="mint"
        />
        <div className="notice">
          <Info size={21} />
          <p>
            {debts
              ? t(
                  "Cicilan pokok mengurangi utang dan saldo, bukan pengeluaran konsumsi kedua. Rencana berikutnya Rp100.000 pada 1 November 2026, belum dibayar.",
                  "Principal repayments reduce debt and cash, without a second consumption expense. Next planned payment: IDR100,000 on 1 November 2026, unpaid.",
                )
              : t(
                  "Dana ini sudah termasuk saldo Bank. Alokasi target tidak menambah saldo total dan tidak dihitung sebagai pengeluaran.",
                  "These funds are included in the Bank balance. Allocating a goal does not increase the total balance or count as an expense.",
                )}
          </p>
        </div>
      </Card>
    </>
  );
}
function Reports() {
  const { state } = useDemo();
  const s = summarize(state.entries);
  const { t } = usePreferences();
  return (
    <>
      <PageHeading
        title={t("Laporan & insight", "Reports & insights")}
        description={t(
          "Ringkasan contoh Oktober 2026, dihitung dari catatan di demo ini.",
          "October 2026 sample summary, calculated from this demo’s records.",
        )}
      />
      <SummaryCards />
      <Card>
        <SectionHeader
          title={t("Pengeluaran per kategori", "Spending by category")}
        />
        <table className="report-table">
          <caption className="sr-only">
            {t(
              "Nominal dan persentase dari total pengeluaran terkonfirmasi",
              "Amounts and shares of confirmed expenses",
            )}
          </caption>
          <thead>
            <tr>
              <th>{t("Kategori", "Category")}</th>
              <th>{t("Pengeluaran", "Spending")}</th>
              <th>{t("Dari total", "Share of total")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <th scope="row">{t(category.name, category.nameEn)}</th>
                <td>
                  <Money amount={s.categorySpending[category.id]} />
                </td>
                <td>
                  {progressPercent(
                    s.categorySpending[category.id],
                    s.expenseMinor,
                  )}
                  %
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>{t("Total", "Total")}</th>
              <td>
                <Money amount={s.expenseMinor} />
              </td>
              <td>100%</td>
            </tr>
          </tfoot>
        </table>
      </Card>
      <div className="notice">
        <Info size={20} />
        <p>
          {t(
            "Hasil AI/OCR sementara, transfer internal, dan alokasi tabungan tidak dimasukkan sebagai pengeluaran konsumsi.",
            "Provisional extraction, internal transfers, and savings allocations are excluded from consumption spending.",
          )}
        </p>
      </div>
    </>
  );
}
function Review() {
  const { t } = usePreferences();
  const { openEntry } = useDemo();
  return (
    <>
      <PageHeading
        title={t("Perlu ditinjau", "Needs review")}
        description={t(
          "Kandidat contoh belum memengaruhi saldo atau laporan.",
          "Sample candidates have no effect on balances or reports.",
        )}
      />
      <div className="notice notice-warning">
        <Info size={21} />
        <div>
          <strong>
            {t(
              "Rp18.000 masih berupa usulan",
              "IDR18,000 is still provisional",
            )}
          </strong>
          <p>
            {t(
              "Dua kandidat masing-masing Rp9.000 hanya untuk memperlihatkan keadaan review. Integrasi pembacaan bukti belum aktif.",
              "Two IDR9,000 candidates illustrate the review state. Receipt extraction is not active yet.",
            )}
          </p>
        </div>
      </div>
      <div className="grid-two">
        {[1, 2].map((n) => (
          <Card key={n}>
            <div className="section-header">
              <span className="category-icon pink">
                <ReceiptText size={23} />
              </span>
              <Badge tone="warning">
                {t("Perlu ditinjau · contoh", "Needs review · sample")}
              </Badge>
            </div>
            <h2>{t(`Usulan contoh ${n}`, `Sample suggestion ${n}`)}</h2>
            <Money amount="9000" className="stat-value" />
            <p className="muted">
              {t(
                "Belum dikonfirmasi. Tidak ada gambar pribadi atau hasil provider yang digunakan.",
                "Not confirmed. No private image or actual provider result is used.",
              )}
            </p>
          </Card>
        ))}
      </div>
      <Button variant="secondary" onClick={openEntry}>
        <Plus size={18} />
        {t("Coba catat manual", "Try manual entry")}
      </Button>
    </>
  );
}
function Recurring() {
  const { t } = usePreferences();
  return (
    <>
      <PageHeading
        title={t("Tagihan & catatan berulang", "Bills & recurring entries")}
        description={t(
          "Jadwal contoh tidak dianggap sebagai pembayaran.",
          "A sample schedule does not count as a payment.",
        )}
      />
      <Card>
        <div className="section-header">
          <div className="inline-label">
            <CalendarDays size={24} />
            <h2>{t("Cicilan utang contoh", "Sample debt installment")}</h2>
          </div>
          <Badge tone="warning">{t("Belum dibayar", "Unpaid")}</Badge>
        </div>
        <Money amount="100000" className="stat-value" />
        <p className="muted">
          {t(
            "Rencana 1 November 2026. Tidak ada pengingat yang dikirim.",
            "Planned for 1 November 2026. No reminders are sent.",
          )}
        </p>
        <Button variant="secondary" asChild>
          <Link to="/demo/debts">
            {t("Lihat utang contoh", "View sample debt")}
            <ArrowRight size={17} />
          </Link>
        </Button>
      </Card>
    </>
  );
}
function SettingsPage() {
  const { theme, setTheme, locale, setLocale, t } = usePreferences();
  const { dispatch, notify } = useDemo();
  return (
    <>
      <PageHeading
        title={t("Lainnya", "More")}
        description={t(
          "Tampilan, preferensi, dan akses ke fitur contoh.",
          "Appearance, preferences, and more sample features.",
        )}
      />
      <div className="more-links">
        {[
          {
            to: "wallets",
            title: t("Sumber uang", "Wallets"),
            icon: WalletCards,
          },
          {
            to: "goals",
            title: t("Target tabungan", "Savings goals"),
            icon: Target,
          },
          {
            to: "debts",
            title: t("Utang & piutang", "Debts & receivables"),
            icon: Wallet,
          },
          { to: "recurring", title: t("Tagihan", "Bills"), icon: CalendarDays },
          {
            to: "insights",
            title: t("Laporan", "Reports"),
            icon: ChartNoAxesCombined,
          },
          {
            to: "review",
            title: t("Perlu ditinjau", "Needs review"),
            icon: ClipboardList,
          },
        ].map((item) => (
          <Link to={`/demo/${item.to}`} key={item.to}>
            <item.icon size={21} />
            <span>{item.title}</span>
            <ChevronRight size={17} />
          </Link>
        ))}
      </div>
      <Card>
        <SectionHeader
          title={t("Tampilan & preferensi", "Appearance & preferences")}
        />
        <div className="preference-row">
          <label htmlFor="theme">{t("Tema", "Theme")}</label>
          <select
            id="theme"
            value={theme}
            onChange={(e) =>
              setTheme(e.target.value as "light" | "dark" | "system")
            }
          >
            <option value="system">
              {t("Ikuti perangkat", "Follow device")}
            </option>
            <option value="light">{t("Terang", "Light")}</option>
            <option value="dark">{t("Gelap", "Dark")}</option>
          </select>
        </div>
        <div className="preference-row">
          <label htmlFor="locale">{t("Bahasa", "Language")}</label>
          <select
            id="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value as "id-ID" | "en-US")}
          >
            <option value="id-ID">Bahasa Indonesia</option>
            <option value="en-US">English</option>
          </select>
        </div>
        <div className="preference-row">
          <span>{t("Zona waktu contoh", "Sample timezone")}</span>
          <strong>Asia/Jakarta</strong>
        </div>
      </Card>
      <Card>
        <SectionHeader title={t("Data demo", "Demo data")} />
        <p className="muted">
          {t(
            "Perubahan hanya disimpan di memori tab ini, tanpa sinkronisasi atau data pribadi. Memuat ulang mengembalikan skenario awal.",
            "Changes stay in this tab’s memory, without synchronization or personal data. Reloading restores the original scenario.",
          )}
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            dispatch({ type: "reset" });
            notify(t("Data contoh direset.", "Sample data reset."));
          }}
        >
          <RotateCcw size={17} />
          {t("Reset data contoh", "Reset sample data")}
        </Button>
      </Card>
      <Link to="/demo/whatsapp" className="notice">
        <MessageCircle size={23} />
        <div>
          <strong>WhatsApp</strong>
          <p>
            {t(
              "Belum tersedia. Tidak ada nomor yang ditautkan.",
              "Unavailable. No number is linked.",
            )}
          </p>
        </div>
        <ChevronRight size={19} />
      </Link>
    </>
  );
}
function WhatsApp() {
  const { t } = usePreferences();
  return (
    <>
      <PageHeading title="WhatsApp" />
      <Card>
        <EmptyState
          icon={<MessageCircle size={32} />}
          title={t("Koneksi belum tersedia", "Connection unavailable")}
          action={
            <Button variant="secondary" asChild>
              <Link to="/demo">{t("Kembali ke demo", "Back to the demo")}</Link>
            </Button>
          }
        >
          {t(
            "Fitur ini memerlukan persetujuan terpisah dan pengujian layanan. Build ini tidak menautkan nomor, membaca chat, atau mengirim pesan.",
            "This feature requires separate consent and service testing. This build does not link numbers, read chats, or send messages.",
          )}
        </EmptyState>
      </Card>
    </>
  );
}
function NewEntry({ close }: { close: () => void }) {
  const { state, dispatch, notify } = useDemo();
  const { t, locale } = usePreferences();
  const [id] = useState(() => crypto.randomUUID());
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [rawAmount, setRawAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [wallet, setWallet] = useState<WalletId>("cash");
  const [date, setDate] = useState("2026-10-24");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const target = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const draft = target?.value === "draft";
    let amountMinor: string;
    try {
      amountMinor = positiveMinorAmountSchema.parse(parseIdrInput(rawAmount));
    } catch {
      setError(
        t(
          "Masukkan nominal rupiah bulat lebih dari nol. Contoh: 10000 atau 10.000.",
          "Enter a positive whole rupiah amount, such as 10000 or 10.000.",
        ),
      );
      return;
    }
    if (
      !localDateSchema.safeParse(date).success ||
      date < "2026-10-01" ||
      date > "2026-10-31"
    ) {
      setError(
        t(
          "Gunakan tanggal pada Oktober 2026 untuk periode contoh ini.",
          "Use a date in October 2026 for this sample period.",
        ),
      );
      return;
    }
    const fallback =
      kind === "income"
        ? t("Pemasukan contoh", "Sample income")
        : t(
            categories.find((c) => c.id === category)?.name ?? "",
            categories.find((c) => c.id === category)?.nameEn ?? "",
          );
    const action: DemoAction = {
      type: draft ? "draft" : "record",
      entry: {
        id,
        kind,
        amountMinor,
        category: kind === "income" ? "other" : category,
        wallet,
        date,
        title: note.trim() || fallback,
        titleEn: note.trim() || fallback,
      },
    };
    try { demoReducer(state, action); } catch {
      setError(t('Nominal menyebabkan total contoh melewati batas penyimpanan. Gunakan nominal yang lebih kecil.', 'This amount would exceed the sample totals storage limit. Enter a smaller amount.'));
      return;
    }
    setSaving(true);
    dispatch(action);
    notify(
      draft
        ? t(
            "Draf contoh disimpan. Saldo tidak berubah.",
            "Sample draft saved. Balances are unchanged.",
          )
        : t(
            "Transaksi contoh dicatat. Saldo demo diperbarui.",
            "Sample transaction recorded. Demo balances updated.",
          ),
    );
    close();
  }
  let preview: string | null = null;
  try {
    const amount = parseIdrInput(rawAmount);
    preview = sumMinor([
      summarize(state.entries).walletBalances[wallet],
      kind === "income" ? amount : `-${amount}`,
    ]);
  } catch {
    /* Invalid input is explained on submit. */
  }
  return (
    <form onSubmit={save} className="entry-form" noValidate>
      <div
        className="entry-tabs"
        role="group"
        aria-label={t("Jenis catatan", "Entry type")}
      >
        <button
          type="button"
          className={kind === "expense" ? "active" : ""}
          aria-pressed={kind === "expense"}
          onClick={() => setKind("expense")}
        >
          <ArrowUpRight size={17} />
          {t("Pengeluaran", "Expense")}
        </button>
        <button
          type="button"
          className={kind === "income" ? "active" : ""}
          aria-pressed={kind === "income"}
          onClick={() => setKind("income")}
        >
          <ArrowDownLeft size={17} />
          {t("Pemasukan", "Income")}
        </button>
      </div>
      <label className="amount-label" htmlFor="amount">
        {t("Nominal rupiah", "Amount in rupiah")}
        <div className="amount-field">
          <span>Rp</span>
          <input
            id="amount"
            name="amount"
            aria-label={t("Nominal rupiah", "Amount in rupiah")}
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            autoFocus
            value={rawAmount}
            aria-invalid={!!error}
            aria-describedby={error ? "entry-error" : "amount-hint"}
            onChange={(e) => {
              setRawAmount(e.target.value);
              setError("");
            }}
          />
        </div>
      </label>
      <p className="muted" id="amount-hint">
        {t("Rupiah bulat, tanpa desimal.", "Whole rupiah, without decimals.")}
      </p>
      {kind === "expense" && (
        <fieldset className="category-picker">
          <legend>{t("Kategori", "Category")}</legend>
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              className={category === c.id ? "selected" : ""}
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              <CategoryIcon category={c.id} />
              {t(c.name, c.nameEn)}
            </button>
          ))}
        </fieldset>
      )}
      <div className="grid-two">
        <label>
          {t("Sumber uang", "Wallet")}
          <select
            value={wallet}
            onChange={(e) => setWallet(e.target.value as WalletId)}
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {t(w.name, w.nameEn)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Tanggal", "Date")}
          <input
            type="date"
            min="2026-10-01"
            max="2026-10-31"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      <label>
        {t("Catatan (opsional)", "Note (optional)")}
        <input
          maxLength={120}
          placeholder={t("Misalnya, makan siang", "For example, lunch")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {preview && (
        <div
          className={cn(
            "entry-preview",
            BigInt(preview) < 0n && "notice-warning",
          )}
        >
          <span>
            {t(
              "Saldo dompet setelah dicatat",
              "Wallet balance after recording",
            )}
          </span>
          <strong>{formatIdr(preview, locale)}</strong>
          {BigInt(preview) < 0n && (
            <p>
              {t(
                "Saldo contoh akan negatif. Periksa nominal dan sumber uang.",
                "The sample balance will be negative. Check the amount and wallet.",
              )}
            </p>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="form-error" id="entry-error">
          {error}
        </p>
      )}
      <div className="entry-actions">
        <Button
          variant="secondary"
          name="action"
          value="draft"
          type="submit"
          disabled={saving}
        >
          {t("Simpan draf", "Save draft")}
        </Button>
        <Button name="action" value="record" type="submit" disabled={saving}>
          {saving ? <LoaderCircle size={17} /> : <Check size={17} />}
          {t("Catat contoh", "Record sample")}
        </Button>
      </div>
      <p className="entry-disclaimer">
        {t(
          "Hanya data contoh di tab ini. Tidak tersimpan ke akun dan direset saat halaman dimuat ulang.",
          "Sample data in this tab only. Not saved to an account; resets when the page reloads.",
        )}
      </p>
    </form>
  );
}
function DemoShell() {
  const { t } = usePreferences();
  const { openEntry } = useDemo();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  const navItems = [
    { path: "", label: t("Beranda", "Home"), icon: Home },
    {
      path: "/transactions",
      label: t("Transaksi", "Transactions"),
      icon: List,
    },
    {
      path: "/budgets",
      label: t("Anggaran", "Budgets"),
      icon: ChartNoAxesCombined,
    },
    { path: "/wallets", label: t("Dompet", "Wallets"), icon: WalletCards },
    {
      path: "/goals",
      label: t("Target tabungan", "Savings goals"),
      icon: Target,
    },
    { path: "/debts", label: t("Utang & piutang", "Debts"), icon: Wallet },
    { path: "/recurring", label: t("Tagihan", "Bills"), icon: ReceiptText },
    {
      path: "/insights",
      label: t("Laporan", "Reports"),
      icon: ChartNoAxesCombined,
    },
    {
      path: "/review",
      label: t("Perlu ditinjau", "Needs review"),
      icon: ClipboardList,
    },
  ];
  return (
    <div className="demo-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-section-label">
          {t("RUANG KEUANGAN", "YOUR FINANCES")}
        </div>
        <nav aria-label={t("Navigasi demo desktop", "Desktop demo navigation")}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={`/demo${item.path}`}
              end={item.path === ""}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.path === "/review" && <span className="nav-count">2</span>}
            </NavLink>
          ))}
          <div className="nav-separator" />
          <NavLink to="/demo/whatsapp">
            <MessageCircle size={20} />
            <span>WhatsApp</span>
          </NavLink>
          <NavLink to="/demo/settings">
            <Settings size={20} />
            <span>{t("Pengaturan", "Settings")}</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <AppearanceControls />
          <div className="sidebar-demo-card">
            <FlaskConical size={21} />
            <strong>
              {t("Kenali uangmu lebih dekat.", "A closer look at your money.")}
            </strong>
            <p>
              {t(
                "Kamu sedang melihat data contoh.",
                "You are viewing sample data.",
              )}
            </p>
            <Link to="/register">
              {t("Mulai dengan akunmu", "Start with your account")}
              <ArrowRight size={16} />
            </Link>
          </div>
          <Link to="/faq" className="sidebar-help">
            <CircleHelp size={17} />
            {t("Butuh bantuan?", "Need help?")}
          </Link>
        </div>
      </aside>
      <div className="demo-workspace">
        <header className="demo-topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="desktop-breadcrumb">
            {t("Keuangan pribadi", "Personal finance")}
            <ChevronRight size={14} />
            <span>{t("Ruang contoh", "Sample workspace")}</span>
          </div>
          <div className="topbar-actions">
            <AppearanceControls />
            <Link
              className="header-help"
              to="/faq"
              aria-label={t("Bantuan", "Help")}
            >
              <CircleHelp size={20} />
            </Link>
            <span
              className="demo-avatar"
              aria-label={t("Data contoh", "Sample data")}
            >
              <FlaskConical size={18} />
            </span>
          </div>
        </header>
        <div className="demo-content">
          <div className="demo-banner">
            <span className="demo-banner-icon">
              <FlaskConical size={24} />
            </span>
            <div>
              <strong>
                {t("Mode demo", "Demo mode")}{" "}
                <span>· {t("Data simulasi", "Sample data")}</span>
              </strong>
              <p>
                {t(
                  "Coba sesukamu. Perubahan hanya sementara di tab ini.",
                  "Explore freely. Changes stay temporarily in this tab.",
                )}
              </p>
            </div>
            <div className="demo-banner-actions">
              <Button className="desktop-add" onClick={openEntry}>
                <Plus size={18} />
                {t("Catat contoh", "Add sample entry")}
              </Button>
              <Button asChild variant="secondary" size="small">
                <Link to="/register">
                  {t("Buat akun saya", "Create my account")}
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
          {!online && (
            <div role="status" className="notice notice-warning">
              <WifiOff size={21} />
              <p>
                {t(
                  "Perangkat sedang offline. Demo di tab ini tetap bisa dicoba. Perubahan demo direset saat dimuat ulang.",
                  "Your device is offline. This tab’s demo still works. Demo changes reset on reload.",
                )}
              </p>
            </div>
          )}
          <main id="main-content" className="demo-main">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="wallets" element={<WalletsPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="debts" element={<GoalsPage debts />} />
              <Route path="recurring" element={<Recurring />} />
              <Route path="insights" element={<Reports />} />
              <Route path="review" element={<Review />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="whatsapp" element={<WhatsApp />} />
              <Route
                path="*"
                element={
                  <EmptyState
                    icon={<Search />}
                    title={t(
                      "Halaman demo tidak ditemukan",
                      "Demo page not found",
                    )}
                    action={
                      <Button asChild>
                        <Link to="/demo">{t("Beranda demo", "Demo home")}</Link>
                      </Button>
                    }
                  />
                }
              />
            </Routes>
          </main>
          <footer className="demo-footer">
            <span>
              <ShieldCheck size={14} />
              {t(
                "Data contoh terpisah dari akun asli",
                "Sample data is separate from real accounts",
              )}
            </span>
            <Link to="/status">
              {t("Status layanan", "Service status")}
              <ArrowUpRight size={13} />
            </Link>
          </footer>
        </div>
      </div>
      <nav
        className="bottom-nav"
        aria-label={t("Navigasi demo mobile", "Mobile demo navigation")}
      >
        <NavLink to="/demo" end>
          <Home size={21} />
          <span>{t("Beranda", "Home")}</span>
        </NavLink>
        <NavLink to="/demo/transactions">
          <List size={21} />
          <span>{t("Transaksi", "Transactions")}</span>
        </NavLink>
        <button onClick={openEntry} className="bottom-add">
          <span>
            <Plus size={27} />
          </span>
          {t("Catat", "Record")}
        </button>
        <NavLink to="/demo/budgets">
          <ChartNoAxesCombined size={21} />
          <span>{t("Anggaran", "Budgets")}</span>
        </NavLink>
        <NavLink to="/demo/settings">
          <Ellipsis size={23} />
          <span>{t("Lainnya", "More")}</span>
        </NavLink>
      </nav>
    </div>
  );
}
export default function Demo() {
  const trigger = useRef<HTMLElement | null>(null);
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [entryOpen, setEntryOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const { t } = usePreferences();
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 6000);
    return () => clearTimeout(timer);
  }, [notification]);
  return (
    <DemoContext
      value={{
        state,
        dispatch,
        openEntry: () => {
          trigger.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          setEntryOpen(true);
        },
        notify: setNotification,
      }}
    >
      <DemoShell />
      <Dialog.Root open={entryOpen} onOpenChange={setEntryOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className="entry-dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              trigger.current?.focus();
            }}
          >
            <div className="dialog-heading">
              <div>
                <Badge tone="brand">{t("Mode demo", "Demo mode")}</Badge>
                <Dialog.Title>
                  {t("Catat angka cepat", "Quick entry")}
                </Dialog.Title>
                <Dialog.Description>
                  {t(
                    "Satu catatan kecil untuk memahami keuanganmu.",
                    "A small entry to understand your finances.",
                  )}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("Tutup", "Close")}
                >
                  <X size={22} />
                </Button>
              </Dialog.Close>
            </div>
            {entryOpen && <NewEntry close={() => setEntryOpen(false)} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {notification && (
        <div className="toast" role="status">
          <Check size={20} />
          <p>{notification}</p>
          <button
            aria-label={t("Tutup notifikasi", "Dismiss notification")}
            onClick={() => setNotification("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </DemoContext>
  );
}
