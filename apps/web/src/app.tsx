import { Component, Suspense, lazy, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Globe2,
  LockKeyhole,
  Moon,
  Play,
  ShieldCheck,
  Sun,
  WalletCards,
  ChartNoAxesCombined,
  FilePenLine,
  AlertCircle,
} from "lucide-react";
import { Button, Card, EmptyState, Badge } from "@venfinance/ui";
import { healthSchema, publicConfigSchema } from "@venfinance/contracts";
import { PreferencesProvider, usePreferences } from "./preferences";

const Demo = lazy(() => import("./demo/demo"));
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="VenFinance — Beranda">
      <img
        src="/brand/venfinance-mark-violet.png"
        alt=""
        width="34"
        height="32"
      />
      {!compact && <span>VenFinance</span>}
    </Link>
  );
}
export function AppearanceControls() {
  const { theme, setTheme, locale, setLocale, t } = usePreferences();
  return (
    <div className="appearance-controls">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("Ganti tema", "Toggle theme")}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
      <Button
        variant="ghost"
        size="small"
        aria-label={t("Ganti bahasa", "Change language")}
        onClick={() => setLocale(locale === "id-ID" ? "en-US" : "id-ID")}
      >
        <Globe2 size={16} />
        {locale === "id-ID" ? "ID" : "EN"}
      </Button>
    </div>
  );
}
function PublicHeader() {
  const { t } = usePreferences();
  return (
    <header className="public-header">
      <Brand />
      <nav aria-label={t("Navigasi utama", "Main navigation")}>
        <a href="/#features">{t("Fitur", "Features")}</a>
        <a href="/#how-it-works">{t("Cara kerja", "How it works")}</a>
        <Link to="/faq">{t("Bantuan", "Help")}</Link>
      </nav>
      <div className="public-actions">
        <AppearanceControls />
        <Button variant="secondary" asChild>
          <Link to="/login">{t("Masuk", "Sign in")}</Link>
        </Button>
      </div>
    </header>
  );
}
function PublicFooter() {
  const { t } = usePreferences();
  return (
    <footer className="public-footer">
      <Brand />
      <span>
        {t(
          "Catat hari ini. Pahami esok nanti.",
          "Record today. Understand tomorrow.",
        )}
      </span>
      <div>
        <Link to="/status">{t("Status layanan", "Service status")}</Link>
        <Link to="/faq">{t("Bantuan", "Help")}</Link>
      </div>
    </footer>
  );
}
function Landing() {
  const { t } = usePreferences();
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="landing">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span />
              {t(
                "Pencatat keuangan pribadi",
                "Your personal finance companion",
              )}
            </div>
            <h1>
              {t("Uangmu,", "Your money,")}
              <br />
              <em>{t("lebih terarah.", "with a direction.")}</em>
            </h1>
            <p>
              {t(
                "Catat pengeluaran, atur anggaran, dan pahami kebiasaanmu.",
                "Track spending, plan your budget, and understand your habits.",
              )}
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link to="/demo">
                  {t("Jelajahi demo", "Explore the demo")}
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/login">
                  {t("Masuk ke akun", "Sign in to your account")}
                </Link>
              </Button>
            </div>
            <div className="hero-note">
              <Check size={16} />
              {t(
                "Coba dengan data contoh, tanpa mendaftar.",
                "Try sample data. No sign-up needed.",
              )}
            </div>
          </div>
          <div className="hero-art">
            <img
              src="/illustrations/landing-hero.png"
              alt={t(
                "Ilustrasi dompet ungu dan aplikasi VenFinance dengan saldo contoh",
                "A purple wallet and the VenFinance app showing sample balances",
              )}
              width="641"
              height="492"
            />
            <span className="art-caption">
              {t(
                "Ilustrasi dengan data contoh",
                "Illustration with sample data",
              )}
            </span>
          </div>
        </section>
        <section
          className="feature-grid"
          id="features"
          aria-label={t("Fitur keuangan", "Finance features")}
        >
          {[
            {
              icon: FilePenLine,
              title: t("Catat cepat", "Capture the little things"),
              description: t(
                "Pengeluaran kecil juga berarti. Catat nominal, kategori, dan sumber uangmu.",
                "Small expenses matter too. Record the amount, category, and wallet.",
              ),
              className: "lavender",
            },
            {
              icon: ChartNoAxesCombined,
              title: t("Anggaran jelas", "A clearer budget"),
              description: t(
                "Pisahkan rencana dan pengeluaran nyata. Lihat berapa yang masih tersedia.",
                "Separate plans from actual spending. See what is still available.",
              ),
              className: "mint",
            },
            {
              icon: ShieldCheck,
              title: t("Kendali privasi", "Privacy in your hands"),
              description: t(
                "Koneksi WhatsApp dan pembacaan AI memiliki izin terpisah.",
                "WhatsApp connections and AI processing require separate consent.",
              ),
              className: "pink",
            },
          ].map((item) => (
            <Link
              to="/demo"
              className={`feature-card ${item.className}`}
              key={item.title}
            >
              <div className="feature-icon">
                <item.icon size={28} />
              </div>
              <div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
              <ChevronRight size={20} />
            </Link>
          ))}
        </section>
        <section className="how-section" id="how-it-works">
          <div>
            <span className="section-kicker">
              {t("Mulai dari hal sederhana", "Start with something simple")}
            </span>
            <h2>
              {t(
                "Lebih kenal uangmu, satu catatan setiap hari.",
                "Get to know your money, one entry at a time.",
              )}
            </h2>
          </div>
          <div className="steps">
            {[
              t("Pilih sumber uang", "Choose a wallet"),
              t("Catat transaksi nyata", "Record a real transaction"),
              t("Tinjau kebiasaanmu", "Review your habits"),
            ].map((label, i) => (
              <div key={label}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="landing-cta">
          <div>
            <h2>
              {t(
                "Kenali dulu. Mulai saat kamu siap.",
                "Take a look. Start when you are ready.",
              )}
            </h2>
            <p>
              {t(
                "Demo memakai data simulasi yang terpisah dari akun pribadi.",
                "The demo uses sample data, separate from personal accounts.",
              )}
            </p>
          </div>
          <Button asChild>
            <Link to="/demo">
              <Play size={17} />
              {t("Buka demo interaktif", "Open interactive demo")}
            </Link>
          </Button>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
export async function publicConfig() {
  const response = await fetch("/api/v1/config/public", { cache: "no-store" });
  if (!response.ok) throw new Error("Configuration unavailable");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("data" in body))
    throw new Error("Invalid configuration");
  return publicConfigSchema.parse(body.data);
}
function AuthGate() {
  const { t } = usePreferences();
  const location = useLocation();
  const config = useQuery({
    queryKey: ["public-config"],
    queryFn: publicConfig,
  });
  const register = location.pathname === "/register";
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="auth-page">
        <Card className="auth-card">
          <div className="auth-icon">
            <LockKeyhole size={30} />
          </div>
          <h1>
            {register
              ? t("Buat akun VenFinance", "Create a VenFinance account")
              : t("Selamat datang kembali", "Welcome back")}
          </h1>
          <p className="muted">
            {t(
              "Ruang untuk catatan dan rencana keuanganmu.",
              "A space for your finances and plans.",
            )}
          </p>
          {config.isPending ? (
            <div role="status" className="notice">
              {t(
                "Memeriksa ketersediaan akses…",
                "Checking sign-in availability…",
              )}
            </div>
          ) : config.isError ? (
            <div role="alert" className="notice notice-warning">
              <AlertCircle size={20} />
              <div>
                <strong>
                  {t(
                    "Layanan belum dapat dihubungi",
                    "Unable to reach the service",
                  )}
                </strong>
                <p>
                  {t(
                    "Periksa koneksi lalu coba kembali.",
                    "Check your connection and try again.",
                  )}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    void config.refetch();
                  }}
                >
                  {t("Coba lagi", "Retry")}
                </Button>
              </div>
            </div>
          ) : (
            <div role="status" className="notice">
              <ShieldCheck size={22} />
              <div>
                <strong>
                  {t(
                    "Akses akun belum dibuka",
                    "Account access is not open yet",
                  )}
                </strong>
                <p>
                  {t(
                    "Layanan autentikasi sedang disiapkan. Kamu bisa menjelajahi demo tanpa memasukkan data pribadi.",
                    "Authentication is being prepared. Explore the demo without entering personal information.",
                  )}
                </p>
              </div>
            </div>
          )}
          <Button asChild>
            <Link to="/demo">
              {t("Coba demo dahulu", "Try the demo")}
              <ArrowRight size={18} />
            </Link>
          </Button>
          <Link to="/status">
            {t("Lihat status layanan", "View service status")}
          </Link>
        </Card>
        <div className="auth-illustration">
          <WalletCards size={64} strokeWidth={1.2} />
          <h2>
            {t(
              "Setiap catatan, selangkah lebih terarah.",
              "Every entry, a step in the right direction.",
            )}
          </h2>
          <p>
            {t(
              "VenFinance membantu mencatat. Uangmu tetap berada di rekening dan dompetmu.",
              "VenFinance keeps records. Your money stays in your own accounts and wallets.",
            )}
          </p>
        </div>
      </main>
    </>
  );
}
function StatusPage() {
  const { t, locale } = usePreferences();
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("/api/v1/health", { cache: "no-store" });
      if (!response.ok) throw new Error("Health unavailable");
      const body = (await response.json()) as { data: unknown };
      return healthSchema.parse(body.data);
    },
    refetchInterval: 60_000,
  });
  const names = {
    auth: t("Autentikasi", "Authentication"),
    database: "Database",
    storage: t("Penyimpanan bukti", "Evidence storage"),
    whatsapp: "WhatsApp",
    ai: t("Pembacaan AI", "AI extraction"),
  };
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="public-content">
        <div className="page-heading">
          <span className="section-kicker">VenFinance</span>
          <h1>{t("Status layanan", "Service status")}</h1>
          <p>
            {t(
              "Ketersediaan yang dilaporkan layanan, beserta waktu pemeriksaan.",
              "Reported service availability and the time it was checked.",
            )}
          </p>
        </div>
        {health.isPending ? (
          <Card>
            <p role="status">{t("Memeriksa layanan…", "Checking services…")}</p>
          </Card>
        ) : health.isError ? (
          <Card>
            <EmptyState
              icon={<AlertCircle />}
              title={t("Status belum tersedia", "Status unavailable")}
              action={
                <Button
                  onClick={() => {
                    void health.refetch();
                  }}
                >
                  {t("Coba lagi", "Retry")}
                </Button>
              }
            >
              {t(
                "Koneksi gagal. Ketersediaan layanan belum dapat dipastikan.",
                "The connection failed. Service availability cannot be confirmed.",
              )}
            </EmptyState>
          </Card>
        ) : (
          <Card>
            <div className="service-row">
              <span>
                <Activity size={20} />
                API
              </span>
              <Badge tone="success">{t("Dapat dihubungi", "Reachable")}</Badge>
            </div>
            {Object.entries(health.data.services).map(([key, value]) => (
              <div className="service-row" key={key}>
                <span>{names[key as keyof typeof names]}</span>
                <Badge tone={value === "available" ? "success" : "warning"}>
                  {value === "not_configured"
                    ? t("Belum dikonfigurasi", "Not configured")
                    : value === "unknown"
                      ? t("Belum diverifikasi", "Not verified")
                      : value === "available"
                        ? t("Tersedia", "Available")
                        : t("Terganggu", "Disrupted")}
                </Badge>
              </div>
            ))}
            <p className="muted status-time">
              {t("Terakhir diperiksa", "Last checked")}:{" "}
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "medium",
                timeZone: "Asia/Jakarta",
              }).format(new Date(health.data.checkedAt))}{" "}
              WIB
            </p>
          </Card>
        )}
        <div className="notice">
          <CircleHelp size={22} />
          <p>
            {t(
              "Status API tidak menyatakan bahwa autentikasi, database, atau integrasi lain sudah siap digunakan.",
              "API availability does not mean authentication, the database, or other integrations are ready.",
            )}
          </p>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
function HelpPage() {
  const { t } = usePreferences();
  const items = [
    [
      t(
        "Apakah VenFinance menyimpan uang saya?",
        "Does VenFinance hold my money?",
      ),
      t(
        "VenFinance merupakan pencatat keuangan. Saldo adalah catatan virtual; aplikasi tidak memindahkan uang dari bank atau e-wallet.",
        "VenFinance keeps financial records. Balances are virtual records; the app does not move money from your bank or e-wallet.",
      ),
    ],
    [
      t(
        "Apakah data demo masuk ke akun saya?",
        "Does demo data enter my account?",
      ),
      t(
        "Tidak. Seluruh angka di demo adalah contoh. Perubahan hanya berada di memori tab ini dan direset saat halaman dimuat ulang.",
        "No. All demo amounts are examples. Changes are kept in this tab’s memory and reset when the page reloads.",
      ),
    ],
    [
      t(
        "Apakah AI langsung mencatat transaksi?",
        "Does AI automatically post transactions?",
      ),
      t(
        "Hasil bacaan harus ditinjau dan dikonfirmasi sebelum menjadi transaksi. Integrasi AI dan WhatsApp belum tersedia pada build ini.",
        "Extraction results must be reviewed and confirmed before posting. AI and WhatsApp integrations are unavailable in this build.",
      ),
    ],
  ];
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="public-content">
        <div className="page-heading">
          <span className="section-kicker">
            {t("Pusat bantuan", "Help center")}
          </span>
          <h1>{t("Kenali VenFinance", "Get to know VenFinance")}</h1>
        </div>
        <Card>
          {items.map(([question, answer]) => (
            <details className="faq-item" key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </Card>
        <Button variant="secondary" asChild>
          <Link to="/demo">
            {t("Jelajahi demo", "Explore the demo")}
            <ArrowRight size={18} />
          </Link>
        </Button>
      </main>
      <PublicFooter />
    </>
  );
}
function NotFound() {
  const { t } = usePreferences();
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="public-content">
        <Card>
          <EmptyState
            icon={<CircleHelp />}
            title={t("Halaman tidak ditemukan", "Page not found")}
            action={
              <Button asChild>
                <Link to="/">{t("Kembali ke beranda", "Back to home")}</Link>
              </Button>
            }
          >
            {t(
              "Alamat ini tidak tersedia. Silakan kembali ke beranda.",
              "This address is unavailable. Please return to the home page.",
            )}
          </EmptyState>
        </Card>
      </main>
    </>
  );
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="public-content">
        <EmptyState
          title="Halaman belum dapat dimuat / Unable to load this page"
          action={
            <Button onClick={() => window.location.reload()}>
              Muat ulang / Reload
            </Button>
          }
        >
          Coba muat ulang halaman. / Try reloading the page.
        </EmptyState>
      </main>
    ) : (
      this.props.children
    );
  }
}
export function App() {
  return (
    <PreferencesProvider>
      <ErrorBoundary>
        <a className="skip-link" href="#main-content">
          Langsung ke konten / Skip to content
        </a>
        <Suspense
          fallback={
            <main className="public-content" role="status">
              Memuat VenFinance… / Loading VenFinance…
            </main>
          }
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/demo/*" element={<Demo />} />
            <Route path="/login" element={<AuthGate />} />
            <Route path="/register" element={<AuthGate />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/faq" element={<HelpPage />} />
            <Route path="/app/*" element={<Navigate to="/login" replace />} />
            <Route path="/admin/*" element={<Navigate to="/login" replace />} />
            <Route
              path="/system/*"
              element={<Navigate to="/login" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </PreferencesProvider>
  );
}
