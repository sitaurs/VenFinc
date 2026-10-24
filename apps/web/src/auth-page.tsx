import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { privateSessionSchema } from "@venfinance/contracts";
import { Button, TextField } from "@venfinance/ui";
import { ApiClientError, apiData, authPost } from "./api-client";
import { usePreferences } from "./preferences";

type Props = {
  register: boolean;
  authAvailable: boolean;
  registrationOpen: boolean;
  loading: boolean;
  unavailable: boolean;
  retry: () => void;
};

function BrandMark() {
  return (
    <Link className="auth-brand" to="/" aria-label="VenFinance">
      <img src="/brand/venfinance-mark-violet.png" width="38" height="36" alt="" />
      <span>VenFinance</span>
    </Link>
  );
}

function friendlyAuthError(error: unknown, register: boolean, signedIn: boolean, t: (id: string, en: string) => string) {
  if (error instanceof ApiClientError && error.status === 429) {
    return t("Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.", "Too many attempts. Wait a moment and try again.");
  }
  if (error instanceof ApiClientError && error.status === 403) {
    return t("Akses belum tersedia untuk akun ini. Periksa verifikasi email atau hubungi dukungan.", "Access is not available for this account. Check email verification or contact support.");
  }
  if (error instanceof ApiClientError && error.status === 503) {
    return t("Layanan autentikasi sedang tidak tersedia. Coba kembali nanti.", "Authentication is temporarily unavailable. Try again later.");
  }
  if (signedIn && error instanceof ApiClientError && error.status === 401) {
    return t("Email akun ini belum terverifikasi. Selesaikan verifikasi email sebelum membuka data keuangan.", "This email is not verified. Complete email verification before opening financial data.");
  }
  return register
    ? t("Akun belum dapat dibuat. Periksa isian lalu coba lagi.", "The account could not be created. Check the form and try again.")
    : t("Email atau kata sandi belum cocok. Periksa lalu coba lagi.", "The email or password did not match. Check them and try again.");
}

export function AuthPage({ register, authAvailable, registrationOpen, loading, unavailable, retry }: Props) {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const routeState = location.state as { email?: string; notice?: string } | null;
  const [email, setEmail] = useState(routeState?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(routeState?.notice ?? null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!authAvailable || (register && !registrationOpen)) return;
    setBusy(true);
    let signedIn = false;
    try {
      if (register) {
        const normalizedEmail = email.trim().toLowerCase();
        await authPost("sign-up/email", {
          name: name.trim(),
          email: normalizedEmail,
          password,
        });
        navigate("/verify-email", {
          replace: true,
          state: { email: normalizedEmail, justRegistered: true },
        });
      } else {
        await authPost("sign-in/email", {
          email: email.trim().toLowerCase(),
          password,
        });
        signedIn = true;
        await apiData("/api/v1/session", privateSessionSchema);
        await queryClient.invalidateQueries();
        const state = location.state as { from?: string } | null;
        navigate(state?.from?.startsWith("/app") ? state.from : "/app", { replace: true });
      }
    } catch (caught) {
      setError(friendlyAuthError(caught, register, signedIn, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen" id="main-content">
      <section className={`auth-panel${register ? " auth-panel-register" : ""}`}>
        <div className="auth-form-wrap">
          {register && <Link to="/" className="auth-back"><ArrowLeft size={19} />{t("Kembali", "Back")}</Link>}
          <BrandMark />
          <div className="auth-heading">
            <h1>{register ? t("Mulai atur uangmu", "Start organizing your money") : t("Selamat datang kembali", "Welcome back")}</h1>
            <p>{register
              ? t("Buat akun untuk mulai mencatat keuanganmu dengan aman.", "Create an account to start recording your finances securely.")
              : t("Masuk untuk melanjutkan catatan dan rencana keuanganmu.", "Sign in to continue with your financial records and plans.")}</p>
          </div>

          {loading ? <div className="auth-notice" role="status">{t("Memeriksa ketersediaan layanan…", "Checking service availability…")}</div> : null}
          {unavailable ? (
            <div className="auth-notice auth-notice-error" role="alert">
              <strong>{t("Layanan belum dapat dihubungi", "Unable to reach the service")}</strong>
              <p>{t("Koneksi autentikasi belum dapat dipastikan.", "Authentication availability cannot be confirmed.")}</p>
              <Button variant="secondary" onClick={retry}>{t("Coba lagi", "Retry")}</Button>
            </div>
          ) : null}
          {!loading && !unavailable && !authAvailable ? (
            <div className="auth-notice" role="status">
              <LockKeyhole size={20} />
              <div><strong>{t("Akses akun belum dibuka", "Account access is not open yet")}</strong>
                <p>{t("Autentikasi masih disiapkan. Demo tetap memakai data contoh terpisah.", "Authentication is still being prepared. The demo continues to use separate sample data.")}</p></div>
            </div>
          ) : null}
          {!loading && !unavailable && authAvailable && register && !registrationOpen ? (
            <div className="auth-notice" role="status">
              <LockKeyhole size={20} />
              <div><strong>{t("Pendaftaran belum dibuka", "Registration is not open")}</strong>
                <p>{t("Akun baru tersedia setelah verifikasi email siap dikirim dan diuji.", "New accounts will be available after email verification is ready and tested.")}</p></div>
            </div>
          ) : null}

          {authAvailable && (!register || registrationOpen) ? (
            <form className="auth-form" onSubmit={submit}>
              {register ? <TextField label={t("Nama", "Name")} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required /> : null}
              <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
              <div className="auth-password-field">
                <TextField label={t("Kata sandi", "Password")} type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required />
                <button type="button" className="password-toggle" aria-label={showPassword ? t("Sembunyikan kata sandi", "Hide password") : t("Tampilkan kata sandi", "Show password")} onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {register ? <label className="auth-consent"><input type="checkbox" required /><span>{t("Saya menyetujui", "I agree to the")} <Link to="/legal/terms">{t("Syarat dan Ketentuan", "Terms of Service")}</Link> {t("serta", "and the")} <Link to="/legal/privacy">{t("Kebijakan Privasi", "Privacy Policy")}</Link>.</span></label> : null}
              {error ? <p className="auth-form-error" role="alert">{error}</p> : null}
              {notice ? <p className="auth-form-success" role="status">{notice}</p> : null}
              <Button type="submit" loading={busy} disabled={loading || unavailable} className="auth-submit">{register ? t("Buat akun", "Create account") : t("Masuk", "Sign in")}</Button>
            </form>
          ) : null}

          {!register && authAvailable ? <Link className="auth-forgot" to="/forgot-password">{t("Lupa kata sandi?", "Forgot password?")}</Link> : null}
          {!register && authAvailable ? <Link className="auth-forgot" to="/verify-email" state={{ email }}>
            {t("Belum menerima kode verifikasi?", "Didn’t receive a verification code?")}
          </Link> : null}
          {!register ? <Link className="auth-offline-link" to="/offline-unlock">{t("Buka draf offline di perangkat ini", "Open offline drafts on this device")}</Link> : null}
          <p className="auth-switch">{register ? t("Sudah punya akun?", "Already have an account?") : t("Belum punya akun?", "New to VenFinance?")} {register
            ? <Link to="/login">{t("Masuk", "Sign in")}</Link>
            : registrationOpen ? <Link to="/register">{t("Daftar", "Create account")}</Link> : <span>{t("Pendaftaran ditutup sementara", "Registration is temporarily closed")}</span>}</p>
        </div>
        <aside className="auth-art" aria-label={t("Catatan keamanan", "Security note")}>
          <div className="auth-art-orbit" />
          <div className="auth-art-card"><div className="auth-art-wallet"><div /></div><div className="auth-art-coins"><span /><span /><span /></div><div className="auth-art-plant"><i /><i /><i /></div></div>
          <div className="auth-art-copy"><h2>{t("Langkah kecil, untuk masa depan yang lebih baik", "Small steps toward a better future")}</h2><p>{t("Catat pengeluaran dan pahami kebiasaanmu. Saldo di sini adalah catatan virtual.", "Record expenses and understand your habits. Balances here are virtual records.")}</p></div>
          <div className="auth-art-dots" aria-hidden="true"><span /><span /><span /></div>
        </aside>
      </section>
    </main>
  );
}
