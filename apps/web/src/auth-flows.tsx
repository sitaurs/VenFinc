import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, MailCheck, RefreshCw } from "lucide-react";
import { privateSessionSchema } from "@venfinance/contracts";
import { Button, TextField } from "@venfinance/ui";
import { ApiClientError, apiData, authPost } from "./api-client";
import { usePreferences } from "./preferences";

export type AuthFlowProps = {
  authAvailable: boolean;
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

function maskEmail(value: string) {
  const [local, domain] = value.split("@", 2);
  if (!local || !domain) return value;
  const visible = local.length < 3 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}${"*".repeat(Math.min(8, Math.max(3, local.length - visible.length)))}@${domain}`;
}

function AuthFlowFrame({
  title,
  description,
  icon,
  backTo,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  backTo: string;
  children: ReactNode;
}) {
  const { t } = usePreferences();
  return (
    <main className="auth-screen auth-screen-flow" id="main-content">
      <section className="auth-panel auth-panel-flow">
        <div className="auth-form-wrap">
          <Link to={backTo} className="auth-back auth-flow-back">
            <ArrowLeft size={19} />{t("Kembali", "Back")}
          </Link>
          <BrandMark />
          <div className="auth-flow-illustration" aria-hidden="true">{icon}</div>
          <div className="auth-heading">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </div>
        <aside className="auth-art" aria-label={t("Catatan keamanan", "Security note")}>
          <div className="auth-art-orbit" />
          <div className="auth-art-card"><div className="auth-art-wallet"><div /></div><div className="auth-art-coins"><span /><span /><span /></div><div className="auth-art-plant"><i /><i /><i /></div></div>
          <div className="auth-art-copy"><h2>{t("Catatan keuangan tetap milikmu", "Your records stay yours")}</h2><p>{t("VenFinance tidak menyimpan uang dan tidak pernah meminta kode keamanan melalui WhatsApp.", "VenFinance does not hold money and will never ask for a security code over WhatsApp.")}</p></div>
          <div className="auth-art-dots" aria-hidden="true"><span /><span /><span /></div>
        </aside>
      </section>
    </main>
  );
}

function Availability({ props }: { props: AuthFlowProps }) {
  const { t } = usePreferences();
  if (props.loading) {
    return <div className="auth-notice" role="status">{t("Memeriksa layanan autentikasi…", "Checking the authentication service…")}</div>;
  }
  if (props.unavailable) {
    return (
      <div className="auth-notice auth-notice-error" role="alert">
        <strong>{t("Layanan belum dapat dihubungi", "Unable to reach the service")}</strong>
        <p>{t("Koneksi autentikasi belum dapat dipastikan.", "Authentication availability cannot be confirmed.")}</p>
        <Button variant="secondary" onClick={props.retry}>{t("Coba lagi", "Retry")}</Button>
      </div>
    );
  }
  if (!props.authAvailable) {
    return (
      <div className="auth-notice" role="status">
        <LockKeyhole size={20} />
        <div><strong>{t("Akses akun belum dibuka", "Account access is not open yet")}</strong><p>{t("Coba lagi nanti atau gunakan demo yang terpisah.", "Try again later or use the separate demo.")}</p></div>
      </div>
    );
  }
  return null;
}

function requestError(error: unknown, t: (id: string, en: string) => string) {
  if (error instanceof ApiClientError && error.status === 429) {
    return t("Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.", "Too many attempts. Wait a little and try again.");
  }
  if (error instanceof ApiClientError && error.status === 503) {
    return t("Layanan autentikasi sementara tidak tersedia. Coba kembali nanti.", "The authentication service is temporarily unavailable. Try again later.");
  }
  return t("Permintaan belum dapat diproses. Periksa isian lalu coba lagi.", "The request could not be processed. Check the details and try again.");
}

export function VerifyEmailPage(props: AuthFlowProps) {
  const { t } = usePreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const state = location.state as { email?: string; justRegistered?: boolean } | null;
  const [email, setEmail] = useState(state?.email ?? "");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(state?.justRegistered ? 45 : 0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState(
    state?.justRegistered
      ? t("Jika alamat ini dapat didaftarkan, kode verifikasi telah dikirim. Periksa email dan folder Spam.", "If this address can be registered, a verification code has been sent. Check your inbox and Spam folder.")
      : null,
  );

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await authPost("email-otp/verify-email", { email: email.trim().toLowerCase(), otp: otp.trim() });
      try {
        await apiData("/api/v1/session", privateSessionSchema);
        await queryClient.invalidateQueries();
        navigate("/app", { replace: true });
      } catch (sessionError) {
        if (!(sessionError instanceof ApiClientError) || sessionError.status !== 401) throw sessionError;
        navigate("/login", {
          replace: true,
          state: { email: email.trim().toLowerCase(), notice: t("Email berhasil diverifikasi. Silakan masuk.", "Your email is verified. Sign in to continue.") },
        });
      }
    } catch (caught) {
      setError(requestError(caught, t));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!email.trim() || resendIn > 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await authPost("email-otp/send-verification-otp", {
        email: email.trim().toLowerCase(),
        type: "email-verification",
      });
      setNotice(t("Jika akun ini belum terverifikasi, kode baru akan dikirim. Periksa juga folder Spam.", "If this account is not verified, a new code will be sent. Check your Spam folder too."));
      setResendIn(45);
    } catch (caught) {
      setError(requestError(caught, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFlowFrame
      title={t("Verifikasi email", "Verify your email")}
      description={t("Masukkan kode sekali pakai yang dikirim ke alamat emailmu.", "Enter the one-time code sent to your email address.")}
      icon={<MailCheck size={54} strokeWidth={1.65} />}
      backTo="/login"
    >
      <Availability props={props} />
      <div className="auth-flow-card-plain">
        <form className="auth-form" onSubmit={verify}>
          <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
          {email ? <p className="auth-flow-masked-email">{t("Kode untuk", "Code for")} <strong>{maskEmail(email.trim())}</strong></p> : null}
          <TextField label={t("Kode verifikasi", "Verification code")} autoComplete="one-time-code" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 12))} minLength={4} maxLength={12} pattern="[0-9]{4,12}" required />
          {error ? <p className="auth-form-error" role="alert">{error}</p> : null}
          {notice ? <p className="auth-form-success" role="status">{notice}</p> : null}
          <Button type="submit" loading={busy} disabled={props.loading || props.unavailable || !props.authAvailable} className="auth-submit">{t("Verifikasi email", "Verify email")}<ArrowRight size={18} /></Button>
        </form>
        <div className="auth-flow-actions">
          <Button type="button" variant="secondary" disabled={busy || resendIn > 0 || !email.trim()} onClick={() => void resend()}>
            <RefreshCw size={17} />{resendIn > 0 ? t(`Kirim ulang (${resendIn} dtk)`, `Resend (${resendIn}s)`) : t("Kirim ulang kode", "Resend code")}
          </Button>
          <Link to="/register" state={{ email: email.trim() }}>{t("Ubah email", "Change email")}</Link>
        </div>
      </div>
      <p className="auth-flow-help">{t("Kode kedaluwarsa atau tidak cocok? Minta kode baru. Jangan bagikan kode ini kepada siapa pun.", "Expired or incorrect code? Request a new one. Never share this code with anyone.")}</p>
    </AuthFlowFrame>
  );
}

export function ForgotPasswordPage(props: AuthFlowProps) {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await authPost("forget-password/email-otp", { email: normalizedEmail });
      navigate("/reset-password", {
        replace: true,
        state: {
          email: normalizedEmail,
          notice: t("Jika akun cocok dengan alamat ini, kode pemulihan akan dikirim.", "If an account matches this address, a recovery code will be sent."),
        },
      });
    } catch (caught) {
      setNotice(t("Jika akun cocok dengan alamat ini, kode pemulihan akan dikirim.", "If an account matches this address, a recovery code will be sent."));
      if (caught instanceof ApiClientError && [429, 503].includes(caught.status)) setError(requestError(caught, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFlowFrame
      title={t("Lupa kata sandi?", "Forgot password?")}
      description={t("Masukkan email akunmu. Kami akan mengirim kode pemulihan jika alamat tersebut terdaftar.", "Enter your account email. We’ll send a recovery code if the address is registered.")}
      icon={<KeyRound size={54} strokeWidth={1.65} />}
      backTo="/login"
    >
      <Availability props={props} />
      <form className="auth-form auth-flow-card-plain" onSubmit={submit}>
        <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
        {error ? <p className="auth-form-error" role="alert">{error}</p> : null}
        {notice ? <p className="auth-flow-help" role="status">{notice}</p> : null}
        <Button type="submit" loading={busy} disabled={props.loading || props.unavailable || !props.authAvailable} className="auth-submit">{t("Kirim kode pemulihan", "Send recovery code")}</Button>
      </form>
      <p className="auth-switch"><Link to="/login">{t("Kembali ke Masuk", "Back to sign in")}</Link></p>
    </AuthFlowFrame>
  );
}

export function ResetPasswordPage(props: AuthFlowProps) {
  const { t } = usePreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const state = location.state as { email?: string; notice?: string } | null;
  const [email, setEmail] = useState(state?.email ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!codeVerified) {
      setBusy(true);
      try {
        await authPost("email-otp/check-verification-otp", {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          type: "forget-password",
        });
        setCodeVerified(true);
      } catch (caught) {
        setError(requestError(caught, t));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (password !== confirmPassword) {
      setError(t("Konfirmasi kata sandi belum cocok.", "The password confirmation does not match."));
      return;
    }
    setBusy(true);
    try {
      await authPost("email-otp/passcode", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      });
      try {
        await apiData("/api/v1/session", privateSessionSchema);
        await queryClient.invalidateQueries();
        navigate("/app", { replace: true });
        return;
      } catch (sessionError) {
        if (!(sessionError instanceof ApiClientError) || sessionError.status !== 401) throw sessionError;
      }
      navigate("/login", {
        replace: true,
        state: { email: email.trim().toLowerCase(), notice: t("Kata sandi berhasil diperbarui. Masuk kembali untuk melanjutkan.", "Your password has been updated. Sign in again to continue.") },
      });
    } catch (caught) {
      setError(requestError(caught, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFlowFrame
      title={t("Buat kata sandi baru", "Create a new password")}
      description={codeVerified
        ? t("Pilih kata sandi baru untuk mengamankan akunmu.", "Choose a new password to secure your account.")
        : t("Masukkan kode pemulihan yang dikirim ke email akunmu.", "Enter the recovery code sent to your account email.")}
      icon={<LockKeyhole size={54} strokeWidth={1.65} />}
      backTo="/forgot-password"
    >
      <Availability props={props} />
      {state?.notice ? <p className="auth-flow-help" role="status">{state.notice}</p> : null}
      <form className="auth-form auth-flow-card" onSubmit={submit}>
        {!codeVerified ? <>
          <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
          <TextField label={t("Kode pemulihan", "Recovery code")} autoComplete="one-time-code" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 12))} minLength={4} maxLength={12} pattern="[0-9]{4,12}" required />
        </> : <>
          <TextField label={t("Kata sandi baru", "New password")} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required />
          <TextField label={t("Konfirmasi kata sandi baru", "Confirm new password")} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} maxLength={128} required />
        </>}
        {error ? <p className="auth-form-error" role="alert">{error}</p> : null}
        <Button type="submit" loading={busy} disabled={props.loading || props.unavailable || !props.authAvailable} className="auth-submit">{codeVerified ? t("Simpan kata sandi", "Save password") : t("Verifikasi kode", "Verify code")}</Button>
      </form>
      <p className="auth-switch"><Link to="/forgot-password">{t("Minta kode baru", "Request a new code")}</Link></p>
    </AuthFlowFrame>
  );
}

