import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, Banknote,
  ChartNoAxesCombined, CircleHelp, Eye, EyeOff, Home, List, LoaderCircle,
  CloudOff, ChevronRight, KeyRound, LaptopMinimal, LogOut, Plus, RefreshCw,
  Settings, ShieldCheck, Smartphone, WalletCards, X,
} from "lucide-react";
import {
  authDeviceSessionListSchema, authSessionMutationSchema, categorySchema,
  financeEventPageSchema, financePostResultSchema, financePostSchema,
  privateSessionSchema, publicConfigSchema, profileCreateResultSchema,
  profileReadResultSchema, walletSchema, type FinanceEvent,
  type FinanceEventPage, type UserProfile, type Wallet,
} from "@venfinance/contracts";
import { formatIdr, parseIdrInput, sumMinor } from "@venfinance/domain";
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
type EventKind = "income" | "expense" | "transfer" | "opening";

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
          <NavLink to="/app/wallets" className={active === "wallets" ? "active" : ""}><WalletCards size={20} /><span>{t("Dompet", "Wallets")}</span></NavLink>
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

function useRecentEvents(ownerId: string, limit: number) {
  const query = new URLSearchParams({ limit: String(limit) });
  return useQuery({ queryKey: ["finance-events", ownerId, "recent", limit], queryFn: () => apiData(`/api/v1/transactions?${query}`, financeEventPageSchema), retry: false });
}

function Dashboard({ profile, ownerId }: { profile: UserProfile; ownerId: string }) {
  const { t, locale, hidden, toggleHidden } = usePreferences();
  const wallets = useWallets(ownerId);
  const recent = useRecentEvents(ownerId, 5);
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
        <Card className="private-summary-note"><ChartNoAxesCombined size={24} /><div><strong>{t("Ringkasan dari catatanmu", "Based on your records")}</strong><p>{t("Saldo dijumlahkan dari mutasi dompet yang sudah dikonfirmasi. Anggaran dan ringkasan bulanan akan muncul setelah fiturnya tersedia.", "Balances come from confirmed wallet postings. Budget and monthly summaries will appear when those features are available.")}</p></div></Card>
      </div>
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

function EventList({ events, locale, timezone, hidden }: { events: FinanceEvent[]; locale: "id-ID" | "en-US"; timezone: string; hidden: boolean }) {
  const { t } = usePreferences();
  return <div className="private-event-list">{events.map((event) => {
    const sign = signForEvent(event);
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: event.timezone || timezone }).format(new Date(event.effectiveAt));
    const wallet = event.walletName ?? event.destinationWalletName ?? t("Dompet", "Wallet");
    return <article className="private-event-row" key={event.id}><span className={`private-event-icon ${sign}`} aria-hidden="true">{sign === "in" ? <ArrowDownLeft size={19} /> : sign === "out" ? <ArrowUpRight size={19} /> : <ArrowLeftRight size={19} />}</span><div className="private-event-description"><strong>{eventTitle(event, t)}</strong><span>{[event.categoryName, wallet, date].filter(Boolean).join(" · ")}</span></div><strong className={`private-event-amount ${sign}`}>{hidden ? "Rp••••••" : `${sign === "in" ? "+" : sign === "out" ? "−" : ""}${formatIdr(event.amountMinor, locale)}`}</strong></article>;
  })}</div>;
}

function TransactionsPage({ profile, ownerId }: { profile: UserProfile; ownerId: string }) {
  const { t, locale } = usePreferences();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [kind, setKind] = useState("all");
  const [search, setSearch] = useState("");
  const query = useInfiniteQuery({
    queryKey: ["finance-events", ownerId, "list", kind],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }): Promise<EventPage> => {
      const searchParams = new URLSearchParams({ limit: "20" });
      if (kind !== "all") searchParams.set("kind", kind);
      if (pageParam) searchParams.set("cursor", pageParam);
      return apiData(`/api/v1/transactions?${searchParams}`, financeEventPageSchema);
    },
    getNextPageParam: (lastPage) => lastPage.page.hasMore ? lastPage.page.nextCursor : undefined,
  });
  const events = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(locale);
    if (!term) return events;
    return events.filter((event) => `${eventTitle(event, t)} ${event.categoryName ?? ""} ${event.walletName ?? ""}`.toLocaleLowerCase(locale).includes(term));
  }, [events, locale, search, t]);
  const openForm = location.pathname.endsWith("/new") || params.get("new") === "1";
  if (query.isPending && !openForm) return loadingPanel(t("Memuat transaksi…", "Loading transactions…"));
  if (query.isError && !openForm) return unavailablePanel(() => void query.refetch(), t("Riwayat transaksi tidak dapat dimuat.", "Transaction history could not be loaded."));
  const closeForm = () => {
    if (location.pathname.endsWith("/new")) void navigate("/app/transactions", { replace: true });
    else setParams({}, { replace: true });
  };
  return (
    <>
      <FinanceHeading title={t("Riwayat transaksi", "Transaction history")} description={t("Catatan yang sudah dikonfirmasi. Draf dan hasil bacaan belum masuk ke saldo.", "Confirmed records. Drafts and extracted items are excluded from balances.")} action={<Button onClick={() => setParams({ new: "1" })}><Plus size={18} />{t("Catat transaksi", "Record transaction")}</Button>} />
      {openForm ? <TransactionForm profile={profile} ownerId={ownerId} onCancel={closeForm} onSaved={() => { closeForm(); void query.refetch(); void navigate("/app/transactions"); }} /> : null}
      <Card className="private-transactions-card">
        {query.isError ? <div className="offline-stale-notice" role="status">{t("Riwayat transaksi server sedang tidak tersedia. Draf lokal tetap tersimpan terpisah dan belum mengubah saldo.", "Server transaction history is unavailable. Local drafts remain separate and do not change balances.")}</div> : null}
        <div className="private-filter-row">
          <TextField label={t("Cari catatan yang sudah dimuat", "Search loaded records")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("Nama, kategori, atau dompet", "Name, category, or wallet")} />
          <label className="private-select-field"><span>{t("Jenis transaksi", "Transaction type")}</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">{t("Semua", "All")}</option><option value="expense">{t("Pengeluaran", "Expenses")}</option><option value="income">{t("Pemasukan", "Income")}</option><option value="transfer">{t("Transfer", "Transfers")}</option><option value="refund">{t("Refund", "Refunds")}</option><option value="opening">{t("Saldo awal", "Opening balance")}</option><option value="adjustment">{t("Penyesuaian", "Adjustments")}</option></select></label>
        </div>
        {visible.length ? <EventList events={visible} locale={locale} timezone={profile.timezone} hidden={false} /> : <EmptyState icon={<List />} title={events.length ? t("Tidak ada catatan yang cocok", "No matching records") : t("Belum ada transaksi", "No transactions yet")} action={events.length ? <Button variant="secondary" onClick={() => { setSearch(""); setKind("all"); }}>{t("Hapus filter", "Clear filters")}</Button> : <Button onClick={() => setParams({ new: "1" })}><Plus size={17} />{t("Catat transaksi pertama", "Record your first transaction")}</Button>}>{events.length ? t("Coba filter lain. Pencarian mencakup transaksi yang sudah dimuat.", "Try another filter. Search covers the records loaded so far.") : t("Transaksi contoh hanya muncul di demo.", "Sample transactions appear in the demo only.")}</EmptyState>}
        {query.hasNextPage ? <div className="private-load-more"><Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{t("Muat transaksi berikutnya", "Load more transactions")}</Button></div> : null}
      </Card>
    </>
  );
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

function TransactionForm({ profile, ownerId, onCancel, onSaved }: { profile: UserProfile; ownerId: string; onCancel: () => void; onSaved: () => void }) {
  const { t } = usePreferences();
  const queryClient = useQueryClient();
  const wallets = useWallets(ownerId);
  const categories = useCategories(ownerId);
  const [kind, setKind] = useState<EventKind>("expense");
  const [walletId, setWalletId] = useState("");
  const [destinationWalletId, setDestinationWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [effectiveAt, setEffectiveAt] = useState(() => toLocalInput(profile.timezone));
  const [note, setNote] = useState("");
  const [allowNegative, setAllowNegative] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const stableCommand = useRef<{ fingerprint: string; key: string } | null>(null);
  const activeWallets = wallets.data?.items.filter((wallet) => !wallet.archivedAt) ?? [];
  const selectedWalletId = activeWallets.find((wallet) => wallet.id === walletId)?.id ?? activeWallets[0]?.id ?? "";
  const selectedDestinationWalletId = activeWallets.find((wallet) => wallet.id === destinationWalletId && wallet.id !== selectedWalletId)?.id ?? activeWallets.find((wallet) => wallet.id !== selectedWalletId)?.id ?? "";
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
      kind, walletId: selectedWalletId, ...(kind === "transfer" ? { destinationWalletId: selectedDestinationWalletId } : {}),
      amountMinor, currency: "IDR", effectiveAt: localDateTimeToIso(effectiveAt, profile.timezone),
      timezone: profile.timezone,
      ...(kind === "expense" && categoryId ? { allocations: [{ categoryId, amountMinor }] } : {}),
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
      <div className="private-form-heading"><div><span className="section-kicker">{t("Catatan pribadi", "Private record")}</span><h2 id="transaction-form-title">{t("Catat transaksi", "Record a transaction")}</h2></div><Button variant="ghost" size="icon" aria-label={t("Tutup", "Close")} onClick={onCancel}><X size={20} /></Button></div>
      {offlineNotice ? <p className="offline-notice" role="status">{offlineNotice}</p> : null}
      {wallets.isPending ? <p role="status">{t("Memuat dompet…", "Loading wallets…")}</p> : wallets.data?.items.length ? (
        <form className="finance-form" onSubmit={submit}>
          <label className="private-select-field"><span>{t("Jenis", "Type")}</span><select value={kind} onChange={(event) => setKind(event.target.value as EventKind)}><option value="expense">{t("Pengeluaran", "Expense")}</option><option value="income">{t("Pemasukan", "Income")}</option><option value="transfer">{t("Transfer", "Transfer")}</option><option value="opening">{t("Saldo awal", "Opening balance")}</option></select></label>
          <TextField label={t("Nominal rupiah", "Amount in rupiah")} inputMode="numeric" autoComplete="off" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="10.000" required />
          <label className="private-select-field"><span>{kind === "income" || kind === "opening" ? t("Masuk ke dompet", "To wallet") : t("Dari dompet", "From wallet")}</span><select value={selectedWalletId} onChange={(event) => setWalletId(event.target.value)} required>{activeWallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name} · {formatIdr(wallet.balanceMinor)}</option>)}</select></label>
          {kind === "transfer" ? <label className="private-select-field"><span>{t("Ke dompet", "To wallet")}</span><select value={selectedDestinationWalletId} onChange={(event) => setDestinationWalletId(event.target.value)} required>{activeWallets.filter((wallet) => wallet.id !== selectedWalletId).map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label> : null}
          {kind === "expense" && categories.data?.items.length ? <label className="private-select-field"><span>{t("Kategori (opsional)", "Category (optional)")}</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">{t("Tanpa kategori", "Uncategorized")}</option>{categories.data.items.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label> : null}
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
  const { t, locale } = usePreferences();
  const queryClient = useQueryClient();
  const wallets = useWallets(ownerId);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("cash");
  const [error, setError] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: (payload: { name: string; type: string }) => apiData("/api/v1/wallets", walletSchema, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => { setName(""); setAdding(false); await queryClient.invalidateQueries({ queryKey: ["finance-wallets", ownerId] }); },
    onError: (cause) => setError(cause instanceof ApiClientError ? cause.publicMessage ?? t("Dompet belum dapat dibuat.", "The wallet could not be created.") : t("Periksa nama dan jenis dompet.", "Check the wallet name and type.")),
  });
  const total = wallets.data ? sumMinor(wallets.data.items.filter((wallet) => !wallet.archivedAt).map((wallet) => wallet.balanceMinor)) : "0";
  return (
    <>
      <FinanceHeading title={t("Daftar dompet", "Wallets")} description={t("Sumber uang virtual yang digunakan pada catatanmu.", "Virtual money sources used in your records.")} action={<Button onClick={() => { setAdding((current) => !current); setError(null); }}><Plus size={18} />{t("Tambah dompet", "Add wallet")}</Button>} />
      {adding ? <Card className="private-form-card"><div className="private-form-heading"><h2>{t("Dompet baru", "New wallet")}</h2><Button variant="ghost" size="icon" aria-label={t("Tutup", "Close")} onClick={() => setAdding(false)}><X size={19} /></Button></div><form className="finance-form" onSubmit={(event) => { event.preventDefault(); setError(null); create.mutate({ name: name.trim(), type }); }}><TextField label={t("Nama dompet", "Wallet name")} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder={t("Contoh: Tunai", "Example: Cash")} required /><label className="private-select-field"><span>{t("Jenis dompet", "Wallet type")}</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="cash">{t("Tunai", "Cash")}</option><option value="bank">{t("Bank", "Bank")}</option><option value="e_wallet">E-wallet</option><option value="savings">{t("Tabungan", "Savings")}</option><option value="other">{t("Lainnya", "Other")}</option></select></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<div className="private-form-actions"><Button type="submit" loading={create.isPending}>{t("Buat dompet", "Create wallet")}</Button><Button type="button" variant="secondary" onClick={() => setAdding(false)}>{t("Batal", "Cancel")}</Button></div><p className="muted">{t("Saldo awal dicatat sebagai transaksi pembuka setelah dompet dibuat.", "Record an opening balance as a separate opening transaction after creating the wallet.")}</p></form></Card> : null}
      {wallets.isPending ? loadingPanel(t("Memuat dompet…", "Loading wallets…")) : wallets.isError ? unavailablePanel(() => void wallets.refetch(), t("Saldo dompet belum dapat dimuat.", "Wallet balances could not be loaded.")) : (
        <>
          {wallets.data.source === "device" ? <p className="offline-stale-notice" role="status">{t("Saldo ini terakhir dimuat sebelum koneksi terputus dan belum diverifikasi ulang.", "These balances were last loaded before the connection was lost and have not been reverified.")}</p> : null}
          <Card className="private-balance-card private-wallet-total"><div className="private-card-title">{t("Total saldo dompet aktif", "Total active wallet balance")}</div><strong>{formatIdr(total, locale)}</strong><span><WalletCards size={17} />{t(`${wallets.data.items.filter((wallet) => !wallet.archivedAt).length} sumber uang`, `${wallets.data.items.filter((wallet) => !wallet.archivedAt).length} wallets`)}</span></Card>
          {wallets.data.items.filter((wallet) => !wallet.archivedAt).length ? <div className="private-wallet-list">{wallets.data.items.filter((wallet) => !wallet.archivedAt).map((wallet) => <Card className="private-wallet-row" key={wallet.id}><span className={`private-wallet-icon ${wallet.type}`}><WalletCards size={22} /></span><div className="private-event-description"><strong>{wallet.name}</strong><span>{walletTypeName(wallet.type, t)}</span></div><strong>{formatIdr(wallet.balanceMinor, locale)}</strong></Card>)}</div> : <Card><EmptyState icon={<WalletCards />} title={t("Belum ada dompet", "No wallets yet")} action={<Button onClick={() => setAdding(true)}><Plus size={17} />{t("Tambah dompet", "Add wallet")}</Button>}>{t("Tambahkan sumber uang virtual sebelum mencatat transaksi.", "Add a virtual money source before recording transactions.")}</EmptyState></Card>}
          {wallets.data.items.some((wallet) => wallet.archivedAt) ? <Card className="private-archived-note"><strong>{t("Dompet arsip", "Archived wallets")}</strong><p>{t("Dompet arsip tidak dihitung pada total saldo aktif.", "Archived wallets are excluded from the active balance total.")}</p></Card> : null}
        </>
      )}
    </>
  );
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
