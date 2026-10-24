import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, CloudOff, KeyRound, LockKeyhole, Trash2 } from "lucide-react";
import {
  categorySchema,
  financePostResultSchema,
  financePostSchema,
  profileReadResultSchema,
  userProfileSchema,
  walletSchema,
  type UserProfile,
  type Wallet,
} from "@venfinance/contracts";
import { formatIdr, parseIdrInput } from "@venfinance/domain";
import { Button, Card, TextField } from "@venfinance/ui";
import { ApiClientError, apiData } from "./api-client";
import { usePreferences } from "./preferences";
import {
  deleteLocalDraft,
  deleteOfflineVaultData,
  getOfflineUnlockOwner,
  getOfflineVaultStatus,
  initializeOfflineVault,
  isOfflineVaultUnlocked,
  listLocalDrafts,
  lockOfflineVault,
  markLocalDraftSynced,
  readOfflineSnapshot,
  recoverInterruptedDrafts,
  saveLocalDraft,
  saveOfflineSnapshot,
  setLocalDraftStatus,
  setOfflineOwner,
  unlockOfflineVault,
  type LocalFinanceDraft,
  type OfflineVaultStatus,
} from "./offline-store";

const walletListSchema = walletSchema.array();
const categoryListSchema = categorySchema.array();

export function OfflineUnlockPage() {
  const { t } = usePreferences();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let active = true;
    void getOfflineUnlockOwner().then((owner) => {
      if (!active) return;
      if (owner) {
        setOfflineOwner(owner);
        setOwnerId(owner);
      }
      setChecking(false);
    }).catch(() => setChecking(false));
    return () => {
      active = false;
      lockOfflineVault();
    };
  }, []);
  if (checking) return <main className="offline-public" role="status">{t("Memeriksa perangkat…", "Checking this device…")}</main>;
  if (!ownerId) {
    return <main className="offline-public" id="main-content"><Card className="offline-panel"><CloudOff size={24} /><h1>{t("Belum ada ruang offline", "No offline vault on this device")}</h1><p>{t("Masuk saat online, buka menu Draf offline, lalu buat frasa sandi perangkat. Draf offline hanya tersedia pada perangkat ini.", "Sign in while online, open Offline drafts, then create a device passphrase. Offline drafts stay on this device.")}</p><Button asChild><Link to="/login">{t("Masuk", "Sign in")}</Link></Button></Card></main>;
  }
  return <OfflineVaultPage ownerId={ownerId} allowSetup={false} />;
}

export function OfflineVaultPage({ ownerId, allowSetup }: { ownerId: string; allowSetup: boolean }) {
  const { t, locale } = usePreferences();
  const queryClient = useQueryClient();
  const [vaultStatus, setVaultStatus] = useState<OfflineVaultStatus>("locked");
  const [drafts, setDrafts] = useState<LocalFinanceDraft[]>([]);
  const [localWallets, setLocalWallets] = useState<Wallet[] | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [localCategories, setLocalCategories] = useState<ReturnType<typeof categorySchema.parse>[]>([]);
  const [passphrase, setPassphrase] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [reviewDraftId, setReviewDraftId] = useState<string | null>(null);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const captureAttempted = useRef(false);

  async function refresh() {
    try {
      const status = await getOfflineVaultStatus(ownerId);
      setVaultStatus(status);
      if (status === "unlocked") {
        const [nextDrafts, walletSnapshot, profileSnapshot, categorySnapshot] = await Promise.all([
          listLocalDrafts(ownerId),
          readOfflineSnapshot<unknown>(ownerId, "wallets"),
          readOfflineSnapshot<unknown>(ownerId, "profile"),
          readOfflineSnapshot<unknown>(ownerId, "categories"),
        ]);
        setDrafts(nextDrafts);
        setLocalWallets(walletSnapshot ? walletListSchema.parse(walletSnapshot.value) : null);
        setLocalProfile(profileSnapshot ? userProfileSchema.parse(profileSnapshot.value) : null);
        setLocalCategories(categorySnapshot ? categoryListSchema.parse(categorySnapshot.value) : []);
      } else {
        setDrafts([]);
        setLocalWallets(null);
        setLocalProfile(null);
        setLocalCategories([]);
      }
    } catch {
      setVaultStatus("unsupported");
      setDrafts([]);
    }
  }

  useEffect(() => {
    setOfflineOwner(ownerId);
    void recoverInterruptedDrafts(ownerId).catch(() => undefined).finally(() => refresh());
    const stateChange = () => void refresh();
    const connectionChange = () => setOnline(navigator.onLine);
    window.addEventListener("venfinance:offline-vault-change", stateChange);
    window.addEventListener("online", connectionChange);
    window.addEventListener("offline", connectionChange);
    return () => {
      window.removeEventListener("venfinance:offline-vault-change", stateChange);
      window.removeEventListener("online", connectionChange);
      window.removeEventListener("offline", connectionChange);
    };
  }, [ownerId]);

  useEffect(() => {
    if (!allowSetup || vaultStatus !== "unlocked" || !online || captureAttempted.current) return;
    captureAttempted.current = true;
    void Promise.all([
      readOfflineSnapshot(ownerId, "wallets"),
      readOfflineSnapshot(ownerId, "categories"),
    ]).then(async ([wallets, categories]) => {
      if (!wallets) {
        const values = await apiData("/api/v1/wallets", walletListSchema);
        await saveOfflineSnapshot(ownerId, "wallets", values);
      }
      if (!categories) {
        const values = await apiData("/api/v1/categories", categoryListSchema);
        await saveOfflineSnapshot(ownerId, "categories", values);
      }
      if (!await readOfflineSnapshot(ownerId, "profile")) {
        const profile = await apiData("/api/v1/me", profileReadResultSchema);
        if (profile.profile) await saveOfflineSnapshot(ownerId, "profile", profile.profile);
      }
    }).catch(() => {
      setNotice(t("Kunci siap. Buka Beranda dan Dompet saat online agar pilihan dompet tersedia untuk pencatatan offline.", "The vault is ready. Visit Home and Wallets while online to make your wallet list available for offline entry."));
    });
  }, [allowSetup, online, ownerId, t, vaultStatus]);

  async function unlockOrCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      setOfflineOwner(ownerId);
      if (vaultStatus === "uninitialized") {
        if (passphrase !== confirmation) throw new Error("Kedua frasa sandi belum sama.");
        await initializeOfflineVault(ownerId, passphrase);
        setNotice(t("Kunci perangkat dibuat. Simpan frasa sandi ini di tempat aman; VenFinance tidak menyimpan atau memulihkannya.", "Device key created. Keep this passphrase safe; VenFinance does not store or recover it."));
      } else {
        await unlockOfflineVault(ownerId, passphrase);
      }
      setPassphrase("");
      setConfirmation("");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("Ruang offline belum dapat dibuka.", "The offline vault could not be opened."));
    } finally {
      setBusy(false);
    }
  }

  async function postReviewedDraft(draft: LocalFinanceDraft) {
    if (syncBusy || vaultStatus !== "unlocked" || !navigator.onLine || !isOfflineVaultUnlocked(ownerId) || draft.status !== "local_draft") return;
    setSyncBusy(true);
    setError(null);
    setNotice(null);
    try {
      await setLocalDraftStatus(ownerId, draft.id, "syncing");
      await refresh();
      const result = await apiData("/api/v1/transactions", financePostResultSchema, {
        method: "POST",
        headers: { "Idempotency-Key": draft.id },
        body: JSON.stringify(draft.command),
      });
      await markLocalDraftSynced(ownerId, draft.id, result.id);
      setReviewDraftId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["finance-wallets", ownerId] }),
        queryClient.invalidateQueries({ queryKey: ["finance-events", ownerId] }),
      ]);
      setNotice(t("Transaksi berhasil dicatat. Kunci pengiriman yang sama melindungi retry dari catatan ganda.", "Transaction posted. The stable submission key protects retries from creating duplicates."));
    } catch (cause) {
      if (cause instanceof ApiClientError && [400, 409, 422].includes(cause.status)) {
        await setLocalDraftStatus(ownerId, draft.id, "conflict");
        setError(t("Server menolak pencatatan ini. Draf tetap tersimpan dan memerlukan pemeriksaan; draf tidak akan dikirim ulang.", "The server rejected this posting. The draft is retained for review and will not be retried."));
      } else {
        await setLocalDraftStatus(ownerId, draft.id, "local_draft");
        if (cause instanceof ApiClientError && cause.status === 401) {
          setError(t("Sesi server tidak lagi aktif. Masuk kembali sebelum mencatat transaksi ini.", "The server session is no longer active. Sign in again before posting this transaction."));
        } else {
          setError(t("Koneksi terhenti. Draf tetap tersimpan; kamu dapat memeriksanya lalu mencoba kembali.", "The connection was interrupted. The draft is retained so you can review and try again."));
        }
      }
    } finally {
      await refresh();
      setSyncBusy(false);
    }
  }

  async function removeDraft(id: string) {
    if (!window.confirm(t("Hapus draf lokal ini? Tindakan ini tidak dapat dibatalkan.", "Delete this local draft? This cannot be undone."))) return;
    await deleteLocalDraft(ownerId, id);
    await refresh();
  }

  async function eraseVault() {
    if (!window.confirm(t("Hapus kunci, draf, dan snapshot terenkripsi untuk akun ini dari perangkat? Salinan server tidak berubah.", "Delete this account's encrypted key, drafts, and snapshots from this device? Server data will not change."))) return;
    await deleteOfflineVaultData(ownerId);
    setNotice(t("Data offline akun ini dihapus dari perangkat.", "This account's offline data was deleted from this device."));
    await refresh();
  }

  const pending = drafts.filter((draft) => draft.status !== "synced").length;
  const canCreate = allowSetup && vaultStatus === "uninitialized";
  const canUnlock = vaultStatus === "locked";
  const unlocked = vaultStatus === "unlocked";
  return (
    <main className={allowSetup ? "offline-private-page" : "offline-public"} id="main-content">
      <div className="offline-page-heading"><div><span className="section-kicker">{t("Penyimpanan lokal", "Local storage")}</span><h1>{t("Draf offline", "Offline drafts")}</h1><p>{t("Draf offline tidak mengubah saldo. Tinjau kembali dan tekan Catat transaksi untuk membuat catatan final.", "Offline drafts do not change balances. Review them and press Post transaction to create a final record.")}</p></div>{allowSetup ? <span className={`offline-connection ${online ? "online" : "offline"}`}>{online ? t("Online", "Online") : t("Offline", "Offline")}</span> : null}</div>
      {vaultStatus === "unsupported" ? <Card className="offline-panel" role="alert"><AlertCircle size={22} /><h2>{t("Penyimpanan aman tidak tersedia", "Secure local storage is unavailable")}</h2><p>{t("Peramban ini tidak menyediakan IndexedDB dan Web Crypto yang diperlukan. Catat kembali saat layanan online.", "This browser does not provide the IndexedDB and Web Crypto required here. Record transactions when the service is online.")}</p></Card> : null}
      {(canCreate || canUnlock) ? <Card className="offline-panel"><div className="offline-panel-heading"><KeyRound size={22} /><div><h2>{canCreate ? t("Buat kunci perangkat", "Create a device key") : t("Buka kunci draf", "Unlock drafts")}</h2><p>{canCreate ? t("Frasa sandi hanya memulihkan kunci pada perangkat ini. Buat yang unik dan simpan terpisah.", "The passphrase unlocks this device only. Choose a unique phrase and store it separately.") : t("Masukkan frasa sandi yang kamu buat pada perangkat ini.", "Enter the passphrase created on this device.")}</p></div></div><form className="offline-unlock-form" onSubmit={(event) => void unlockOrCreate(event)}><TextField label={t("Frasa sandi perangkat", "Device passphrase")} type="password" autoComplete="new-password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} minLength={12} maxLength={128} required /><p className="muted">{t("Minimal 12 karakter. Jangan gunakan kata sandi akun yang sama.", "At least 12 characters. Do not reuse your account password.")}</p>{canCreate ? <TextField label={t("Ulangi frasa sandi", "Confirm passphrase")} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={12} maxLength={128} required /> : null}{error ? <p role="alert" className="form-error">{error}</p> : null}<Button type="submit" loading={busy}><LockKeyhole size={17} />{canCreate ? t("Buat kunci", "Create key") : t("Buka draf", "Unlock drafts")}</Button></form></Card> : null}
      {unlocked ? <>
        <Card className="offline-summary"><CheckCircle2 size={21} /><div><strong>{t("Kunci perangkat terbuka", "Device key unlocked")}</strong><span>{t(`${pending} draf belum dicatat. Draf akan kedaluwarsa setelah 30 hari dan tidak pernah diposting otomatis.`, `${pending} drafts are not posted. Drafts expire after 30 days and are never posted automatically.`)}</span></div><Button variant="secondary" size="small" onClick={() => { lockOfflineVault(); void refresh(); }}><LockKeyhole size={16} />{t("Kunci", "Lock")}</Button></Card>
        {allowSetup && pending > 0 ? <p className="offline-stale-notice">{t("Setiap draf harus ditinjau dan dicatat satu per satu. Saldo belum berubah sampai kamu mengonfirmasi pencatatan.", "Review and post each draft individually. Balances stay unchanged until you confirm posting.")}</p> : null}
        {error ? <p role="alert" className="form-error">{error}</p> : null}
        {!allowSetup ? <OfflineDraftComposer ownerId={ownerId} profile={localProfile} wallets={localWallets} categories={localCategories} onSaved={() => void refresh()} /> : null}
        {drafts.length ? <div className="offline-draft-list" aria-label={t("Daftar draf offline", "Offline draft list")}>{drafts.map((draft) => <Card className="offline-draft-row" key={draft.id}><div className="offline-draft-mark"><CloudOff size={18} /></div><div className="offline-draft-main"><strong>{draft.command.kind === "income" ? t("Pemasukan", "Income") : draft.command.kind === "transfer" ? t("Transfer", "Transfer") : draft.command.kind === "opening" ? t("Saldo awal", "Opening balance") : t("Pengeluaran", "Expense")}</strong><span>{formatIdr(draft.command.amountMinor, locale)} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: draft.command.timezone }).format(new Date(draft.command.effectiveAt))}</span><span className={`offline-draft-status ${draft.status}`}>{draft.expired ? t("Kedaluwarsa — tinjau manual sebelum dicatat", "Expired — review manually before posting") : draft.status === "synced" ? t("Sudah dicatat · tersinkron", "Posted · synced") : draft.status === "syncing" ? t("Sedang mencatat", "Posting") : draft.status === "conflict" ? t("Perlu diperiksa — tidak dikirim ulang", "Needs review — not retried") : t("Tersimpan di perangkat · belum mengubah saldo", "Saved on device · balance unchanged")}</span>{draft.command.note ? <span>{draft.command.note}</span> : null}{allowSetup && draft.status === "local_draft" ? reviewDraftId === draft.id ? <div className="offline-review-confirm" role="group" aria-label={t("Konfirmasi pencatatan transaksi", "Confirm transaction posting")}><p>{t("Tindakan berikut akan membuat catatan POSTED dan mengubah saldo server. Periksa jenis, dompet, waktu, nominal, kategori, dan catatan di atas.", "The next action will create a POSTED event and change the server balance. Review the type, wallet, time, amount, category, and note above.")}</p><div><Button loading={syncBusy} disabled={!online} onClick={() => void postReviewedDraft(draft)}>{t("Catat transaksi", "Post transaction")}</Button><Button variant="ghost" disabled={syncBusy} onClick={() => setReviewDraftId(null)}>{t("Batal", "Cancel")}</Button></div></div> : <Button variant="secondary" size="small" disabled={!online} onClick={() => setReviewDraftId(draft.id)}>{t("Tinjau & catat", "Review & post")}</Button> : null}</div><Button variant="ghost" size="icon" aria-label={t("Hapus draf", "Delete draft")} disabled={syncBusy} onClick={() => void removeDraft(draft.id)}><Trash2 size={18} /></Button></Card>)}</div> : <Card className="offline-empty"><CloudOff size={23} /><strong>{t("Belum ada draf offline", "No offline drafts yet")}</strong><span>{allowSetup ? t("Buka Catat transaksi, lalu pilih Simpan draf offline saat perlu.", "Open Record transaction and choose Save offline draft when needed.") : t("Draf yang tersimpan di perangkat akan muncul di sini.", "Drafts saved on this device will appear here.")}</span></Card>}
        {allowSetup ? <div className="offline-danger-zone"><Button variant="secondary" onClick={() => void eraseVault()}><Trash2 size={16} />{t("Hapus semua data offline perangkat ini", "Delete this device's offline data")}</Button></div> : null}
      </> : null}
      {notice ? <p className="offline-notice" role="status">{notice}</p> : null}
      {!allowSetup ? <p className="offline-return"><Link to="/login">{t("Kembali ke masuk akun", "Return to sign in")}</Link></p> : null}
    </main>
  );
}

function localNow(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function localTimeToIso(value: string, timezone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Waktu transaksi tidak valid.");
  const target = match.slice(1).map(Number);
  const [year, month, day, hour, minute] = target as [number, number, number, number, number];
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  let candidate = desired;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = formatter.formatToParts(new Date(candidate));
    const valueOf = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const represented = Date.UTC(valueOf("year"), valueOf("month") - 1, valueOf("day"), valueOf("hour"), valueOf("minute"));
    const difference = desired - represented;
    candidate += difference;
    if (difference === 0) break;
  }
  const actual = formatter.formatToParts(new Date(candidate)).filter((part) => ["year", "month", "day", "hour", "minute"].includes(part.type)).map((part) => Number(part.value));
  if (actual.some((part, index) => part !== target[index])) throw new Error("Waktu ini tidak berlaku di zona waktu yang dipilih.");
  return new Date(candidate).toISOString();
}

function OfflineDraftComposer({ ownerId, profile, wallets, categories, onSaved }: {
  ownerId: string;
  profile: UserProfile | null;
  wallets: Wallet[] | null;
  categories: ReturnType<typeof categorySchema.parse>[];
  onSaved: () => void;
}) {
  const { t } = usePreferences();
  const activeWallets = wallets?.filter((wallet) => !wallet.archivedAt) ?? [];
  const [kind, setKind] = useState<"expense" | "income" | "transfer" | "opening">("expense");
  const [walletId, setWalletId] = useState("");
  const [destinationWalletId, setDestinationWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [effectiveAt, setEffectiveAt] = useState(() => localNow(profile?.timezone ?? "Asia/Jakarta"));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const draftKey = useRef<{ fingerprint: string; id: string } | null>(null);
  const selectedWalletId = activeWallets.find((wallet) => wallet.id === walletId)?.id ?? activeWallets[0]?.id ?? "";
  const selectedDestination = activeWallets.find((wallet) => wallet.id === destinationWalletId && wallet.id !== selectedWalletId)?.id ?? activeWallets.find((wallet) => wallet.id !== selectedWalletId)?.id ?? "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSavingDraft(true);
    try {
      if (!profile || !selectedWalletId) throw new Error("Data perangkat belum cukup untuk membuat draf offline.");
      const amountMinor = parseIdrInput(amount);
      const command = financePostSchema.parse({
        kind,
        walletId: selectedWalletId,
        ...(kind === "transfer" ? { destinationWalletId: selectedDestination } : {}),
        amountMinor,
        currency: "IDR",
        effectiveAt: localTimeToIso(effectiveAt, profile.timezone),
        timezone: profile.timezone,
        ...(kind === "expense" && categoryId ? { allocations: [{ categoryId, amountMinor }] } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
        allowNegative: false,
      });
      const fingerprint = JSON.stringify(command);
      if (!draftKey.current || draftKey.current.fingerprint !== fingerprint) {
        draftKey.current = { fingerprint, id: crypto.randomUUID() };
      }
      await saveLocalDraft(ownerId, draftKey.current.id, command);
      draftKey.current = null;
      setAmount("");
      setNote("");
      setNotice(t("Draf terenkripsi tersimpan di perangkat. Saldo tidak berubah dan server belum menerima catatan ini.", "Encrypted draft saved on this device. The balance is unchanged and the server has not received it."));
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("Draf offline belum dapat disimpan.", "The offline draft could not be saved."));
    } finally {
      setSavingDraft(false);
    }
  }

  return <Card className="offline-composer"><div className="offline-panel-heading"><CloudOff size={21} /><div><h2>{t("Catat saat offline", "Record while offline")}</h2><p>{t("Draf disimpan lokal sampai kamu masuk kembali untuk menyinkronkannya. Belum ada perubahan saldo.", "Drafts stay local until you sign in to sync them. Balances are unchanged.")}</p></div></div>{!profile || !activeWallets.length ? <p role="status" className="offline-stale-notice">{t("Belum ada snapshot dompet pada perangkat ini. Sambungkan online, siapkan Draf offline, lalu buka Dompet.", "No wallet snapshot is available on this device. Connect online, prepare Offline drafts, then visit Wallets.")}</p> : <form className="finance-form" onSubmit={(event) => void submit(event)}><label className="private-select-field"><span>{t("Jenis", "Type")}</span><select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="expense">{t("Pengeluaran", "Expense")}</option><option value="income">{t("Pemasukan", "Income")}</option><option value="transfer">{t("Transfer", "Transfer")}</option><option value="opening">{t("Saldo awal", "Opening balance")}</option></select></label><TextField label={t("Nominal rupiah", "Amount in rupiah")} value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" required /><label className="private-select-field"><span>{t("Dari/ke dompet", "From/to wallet")}</span><select value={selectedWalletId} onChange={(event) => setWalletId(event.target.value)}>{activeWallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}</select></label>{kind === "transfer" ? <label className="private-select-field"><span>{t("Ke dompet", "To wallet")}</span><select value={selectedDestination} onChange={(event) => setDestinationWalletId(event.target.value)}>{activeWallets.filter((wallet) => wallet.id !== selectedWalletId).map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}</select></label> : null}{kind === "expense" && categories.length ? <label className="private-select-field"><span>{t("Kategori (opsional)", "Category (optional)")}</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">{t("Tanpa kategori", "Uncategorized")}</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label> : null}<TextField label={t("Waktu transaksi", "Transaction time")} type="datetime-local" value={effectiveAt} onChange={(event) => setEffectiveAt(event.target.value)} required /><TextField label={t("Catatan (opsional)", "Note (optional)")} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />{error ? <p role="alert" className="form-error">{error}</p> : null}{notice ? <p role="status" className="offline-notice">{notice}</p> : null}<Button type="submit" loading={savingDraft}>{t("Simpan draf di perangkat", "Save draft on this device")}</Button></form>}</Card>;
}
