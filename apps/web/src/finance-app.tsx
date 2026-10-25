import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, Banknote,
  ChartNoAxesCombined, CircleHelp, Eye, EyeOff, Home, List, LoaderCircle,
  CloudOff, ChevronRight, KeyRound, LaptopMinimal, LogOut, Plus, RefreshCw,
  Settings, ShieldCheck, Smartphone, WalletCards, X, PiggyBank, CalendarDays, Target,
  Download, TrendingDown, TrendingUp, Receipt,
  Tags,
} from "lucide-react";
import {
  authDeviceSessionListSchema, authSessionMutationSchema, budgetCreateResultSchema,
  budgetCreateSchema, budgetListSchema, categoryCreateSchema, categorySchema, categoryUpdateSchema,
  financeReportSchema, type FinanceReport,
  savingsContributionCreateSchema, savingsContributionListSchema, savingsContributionSchema,
  savingsGoalCreateResultSchema, savingsGoalCreateSchema,
  savingsGoalListSchema, savingsGoalUpdateResultSchema, type SavingsGoal, type SavingsGoalUpdate,
  financeEventPageSchema, financePostResultSchema, financePostSchema,
  privateSessionSchema, publicConfigSchema, profileCreateResultSchema,
  profileReadResultSchema, walletSchema, walletUpdateResultSchema, walletUpdateSchema, type Budget, type BudgetCreate,
  type FinanceEvent, type FinanceEventPage, type UserProfile, type Wallet,
} from "@venfinance/contracts";
import { formatIdr, monthBounds, parseIdrInput, progressPercent, shiftMonth, subtractMinor, sumMinor } from "@venfinance/domain";
import { Button, Card, EmptyState, TextField } from "@venfinance/ui";
import { ApiClientError, apiData, authPost } from "./api-client";
import { OfflineVaultPage } from "./offline-page";
import {
  isOfflineVaultUnlocked,
  lockOfflineVault,
  readOfflineSnapshot,
  saveLocalDraft,
  saveOfflineSnapshot,
  setOfflineOwner,
} from "./offline-store";
import { usePreferences } from "./preferences";

const walletArraySchema = walletSchema.array();
const categoryArraySchema = categorySchema.array();
type AuthDeviceSession = {
  id: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string | null;
  current: boolean;
};
type EventPage = FinanceEventPage;
type EventKind = "income" | "expense" | "transfer" | "savings_transfer" | "opening" | "refund";
const MAX_FINANCE_EXPORT_EVENTS = 25_000;

function loadingPanel(message: string) {
  return <Card className="finance-state" role="status"><LoaderCircle className="spin" size={20} />{message}</Card>;
}

function unavailablePanel(retry: () => void, message: string) {
  return <Card className="finance-state"><EmptyState icon={<CircleHelp />} title="Data belum dapat dimuat" action={<Button variant="secondary" onClick={retry}><RefreshCw size={17} />Coba lagi</Button>}>{message}</EmptyState></Card>;
}

function offlineRecoveryPanel(retry: () => void, message: string, label: string) {
  return <Card className="finance-state"><EmptyState icon={<CloudOff />} title="Data belum dapat dimuat" action={<div className="offline-recovery-actions"><Button variant="secondary" onClick={retry}><RefreshCw size={17} />Coba lagi</Button><Button asChild variant="ghost"><Link to="/offline-unlock">{label}</Link></Button></div>}>{message}</EmptyState></Card>;
}

export function PrivateFinanceApp() {
  const { t } = usePreferences();
  const config = useQuery({
    queryKey: ["private-public-config"],
    queryFn: () => apiData("/api/v1/config/public", publicConfigSchema),
    retry: false,
    staleTime: 60_000,
  });
  const session = useQuery({
    queryKey: ["private-session"],
    queryFn: () => apiData("/api/v1/session", privateSessionSchema),
    enabled: config.data?.authAvailable === true,
    retry: false,
    staleTime: 0,
  });
  if (config.isPending) return loadingPanel(t("Memeriksa sesi aman…", "Checking your secure session…"));
  if (config.isError) return offlineRecoveryPanel(() => void config.refetch(), t("Koneksi layanan belum dapat dipastikan. Data keuangan tidak ditampilkan.", "The service connection cannot be confirmed. Financial data is hidden."), t("Buka draf lokal", "Open local drafts"));
  if (!config.data.authAvailable) return <Navigate to="/login" replace />;
  if (session.isPending) return loadingPanel(t("Memeriksa sesi aman…", "Checking your secure session…"));
  if (session.isError) {
    if (session.error instanceof ApiClientError && session.error.status === 401) {
      return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
    }
    return offlineRecoveryPanel(() => void session.refetch(), t("Sesi belum dapat diverifikasi. Coba lagi saat koneksi tersedia.", "The session could not be verified. Try again when the connection is available."), t("Buka draf lokal", "Open local drafts"));
  }
  return <ProfileGate key={session.data.userId} ownerId={session.data.userId} />;
}

function ProfileGate({ ownerId }: { ownerId: string }) {
  const { t } = usePreferences();
  const queryClient = useQueryClient();
  useEffect(() => {
    setOfflineOwner(ownerId);
    return () => lockOfflineVault();
  }, [ownerId]);
  const profile = useQuery({
    queryKey: ["finance-profile", ownerId],
    queryFn: () => apiData("/api/v1/me", profileReadResultSchema),
    retry: false,
  });
  const currentProfile = profile.data?.profile;
  useEffect(() => {
    if (currentProfile && isOfflineVaultUnlocked(ownerId)) {
      void saveOfflineSnapshot(ownerId, "profile", currentProfile).catch(() => undefined);
    }
  }, [currentProfile, ownerId]);
  const createProfile = useMutation({
    mutationFn: (payload: { displayName: string; locale: "id-ID" | "en-US"; timezone: string }) =>
      apiData("/api/v1/me", profileCreateResultSchema, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["finance-profile", ownerId] }),
  });
  if (profile.isPending) return loadingPanel(t("Memuat profil pribadi…", "Loading your private profile…"));
  if (profile.isError) return offlineRecoveryPanel(() => void profile.refetch(), t("Profil tidak dapat dimuat. Data akun tetap tersembunyi sampai server berhasil merespons.", "Your profile could not be loaded. Account data remains hidden until the server responds."), t("Buka draf lokal", "Open local drafts"));
  if (!profile.data.profile) {
    return <ProfileSetup busy={createProfile.isPending} error={createProfile.error} onSubmit={(payload) => createProfile.mutate(payload)} />;
  }
  if (profile.data.profile.accountStatus !== "active") return <RestrictedProfile />;
  return <FinanceShell profile={profile.data.profile} ownerId={ownerId} />;
}

function RestrictedProfile() {
  const { t } = usePreferences();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function signOut() {
    setBusy(true);
    setError(false);
    try {
      await authPost("sign-out", {});
      lockOfflineVault();
      window.location.assign("/login");
    } catch {
      setError(true);
      setBusy(false);
    }
  }
  return <main className="profile-setup" id="main-content"><Card><span className="section-kicker">VenFinance</span><h1>{t("Akun belum dapat dibuka", "This account cannot be opened")}</h1><p className="muted">{t("Data pribadi tidak ditampilkan karena status akun tidak aktif. Hubungi dukungan jika kamu membutuhkan bantuan.", "Private data is hidden because this account is not active. Contact support if you need help.")}</p>{error ? <p role="alert" className="form-error">{t("Belum dapat keluar. Coba lagi.", "Could not sign out. Try again.")}</p> : null}<Button loading={busy} onClick={() => void signOut()}><LogOut size={17} />{t("Keluar", "Sign out")}</Button></Card></main>;
}

function ProfileSetup({ busy, error, onSubmit }: {
  busy: boolean; error: unknown; onSubmit: (payload: { displayName: string; locale: "id-ID" | "en-US"; timezone: string }) => void;
}) {
  const { t, locale, setLocale } = usePreferences();
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ displayName: displayName.trim(), locale, timezone });
  };
  return (
    <main className="profile-setup" id="main-content">
      <Card>
        <img src="/brand/venfinance-mark-violet.png" width="42" height="40" alt="" />
        <span className="section-kicker">{t("Langkah pertama", "First step")}</span>
        <h1>{t("Kenalan dulu", "Let’s get acquainted")}</h1>
        <p className="muted">{t("Nama ini membantu memberi konteks pada catatanmu. Kamu dapat mengubah preferensi nanti.", "This name helps personalize your records. You can change preferences later.")}</p>
        <form className="finance-form" onSubmit={submit}>
          <TextField label={t("Nama panggilan", "Display name")} autoComplete="nickname" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={100} required />
          <label className="private-select-field"><span>{t("Zona waktu", "Time zone")}</span><select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option value="Asia/Jakarta">WIB · Jakarta</option><option value="Asia/Makassar">WITA · Makassar</option><option value="Asia/Jayapura">WIT · Jayapura</option></select></label>
          <label className="private-select-field"><span>{t("Bahasa", "Language")}</span><select value={locale} onChange={(event) => setLocale(event.target.value as "id-ID" | "en-US")}><option value="id-ID">Bahasa Indonesia</option><option value="en-US">English</option></select></label>
          {error ? <p className="form-error" role="alert">{error instanceof ApiClientError ? error.publicMessage : t("Profil belum dapat disimpan.", "Your profile could not be saved.")}</p> : null}
          <Button type="submit" loading={busy}>{t("Lanjutkan", "Continue")}</Button>
        </form>
      </Card>
    </main>
  );
}

function FinanceShell({ profile, ownerId }: { profile: UserProfile; ownerId: string }) {
  const { t, theme, setTheme, locale, setLocale } = usePreferences();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [signOutError, setSignOutError] = useState(false);
  const active = location.pathname.endsWith("/transactions") || location.pathname.includes("/transactions/")
    ? "transactions"
    : location.pathname.includes("/budgets") ? "budgets"
      : location.pathname.includes("/insights") ? "settings"
        : location.pathname.includes("/categories") ? "settings"
      : location.pathname.includes("/goals") ? "goals"
      : location.pathname.includes("/wallets") ? "wallets"
      : location.pathname.includes("/offline") ? "offline"
        : location.pathname.includes("/settings") ? "settings" : "home";
  async function signOut() {
    setSignOutError(false);
    try {
      await authPost("sign-out", {});
      queryClient.clear();
      lockOfflineVault();
      window.location.assign("/login");
    } catch {
      setSignOutError(true);
    }
  }
  return (
    <div className="private-shell">
      <aside className="private-sidebar">
        <Link className="private-brand" to="/app"><img src="/brand/venfinance-mark-violet.png" alt="" width="34" height="32" /><span>VenFinance</span></Link>
        <p className="private-nav-label">{t("KEUANGAN", "FINANCES")}</p>
        <nav aria-label={t("Navigasi keuangan", "Finance navigation")}>
          <NavLink end to="/app" className={({ isActive }) => isActive ? "active" : ""}><Home size={19} />{t("Beranda", "Home")}</NavLink>
          <NavLink to="/app/transactions" className={({ isActive }) => isActive ? "active" : ""}><List size={19} />{t("Transaksi", "Transactions")}</NavLink>
          <NavLink to="/app/budgets" className={({ isActive }) => isActive ? "active" : ""}><PiggyBank size={19} />{t("Anggaran", "Budgets")}</NavLink>
          <NavLink to="/app/goals" className={({ isActive }) => isActive ? "active" : ""}><Target size={19} />{t("Target tabungan", "Savings goals")}</NavLink>
          <NavLink to="/app/insights" className={({ isActive }) => isActive ? "active" : ""}><ChartNoAxesCombined size={19} />{t("Laporan", "Reports")}</NavLink>
          <NavLink to="/app/wallets" className={({ isActive }) => isActive ? "active" : ""}><WalletCards size={19} />{t("Dompet", "Wallets")}</NavLink>
          <NavLink to="/app/offline" className={({ isActive }) => isActive ? "active" : ""}><CloudOff size={19} />{t("Draf offline", "Offline drafts")}</NavLink>
          <NavLink to="/app/settings" className={({ isActive }) => isActive ? "active" : ""}><Settings size={19} />{t("Pengaturan", "Settings")}</NavLink>
        </nav>
        <div className="private-sidebar-bottom">
          <Link to="/faq"><CircleHelp size={18} />{t("Pusat bantuan", "Help center")}</Link>
          <Button variant="ghost" onClick={() => void signOut()}><LogOut size={18} />{t("Keluar", "Sign out")}</Button>
        </div>
      </aside>
      <div className="private-workspace">
        <header className="private-topbar">
          <div className="private-topbar-user"><span className="private-avatar" aria-hidden="true">{profile.displayName?.slice(0, 1).toUpperCase() ?? "V"}</span><div><strong>{t("Hai", "Hello")}, {profile.displayName ?? t("teman", "there")}</strong><span>{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: profile.timezone }).format(new Date())}</span></div></div>
          <div className="private-topbar-actions">
            <Button variant="ghost" size="icon" aria-label={t("Ganti tema", "Toggle theme")} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <EyeOff size={19} /> : <Eye size={19} />}</Button>
            <Button variant="secondary" size="small" onClick={() => setLocale(locale === "id-ID" ? "en-US" : "id-ID")}>{locale === "id-ID" ? "ID" : "EN"}</Button>
          </div>
        </header>
        {signOutError ? <div className="private-signout-error" role="alert">{t("Belum dapat keluar. Coba lagi.", "Could not sign out. Try again.")}</div> : null}
        <main className="private-content" id="main-content">
          <Routes>
            <Route index element={<Dashboard profile={profile} ownerId={ownerId} />} />
            <Route path="transactions" element={<TransactionsPage profile={profile} ownerId={ownerId} />} />
            <Route path="transactions/new" element={<TransactionsPage profile={profile} ownerId={ownerId} />} />
            <Route path="budgets" element={<BudgetsPage profile={profile} ownerId={ownerId} />} />
            <Route path="goals" element={<SavingsGoalsPage profile={profile} ownerId={ownerId} />} />
            <Route path="goals/:goalId" element={<SavingsGoalsPage profile={profile} ownerId={ownerId} />} />
            <Route path="insights" element={<InsightsPage profile={profile} ownerId={ownerId} />} />
            <Route path="categories" element={<CategoriesPage ownerId={ownerId} />} />
            <Route path="wallets" element={<WalletsPage ownerId={ownerId} />} />
            <Route path="offline" element={<OfflineVaultPage ownerId={ownerId} allowSetup />} />
            <Route path="settings" element={<MoreSettingsPage profile={profile} />} />
            <Route path="settings/security" element={<SecuritySessionsPage ownerId={ownerId} profile={profile} />} />
            <Route path="*" element={<PrivateNotFound />} />
          </Routes>
        </main>
        <nav className="private-bottom-nav" aria-label={t("Navigasi aplikasi", "App navigation")}>
          <NavLink end to="/app" className={active === "home" ? "active" : ""}><Home size={20} /><span>{t("Beranda", "Home")}</span></NavLink>
          <NavLink to="/app/transactions" className={active === "transactions" ? "active" : ""}><List size={20} /><span>{t("Transaksi", "Transactions")}</span></NavLink>
          <Link className="private-add-button" to="/app/transactions/new" aria-label={t("Catat transaksi", "Record transaction")}><Plus size={22} /><span>{t("Catat", "Record")}</span></Link>
          <NavLink to="/app/budgets" className={active === "budgets" ? "active" : ""}><PiggyBank size={20} /><span>{t("Anggaran", "Budgets")}</span></NavLink>
          <NavLink to="/app/settings" className={active === "settings" ? "active" : ""}><Settings size={19} /><span>{t("Lainnya", "More")}</span></NavLink>
        </nav>
      </div>
    </div>
  );
}

function MoreSettingsPage({ profile }: { profile: UserProfile }) {
  const { t } = usePreferences();
  return (
    <section className="settings-page" aria-label={t("Pusat pengaturan", "Settings center")}>
      <FinanceHeading title={t("Lainnya", "More")} description={t("Pengaturan akun dan akses ke fitur pribadimu.", "Account settings and access to your personal features.")} />
      <Card className="settings-account-card">
        <span className="settings-account-avatar" aria-hidden="true">{profile.displayName?.slice(0, 1).toUpperCase() ?? "V"}</span>
        <div><strong>{profile.displayName ?? t("Akun pribadi", "Personal account")}</strong><span>{t("Pengaturan dan keamanan VenFinance kamu.", "Your VenFinance settings and security.")}</span></div>
      </Card>
      <h2 className="settings-section-title">{t("Pengaturan dan fitur", "Settings and features")}</h2>
      <div className="settings-directory">
        <Link className="settings-directory-card" to="/app/wallets">
          <span className="settings-directory-icon"><WalletCards size={22} /></span>
          <span><strong>{t("Sumber uang", "Money sources")}</strong><small>{t("Kelola dompet virtual dan saldo yang tercatat.", "Manage virtual wallets and recorded balances.")}</small></span>
          <ChevronRight size={20} />
        </Link>
        <Link className="settings-directory-card" to="/app/goals">
          <span className="settings-directory-icon"><Target size={22} /></span>
          <span><strong>{t("Target tabungan", "Savings goals")}</strong><small>{t("Pantau target dan setoran dari transfer nyata.", "Track a goal and contributions from actual transfers.")}</small></span>
          <ChevronRight size={20} />
        </Link>
        <Link className="settings-directory-card" to="/app/insights">
          <span className="settings-directory-icon"><ChartNoAxesCombined size={22} /></span>
          <span><strong>{t("Laporan & insight", "Reports & insights")}</strong><small>{t("Tinjau arus kas dan kebiasaan dari catatan terkonfirmasi.", "Review cash flow and habits from confirmed records.")}</small></span>
          <ChevronRight size={20} />
        </Link>
        <Link className="settings-directory-card" to="/app/categories">
          <span className="settings-directory-icon"><Tags size={22} /></span>
          <span><strong>{t("Kategori transaksi", "Transaction categories")}</strong><small>{t("Atur kategori dan subkategori tanpa mengubah histori transaksi.", "Manage categories and subcategories without changing transaction history.")}</small></span>
          <ChevronRight size={20} />
        </Link>
        <Link className="settings-directory-card" to="/app/settings/security">
          <span className="settings-directory-icon"><ShieldCheck size={22} /></span>
          <span><strong>{t("Keamanan & perangkat", "Security & devices")}</strong><small>{t("Tinjau sesi aktif dan keluarkan perangkat.", "Review active sessions and sign devices out.")}</small></span>
          <ChevronRight size={20} />
        </Link>
        <Link className="settings-directory-card" to="/app/offline">
          <span className="settings-directory-icon settings-directory-icon-muted"><CloudOff size={22} /></span>
          <span><strong>{t("Draf offline", "Offline drafts")}</strong><small>{t("Kelola draf terenkripsi di perangkat ini.", "Manage encrypted drafts on this device.")}</small></span>
          <ChevronRight size={20} />
        </Link>
        <Link className="settings-directory-card" to="/faq">
          <span className="settings-directory-icon settings-directory-icon-help"><CircleHelp size={22} /></span>
          <span><strong>{t("Pusat bantuan", "Help center")}</strong><small>{t("Baca panduan dan pertanyaan umum.", "Read guides and frequently asked questions.")}</small></span>
          <ChevronRight size={20} />
        </Link>
      </div>
    </section>
  );
}

type SessionAction =
  | { type: "revoke"; sessionId: string }
  | { type: "revoke-others" }
  | { type: "revoke-all" };

function SecuritySessionsPage({ ownerId, profile }: { ownerId: string; profile: UserProfile }) {
  const { t, locale } = usePreferences();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<SessionAction | null>(null);
  const sessions = useQuery({
    queryKey: ["auth-device-sessions", ownerId],
    queryFn: () => apiData("/api/v1/security/sessions", authDeviceSessionListSchema),
    retry: false,
    staleTime: 0,
  });
  const mutation = useMutation({
    mutationFn: async (action: SessionAction) => {
      const path = action.type === "revoke"
        ? "revoke"
        : action.type === "revoke-others" ? "revoke-others" : "revoke-all";
      const body = action.type === "revoke" ? { sessionId: action.sessionId } : {};
      return apiData(`/api/v1/security/sessions/${path}`, authSessionMutationSchema, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: async (result) => {
      setConfirmAction(null);
      if (result.currentSessionRevoked) {
        queryClient.clear();
        lockOfflineVault();
        window.location.assign("/login");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["auth-device-sessions", ownerId] });
    },
  });
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: profile.timezone,
  }).format(new Date(value));

  return (
    <section className="settings-page security-page" aria-label={t("Keamanan akun", "Account security")}>
      <FinanceHeading title={t("Keamanan & perangkat", "Security & devices")} description={t("Kelola sesi masuk dan lindungi akses ke akunmu.", "Manage sign-in sessions and protect access to your account.")} />
      <Card className="security-hero-card">
        <span className="security-hero-icon"><ShieldCheck size={30} /></span>
        <div><h2>{t("Jaga akun tetap aman", "Keep your account secure")}</h2><p>{t("Keluarkan perangkat yang tidak kamu kenali. Token sesi tidak ditampilkan di halaman ini.", "Sign out devices you do not recognize. Session tokens are never shown here.")}</p></div>
      </Card>

      <div className="security-layout">
        <Card className="security-session-card">
          <div className="security-card-heading"><span className="settings-directory-icon"><Smartphone size={22} /></span><div><h2>{t("Perangkat yang masuk", "Signed-in devices")}</h2><p>{t("Daftar sesi aktif yang dilaporkan penyedia autentikasi.", "Active sessions reported by the authentication provider.")}</p></div></div>
          {sessions.isPending ? loadingPanel(t("Memuat sesi perangkat…", "Loading device sessions…")) : null}
          {sessions.isError ? <EmptyState icon={<CircleHelp />} title={t("Sesi belum dapat dimuat", "Sessions are unavailable")} action={<Button variant="secondary" onClick={() => void sessions.refetch()}><RefreshCw size={17} />{t("Coba lagi", "Try again")}</Button>}>{t("Daftar perangkat tidak ditampilkan sampai server berhasil memverifikasinya.", "Devices stay hidden until the server can verify the session list.")}</EmptyState> : null}
          {sessions.data?.length === 0 ? <EmptyState icon={<Smartphone />} title={t("Tidak ada sesi aktif", "No active sessions")}>{t("Segarkan halaman setelah masuk kembali.", "Refresh after signing in again.")}</EmptyState> : null}
          {sessions.data?.length ? <div className="security-session-list">
            {sessions.data.map((session: AuthDeviceSession) => (
              <article className="security-session-row" key={session.id}>
                <span className="security-device-icon">{session.userAgent?.toLowerCase().includes("mobile") || session.userAgent?.toLowerCase().includes("android") || session.userAgent?.toLowerCase().includes("iphone") ? <Smartphone size={20} /> : <LaptopMinimal size={20} />}</span>
                <div className="security-session-copy">
                  <strong>{session.current ? t("Perangkat ini", "This device") : t("Perangkat lain", "Other device")} {session.current ? <span className="security-current-badge">{t("Saat ini", "Current")}</span> : null}</strong>
                  <span>{session.userAgent ?? t("Perangkat atau browser tidak dilaporkan", "Device or browser not reported")}</span>
                  <small>{t("Masuk", "Signed in")} {formatDate(session.createdAt)} · {t("berlaku sampai", "expires")} {formatDate(session.expiresAt)}</small>
                  {confirmAction?.type === "revoke" && confirmAction.sessionId === session.id ? <div className="security-confirmation" role="group" aria-label={t("Konfirmasi keluarkan perangkat", "Confirm device sign-out")}><p>{session.current ? t("Kamu akan keluar dari perangkat ini.", "You will sign out on this device.") : t("Sesi perangkat ini akan dicabut.", "This device session will be revoked.")}</p><Button size="small" loading={mutation.isPending} onClick={() => mutation.mutate(confirmAction)}>{t("Ya, keluarkan", "Yes, sign out")}</Button><Button size="small" variant="secondary" onClick={() => setConfirmAction(null)}>{t("Batal", "Cancel")}</Button></div> : null}
                </div>
                {!session.current ? <Button size="small" variant="secondary" disabled={mutation.isPending} onClick={() => setConfirmAction({ type: "revoke", sessionId: session.id })}>{t("Keluarkan", "Sign out")}</Button> : null}
                {session.current ? <span className="security-current-label"><span aria-hidden="true" />{t("Aktif", "Active")}</span> : null}
              </article>
            ))}
          </div> : null}
          {mutation.isError ? <p className="form-error" role="alert">{t("Perubahan sesi belum berhasil. Coba muat ulang daftar dan ulangi.", "The session change failed. Refresh the list and try again.")}</p> : null}
          {sessions.data && sessions.data.filter((session: AuthDeviceSession) => !session.current).length > 0 ? <div className="security-session-actions">
            <Button variant="secondary" disabled={mutation.isPending} onClick={() => setConfirmAction({ type: "revoke-others" })}><LogOut size={17} />{t("Logout dari perangkat lain", "Sign out other devices")}</Button>
            <Button variant="ghost" disabled={mutation.isPending} onClick={() => setConfirmAction({ type: "revoke-all" })}>{t("Logout dari semua perangkat", "Sign out all devices")}</Button>
          </div> : null}
          {confirmAction?.type === "revoke-others" || confirmAction?.type === "revoke-all" ? <div className="security-confirmation security-global-confirm" role="group" aria-label={t("Konfirmasi pencabutan sesi", "Confirm session revocation")}><p>{confirmAction.type === "revoke-all" ? t("Semua perangkat, termasuk perangkat ini, akan keluar.", "All devices, including this one, will be signed out.") : t("Semua perangkat lain akan keluar. Sesi perangkat ini tetap aktif.", "All other devices will be signed out. This device stays active.")}</p><Button size="small" loading={mutation.isPending} onClick={() => mutation.mutate(confirmAction)}>{t("Konfirmasi", "Confirm")}</Button><Button size="small" variant="secondary" onClick={() => setConfirmAction(null)}>{t("Batal", "Cancel")}</Button></div> : null}
        </Card>

        <div className="security-side-column">
          <Card className="security-password-card"><span className="settings-directory-icon"><KeyRound size={22} /></span><div><h2>{t("Kata sandi", "Password")}</h2><p>{t("Minta kode pemulihan melalui email untuk mengganti kata sandi.", "Request an email recovery code to change your password.")}</p><Button asChild variant="secondary" size="small"><Link to="/forgot-password">{t("Atur ulang kata sandi", "Reset password")}</Link></Button></div></Card>
          <Card className="security-mfa-notice"><span className="settings-directory-icon"><ShieldCheck size={22} /></span><div><h2>{t("Verifikasi dua langkah", "Two-step verification")}</h2><p>{t("Belum tersedia melalui provider autentikasi saat ini. Akun operator tetap dibatasi sampai MFA terverifikasi.", "Not available through the current authentication provider. Operator accounts remain restricted until MFA is verified.")}</p><strong>{t("Belum aktif", "Not active")}</strong></div></Card>
          <Card className="security-tips-card"><h2>{t("Tips menjaga keamanan akun", "Account security tips")}</h2><ul><li>{t("Gunakan kata sandi yang unik.", "Use a unique password.")}</li><li>{t("Jangan bagikan kode verifikasi atau kata sandi.", "Never share verification codes or your password.")}</li><li>{t("Keluarkan perangkat yang tidak kamu kenali.", "Sign out devices you do not recognize.")}</li></ul></Card>
        </div>
      </div>
    </section>
  );
}

function FinanceHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="finance-heading"><div><h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{action}</div>;
}

type WalletQueryResult = { items: Wallet[]; source: "server" | "device"; savedAt: string | null };
type Category = ReturnType<typeof categorySchema.parse>;
type CategoryQueryResult = { items: Category[]; source: "server" | "device" };

async function fetchWallets(ownerId: string): Promise<WalletQueryResult> {
  try {
    const items = await apiData("/api/v1/wallets", walletArraySchema);
    if (isOfflineVaultUnlocked(ownerId)) await saveOfflineSnapshot(ownerId, "wallets", items).catch(() => undefined);
    return { items, source: "server", savedAt: null };
  } catch (error) {
    if (isOfflineVaultUnlocked(ownerId) && (!navigator.onLine || (error instanceof ApiClientError && error.status >= 500))) {
      const snapshot = await readOfflineSnapshot<unknown>(ownerId, "wallets");
      if (snapshot) return { items: walletArraySchema.parse(snapshot.value), source: "device", savedAt: snapshot.savedAt };
    }
    throw error;
  }
}

function useWallets(ownerId: string) {
  return useQuery({ queryKey: ["finance-wallets", ownerId], queryFn: () => fetchWallets(ownerId), retry: false });
}

async function fetchCategories(ownerId: string): Promise<CategoryQueryResult> {
  try {
    const items = await apiData("/api/v1/categories", categoryArraySchema);
    if (isOfflineVaultUnlocked(ownerId)) await saveOfflineSnapshot(ownerId, "categories", items).catch(() => undefined);
    return { items, source: "server" };
  } catch (error) {
    if (isOfflineVaultUnlocked(ownerId) && (!navigator.onLine || (error instanceof ApiClientError && error.status >= 500))) {
      const snapshot = await readOfflineSnapshot<unknown>(ownerId, "categories");
      if (snapshot) return { items: categoryArraySchema.parse(snapshot.value), source: "device" };
    }
    throw error;
  }
}

function useCategories(ownerId: string) {
  return useQuery({ queryKey: ["finance-categories", ownerId], queryFn: () => fetchCategories(ownerId), retry: false });
}

function CategoriesPage({ ownerId }: { ownerId: string }) {
  const { t } = usePreferences();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [pendingArchive, setPendingArchive] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const categories = useQuery({
    queryKey: ["finance-categories", ownerId, "manage"],
    queryFn: () => apiData("/api/v1/categories?includeArchived=true", categoryArraySchema),
    retry: false,
  });
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["finance-categories", ownerId] });
  };
  const create = useMutation({
    mutationFn: (payload: ReturnType<typeof categoryCreateSchema.parse>) => apiData("/api/v1/categories", categorySchema, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => { setEditing(null); setError(null); await refresh(); },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Kategori belum dapat disimpan.", "The category could not be saved.") : t("Periksa nama kategori dan kategori induk.", "Check the category name and parent.")),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof categoryUpdateSchema.parse> }) => apiData(`/api/v1/categories/${id}`, categorySchema, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: async () => { setEditing(null); setPendingArchive(null); setError(null); await refresh(); },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Kategori belum dapat diperbarui.", "The category could not be updated.") : t("Perubahan kategori belum dapat disimpan.", "The category changes could not be saved.")),
  });
  const active = categories.data?.filter((category) => !category.archivedAt) ?? [];
  const archived = categories.data?.filter((category) => category.archivedAt) ?? [];
  function saveCategory(payload: ReturnType<typeof categoryCreateSchema.parse>) {
    setError(null);
    if (editing === "new") create.mutate(payload);
    else if (editing) update.mutate({ id: editing.id, payload: categoryUpdateSchema.parse({ ...payload, archived: false }) });
  }
  function setArchived(category: Category, archivedValue: boolean) {
    setError(null);
    update.mutate({
      id: category.id,
      payload: categoryUpdateSchema.parse({
        name: category.name,
        parentId: category.parentId,
        iconKey: category.iconKey,
        colorToken: category.colorToken,
        archived: archivedValue,
      }),
    });
  }
  return (
    <section className="category-manager-page" aria-label={t("Pengelolaan kategori", "Category management")}>
      <FinanceHeading title={t("Kategori transaksi", "Transaction categories")} description={t("Sesuaikan kategori untuk catatan baru. Mengarsipkan kategori menjaga transaksi lama tetap utuh.", "Set up categories for new records. Archiving preserves existing transaction history.")} action={<Button onClick={() => { setEditing("new"); setError(null); }}><Plus size={18} />{t("Tambah kategori", "Add category")}</Button>} />
      {error ? <Card className="private-form-card"><p className="form-error" role="alert">{error}</p></Card> : null}
      {editing !== null ? <CategoryEditor
        key={editing === "new" ? "new-category" : editing.id}
        category={editing === "new" ? null : editing}
        parentOptions={active.filter((category) => !category.parentId && category.id !== (editing === "new" ? null : editing.id))}
        busy={create.isPending || update.isPending}
        error={null}
        onCancel={() => { setEditing(null); setError(null); }}
        onSubmit={saveCategory}
      /> : null}
      {categories.isPending ? loadingPanel(t("Memuat kategori…", "Loading categories…")) : categories.isError ? unavailablePanel(() => void categories.refetch(), t("Kategori belum dapat dimuat.", "Categories could not be loaded.")) : <>
        <div className="category-manager-summary"><Tags size={19} /><span>{t(`${active.length} kategori aktif`, `${active.length} active categories`)}</span><small>{t("Perubahan hanya berlaku untuk catatan berikutnya.", "Changes apply to future records only.")}</small></div>
        {active.length ? <div className="category-manager-grid">{active.map((category) => <CategoryManagerCard
          key={category.id}
          category={category}
          parentName={active.find((candidate) => candidate.id === category.parentId)?.name ?? null}
          t={t}
          onEdit={() => { setEditing(category); setError(null); }}
          onArchive={() => setPendingArchive(category)}
          confirmArchive={pendingArchive?.id === category.id}
          busy={update.isPending}
          onConfirmArchive={() => setArchived(category, true)}
          onCancelArchive={() => setPendingArchive(null)}
        />)}</div> : <Card><EmptyState icon={<Tags />} title={t("Belum ada kategori aktif", "No active categories yet")} action={<Button onClick={() => setEditing("new")}><Plus size={17} />{t("Buat kategori", "Create a category")}</Button>}>{t("Kategori membantu mengelompokkan pengeluaran tanpa mencampur saldo dompet.", "Categories help group spending without changing wallet balances.")}</EmptyState></Card>}
        {archived.length ? <details className="category-archive-section"><summary>{t("Kategori arsip", "Archived categories")} · {archived.length}</summary><div className="category-manager-grid">{archived.map((category) => <CategoryManagerCard key={category.id} category={category} parentName={null} t={t} busy={update.isPending} onRestore={() => setArchived(category, false)} />)}</div></details> : null}
      </>}
    </section>
  );
}

function CategoryManagerCard({ category, parentName, t, onEdit, onArchive, confirmArchive, busy, onConfirmArchive, onCancelArchive, onRestore }: {
  category: Category;
  parentName: string | null;
  t: (id: string, en: string) => string;
  onEdit?: () => void;
  onArchive?: () => void;
  confirmArchive?: boolean;
  busy: boolean;
  onConfirmArchive?: () => void;
  onCancelArchive?: () => void;
  onRestore?: () => void;
}) {
  return <Card className={`category-manager-card${category.archivedAt ? " is-archived" : ""}`}>
    <span className={`category-manager-icon ${category.colorToken ?? "lavender"}`}><Tags size={20} /></span>
    <div className="category-manager-copy"><strong>{category.name}</strong><small>{parentName ? t(`Subkategori · ${parentName}`, `Subcategory · ${parentName}`) : t("Kategori utama", "Top-level category")}</small></div>
    <div className="category-manager-actions">{onEdit ? <Button variant="secondary" size="small" onClick={onEdit}>{t("Edit", "Edit")}</Button> : null}{onArchive ? confirmArchive ? <><Button size="small" loading={busy} onClick={onConfirmArchive}>{t("Konfirmasi arsip", "Confirm archive")}</Button><Button variant="ghost" size="small" onClick={onCancelArchive}>{t("Batal", "Cancel")}</Button></> : <Button variant="ghost" size="small" onClick={onArchive}>{t("Arsipkan", "Archive")}</Button> : null}{onRestore ? <Button variant="secondary" size="small" loading={busy} onClick={onRestore}>{t("Pulihkan", "Restore")}</Button> : null}</div>
  </Card>;
}

function CategoryEditor({ category, parentOptions, busy, error, onCancel, onSubmit }: {
  category: Category | null;
  parentOptions: Category[];
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (payload: ReturnType<typeof categoryCreateSchema.parse>) => void;
}) {
  const { t } = usePreferences();
  const [name, setName] = useState(category?.name ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [iconKey, setIconKey] = useState(category?.iconKey ?? "receipt");
  const [colorToken, setColorToken] = useState(category?.colorToken ?? "lavender");
  return <Card className="private-form-card category-editor">
    <div className="private-form-heading"><div><span className="section-kicker">{t("Kategori dan subkategori", "Categories and subcategories")}</span><h2>{category ? t("Edit kategori", "Edit category") : t("Kategori baru", "New category")}</h2></div><Button variant="ghost" size="icon" aria-label={t("Tutup", "Close")} onClick={onCancel}><X size={19} /></Button></div>
    <form className="finance-form" onSubmit={(event) => { event.preventDefault(); onSubmit(categoryCreateSchema.parse({ name, parentId: parentId || null, iconKey: iconKey || null, colorToken })); }}>
      <TextField label={t("Nama kategori", "Category name")} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required />
      <label className="private-select-field"><span>{t("Kategori induk (opsional)", "Parent category (optional)")}</span><select value={parentId} onChange={(event) => setParentId(event.target.value)}><option value="">{t("Kategori utama", "Top-level category")}</option>{parentOptions.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label className="private-select-field"><span>{t("Warna kategori", "Category color")}</span><select value={colorToken} onChange={(event) => setColorToken(event.target.value)}><option value="peach">{t("Persik", "Peach")}</option><option value="mint">{t("Mint", "Mint")}</option><option value="blue">{t("Biru", "Blue")}</option><option value="lavender">{t("Lavender", "Lavender")}</option><option value="pink">{t("Merah muda", "Pink")}</option></select></label>
      <TextField label={t("Kunci ikon (opsional)", "Icon key (optional)")} value={iconKey} onChange={(event) => setIconKey(event.target.value)} maxLength={80} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="private-form-actions"><Button type="submit" loading={busy}>{t("Simpan kategori", "Save category")}</Button><Button type="button" variant="secondary" onClick={onCancel}>{t("Batal", "Cancel")}</Button></div>
      <p className="muted">{t("Kategori yang diarsipkan tetap terlihat pada histori lama dan tidak dipakai untuk catatan baru.", "Archived categories remain in old history and are unavailable for new records.")}</p>
    </form>
  </Card>;
}

function useRecentEvents(ownerId: string, limit: number) {
  const query = new URLSearchParams({ limit: String(limit) });
  return useQuery({ queryKey: ["finance-events", ownerId, "recent", limit], queryFn: () => apiData(`/api/v1/transactions?${query}`, financeEventPageSchema), retry: false });
}

function monthInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

function useBudgets(ownerId: string, month: string) {
  const bounds = monthBounds(month);
  const query = new URLSearchParams(bounds);
  return useQuery({
    queryKey: ["finance-budgets", ownerId, month],
    queryFn: () => apiData(`/api/v1/budgets?${query}`, budgetListSchema),
    retry: false,
  });
}

function useSavingsGoals(ownerId: string) {
  return useQuery({
    queryKey: ["finance-savings-goals", ownerId],
    queryFn: () => apiData("/api/v1/savings-goals", savingsGoalListSchema),
    retry: false,
  });
}

function localDateInTimezone(timezone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: "year" | "month" | "day") => parts.find((item) => item.type === type)?.value ?? "01";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function shiftLocalDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function reportMoney(amount: string, locale: "id-ID" | "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency", currency: "IDR", maximumFractionDigits: 0, minimumFractionDigits: 0,
  }).format(BigInt(amount)).replace(/\u00a0/g, "").replace(/^-/, "−");
}

function ratioPercent(numerator: string, denominator: string) {
  const top = BigInt(numerator);
  const bottom = BigInt(denominator);
  if (bottom <= 0n) return 0;
  const value = (top < 0n ? -top : top) * 100n / bottom;
  return Number(value > 100n ? 100n : value);
}

function downloadFinanceReport(report: FinanceReport) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const safeLabel = (value: string) => /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
  const rows = [
    ["VenFinance · Ringkasan laporan"],
    ["Periode", report.from, report.to],
    ["Zona waktu", report.timezone],
    [],
    ["Ringkasan", "Nominal (IDR)"],
    ["Pemasukan", report.current.incomeMinor],
    ["Pengeluaran kotor", report.current.grossExpenseMinor],
    ["Refund", report.current.refundMinor],
    ["Pengeluaran bersih", (BigInt(report.current.grossExpenseMinor) - BigInt(report.current.refundMinor)).toString()],
    ["Transaksi terkonfirmasi", String(report.current.eventCount)],
    [],
    ["Kategori", "Pengeluaran bersih (IDR)", "Jumlah transaksi"],
    ...report.categories.map((item) => [safeLabel(item.categoryName), item.amountMinor, String(item.eventCount)]),
    [],
    ["Merchant", "Pengeluaran bersih (IDR)", "Jumlah transaksi"],
    ...report.merchants.map((item) => [safeLabel(item.merchant), item.amountMinor, String(item.eventCount)]),
  ];
  const blob = new Blob([`\uFEFF${rows.map((row) => row.map((value) => escape(value ?? "")).join(",")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `venfinance-laporan-${report.from}-${report.to}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function InsightsPage({ profile, ownerId }: { profile: UserProfile; ownerId: string }) {
  const { t, locale, hidden } = usePreferences();
  const today = localDateInTimezone(profile.timezone);
  const [from, setFrom] = useState(() => `${monthInTimezone(profile.timezone)}-01`);
  const [to, setTo] = useState(today);
  const query = useQuery({
    queryKey: ["finance-report", ownerId, from, to],
    queryFn: () => apiData(`/api/v1/reports/summary?${new URLSearchParams({ from, to })}`, financeReportSchema),
    enabled: financeReportRangeValid(from, to),
    retry: false,
  });
  const activeRange = financeReportRangeValid(from, to);
  const displayMoney = (amount: string) => hidden ? "Rp••••••" : reportMoney(amount, locale);
  const periodLabel = (start: string, end: string) => {
    const format = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
    const asDate = (value: string) => new Date(`${value}T12:00:00Z`);
    return `${format.format(asDate(start))} – ${format.format(asDate(end))}`;
  };
  function chooseRange(kind: "month" | "previous" | "seven" | "thirty") {
    const currentMonth = monthInTimezone(profile.timezone);
    if (kind === "month") {
      setFrom(`${currentMonth}-01`);
      setTo(today);
    } else if (kind === "previous") {
      const previous = shiftMonth(currentMonth, -1);
      setFrom(`${previous}-01`);
      setTo(monthBounds(previous).endsOn);
    } else {
      const count = kind === "seven" ? 7 : 30;
      setFrom(shiftLocalDate(today, -(count - 1)));
      setTo(today);
    }
  }
  const report = query.data;
  const netExpense = report
    ? (BigInt(report.current.grossExpenseMinor) - BigInt(report.current.refundMinor)).toString()
    : "0";
  const previousNetExpense = report
    ? (BigInt(report.previous.grossExpenseMinor) - BigInt(report.previous.refundMinor)).toString()
    : "0";
  const netCashflow = report
    ? (BigInt(report.current.incomeMinor) - BigInt(netExpense)).toString()
    : "0";
  const maxDaily = report?.daily.reduce((max, item) => {
    const income = BigInt(item.incomeMinor); const expense = BigInt(item.expenseMinor);
    const largest = [income < 0n ? -income : income, expense < 0n ? -expense : expense].reduce((a, b) => a > b ? a : b, 0n);
    return largest > max ? largest : max;
  }, 0n) ?? 0n;
  const categoryMagnitude = report?.categories.reduce((sum, item) => {
    const value = BigInt(item.amountMinor);
    return sum + (value < 0n ? -value : value);
  }, 0n).toString() ?? "0";
  const netChange = report ? BigInt(netExpense) - BigInt(previousNetExpense) : 0n;
  const incomeChange = report ? BigInt(report.current.incomeMinor) - BigInt(report.previous.incomeMinor) : 0n;
  return (
    <section className="insights-page" aria-label={t("Laporan dan insight keuangan", "Finance reports and insights")}>
      <FinanceHeading
        title={t("Laporan & insight", "Reports & insights")}
        description={t("Angka bersumber dari transaksi terkonfirmasi di periode dan zona waktu profilmu.", "Figures come from confirmed transactions in your selected period and profile time zone.")}
        action={report ? <Button variant="secondary" onClick={() => downloadFinanceReport(report)}><Download size={17} />{t("Unduh ringkasan CSV", "Download summary CSV")}</Button> : undefined}
      />
      <Card className="report-range-card">
        <div className="report-range-presets" aria-label={t("Pilih periode laporan", "Choose report period")}>
          <Button variant="ghost" size="small" onClick={() => chooseRange("month")}>{t("Bulan ini", "This month")}</Button>
          <Button variant="ghost" size="small" onClick={() => chooseRange("previous")}>{t("Bulan lalu", "Last month")}</Button>
          <Button variant="ghost" size="small" onClick={() => chooseRange("seven")}>{t("7 hari", "7 days")}</Button>
          <Button variant="ghost" size="small" onClick={() => chooseRange("thirty")}>{t("30 hari", "30 days")}</Button>
        </div>
        <div className="report-range-inputs">
          <label><span>{t("Dari tanggal", "From date")}</span><input aria-label={t("Dari tanggal", "From date")} type="date" value={from} max={to || today} onChange={(event) => setFrom(event.target.value)} /></label>
          <span className="report-range-separator" aria-hidden="true">–</span>
          <label><span>{t("Sampai tanggal", "To date")}</span><input aria-label={t("Sampai tanggal", "To date")} type="date" value={to} min={from} max={today} onChange={(event) => setTo(event.target.value)} /></label>
          <span className="report-timezone"><CalendarDays size={17} />{profile.timezone}</span>
        </div>
        {!activeRange ? <p className="form-error" role="alert">{t("Pilih rentang tanggal 1–366 hari yang berurutan.", "Choose a continuous date range of 1–366 days.")}</p> : null}
      </Card>
      {query.isPending && activeRange ? loadingPanel(t("Menghitung laporan terkonfirmasi…", "Calculating confirmed report…")) : null}
      {query.isError ? unavailablePanel(() => void query.refetch(), t("Data laporan belum dapat diverifikasi. Coba lagi saat koneksi pulih.", "Report data could not be verified. Try again when the connection is restored.")) : null}
      {report ? <>
        <p className="report-period-caption">{periodLabel(report.from, report.to)} · {report.timezone} · {t("data server", "server data")}</p>
        <div className="report-metric-grid">
          <Card className="report-metric report-metric-income"><span><TrendingUp size={19} />{t("Pemasukan", "Income")}</span><strong>{displayMoney(report.current.incomeMinor)}</strong><small>{hidden ? t("Nominal disembunyikan", "Amount hidden") : incomeChange === 0n ? t("Sama dengan periode sebelumnya", "Same as previous period") : incomeChange > 0n ? t("Lebih tinggi dari periode sebelumnya", "Higher than previous period") : t("Lebih rendah dari periode sebelumnya", "Lower than previous period")}</small></Card>
          <Card className="report-metric report-metric-expense"><span><TrendingDown size={19} />{t("Pengeluaran bersih", "Net spending")}</span><strong>{displayMoney(netExpense)}</strong><small>{hidden ? t("Nominal disembunyikan", "Amount hidden") : netChange === 0n ? t("Sama dengan periode sebelumnya", "Same as previous period") : netChange > 0n ? t("Lebih tinggi dari periode sebelumnya", "Higher than previous period") : t("Lebih rendah dari periode sebelumnya", "Lower than previous period")}</small></Card>
          <Card className="report-metric report-metric-refund"><span><Receipt size={19} />{t("Refund tercatat", "Refunds recorded")}</span><strong>{displayMoney(report.current.refundMinor)}</strong><small>{t("Mengurangi pengeluaran bersih", "Reduce net spending")}</small></Card>
          <Card className="report-metric report-metric-cashflow"><span><ChartNoAxesCombined size={19} />{t("Arus kas bersih", "Net cash flow")}</span><strong>{displayMoney(netCashflow)}</strong><small>{t(`${report.current.eventCount} transaksi terkonfirmasi`, `${report.current.eventCount} confirmed transactions`)}</small></Card>
        </div>
        <div className="report-content-grid">
          <Card className="report-chart-card">
            <div className="report-section-heading"><div><h2>{t("Pemasukan & pengeluaran", "Income & spending")}</h2><p>{t("Per hari · transfer dan setoran tabungan tidak dihitung sebagai pemasukan/pengeluaran.", "By day · transfers and savings contributions are excluded from income and spending.")}</p></div><span className="report-chart-legend"><i className="income-key" />{t("Masuk", "Income")}<i className="expense-key" />{t("Keluar", "Spending")}</span></div>
            {maxDaily === 0n ? <div className="report-chart-empty">{t("Belum ada pemasukan atau pengeluaran terkonfirmasi pada periode ini.", "No confirmed income or spending in this period yet.")}</div> : <div className="report-daily-chart" role="list" aria-label={t("Grafik arus kas harian", "Daily cash flow chart")}>
              {report.daily.map((item) => {
                const incomeMagnitude = BigInt(item.incomeMinor) < 0n ? -BigInt(item.incomeMinor) : BigInt(item.incomeMinor);
                const expenseMagnitude = BigInt(item.expenseMinor) < 0n ? -BigInt(item.expenseMinor) : BigInt(item.expenseMinor);
                const incomeHeight = Number(incomeMagnitude * 100n / maxDaily);
                const expenseHeight = Number(expenseMagnitude * 100n / maxDaily);
                const day = item.localDate.slice(-2);
                return <div className="report-day-column" role="listitem" aria-label={`${item.localDate}: ${t("pemasukan", "income")} ${displayMoney(item.incomeMinor)}, ${t("pengeluaran bersih", "net spending")} ${displayMoney(item.expenseMinor)}`} key={item.localDate}><div className="report-day-bars"><span className="report-day-income" style={{ height: `${incomeHeight}%` }} /><span className="report-day-expense" style={{ height: `${expenseHeight}%` }} /></div><small>{Number(day) === 1 || Number(day) % 5 === 0 ? day : ""}</small></div>;
              })}
            </div>}
          </Card>
          <Card className="report-category-card">
            <div className="report-section-heading"><div><h2>{t("Pengeluaran per kategori", "Spending by category")}</h2><p>{t("Refund mengurangi nilai kategori terkait.", "Refunds reduce the related category total.")}</p></div></div>
            {report.categories.length ? <div className="report-breakdown-list">{report.categories.slice(0, 12).map((item) => <div className="report-breakdown-row" key={item.categoryId ?? "uncategorized"}><span className="report-breakdown-icon"><Receipt size={17} /></span><div className="report-breakdown-copy"><div><strong>{item.categoryName}</strong><small>{t(`${item.eventCount} catatan`, `${item.eventCount} records`)}</small></div><div className="report-breakdown-track"><span style={{ width: `${ratioPercent(item.amountMinor, categoryMagnitude)}%` }} /></div></div><strong>{displayMoney(item.amountMinor)}</strong></div>)}</div> : <EmptyState icon={<Receipt />} title={t("Belum ada rincian kategori", "No category breakdown yet")}>{t("Kategori akan muncul setelah transaksi pengeluaran terkonfirmasi dicatat.", "Categories appear after a confirmed expense is recorded.")}</EmptyState>}
          </Card>
        </div>
        <div className="report-detail-grid">
          <Card className="report-detail-card"><div className="report-section-heading"><div><h2>{t("Perbandingan periode", "Period comparison")}</h2><p>{t("Rentang sebelumnya memiliki jumlah hari yang sama.", "The previous period uses the same number of days.")}</p></div></div><div className="report-comparison-row"><span>{t("Pemasukan", "Income")}</span><strong>{displayMoney(report.previous.incomeMinor)}</strong><span>{t("sebelumnya", "previous")}</span><strong>{displayMoney(report.current.incomeMinor)}</strong><span>{incomeChange === 0n ? "=" : incomeChange > 0n ? "↑" : "↓"}</span></div><div className="report-comparison-row"><span>{t("Pengeluaran bersih", "Net spending")}</span><strong>{displayMoney(previousNetExpense)}</strong><span>{t("sebelumnya", "previous")}</span><strong>{displayMoney(netExpense)}</strong><span>{netChange === 0n ? "=" : netChange > 0n ? "↑" : "↓"}</span></div><div className="report-comparison-periods"><span>{periodLabel(shiftLocalDate(report.from, -(Date.parse(`${report.to}T00:00:00Z`) - Date.parse(`${report.from}T00:00:00Z`)) / 86_400_000 - 1), shiftLocalDate(report.from, -1))}</span><span>{periodLabel(report.from, report.to)}</span></div></Card>
          <Card className="report-detail-card"><div className="report-section-heading"><div><h2>{t("Merchant teratas", "Top merchants")}</h2><p>{t("Berdasarkan nilai pengeluaran bersih yang tercatat.", "Based on recorded net spending.")}</p></div></div>{report.merchants.length ? <div className="report-merchant-list">{report.merchants.slice(0, 6).map((item) => <div key={item.merchant}><span><Receipt size={16} /><strong>{item.merchant}</strong><small>{item.eventCount} {t("catatan", "records")}</small></span><strong>{displayMoney(item.amountMinor)}</strong></div>)}</div> : <p className="report-chart-empty">{t("Belum ada merchant pada periode ini.", "No merchants recorded in this period yet.")}</p>}</Card>
        </div>
        <p className="report-footnote">{t("Laporan menggunakan transaksi yang sudah terkonfirmasi. Draf offline, hasil AI/OCR, transfer dompet, dan setoran tabungan tidak dihitung sebagai konsumsi.", "Reports use confirmed transactions only. Offline drafts, AI/OCR results, wallet transfers, and savings contributions are not counted as consumption.")}</p>
      </> : null}
    </section>
  );
}

function financeReportRangeValid(from: string, to: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return false;
  const duration = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000 + 1;
  return Number.isInteger(duration) && duration >= 1 && duration <= 366;
}

function BudgetSummary({ budgets, month, locale }: { budgets: Budget[]; month: string; locale: "id-ID" | "en-US" }) {
  const { t, hidden } = usePreferences();
  // A global cap overlaps every category cap. Show the global plan alone when it exists.
  const summaryBudgets = budgets.find((budget) => budget.kind === "global")
    ? budgets.filter((budget) => budget.kind === "global")
    : budgets;
  const planned = sumMinor(summaryBudgets.map((budget) => budget.plannedMinor));
  const used = sumMinor(summaryBudgets.map((budget) => budget.usedMinor));
  const remaining = subtractMinor(planned, used);
  const percentage = progressPercent(used, planned);
  const displayMoney = (amount: string) => hidden ? "Rp••••••" : formatIdr(amount, locale);
  return (
    <Card className="budget-summary-card">
      <div className="private-section-heading">
        <div><span className="section-kicker">{t("Rencana bulanan", "Monthly plan")}</span><h2>{t("Anggaran", "Budgets")}</h2></div>
        <Link to="/app/budgets">{t("Kelola", "Manage")}<ArrowRight size={16} /></Link>
      </div>
      {budgets.length ? <>
        <div className="budget-summary-total"><strong>{displayMoney(remaining)}</strong><span>{t("sisa anggaran", "budget remaining")}</span></div>
        <div className="budget-summary-track" role="progressbar" aria-label={t("Pemakaian seluruh anggaran", "Combined budget usage")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><span style={{ width: `${percentage}%` }} /></div>
        <p className="budget-summary-caption">{hidden ? t(`Nominal disembunyikan · ${summaryBudgets.length} anggaran · ${month}`, `Amounts hidden · ${summaryBudgets.length} budgets · ${month}`) : t(`${displayMoney(used)} terpakai dari ${displayMoney(planned)} · ${summaryBudgets.length} anggaran · ${month}`, `${displayMoney(used)} used of ${displayMoney(planned)} · ${summaryBudgets.length} budgets · ${month}`)}</p>
      </> : <div className="budget-summary-empty"><p>{t("Belum ada rencana bulan ini. Membuat anggaran hanya memberi gambaran, tidak membatasi transaksi nyata.", "No plans for this month yet. A budget helps you plan and never blocks a real transaction.")}</p><Link to="/app/budgets" className="text-action">{t("Buat anggaran pertama", "Create your first budget")}<ArrowRight size={16} /></Link></div>}
    </Card>
  );
}

function Dashboard({ profile, ownerId }: { profile: UserProfile; ownerId: string }) {
  const { t, locale, hidden, toggleHidden } = usePreferences();
  const wallets = useWallets(ownerId);
  const recent = useRecentEvents(ownerId, 5);
  const month = monthInTimezone(profile.timezone);
  const budgets = useBudgets(ownerId, month);
  if (wallets.isPending || recent.isPending) return loadingPanel(t("Memuat ringkasan keuangan…", "Loading your finance overview…"));
  if (wallets.isError || recent.isError) return unavailablePanel(() => { void wallets.refetch(); void recent.refetch(); }, t("Saldo atau catatan terbaru tidak dapat dimuat.", "Balances or recent records could not be loaded."));
  const total = sumMinor(wallets.data.items.filter((wallet) => wallet.archivedAt === null).map((wallet) => wallet.balanceMinor));
  const events = recent.data.items;
  return (
    <>
      <FinanceHeading title={t("Ringkasan keuangan", "Finance overview")} description={new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: profile.timezone }).format(new Date())} action={<Button asChild><Link to="/app/transactions/new"><Plus size={18} />{t("Catat transaksi", "Record transaction")}</Link></Button>} />
      {wallets.data.source === "device" ? <p className="offline-stale-notice" role="status">{t(`Saldo terakhir dimuat ${wallets.data.savedAt ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: profile.timezone }).format(new Date(wallets.data.savedAt)) : "sebelumnya"}. Data ini belum diverifikasi oleh server.`, `Balances were last loaded ${wallets.data.savedAt ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: profile.timezone }).format(new Date(wallets.data.savedAt)) : "earlier"}. The server has not verified this data.`)}</p> : null}
      <div className="private-summary-grid">
        <Card className="private-balance-card"><div className="private-card-title"><span>{t("Saldo tercatat", "Recorded balance")}</span><Button variant="ghost" size="icon" aria-label={hidden ? t("Tampilkan saldo", "Show balance") : t("Sembunyikan saldo", "Hide balance")} onClick={toggleHidden}>{hidden ? <EyeOff size={18} /> : <Eye size={18} />}</Button></div><strong>{hidden ? "Rp••••••" : formatIdr(total, locale)}</strong><span><WalletCards size={17} />{t(`${wallets.data.items.filter((wallet) => !wallet.archivedAt).length} sumber uang`, `${wallets.data.items.filter((wallet) => !wallet.archivedAt).length} wallets`)}</span></Card>
        <Card className="private-summary-note"><ChartNoAxesCombined size={24} /><div><strong>{t("Ringkasan dari catatanmu", "Based on your records")}</strong><p>{t("Saldo berasal dari mutasi terkonfirmasi. Panel anggaran membandingkan rencana dan transaksi pada bulan ini.", "Balances come from confirmed postings. The budget panel compares this month’s plans and transactions.")}</p></div></Card>
      </div>
      {budgets.isPending ? loadingPanel(t("Memuat anggaran…", "Loading budgets…")) : budgets.isError ? <Card className="budget-summary-card"><EmptyState icon={<PiggyBank />} title={t("Anggaran sementara belum dapat dimuat", "Budgets are temporarily unavailable")} action={<Button variant="secondary" onClick={() => void budgets.refetch()}><RefreshCw size={17} />{t("Coba lagi", "Try again")}</Button>}>{t("Saldo dan transaksi tetap ditampilkan dari data server yang berhasil diverifikasi.", "Your verified balances and transactions remain available.")}</EmptyState></Card> : <BudgetSummary budgets={budgets.data} month={month} locale={locale} />}
      <Card className="private-recent-card">
        <div className="private-section-heading"><div><h2>{t("Transaksi terbaru", "Recent transactions")}</h2><p>{t("Catatan yang sudah masuk ke buku besar", "Records posted to your ledger")}</p></div><Link to="/app/transactions">{t("Lihat semua", "View all")}<ArrowRight size={16} /></Link></div>
        {events.length ? <EventList events={events} locale={locale} timezone={profile.timezone} hidden={hidden} /> : <EmptyState icon={<Banknote />} title={t("Belum ada transaksi", "No transactions yet")} action={<Button asChild><Link to="/app/transactions/new"><Plus size={17} />{t("Catat transaksi pertama", "Record your first transaction")}</Link></Button>}>{t("Transaksi contoh hanya ada di demo. Catatan pribadi mulai muncul setelah kamu mencatatnya.", "Sample transactions live in the demo only. Your private records appear after you add one.")}</EmptyState>}
      </Card>
      {!wallets.data.items.some((wallet) => !wallet.archivedAt) ? <Card className="private-first-wallet"><div><WalletCards size={23} /><div><strong>{t("Tambahkan sumber uang", "Add a wallet")}</strong><p>{t("Dompet menyimpan saldo virtual untuk membantu rekonsiliasi catatanmu.", "Wallets keep virtual balances to help reconcile your records.")}</p></div></div><Button asChild variant="secondary"><Link to="/app/wallets">{t("Siapkan dompet", "Set up a wallet")}<ArrowRight size={17} /></Link></Button></Card> : null}
    </>
  );
}

function signForEvent(event: FinanceEvent): "in" | "out" | "neutral" {
  if (["income", "refund", "opening"].includes(event.kind)) return "in";
  if (event.kind === "expense") return "out";
  return "neutral";
}

function BudgetCard({ budget, locale }: { budget: Budget; locale: "id-ID" | "en-US" }) {
  const { t, hidden } = usePreferences();
  const displayMoney = (amount: string) => hidden ? "Rp••••••" : formatIdr(amount, locale);
  const overspent = BigInt(budget.remainingMinor) < 0n;
  const percentage = progressPercent(budget.usedMinor, budget.plannedMinor);
  const reachedThreshold = BigInt(budget.usedMinor) > 0n
    ? budget.warningThresholds.filter((threshold) => BigInt(budget.usedMinor) * 100n >= BigInt(budget.plannedMinor) * BigInt(threshold)).at(-1)
    : undefined;
  return (
    <Card className={`budget-card${overspent ? " overspent" : ""}`}>
      <div className="budget-card-top">
        <div><span className="budget-card-icon"><PiggyBank size={20} /></span><div><h3>{budget.name}</h3><p>{budget.categoryName ?? t("Semua kategori konsumsi", "All consumption categories")} · {budget.frequency === "monthly" ? t("Bulanan", "Monthly") : budget.frequency}</p></div></div>
        {overspent ? <span className="budget-state overspent">{t("Melewati rencana", "Over plan")}</span> : reachedThreshold ? <span className="budget-state warning">{t(`${reachedThreshold}% terpakai`, `${reachedThreshold}% used`)}</span> : <span className="budget-state safe">{t("Dalam rencana", "On plan")}</span>}
      </div>
      <div className="budget-money-row"><div><span>{t("Terpakai", "Used")}</span><strong>{displayMoney(budget.usedMinor)}</strong></div><div><span>{t("Rencana", "Planned")}</span><strong>{displayMoney(budget.plannedMinor)}</strong></div><div><span>{overspent ? t("Lebih", "Over") : t("Sisa", "Left")}</span><strong className={overspent ? "money-negative" : ""}>{displayMoney(budget.remainingMinor)}</strong></div></div>
      <div className={`budget-progress${overspent ? " is-over" : ""}`} role="progressbar" aria-label={t(`Pemakaian anggaran ${budget.name}`, `${budget.name} budget usage`)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><span style={{ width: `${percentage}%` }} /></div>
      <p className="budget-card-footnote">{t(`${budget.startsOn} – ${budget.endsOn}. Pengeluaran terverifikasi saja; transfer dan draf tidak dihitung.`, `${budget.startsOn} – ${budget.endsOn}. Posted expenses only; transfers and drafts are excluded.`)}</p>
    </Card>
  );
}

function BudgetsPage({ profile, ownerId }: { profile: UserProfile; ownerId: string }) {
  const { t, locale } = usePreferences();
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(() => monthInTimezone(profile.timezone));
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categories = useCategories(ownerId);
  const budgets = useBudgets(ownerId, month);
  const idempotency = useRef<{ fingerprint: string; key: string } | null>(null);
  const create = useMutation({
    mutationFn: ({ payload, fingerprint }: { payload: BudgetCreate; fingerprint: string }) => {
      if (!idempotency.current || idempotency.current.fingerprint !== fingerprint) {
        idempotency.current = { fingerprint, key: crypto.randomUUID() };
      }
      return apiData("/api/v1/budgets", budgetCreateResultSchema, {
        method: "POST",
        headers: { "Idempotency-Key": idempotency.current.key },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      idempotency.current = null;
      setEditing(false);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["finance-budgets", ownerId] });
    },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Anggaran belum dapat disimpan.", "The budget could not be saved.") : t("Periksa kembali nominal dan periode.", "Check the amount and period.")),
  });
  const bounds = monthBounds(month);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${bounds.startsOn}T12:00:00Z`));

  return (
    <section className="budgets-page" aria-label={t("Anggaran pribadi", "Personal budgets")}>
      <FinanceHeading title={t("Anggaran", "Budgets")} description={t("Rencana membantu melihat pengeluaran. Anggaran tidak membatasi transaksi nyata.", "Plans help you understand spending. Budgets never block real transactions.")} action={<Button onClick={() => { setEditing((open) => !open); setError(null); }}><Plus size={18} />{t("Buat anggaran", "Create budget")}</Button>} />
      <Card className="budget-period-card">
        <div><span className="section-kicker">{t("Periode laporan", "Reporting period")}</span><strong>{monthLabel}</strong></div>
        <div className="budget-period-actions"><Button variant="secondary" size="small" aria-label={t("Bulan sebelumnya", "Previous month")} onClick={() => setMonth((value) => shiftMonth(value, -1))}>‹</Button><label className="sr-only" htmlFor="budget-month">{t("Pilih bulan", "Choose month")}</label><input id="budget-month" type="month" value={month} onChange={(event) => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value)) setMonth(event.target.value); }} /><Button variant="secondary" size="small" aria-label={t("Bulan berikutnya", "Next month")} onClick={() => setMonth((value) => shiftMonth(value, 1))}>›</Button></div>
      </Card>
      {editing ? <BudgetEditor profile={profile} month={month} categories={categories.data?.items ?? []} busy={create.isPending} error={error} onCancel={() => { setEditing(false); setError(null); }} onSubmit={(payload) => create.mutate({ payload, fingerprint: JSON.stringify(payload) })} /> : null}
      {budgets.isPending ? loadingPanel(t("Memuat rencana anggaran…", "Loading budget plans…")) : budgets.isError ? unavailablePanel(() => void budgets.refetch(), t("Data anggaran tidak dapat dimuat. Rencana dan saldo tidak diubah.", "Budget plans could not be loaded. No plan or balance was changed.")) : budgets.data.length ? <>
        <BudgetSummary budgets={budgets.data} month={month} locale={locale} />
        <div className="budget-list">{budgets.data.map((budget) => <BudgetCard budget={budget} locale={locale} key={budget.id} />)}</div>
      </> : <Card className="budget-empty-card"><EmptyState icon={<PiggyBank />} title={t("Belum ada rencana untuk bulan ini", "No plan for this month yet")} action={<Button onClick={() => setEditing(true)}><Plus size={17} />{t("Buat anggaran", "Create budget")}</Button>}>{t("Mulai dari satu kategori. Angka rencana terpisah dari saldo dompet, dan transaksi tetap dapat dicatat saat anggaran terlampaui.", "Start with one category. Plans stay separate from wallet balances, and transactions remain recordable when a budget is exceeded.")}</EmptyState></Card>}
    </section>
  );
}

function SavingsGoalsPage({ profile, ownerId }: { profile: UserProfile; ownerId: string }) {
  const { t, locale, hidden } = usePreferences();
  const queryClient = useQueryClient();
  const params = useParams();
  const goalId = params.goalId;
  const goals = useSavingsGoals(ownerId);
  const wallets = useWallets(ownerId);
  const contributions = useQuery({
    queryKey: ["finance-savings-contributions", ownerId, goalId],
    queryFn: () => apiData(`/api/v1/savings-goals/${goalId}/contributions`, savingsContributionListSchema),
    enabled: Boolean(goalId),
    retry: false,
  });
  const [formGoal, setFormGoal] = useState<SavingsGoal | null | "new">(null);
  const [contributing, setContributing] = useState(false);
  const [archivingGoalId, setArchivingGoalId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "date" | "progress">("newest");
  const [error, setError] = useState<string | null>(null);
  const createKey = useRef<{ fingerprint: string; value: string } | null>(null);
  const contributionKey = useRef<{ fingerprint: string; value: string } | null>(null);
  const activeWallets = (wallets.data?.items ?? []).filter((wallet) => wallet.archivedAt === null);
  const create = useMutation({
    mutationFn: (payload: ReturnType<typeof savingsGoalCreateSchema.parse>) => {
      const fingerprint = JSON.stringify(payload);
      if (!createKey.current || createKey.current.fingerprint !== fingerprint) {
        createKey.current = { fingerprint, value: crypto.randomUUID() };
      }
      return apiData("/api/v1/savings-goals", savingsGoalCreateResultSchema, {
        method: "POST",
        headers: { "Idempotency-Key": createKey.current.value },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      createKey.current = null;
      setFormGoal(null);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["finance-savings-goals", ownerId] });
    },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Target belum dapat dibuat.", "The goal could not be created.") : t("Periksa kembali detail target.", "Check the goal details.")),
  });
  const update = useMutation({
    mutationFn: ({ goal, payload }: { goal: SavingsGoal; payload: SavingsGoalUpdate }) =>
      apiData(`/api/v1/savings-goals/${goal.id}`, savingsGoalUpdateResultSchema, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      setFormGoal(null);
      setArchivingGoalId(null);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["finance-savings-goals", ownerId] });
    },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Target belum dapat diperbarui.", "The goal could not be updated.") : t("Perubahan target belum berhasil.", "The goal could not be updated.")),
  });
  const contribute = useMutation({
    mutationFn: ({ goal, payload }: { goal: SavingsGoal; payload: ReturnType<typeof savingsContributionCreateSchema.parse> }) => {
      const fingerprint = `${goal.id}:${JSON.stringify(payload)}`;
      if (!contributionKey.current || contributionKey.current.fingerprint !== fingerprint) {
        contributionKey.current = { fingerprint, value: crypto.randomUUID() };
      }
      return apiData(`/api/v1/savings-goals/${goal.id}/contributions`, savingsContributionSchema, {
        method: "POST",
        headers: { "Idempotency-Key": contributionKey.current.value },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      contributionKey.current = null;
      setContributing(false);
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["finance-savings-goals", ownerId] }),
        queryClient.invalidateQueries({ queryKey: ["finance-savings-contributions", ownerId, goalId] }),
        queryClient.invalidateQueries({ queryKey: ["finance-wallets", ownerId] }),
        queryClient.invalidateQueries({ queryKey: ["finance-events", ownerId] }),
      ]);
    },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Setoran belum dapat dicatat.", "The contribution could not be recorded.") : t("Periksa kembali sumber, dompet tabungan, dan nominal.", "Check the source, savings wallet, and amount.")),
  });

  const selectedGoal = goalId ? goals.data?.find((goal) => goal.id === goalId) : undefined;
  const savingWallets = activeWallets.filter((wallet) => wallet.type === "savings");
  const displayMoney = (amount: string) => hidden ? "Rp••••••" : formatIdr(amount, locale);
  const refresh = () => {
    void goals.refetch();
    void wallets.refetch();
    if (goalId) void contributions.refetch();
  };

  if (goals.isPending || wallets.isPending) return loadingPanel(t("Memuat target tabungan…", "Loading savings goals…"));
  if (goals.isError || wallets.isError) return unavailablePanel(refresh, t("Target dan saldo tidak dapat diverifikasi. Tidak ada setoran yang dicatat.", "Goals and balances could not be verified. No contribution was recorded."));

  const editor = formGoal !== null ? <SavingsGoalEditor
    key={formGoal === "new" ? "new" : formGoal.id}
    goal={formGoal === "new" ? null : formGoal}
    wallets={savingWallets}
    busy={create.isPending || update.isPending}
    error={error}
    onCancel={() => { setFormGoal(null); setError(null); }}
    onSubmit={(payload) => {
      setError(null);
      if (formGoal === "new") create.mutate(payload);
      else update.mutate({ goal: formGoal, payload: { ...payload, archived: false } });
    }}
  /> : null;

  if (goalId) {
    if (!selectedGoal) return <Card><EmptyState icon={<Target />} title={t("Target tabungan tidak ditemukan", "Savings goal not found")} action={<Button asChild variant="secondary"><Link to="/app/goals">{t("Kembali ke target", "Back to goals")}</Link></Button>}>{t("Target mungkin sudah diarsipkan atau tidak tersedia untuk akun ini.", "This goal may be archived or unavailable to this account.")}</EmptyState></Card>;
    return <section className="savings-goals-page" aria-label={t("Detail target tabungan", "Savings goal details")}>
      <div className="goal-back-row"><Button asChild variant="ghost" size="small"><Link to="/app/goals"><ArrowRight className="goal-back-icon" size={16} />{t("Semua target", "All goals")}</Link></Button></div>
      <FinanceHeading title={selectedGoal.name} description={t("Target dan progres berdasarkan transfer tabungan yang terkonfirmasi.", "Progress reflects confirmed savings transfers.")} action={!selectedGoal.archivedAt ? <div className="goal-heading-actions"><Button variant="secondary" onClick={() => setFormGoal(selectedGoal)}>{t("Edit target", "Edit goal")}</Button>{archivingGoalId === selectedGoal.id ? <><Button size="small" loading={update.isPending} onClick={() => update.mutate({ goal: selectedGoal, payload: { name: selectedGoal.name, targetMinor: selectedGoal.targetMinor, targetDate: selectedGoal.targetDate, savingsWalletId: selectedGoal.savingsWalletId, archived: true } })}>{t("Konfirmasi arsip", "Confirm archive")}</Button><Button variant="ghost" size="small" onClick={() => setArchivingGoalId(null)}>{t("Batal", "Cancel")}</Button></> : <Button variant="ghost" size="small" onClick={() => { setArchivingGoalId(selectedGoal.id); setError(null); }}>{t("Arsipkan", "Archive")}</Button>}</div> : undefined} />
      <SavingsGoalCard goal={selectedGoal} locale={locale} hidden={hidden} t={t} />
      {!selectedGoal.archivedAt ? contributing ? <SavingsContributionEditor
        goal={selectedGoal}
        wallets={activeWallets}
        timezone={profile.timezone}
        busy={contribute.isPending}
        error={error}
        onCancel={() => { setContributing(false); setError(null); }}
        onSubmit={(payload) => { setError(null); contribute.mutate({ goal: selectedGoal, payload }); }}
      /> : <div className="goal-detail-actions">
        <Button onClick={() => { setContributing(true); setError(null); }} disabled={!savingWallets.length}><Plus size={17} />{t("Catat setoran", "Record contribution")}</Button>
        <Button variant="secondary" onClick={() => setFormGoal(selectedGoal)}>{t("Ubah detail", "Edit details")}</Button>
      </div> : null}
      {error && !contributing && !formGoal ? <p className="form-error" role="alert">{error}</p> : null}
      {contributions.isPending ? loadingPanel(t("Memuat riwayat setoran…", "Loading contribution history…")) : contributions.isError ? unavailablePanel(() => void contributions.refetch(), t("Riwayat setoran belum dapat dimuat.", "Contribution history is unavailable.")) : <Card className="goal-history-card">
        <div className="private-section-heading"><div><h2>{t("Riwayat setoran", "Contribution history")}</h2><p>{t("Setoran tersimpan sebagai transfer, bukan pengeluaran.", "Contributions are transfers, not expenses.")}</p></div></div>
        {contributions.data.length ? <div className="goal-contribution-list">{contributions.data.map((item) => <div className="goal-contribution-row" key={item.eventId}><span className="goal-contribution-icon"><ArrowDownLeft size={18} /></span><div><strong>{item.sourceWalletName} → {item.destinationWalletName}</strong><small>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: profile.timezone }).format(new Date(item.effectiveAt))}{item.note ? ` · ${item.note}` : ""}</small></div><strong>{displayMoney(item.amountMinor)}</strong></div>)}</div> : <EmptyState icon={<Banknote />} title={t("Belum ada setoran", "No contributions yet")}>{t("Setoran akan muncul setelah transfer dari dompet sumber ke dompet bertipe tabungan dicatat.", "Contributions appear after a transfer from a source wallet to a savings wallet is recorded.")}</EmptyState>}
      </Card>}
      {editor}
    </section>;
  }

  const activeGoals = goals.data.filter((goal) => !goal.archivedAt);
  const visibleGoals = sortBy === "date"
    ? [...activeGoals].sort((left, right) => (left.targetDate ?? "9999-12-31").localeCompare(right.targetDate ?? "9999-12-31"))
    : sortBy === "progress"
      ? [...activeGoals].sort((left, right) => right.progressPercent - left.progressPercent || left.name.localeCompare(right.name, locale))
      : activeGoals;
  const archivedGoals = goals.data.filter((goal) => goal.archivedAt);
  return <section className="savings-goals-page" aria-label={t("Daftar target tabungan", "Savings goals")}>
    <FinanceHeading title={t("Daftar target tabungan", "Savings goals")} description={t("Pantau target dari setoran yang benar-benar dipindahkan. Rencana target tidak mengunci saldo dompet.", "Track goals using funds actually transferred. A goal does not lock wallet balances.")} action={<Button onClick={() => { setFormGoal("new"); setError(null); }}><Plus size={18} />{t("Tambah target tabungan", "Add savings goal")}</Button>} />
    <Card className="goal-hero"><span className="goal-hero-icon"><Target size={30} /></span><div><h2>{t("Wujudkan tujuan keuangan Anda", "Bring your financial goals to life")}</h2><p>{t("Buat target tabungan untuk berbagai rencana masa depan, seperti dana darurat atau pembelian besar.", "Create savings goals for future plans, such as an emergency fund or a major purchase.")}</p></div></Card>
    <Button className="goal-add-mobile" onClick={() => { setFormGoal("new"); setError(null); }}><Plus size={19} />{t("Tambah target tabungan", "Add savings goal")}</Button>
    {editor}
    <div className="goal-list-heading"><h2>{t(`${visibleGoals.length} target tabungan`, `${visibleGoals.length} savings goals`)}</h2><label><span className="sr-only">{t("Urutkan target", "Sort goals")}</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}><option value="newest">{t("Terbaru", "Newest")}</option><option value="date">{t("Tanggal target", "Target date")}</option><option value="progress">{t("Kemajuan", "Progress")}</option></select></label></div>
    {visibleGoals.length ? <>
      <div className="goal-table-wrap"><table className="savings-goal-table"><thead><tr><th>{t("Nama target", "Goal")}</th><th>{t("Realisasi / Target", "Saved / target")}</th><th>{t("Kemajuan", "Progress")}</th><th>{t("Target tanggal", "Target date")}</th><th>{t("Sumber dana", "Funding source")}</th><th><span className="sr-only">{t("Aksi", "Actions")}</span></th></tr></thead><tbody>{visibleGoals.map((goal) => <tr key={goal.id}><td><Link className="goal-table-name" to={`/app/goals/${goal.id}`}><span className="goal-card-icon"><Target size={18} /></span><span><strong>{goal.name}</strong><small>{t("Untuk kebutuhan masa depan", "For a future goal")}</small></span></Link></td><td><strong>{displayMoney(goal.savedMinor)}</strong><span> / {displayMoney(goal.targetMinor)}</span></td><td><div className="goal-table-progress"><div className="goal-progress" role="progressbar" aria-label={t(`Progres target ${goal.name}`, `${goal.name} progress`)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={goal.progressPercent}><span style={{ width: `${goal.progressPercent}%` }} /></div><span>{goal.progressPercent}%</span></div></td><td>{goal.targetDate ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${goal.targetDate}T12:00:00Z`)) : t("Tanpa tanggal", "No date")}</td><td><span className="goal-source-label"><WalletCards size={17} />{goal.savingsWalletName ?? t("Pilih saat setoran", "Choose when contributing")}</span><small className="goal-source-secondary">{goal.savingsWalletName ? t("Dompet bertipe tabungan", "Savings-type wallet") : t("Tujuan tanpa dompet khusus", "Goal without a dedicated wallet")}</small></td><td><Button asChild variant="ghost" size="small"><Link to={`/app/goals/${goal.id}`}>{t("Kelola", "Manage")}<ChevronRight size={15} /></Link></Button></td></tr>)}</tbody></table></div>
      <div className="savings-goals-list">{visibleGoals.map((goal) => <SavingsGoalCard key={goal.id} goal={goal} locale={locale} hidden={hidden} t={t} actions={<>
      <Button asChild variant="ghost" size="small"><Link to={`/app/goals/${goal.id}`}>{t("Lihat detail", "View details")}<ArrowRight size={15} /></Link></Button>
      <Button variant="secondary" size="small" onClick={() => setFormGoal(goal)}>{t("Edit", "Edit")}</Button>
      {archivingGoalId === goal.id ? <span className="goal-confirm-actions"><Button size="small" loading={update.isPending} onClick={() => update.mutate({ goal, payload: { name: goal.name, targetMinor: goal.targetMinor, targetDate: goal.targetDate, savingsWalletId: goal.savingsWalletId, archived: true } })}>{t("Arsipkan", "Archive")}</Button><Button variant="ghost" size="small" onClick={() => setArchivingGoalId(null)}>{t("Batal", "Cancel")}</Button></span> : <Button variant="ghost" size="small" onClick={() => { setArchivingGoalId(goal.id); setError(null); }}>{t("Arsipkan", "Archive")}</Button>}
    </>} />)}</div>
    </> : <p className="goal-empty-copy">{t("Belum ada target yang tercatat. Tambahkan target dan progresnya akan mengikuti transfer terkonfirmasi.", "No goals yet. Add a goal and its progress will follow confirmed transfers.")}</p>}
    <button className="goal-add-tile" type="button" onClick={() => { setFormGoal("new"); setError(null); }}><span><Plus size={23} /></span><strong>{t("Tambah target tabungan", "Add savings goal")}</strong><small>{t("Mulai menabung untuk tujuan finansial Anda.", "Start saving for your financial goal.")}</small></button>
    {archivedGoals.length ? <details className="goal-archive-section"><summary>{t("Target arsip", "Archived goals")} · {archivedGoals.length}</summary><div className="savings-goals-list">{archivedGoals.map((goal) => <SavingsGoalCard key={goal.id} goal={goal} locale={locale} hidden={hidden} t={t} actions={<Button variant="secondary" size="small" loading={update.isPending} onClick={() => update.mutate({ goal, payload: { name: goal.name, targetMinor: goal.targetMinor, targetDate: goal.targetDate, savingsWalletId: goal.savingsWalletId, archived: false } })}>{t("Pulihkan", "Restore")}</Button>} />)}</div></details> : null}
    {error && !formGoal ? <p className="form-error" role="alert">{error}</p> : null}
  </section>;
}

function SavingsGoalCard({ goal, locale, hidden, t, actions }: {
  goal: SavingsGoal; locale: "id-ID" | "en-US"; hidden: boolean;
  t: (id: string, en: string) => string; actions?: ReactNode;
}) {
  const percent = Math.min(100, goal.progressPercent);
  const money = (amount: string) => hidden ? "Rp••••••" : formatIdr(amount, locale);
  const targetLabel = goal.targetDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${goal.targetDate}T12:00:00Z`))
    : t("Tanpa tanggal target", "No target date");
  return <Card className={`savings-goal-card${goal.archivedAt ? " is-archived" : ""}`}>
    <div className="goal-card-heading"><span className="goal-card-icon"><Target size={20} /></span><div><h2>{goal.name}</h2><p>{targetLabel} · {goal.savingsWalletName ?? t("Dompet tabungan dipilih saat setoran", "Choose a savings wallet when contributing")}</p></div>{goal.archivedAt ? <span className="goal-archived-badge">{t("Diarsipkan", "Archived")}</span> : null}</div>
    <div className="goal-card-amounts"><div><span>{t("Terkumpul", "Saved")}</span><strong>{money(goal.savedMinor)}</strong></div><div><span>{t("Target", "Target")}</span><strong>{money(goal.targetMinor)}</strong></div><div><span>{goal.remainingMinor.startsWith("-") ? t("Melebihi", "Over target") : t("Kekurangan", "To go")}</span><strong>{money(goal.remainingMinor)}</strong></div></div>
    <div className="goal-progress" role="progressbar" aria-label={t(`Progres target ${goal.name}`, `${goal.name} progress`)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${percent}%` }} /></div>
    <p className="goal-progress-caption">{t(`${percent}% tercapai · progres menghitung transfer terkonfirmasi saja.`, `${percent}% reached · progress counts confirmed transfers only.`)}</p>
    {actions ? <div className="goal-card-actions">{actions}</div> : null}
  </Card>;
}

function SavingsGoalEditor({ goal, wallets, busy, error, onCancel, onSubmit }: {
  goal: SavingsGoal | null; wallets: Wallet[]; busy: boolean; error: string | null;
  onCancel: () => void; onSubmit: (payload: ReturnType<typeof savingsGoalCreateSchema.parse>) => void;
}) {
  const { t } = usePreferences();
  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(goal?.targetMinor ?? "");
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? "");
  const [walletId, setWalletId] = useState(goal?.savingsWalletId ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  return <Card className="private-form-card savings-goal-editor">
    <div className="private-form-heading"><div><span className="section-kicker">{t("Rencana tabungan", "Savings plan")}</span><h2>{goal ? t("Edit target", "Edit goal") : t("Target baru", "New goal")}</h2></div><Button variant="ghost" size="icon" aria-label={t("Tutup", "Close")} onClick={onCancel}><X size={20} /></Button></div>
    <form className="finance-form" onSubmit={(event) => {
      event.preventDefault(); setFormError(null);
      try {
        onSubmit(savingsGoalCreateSchema.parse({ name: name.trim(), targetMinor: parseIdrInput(target), targetDate: targetDate || null, savingsWalletId: walletId || null }));
      } catch (cause) { setFormError(cause instanceof Error ? cause.message : t("Periksa isian target.", "Check the goal details.")); }
    }}>
      <TextField label={t("Nama target", "Goal name")} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder={t("Contoh: Dana darurat", "Example: Emergency fund")} required />
      <TextField label={t("Nominal target (rupiah)", "Target amount (rupiah)")} inputMode="numeric" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="5.000.000" required />
      <TextField label={t("Tanggal target (opsional)", "Target date (optional)")} type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
      <label className="private-select-field"><span>{t("Dompet tabungan khusus (opsional)", "Dedicated savings wallet (optional)")}</span><select value={walletId} onChange={(event) => setWalletId(event.target.value)}><option value="">{t("Pilih saat mencatat setoran", "Choose when recording a contribution")}</option>{wallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label>
      <p className="muted">{t("Target tidak memindahkan atau mengunci uang. Setoran akan tercatat sebagai transfer ledger menuju dompet bertipe tabungan.", "A goal does not move or lock money. Contributions are ledger transfers to a savings-type wallet.")}</p>
      {wallets.length === 0 ? <p className="goal-wallet-hint">{t("Belum ada dompet tabungan. Buat lebih dulu dari menu Dompet untuk mencatat progres setoran.", "No savings wallet yet. Create one in Wallets to record goal contributions.")}</p> : null}
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="private-form-actions"><Button type="submit" loading={busy}>{t("Simpan target", "Save goal")}</Button><Button type="button" variant="secondary" onClick={onCancel}>{t("Batal", "Cancel")}</Button></div>
    </form>
  </Card>;
}

function SavingsContributionEditor({ goal, wallets, timezone, busy, error, onCancel, onSubmit }: {
  goal: SavingsGoal; wallets: Wallet[]; timezone: string; busy: boolean; error: string | null;
  onCancel: () => void; onSubmit: (payload: ReturnType<typeof savingsContributionCreateSchema.parse>) => void;
}) {
  const { t } = usePreferences();
  const destinations = wallets.filter((wallet) => wallet.type === "savings" && (!goal.savingsWalletId || wallet.id === goal.savingsWalletId));
  const sources = wallets.filter((wallet) => wallet.id !== goal.savingsWalletId);
  const [sourceWalletId, setSourceWalletId] = useState(sources[0]?.id ?? "");
  const [destinationWalletId, setDestinationWalletId] = useState(goal.savingsWalletId ?? destinations[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  return <Card className="private-form-card savings-contribution-editor">
    <div className="private-form-heading"><div><span className="section-kicker">{t("Transfer terkonfirmasi", "Confirmed transfer")}</span><h2>{t("Catat setoran", "Record contribution")}</h2></div><Button variant="ghost" size="icon" aria-label={t("Tutup", "Close")} onClick={onCancel}><X size={20} /></Button></div>
    {destinations.length && sources.length ? <form className="finance-form" onSubmit={(event) => {
      event.preventDefault(); setFormError(null);
      try {
        onSubmit(savingsContributionCreateSchema.parse({
          sourceWalletId, destinationWalletId, amountMinor: parseIdrInput(amount),
          effectiveAt: new Date().toISOString(), timezone,
          ...(note.trim() ? { note: note.trim() } : {}),
        }));
      } catch (cause) { setFormError(cause instanceof Error ? cause.message : t("Periksa nominal dan dompet.", "Check the amount and wallets.")); }
    }}>
      <label className="private-select-field"><span>{t("Dari sumber uang", "From wallet")}</span><select value={sourceWalletId} onChange={(event) => setSourceWalletId(event.target.value)} required>{sources.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label>
      <label className="private-select-field"><span>{t("Ke dompet tabungan", "To savings wallet")}</span><select value={destinationWalletId} onChange={(event) => setDestinationWalletId(event.target.value)} required>{destinations.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label>
      <TextField label={t("Nominal setoran (rupiah)", "Contribution amount (rupiah)")} inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="200.000" required />
      <TextField label={t("Catatan (opsional)", "Note (optional)")} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />
      <p className="muted">{t("Transfer hanya disimpan setelah saldo dan dompet diverifikasi server. Transfer ini bukan pengeluaran konsumsi.", "The transfer is saved only after the server verifies the wallets and balance. It is not a consumption expense.")}</p>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="private-form-actions"><Button type="submit" loading={busy}>{t("Konfirmasi setoran", "Confirm contribution")}</Button><Button type="button" variant="secondary" onClick={onCancel}>{t("Batal", "Cancel")}</Button></div>
    </form> : <EmptyState icon={<WalletCards />} title={t("Dompet belum siap", "Wallets are not ready")} action={<Button asChild variant="secondary"><Link to="/app/wallets">{t("Kelola dompet", "Manage wallets")}</Link></Button>}>{t("Setoran memerlukan satu sumber uang aktif dan satu dompet bertipe tabungan. Saldo sumber yang tidak cukup akan ditolak.", "A contribution needs an active source wallet and a savings-type destination. Insufficient source balance is rejected.")}</EmptyState>}
  </Card>;
}

function BudgetEditor({ profile, month, categories, busy, error, onCancel, onSubmit }: {
  profile: UserProfile;
  month: string;
  categories: Category[];
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (payload: BudgetCreate) => void;
}) {
  const { t } = usePreferences();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"category" | "global">("category");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    try {
      const range = monthBounds(month);
      onSubmit(budgetCreateSchema.parse({
        name: name.trim(),
        kind,
        categoryId: kind === "category" ? categoryId : null,
        frequency: "monthly",
        timezone: profile.timezone,
        startsOn: range.startsOn,
        endsOn: range.endsOn,
        plannedMinor: parseIdrInput(amount),
        rolloverPolicy: false,
        warningThresholds: [50, 75, 90, 100],
      }));
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : t("Periksa isian anggaran.", "Check the budget details."));
    }
  }
  return (
    <Card className="private-form-card budget-editor-card">
      <div className="private-form-heading"><div><span className="section-kicker">{t("Rencana saja", "Plan only")}</span><h2>{t("Anggaran baru", "New budget")}</h2></div><Button variant="ghost" size="icon" aria-label={t("Tutup", "Close")} onClick={onCancel}><X size={20} /></Button></div>
      <form className="finance-form" onSubmit={submit}>
        <TextField label={t("Nama anggaran", "Budget name")} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder={t("Contoh: Makan bulanan", "Example: Monthly food")} required />
        <label className="private-select-field"><span>{t("Ruang lingkup", "Scope")}</span><select value={kind} onChange={(event) => setKind(event.target.value as "category" | "global")}><option value="category">{t("Satu kategori", "One category")}</option><option value="global">{t("Semua pengeluaran", "All expenses")}</option></select></label>
        {kind === "category" ? <label className="private-select-field"><span>{t("Kategori", "Category")}</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required disabled={!categories.length}><option value="">{t("Pilih kategori", "Choose a category")}</option>{categories.filter((category) => !category.archivedAt).map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label> : null}
        <TextField label={t("Rencana per bulan (rupiah)", "Monthly plan (rupiah)")} inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="500.000" required />
        <div className="budget-period-readonly"><CalendarDays size={18} /><span>{t("Periode mengikuti bulan yang dipilih:", "Period follows selected month:")} <strong>{monthBounds(month).startsOn} – {monthBounds(month).endsOn}</strong></span></div>
        <p className="muted">{t("Anggaran hanya membandingkan rencana dengan pengeluaran terposting. Tidak ada saldo yang dipindahkan dan QRIS/bank tidak diblokir.", "A budget only compares a plan with posted spending. It moves no money and does not block QRIS or bank payments.")}</p>
        {formError ? <p className="form-error" role="alert">{formError}</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="private-form-actions"><Button type="submit" loading={busy} disabled={kind === "category" && !categories.length}>{t("Simpan rencana", "Save plan")}</Button><Button type="button" variant="secondary" onClick={onCancel}>{t("Batal", "Cancel")}</Button></div>
      </form>
    </Card>
  );
}

function eventTitle(event: FinanceEvent, t: (id: string, en: string) => string) {
  if (event.merchant) return event.merchant;
  if (event.note) return event.note;
  const labels: Record<string, [string, string]> = {
    income: ["Pemasukan", "Income"], expense: ["Pengeluaran", "Expense"],
    transfer: ["Transfer", "Transfer"], refund: ["Pengembalian dana", "Refund"],
    adjustment: ["Penyesuaian", "Adjustment"], opening: ["Saldo awal", "Opening balance"],
    debt_payment: ["Pembayaran utang", "Debt payment"], debt_opening: ["Utang dibuka", "Debt opened"],
    loan_disbursement: ["Pinjaman diberikan", "Loan issued"], loan_receipt: ["Pinjaman diterima", "Loan received"],
    savings_transfer: ["Transfer tabungan", "Savings transfer"],
  };
  const pair = labels[event.kind] ?? ["Transaksi", "Transaction"];
  return t(...pair);
}

function EventList({ events, locale, timezone, hidden, onRefund }: { events: FinanceEvent[]; locale: "id-ID" | "en-US"; timezone: string; hidden: boolean; onRefund?: (event: FinanceEvent) => void }) {
  const { t } = usePreferences();
  return <div className="private-event-list">{events.map((event) => {
    const sign = signForEvent(event);
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: event.timezone || timezone }).format(new Date(event.effectiveAt));
    const wallet = event.walletName ?? event.destinationWalletName ?? t("Dompet", "Wallet");
    return <article className="private-event-row" key={event.id}><span className={`private-event-icon ${sign}`} aria-hidden="true">{sign === "in" ? <ArrowDownLeft size={19} /> : sign === "out" ? <ArrowUpRight size={19} /> : <ArrowLeftRight size={19} />}</span><div className="private-event-description"><strong>{eventTitle(event, t)}</strong><span>{[event.categoryName, wallet, date].filter(Boolean).join(" · ")}</span>{onRefund && event.status === "posted" && event.kind === "expense" ? <Button className="event-refund-button" size="small" variant="ghost" onClick={() => onRefund(event)}><Receipt size={15} />{t("Catat refund", "Record refund")}</Button> : null}</div><strong className={`private-event-amount ${sign}`}>{hidden ? "Rp••••••" : `${sign === "in" ? "+" : sign === "out" ? "−" : ""}${formatIdr(event.amountMinor, locale)}`}</strong></article>;
  })}</div>;
}

function TransactionsPage({ profile, ownerId }: { profile: UserProfile; ownerId: string }) {
  const { t, locale, hidden } = usePreferences();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [kind, setKind] = useState("all");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | null>(null);
  const [exportCount, setExportCount] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);
  const query = useInfiniteQuery({
    queryKey: ["finance-events", ownerId, "list", kind, searchQuery, fromDate, toDate, profile.timezone],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }): Promise<EventPage> => {
      const searchParams = new URLSearchParams({ limit: "20" });
      if (kind !== "all") searchParams.set("kind", kind);
      if (searchQuery) searchParams.set("q", searchQuery);
      if (fromDate) searchParams.set("from", localDateTimeToIso(`${fromDate}T00:00`, profile.timezone));
      if (toDate) searchParams.set("to", localDateTimeToIso(`${nextLocalDate(toDate)}T00:00`, profile.timezone));
      if (pageParam) searchParams.set("cursor", pageParam);
      return apiData(`/api/v1/transactions?${searchParams}`, financeEventPageSchema);
    },
    getNextPageParam: (lastPage) => lastPage.page.hasMore ? lastPage.page.nextCursor : undefined,
  });
  const events = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const visible = events;
  const openForm = location.pathname.endsWith("/new") || params.get("new") === "1";
  if (query.isPending && !openForm) return loadingPanel(t("Memuat transaksi…", "Loading transactions…"));
  if (query.isError && !openForm) return unavailablePanel(() => void query.refetch(), t("Riwayat transaksi tidak dapat dimuat.", "Transaction history could not be loaded."));
  const closeForm = () => {
    if (location.pathname.endsWith("/new")) void navigate("/app/transactions", { replace: true });
    else setParams({}, { replace: true });
  };
  async function downloadOwnerBackup(format: "csv" | "json") {
    if (exportFormat) return;
    setExportFormat(format);
    setExportCount(0);
    setExportError(null);
    try {
      const backup = await collectFinanceExport(setExportCount);
      if (format === "json") {
        downloadFile(
          JSON.stringify(backup, null, 2),
          `venfinance-export-v1-${new Date().toISOString().slice(0, 10)}.json`,
          "application/json;charset=utf-8",
        );
      } else {
        const columns = [
          "eventId", "status", "kind", "effectiveAt", "timezone", "amountMinor", "currency",
          "walletId", "walletName", "destinationWalletId", "destinationWalletName", "categoryId",
          "categoryName", "note", "merchant", "sourceChannel", "refundOf",
          "negativeBalanceConfirmed", "allocations",
        ];
        const rows = backup.transactions.map((event) => [
          event.id, event.status, event.kind, event.effectiveAt, event.timezone, event.amountMinor,
          event.currency, event.walletId ?? "", event.walletName ?? "", event.destinationWalletId ?? "",
          event.destinationWalletName ?? "", event.categoryId ?? "", event.categoryName ?? "",
          event.note ?? "", event.merchant ?? "", event.sourceChannel, event.refundOf ?? "",
          String(event.negativeBalanceConfirmed), JSON.stringify(event.allocations),
        ]);
        const csv = [columns, ...rows]
          .map((row) => row.map((value) => escapeCsvCell(String(value))).join(","))
          .join("\r\n");
        downloadFile(
          `\uFEFF${csv}`,
          `venfinance-transaksi-${new Date().toISOString().slice(0, 10)}.csv`,
          "text/csv;charset=utf-8",
        );
      }
    } catch (cause) {
      setExportError(cause instanceof ApiClientError
        ? cause.publicMessage ?? t("Ekspor belum dapat dibuat. Coba lagi saat tersambung.", "The export could not be created. Try again while connected.")
        : t("Ekspor tidak lengkap atau datanya belum dapat dimuat. Tidak ada file yang dibuat.", "The export could not be completed. No file was created."));
    } finally {
      setExportFormat(null);
      setExportCount(null);
    }
  }
  return (
    <>
      <FinanceHeading title={t("Riwayat transaksi", "Transaction history")} description={t("Catatan yang sudah dikonfirmasi. Draf dan hasil bacaan belum masuk ke saldo.", "Confirmed records. Drafts and extracted items are excluded from balances.")} action={<div className="finance-heading-actions"><div className="finance-export-actions"><Button variant="secondary" loading={exportFormat === "csv"} disabled={exportFormat !== null} onClick={() => void downloadOwnerBackup("csv")}><Download size={17} />{t("Ekspor semua CSV", "Export all CSV")}</Button><Button variant="secondary" loading={exportFormat === "json"} disabled={exportFormat !== null} onClick={() => void downloadOwnerBackup("json")}><Download size={17} />{t("Ekspor data JSON", "Export JSON data")}</Button></div><Button onClick={() => setParams({ new: "1" })}><Plus size={18} />{t("Catat transaksi", "Record transaction")}</Button></div>} />
      {exportCount !== null ? <p className="export-progress" role="status">{t(`Menyiapkan ekspor privat: ${exportCount.toLocaleString("id-ID")} transaksi…`, `Preparing private export: ${exportCount.toLocaleString("en-US")} transactions…`)}</p> : null}
      {exportError ? <p className="form-error" role="alert">{exportError}</p> : null}
      {openForm ? <TransactionForm profile={profile} ownerId={ownerId} refundSource={events.find((event) => event.id === params.get("refund"))} onCancel={closeForm} onSaved={() => { closeForm(); void query.refetch(); void navigate("/app/transactions"); }} /> : null}
      <Card className="private-transactions-card">
        {query.isError ? <div className="offline-stale-notice" role="status">{t("Riwayat transaksi server sedang tidak tersedia. Draf lokal tetap tersimpan terpisah dan belum mengubah saldo.", "Server transaction history is unavailable. Local drafts remain separate and do not change balances.")}</div> : null}
        <div className="private-filter-row">
          <TextField label={t("Cari seluruh riwayat", "Search all history")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("Catatan, merchant, kategori, dompet, nominal", "Note, merchant, category, wallet, amount")} maxLength={80} />
          <label className="private-select-field"><span>{t("Jenis transaksi", "Transaction type")}</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">{t("Semua", "All")}</option><option value="expense">{t("Pengeluaran", "Expenses")}</option><option value="income">{t("Pemasukan", "Income")}</option><option value="transfer">{t("Transfer", "Transfers")}</option><option value="savings_transfer">{t("Setoran tabungan", "Savings transfers")}</option><option value="refund">{t("Refund", "Refunds")}</option><option value="opening">{t("Saldo awal", "Opening balance")}</option><option value="adjustment">{t("Penyesuaian", "Adjustments")}</option></select></label>
          <TextField label={t("Dari tanggal", "From date")} type="date" value={fromDate} onChange={(event) => { const value = event.target.value; setFromDate(value); if (value && toDate && value > toDate) setToDate(value); }} />
          <TextField label={t("Sampai tanggal", "Through date")} type="date" value={toDate} onChange={(event) => { const value = event.target.value; setToDate(value); if (value && fromDate && value < fromDate) setFromDate(value); }} />
        </div>
        {visible.length ? <EventList events={visible} locale={locale} timezone={profile.timezone} hidden={hidden} onRefund={(source) => setParams({ new: "1", refund: source.id })} /> : <EmptyState icon={<List />} title={events.length ? t("Tidak ada catatan yang cocok", "No matching records") : t("Belum ada transaksi", "No transactions yet")} action={events.length || searchQuery ? <Button variant="secondary" onClick={() => { setSearch(""); setSearchQuery(""); setKind("all"); }}>{t("Hapus filter", "Clear filters")}</Button> : <Button onClick={() => setParams({ new: "1" })}><Plus size={17} />{t("Catat transaksi pertama", "Record your first transaction")}</Button>}>{events.length || searchQuery ? t("Coba istilah pencarian atau rentang tanggal lain. Hasil dicari di seluruh riwayat server.", "Try another search term or date range. Results search the full server history.") : t("Transaksi contoh hanya muncul di demo.", "Sample transactions appear in the demo only.")}</EmptyState>}
        {query.hasNextPage ? <div className="private-load-more"><Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{t("Muat transaksi berikutnya", "Load more transactions")}</Button></div> : null}
      </Card>
    </>
  );
}

type FinanceExportV1 = {
  schemaVersion: 1;
  exportedAt: string;
  scope: {
    included: ["profile", "wallets", "categories", "transactions"];
    excluded: ["budget_periods", "debts", "attachments"];
  };
  profile: Pick<UserProfile, "displayName" | "locale" | "timezone" | "preferredCurrency">;
  wallets: Wallet[];
  categories: Category[];
  transactions: FinanceEvent[];
};

async function collectFinanceExport(onProgress: (count: number) => void): Promise<FinanceExportV1> {
  const [profileResult, wallets, categories] = await Promise.all([
    apiData("/api/v1/me", profileReadResultSchema),
    apiData("/api/v1/wallets", walletArraySchema),
    apiData("/api/v1/categories?includeArchived=true", categoryArraySchema),
  ]);
  if (!profileResult.profile) throw new Error("Profile is unavailable.");
  const transactions: FinanceEvent[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  while (true) {
    const params = new URLSearchParams({ limit: "99" });
    if (cursor) params.set("cursor", cursor);
    const page = await apiData(`/api/v1/transactions?${params}`, financeEventPageSchema);
    transactions.push(...page.items);
    onProgress(transactions.length);
    if (transactions.length > MAX_FINANCE_EXPORT_EVENTS) {
      throw new Error("Export exceeds the safe browser limit.");
    }
    if (!page.page.hasMore) break;
    const nextCursor = page.page.nextCursor;
    if (!nextCursor || seenCursors.has(nextCursor) || page.items.length === 0) {
      throw new Error("Transaction pagination was incomplete.");
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    scope: {
      included: ["profile", "wallets", "categories", "transactions"],
      excluded: ["budget_periods", "debts", "attachments"],
    },
    profile: {
      displayName: profileResult.profile.displayName,
      locale: profileResult.profile.locale,
      timezone: profileResult.profile.timezone,
      preferredCurrency: profileResult.profile.preferredCurrency,
    },
    wallets,
    categories,
    transactions,
  };
}

function escapeCsvCell(value: string) {
  const formulaSafe = /^[\s\uFEFF]*[=+@-]/.test(value) ? `'${value}` : value;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

function downloadFile(contents: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toLocalInput(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function localDateTimeToIso(value: string, timezone: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Waktu transaksi tidak valid.");
  const target = match.slice(1).map(Number);
  const [year, month, day, hour, minute] = target as [number, number, number, number, number];
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = desired;
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = formatter.formatToParts(new Date(candidate));
    const valueOf = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const represented = Date.UTC(valueOf("year"), valueOf("month") - 1, valueOf("day"), valueOf("hour"), valueOf("minute"));
    const difference = desired - represented;
    candidate += difference;
    if (difference === 0) break;
  }
  const roundTrip = formatter.formatToParts(new Date(candidate));
  const actual = roundTrip.filter((part) => ["year", "month", "day", "hour", "minute"].includes(part.type)).map((part) => Number(part.value));
  if (actual.some((value, index) => value !== target[index])) throw new Error("Waktu ini tidak berlaku di zona waktu yang dipilih.");
  return new Date(candidate).toISOString();
}

function nextLocalDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error("Tanggal transaksi tidak valid.");
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1)).toISOString().slice(0, 10);
}

function TransactionForm({ profile, ownerId, refundSource, onCancel, onSaved }: { profile: UserProfile; ownerId: string; refundSource?: FinanceEvent | undefined; onCancel: () => void; onSaved: () => void }) {
  const { t } = usePreferences();
  const queryClient = useQueryClient();
  const wallets = useWallets(ownerId);
  const categories = useCategories(ownerId);
  const [kind, setKind] = useState<EventKind>(refundSource ? "refund" : "expense");
  const [walletId, setWalletId] = useState(refundSource?.walletId ?? "");
  const [destinationWalletId, setDestinationWalletId] = useState("");
  const [categoryId, setCategoryId] = useState(refundSource?.categoryId ?? "");
  const [amount, setAmount] = useState("");
  const [effectiveAt, setEffectiveAt] = useState(() => toLocalInput(profile.timezone));
  const [note, setNote] = useState("");
  const [allowNegative, setAllowNegative] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const stableCommand = useRef<{ fingerprint: string; key: string } | null>(null);
  const activeWallets = wallets.data?.items.filter((wallet) => !wallet.archivedAt) ?? [];
  const selectedWalletId = activeWallets.find((wallet) => wallet.id === walletId)?.id ?? activeWallets[0]?.id ?? "";
  const destinationCandidates = activeWallets.filter((wallet) => wallet.id !== selectedWalletId && (kind !== "savings_transfer" || wallet.type === "savings"));
  const selectedDestinationWalletId = destinationCandidates.find((wallet) => wallet.id === destinationWalletId)?.id ?? destinationCandidates[0]?.id ?? "";
  const mutation = useMutation({
    mutationFn: async (payload: { command: Record<string, unknown>; fingerprint: string }) => {
      if (!stableCommand.current || stableCommand.current.fingerprint !== payload.fingerprint) {
        stableCommand.current = { fingerprint: payload.fingerprint, key: crypto.randomUUID() };
      }
      return apiData("/api/v1/transactions", financePostResultSchema, {
        method: "POST",
        headers: { "Idempotency-Key": stableCommand.current.key },
        body: JSON.stringify(payload.command),
      });
    },
    onSuccess: async () => {
      stableCommand.current = null;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["finance-wallets", ownerId] }),
        queryClient.invalidateQueries({ queryKey: ["finance-events", ownerId] }),
      ]);
      onSaved();
    },
    onError: (cause, payload) => {
      setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Transaksi belum tersimpan. Coba lagi.", "The transaction was not saved. Try again.") : t("Periksa waktu, nominal, dan dompet yang dipilih.", "Check the time, amount, and selected wallets."));
      if (isOfflineVaultUnlocked(ownerId) && (cause instanceof ApiClientError ? cause.status >= 500 : !navigator.onLine)) {
        const key = stableCommand.current?.key;
        if (key) setPendingOffline({ id: key, command: payload.command });
      }
    },
  });
  const [pendingOffline, setPendingOffline] = useState<{ id: string; command: Record<string, unknown> } | null>(null);
  function buildCommand() {
    const amountMinor = parseIdrInput(amount);
    return financePostSchema.parse({
      kind, walletId: selectedWalletId, ...(["transfer", "savings_transfer"].includes(kind) ? { destinationWalletId: selectedDestinationWalletId } : {}),
      amountMinor, currency: "IDR", effectiveAt: localDateTimeToIso(effectiveAt, profile.timezone),
      timezone: profile.timezone,
      ...((kind === "expense" || kind === "refund") && categoryId ? { allocations: [{ categoryId, amountMinor }] } : {}),
      ...(kind === "refund" && refundSource ? { refundOf: refundSource.id } : {}),
      ...(note.trim() ? { note: note.trim() } : {}), allowNegative,
    });
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const command = buildCommand();
      mutation.mutate({ command, fingerprint: JSON.stringify(command) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("Periksa kembali isian transaksi.", "Check the transaction details."));
    }
  }
  async function saveDraft() {
    if (!isOfflineVaultUnlocked(ownerId)) {
      setError(t("Buka kunci draf offline terlebih dahulu.", "Unlock offline drafts first."));
      return;
    }
    setError(null);
    try {
      const command = pendingOffline?.command ?? buildCommand();
      const fingerprint = JSON.stringify(command);
      if (!stableCommand.current || stableCommand.current.fingerprint !== fingerprint) {
        stableCommand.current = { fingerprint, key: crypto.randomUUID() };
      }
      await saveLocalDraft(ownerId, stableCommand.current.key, financePostSchema.parse(command));
      setOfflineNotice(t("Draf tersimpan terenkripsi di perangkat. Saldo belum berubah; buka Draf offline untuk memeriksa atau menyinkronkannya nanti.", "Draft encrypted on this device. The balance is unchanged; open Offline drafts to review or sync it later."));
      setPendingOffline(null);
      setAmount("");
      setNote("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("Draf belum dapat disimpan di perangkat.", "The draft could not be saved on this device."));
    }
  }
  if (wallets.isError) return <Card role="alert" className="private-form-card">{t("Daftar dompet belum dapat dimuat. Buka Draf offline saat online untuk menyiapkan perangkat sebelum mencoba lagi tanpa jaringan.", "Wallets could not be loaded. Open Offline drafts while online to prepare this device before working without a connection.")}</Card>;
  return (
    <Card className="private-form-card" aria-labelledby="transaction-form-title">
      <div className="private-form-heading"><div><span className="section-kicker">{t("Catatan pribadi", "Private record")}</span><h2 id="transaction-form-title">{kind === "refund" ? t("Catat pengembalian dana", "Record a refund") : t("Catat transaksi", "Record a transaction")}</h2></div><Button variant="ghost" size="icon" aria-label={t("Tutup", "Close")} onClick={onCancel}><X size={20} /></Button></div>
      {offlineNotice ? <p className="offline-notice" role="status">{offlineNotice}</p> : null}
      {wallets.isPending ? <p role="status">{t("Memuat dompet…", "Loading wallets…")}</p> : activeWallets.length ? (
        <form className="finance-form" onSubmit={submit}>
          <label className="private-select-field"><span>{t("Jenis", "Type")}</span><select value={kind} onChange={(event) => setKind(event.target.value as EventKind)}><option value="expense">{t("Pengeluaran", "Expense")}</option><option value="income">{t("Pemasukan", "Income")}</option><option value="transfer">{t("Transfer", "Transfer")}</option>{activeWallets.some((wallet) => wallet.type === "savings") ? <option value="savings_transfer">{t("Setoran tabungan", "Savings transfer")}</option> : null}{refundSource ? <option value="refund">{t("Pengembalian dana", "Refund")}</option> : null}<option value="opening">{t("Saldo awal", "Opening balance")}</option></select></label>
          {kind === "refund" && refundSource ? <p className="offline-stale-notice" role="status">{t(`Refund ini terkait ${eventTitle(refundSource, t)}. Sisa yang dapat dikembalikan akan diperiksa server.`, `This refund is linked to ${eventTitle(refundSource, t)}. The server checks the remaining refundable amount.`)}</p> : null}
          <TextField label={t("Nominal rupiah", "Amount in rupiah")} inputMode="numeric" autoComplete="off" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="10.000" required />
          <label className="private-select-field"><span>{kind === "income" || kind === "opening" || kind === "refund" ? t("Masuk ke dompet", "To wallet") : t("Dari dompet", "From wallet")}</span><select value={selectedWalletId} onChange={(event) => setWalletId(event.target.value)} required>{activeWallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name} · {formatIdr(wallet.balanceMinor)}</option>)}</select></label>
          {kind === "transfer" || kind === "savings_transfer" ? <label className="private-select-field"><span>{kind === "savings_transfer" ? t("Ke dompet tabungan", "To savings wallet") : t("Ke dompet", "To wallet")}</span><select value={selectedDestinationWalletId} onChange={(event) => setDestinationWalletId(event.target.value)} required disabled={!destinationCandidates.length}>{destinationCandidates.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label> : null}
          {(kind === "expense" || kind === "refund") && categories.data?.items.length ? <label className="private-select-field"><span>{kind === "refund" ? t("Kategori refund asal (opsional)", "Original refund category (optional)") : t("Kategori (opsional)", "Category (optional)")}</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">{t("Tanpa kategori", "Uncategorized")}</option>{categories.data.items.filter((category) => kind === "expense" || category.id === refundSource?.categoryId || refundSource?.allocations.some((allocation) => allocation.categoryId === category.id)).map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label> : null}
          <TextField label={t("Waktu transaksi", "Transaction time")} type="datetime-local" value={effectiveAt} onChange={(event) => setEffectiveAt(event.target.value)} required />
          <TextField label={t("Catatan (opsional)", "Note (optional)")} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />
          {kind === "expense" ? <label className="negative-confirmation"><input type="checkbox" checked={allowNegative} onChange={(event) => setAllowNegative(event.target.checked)} /><span>{t("Saya memahami saldo catatan dompet ini dapat menjadi negatif.", "I understand this recorded wallet balance may become negative.")}</span></label> : null}
          {wallets.data.source === "device" ? <p className="offline-stale-notice" role="status">{t(`Dompet dipilih dari snapshot perangkat ${wallets.data.savedAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: profile.timezone }).format(new Date(wallets.data.savedAt)) : "lama"}. Server akan memeriksa ulang sebelum menyimpan.`, `Wallets are selected from a device snapshot${wallets.data.savedAt ? ` saved ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: profile.timezone }).format(new Date(wallets.data.savedAt))}` : ""}. The server revalidates them before saving.`)}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="private-form-actions"><Button type="submit" loading={mutation.isPending}>{t("Simpan transaksi", "Save transaction")}</Button><Button type="button" variant="secondary" onClick={() => void saveDraft()} disabled={!isOfflineVaultUnlocked(ownerId)}>{t("Simpan draf offline", "Save offline draft")}</Button><Button type="button" variant="secondary" onClick={onCancel}>{t("Batal", "Cancel")}</Button></div>
          {!isOfflineVaultUnlocked(ownerId) ? <p className="muted">{t("Untuk menyimpan tanpa jaringan, aktifkan kunci perangkat terlebih dahulu.", "To save without a connection, first enable the device key.")} <Link to="/app/offline">{t("Buka Draf offline", "Open Offline drafts")}</Link></p> : null}
        </form>
      ) : <EmptyState icon={<WalletCards />} title={t("Siapkan dompet terlebih dahulu", "Set up a wallet first")} action={<Button asChild><Link to="/app/wallets">{t("Tambah dompet", "Add wallet")}</Link></Button>}>{t("Transaksi perlu memiliki sumber uang yang valid.", "A transaction needs a valid wallet.")}</EmptyState>}
    </Card>
  );
}

function WalletsPage({ ownerId }: { ownerId: string }) {
  const { t, locale, hidden } = usePreferences();
  const queryClient = useQueryClient();
  const wallets = useWallets(ownerId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [pendingArchive, setPendingArchive] = useState<Wallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => queryClient.invalidateQueries({ queryKey: ["finance-wallets", ownerId] });
  const create = useMutation({
    mutationFn: (payload: { name: string; type: string }) => apiData("/api/v1/wallets", walletSchema, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => { setAdding(false); await refresh(); },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Dompet belum dapat dibuat.", "The wallet could not be created.") : t("Periksa nama dan jenis dompet.", "Check the wallet name and type.")),
  });
  const update = useMutation({
    mutationFn: ({ wallet, archived }: { wallet: Wallet; archived: boolean }) => apiData(
      `/api/v1/wallets/${wallet.id}`,
      walletUpdateResultSchema,
      { method: "PATCH", body: JSON.stringify(walletUpdateSchema.parse({ name: wallet.name, type: wallet.type, archived })) },
    ),
    onSuccess: async () => { setEditing(null); setPendingArchive(null); setError(null); await refresh(); },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Dompet belum dapat diperbarui.", "The wallet could not be updated.") : t("Perubahan dompet belum dapat disimpan.", "Wallet changes could not be saved.")),
  });
  const total = wallets.data ? sumMinor(wallets.data.items.filter((wallet) => !wallet.archivedAt).map((wallet) => wallet.balanceMinor)) : "0";
  const activeWallets = wallets.data?.items.filter((wallet) => !wallet.archivedAt) ?? [];
  const archivedWallets = wallets.data?.items.filter((wallet) => wallet.archivedAt) ?? [];
  return (
    <>
      <FinanceHeading title={t("Daftar dompet", "Wallets")} description={t("Sumber uang virtual yang digunakan pada catatanmu.", "Virtual money sources used in your records.")} action={<Button onClick={() => { setAdding((current) => !current); setError(null); }}><Plus size={18} />{t("Tambah dompet", "Add wallet")}</Button>} />
      {adding ? <WalletEditor key="new-wallet" wallet={null} busy={create.isPending} error={error} onCancel={() => { setAdding(false); setError(null); }} onSubmit={(payload) => { setError(null); create.mutate(payload); }} /> : null}
      {editing ? <WalletEditor key={editing.id} wallet={editing} busy={update.isPending} error={error} onCancel={() => { setEditing(null); setError(null); }} onSubmit={(payload) => { setError(null); update.mutate({ wallet: { ...editing, name: payload.name, type: payload.type }, archived: false }); }} /> : null}
      {wallets.isPending ? loadingPanel(t("Memuat dompet…", "Loading wallets…")) : wallets.isError ? unavailablePanel(() => void wallets.refetch(), t("Saldo dompet belum dapat dimuat.", "Wallet balances could not be loaded.")) : (
        <>
          {wallets.data.source === "device" ? <p className="offline-stale-notice" role="status">{t("Saldo ini terakhir dimuat sebelum koneksi terputus dan belum diverifikasi ulang.", "These balances were last loaded before the connection was lost and have not been reverified.")}</p> : null}
          <Card className="private-balance-card private-wallet-total"><div className="private-card-title">{t("Total saldo dompet aktif", "Total active wallet balance")}</div><strong>{hidden ? "Rp••••••" : formatIdr(total, locale)}</strong><span><WalletCards size={17} />{t(`${wallets.data.items.filter((wallet) => !wallet.archivedAt).length} sumber uang`, `${wallets.data.items.filter((wallet) => !wallet.archivedAt).length} wallets`)}</span></Card>
          {activeWallets.length ? <div className="private-wallet-list">{activeWallets.map((wallet) => <Card className="private-wallet-row private-wallet-manage-row" key={wallet.id}>
            <span className={`private-wallet-icon ${wallet.type}`}><WalletCards size={22} /></span>
            <div className="private-event-description"><strong>{wallet.name}</strong><span>{walletTypeName(wallet.type, t)}</span></div>
            <strong>{hidden ? "Rp••••••" : formatIdr(wallet.balanceMinor, locale)}</strong>
            {wallets.data.source === "server" ? <div className="wallet-management-actions">
              <Button variant="secondary" size="small" aria-label={t(`Edit ${wallet.name}`, `Edit ${wallet.name}`)} onClick={() => { setEditing(wallet); setError(null); }}>{t("Edit", "Edit")}</Button>
              {pendingArchive?.id === wallet.id ? <div className="wallet-archive-confirmation"><p>{t(`Saldo ini akan dikeluarkan dari total aktif (${hidden ? "nominal disembunyikan" : formatIdr(wallet.balanceMinor, locale)}). Riwayat tetap tersedia.`, `This balance will be removed from the active total (${hidden ? "amount hidden" : formatIdr(wallet.balanceMinor, locale)}). History remains available.`)}</p><Button size="small" loading={update.isPending} onClick={() => update.mutate({ wallet, archived: true })}>{t("Konfirmasi arsip", "Confirm archive")}</Button><Button variant="ghost" size="small" onClick={() => setPendingArchive(null)}>{t("Batal", "Cancel")}</Button></div> : <Button variant="ghost" size="small" onClick={() => setPendingArchive(wallet)}>{t("Arsipkan", "Archive")}</Button>}
            </div> : null}
          </Card>)}</div> : <Card><EmptyState icon={<WalletCards />} title={t("Belum ada dompet aktif", "No active wallets")} action={<Button onClick={() => setAdding(true)}><Plus size={17} />{t("Tambah dompet", "Add wallet")}</Button>}>{t("Tambahkan sumber uang virtual sebelum mencatat transaksi.", "Add a virtual money source before recording transactions.")}</EmptyState></Card>}
          {archivedWallets.length ? <details className="wallet-archive-section"><summary>{t("Dompet arsip", "Archived wallets")} · {archivedWallets.length}</summary><div className="private-wallet-list">{archivedWallets.map((wallet) => <Card className="private-wallet-row private-wallet-manage-row is-archived" key={wallet.id}><span className={`private-wallet-icon ${wallet.type}`}><WalletCards size={22} /></span><div className="private-event-description"><strong>{wallet.name}</strong><span>{walletTypeName(wallet.type, t)}</span></div><strong>{hidden ? "Rp••••••" : formatIdr(wallet.balanceMinor, locale)}</strong>{wallets.data.source === "server" ? <div className="wallet-management-actions"><Button variant="secondary" size="small" loading={update.isPending} onClick={() => update.mutate({ wallet, archived: false })}>{t("Pulihkan", "Restore")}</Button></div> : null}</Card>)}</div></details> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </>
      )}
    </>
  );
}

function WalletEditor({ wallet, busy, error, onCancel, onSubmit }: {
  wallet: Wallet | null;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (payload: { name: string; type: Wallet["type"] }) => void;
}) {
  const { t } = usePreferences();
  const [name, setName] = useState(wallet?.name ?? "");
  const [type, setType] = useState<Wallet["type"]>(wallet?.type ?? "cash");
  return <Card className="private-form-card wallet-editor">
    <div className="private-form-heading"><div><span className="section-kicker">{t("Sumber uang virtual", "Virtual money source")}</span><h2>{wallet ? t("Edit dompet", "Edit wallet") : t("Dompet baru", "New wallet")}</h2></div><Button variant="ghost" size="icon" aria-label={t("Tutup", "Close")} onClick={onCancel}><X size={19} /></Button></div>
    <form className="finance-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ name: name.trim(), type }); }}>
      <TextField label={t("Nama dompet", "Wallet name")} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder={t("Contoh: Tunai", "Example: Cash")} required />
      <label className="private-select-field"><span>{t("Jenis dompet", "Wallet type")}</span><select value={type} onChange={(event) => setType(event.target.value as Wallet["type"])}><option value="cash">{t("Tunai", "Cash")}</option><option value="bank">{t("Bank", "Bank")}</option><option value="e_wallet">E-wallet</option><option value="savings">{t("Tabungan", "Savings")}</option><option value="other">{t("Lainnya", "Other")}</option></select></label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="private-form-actions"><Button type="submit" loading={busy}>{wallet ? t("Simpan perubahan", "Save changes") : t("Buat dompet", "Create wallet")}</Button><Button type="button" variant="secondary" onClick={onCancel}>{t("Batal", "Cancel")}</Button></div>
      <p className="muted">{t("Saldo dan riwayat transaksi tidak berubah saat nama atau jenis dompet diperbarui.", "Changing a wallet name or type does not change its balance or transaction history.")}</p>
    </form>
  </Card>;
}

function walletTypeName(type: Wallet["type"], t: (id: string, en: string) => string) {
  const names: Record<Wallet["type"], [string, string]> = {
    cash: ["Tunai", "Cash"], bank: ["Bank", "Bank"], e_wallet: ["E-wallet", "E-wallet"],
    savings: ["Tabungan", "Savings"], other: ["Lainnya", "Other"],
  };
  return t(...names[type]);
}

function PrivateNotFound() {
  const { t } = usePreferences();
  return <Card><EmptyState icon={<CircleHelp />} title={t("Halaman ini belum tersedia", "This page is not available yet")} action={<Button asChild variant="secondary"><Link to="/app">{t("Kembali ke beranda", "Back to home")}</Link></Button>}>{t("Tidak ada data contoh yang ditampilkan di area akun pribadi.", "No sample data is shown inside the private account area.")}</EmptyState></Card>;
}
