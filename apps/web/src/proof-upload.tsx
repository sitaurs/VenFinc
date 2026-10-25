import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent } from "react";
import { Link } from "react-router";
import {
  Camera,
  Check,
  CircleAlert,
  CircleCheck,
  Clipboard,
  FileImage,
  FileUp,
  Image as ImageIcon,
  Info,
  LoaderCircle,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  apiErrorSchema,
  proofDeleteResultSchema,
  proofUploadCompletionSchema,
  proofUploadCreateSchema,
  proofUploadCreatedSchema,
} from "@venfinance/contracts";
import { Button, Card } from "@venfinance/ui";
import { ApiClientError, apiData } from "./api-client";
import { usePreferences } from "./preferences";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 12_000;
const MAX_IMAGE_PIXELS = 40_000_000;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_INPUT = "image/jpeg,image/png,image/webp";

type UploadIntent = ReturnType<typeof proofUploadCreatedSchema.parse>;
type UploadState = "queued" | "preparing" | "uploading" | "verifying" | "stored" | "failed" | "cancelling";
type UploadItem = {
  clientId: string;
  file: File;
  previewUrl: string;
  state: UploadState;
  progress: number;
  error?: string | undefined;
  sanitized: boolean;
  intent: UploadIntent | undefined;
  proofId: string | undefined;
};

function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  return crypto.subtle.digest("SHA-256", bytes).then((digest) =>
    [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join(""),
  );
}

function formatBytes(bytes: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024)) + " MB";
}

async function sanitizeProofImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(
      1,
      MAX_IMAGE_EDGE / bitmap.width,
      MAX_IMAGE_EDGE / bitmap.height,
      Math.sqrt(MAX_IMAGE_PIXELS / (bitmap.width * bitmap.height)),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(bitmap.width * scale));
    canvas.height = Math.max(1, Math.floor(bitmap.height * scale));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("IMAGE_CANVAS_UNAVAILABLE");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const toBlob = (type: string, quality: number) => new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, type, quality);
    });
    let output: Blob | null = null;
    let outputType = "image/webp";
    for (const quality of [0.92, 0.84, 0.76]) {
      output = await toBlob(outputType, quality);
      if (output && output.type === outputType && output.size <= MAX_FILE_BYTES) break;
    }
    if (!output || output.type !== outputType || output.size > MAX_FILE_BYTES) {
      outputType = "image/jpeg";
      output = null;
      for (const quality of [0.86, 0.76]) {
        output = await toBlob(outputType, quality);
        if (output && output.type === outputType && output.size <= MAX_FILE_BYTES) break;
      }
    }
    if (!output || output.type !== outputType || output.size <= 0 || output.size > MAX_FILE_BYTES) {
      throw new Error("IMAGE_ENCODING_FAILED");
    }
    const safeName = file.name.replace(/\.[^.]+$/, "") || "bukti";
    return new File([output], `${safeName}${outputType === "image/webp" ? ".webp" : ".jpg"}`, {
      type: outputType,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

function publicUploadError(error: unknown, t: (id: string, en: string) => string): string {
  if (error instanceof ApiClientError) {
    if (error.publicMessage) return error.publicMessage;
    if (error.status === 413) return t("Ukuran file melewati batas 5 MB.", "The file is larger than the 5 MB limit.");
    if (error.status === 401) return t("Sesi berakhir. Masuk kembali untuk mengirim bukti.", "Your session expired. Sign in again to upload proof.");
    if (error.status >= 500) return t("Penyimpanan belum tersedia. File tetap ada di halaman ini.", "Storage is unavailable. The file is still on this page.");
  }
  if (error instanceof Error && error.message === "IMAGE_ENCODING_FAILED") {
    return t("Gambar tidak dapat diproses aman di perangkat ini. Coba file lain.", "This image could not be safely processed on this device. Try another file.");
  }
  if (error instanceof Error && error.message === "IMAGE_CANVAS_UNAVAILABLE") {
    return t("Pemrosesan gambar aman tidak tersedia di browser ini.", "Safe image processing is unavailable in this browser.");
  }
  if (!navigator.onLine) return t("Koneksi terputus. File tetap ada di halaman ini; coba lagi saat online.", "You are offline. The file stays on this page; retry when online.");
  return t("Bukti belum terkirim. File tetap ada di halaman ini; coba lagi atau catat manual.", "The proof was not uploaded. The file stays on this page; retry or record it manually.");
}

function xhrUpload(file: File, intent: UploadIntent, onProgress: (progress: number) => void): { xhr: XMLHttpRequest; result: Promise<void> } {
  const xhr = new XMLHttpRequest();
  const result = new Promise<void>((resolve, reject) => {
    xhr.open("PUT", intent.uploadPath);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("X-Proof-Upload-Token", intent.uploadToken);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      let body: unknown;
      try { body = JSON.parse(xhr.responseText) as unknown; } catch { body = null; }
      const parsed = apiErrorSchema.safeParse(body);
      reject(new ApiClientError(xhr.status, parsed.success ? parsed.data.error.code : "UPLOAD_FAILED", parsed.success ? parsed.data.error.message : undefined));
    };
    xhr.onerror = () => reject(new Error("UPLOAD_NETWORK_ERROR"));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    xhr.send(file);
  });
  return { xhr, result };
}

export function ProofUploadPage({ available }: { available: boolean }) {
  const { t, locale } = usePreferences();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [storeConsent, setStoreConsent] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pasteArea = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<UploadItem[]>([]);
  const activeXhrs = useRef(new Map<string, XMLHttpRequest>());
  const cancellationRequests = useRef(new Set<string>());

  function commitItems(nextItems: UploadItem[]) {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }

  function updateItem(clientId: string, patch: Partial<UploadItem>) {
    const nextItems = itemsRef.current.map((item) => item.clientId === clientId ? { ...item, ...patch } : item);
    commitItems(nextItems);
  }

  function removeLocalItem(clientId: string) {
    const item = itemsRef.current.find((candidate) => candidate.clientId === clientId);
    if (item) URL.revokeObjectURL(item.previewUrl);
    commitItems(itemsRef.current.filter((candidate) => candidate.clientId !== clientId));
  }

  useEffect(() => () => {
    for (const xhr of activeXhrs.current.values()) xhr.abort();
    for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl);
    activeXhrs.current.clear();
  }, []);

  function addFiles(files: FileList | File[]) {
    const accepted: UploadItem[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.has(file.type)) {
        rejected.push(t(`${file.name}: format harus JPG, PNG, atau WebP.`, `${file.name}: choose a JPG, PNG, or WebP image.`));
        continue;
      }
      if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
        rejected.push(t(`${file.name}: ukuran harus di bawah 5 MB.`, `${file.name}: the file must be under 5 MB.`));
        continue;
      }
      accepted.push({
        clientId: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        state: "queued",
        progress: 0,
        sanitized: false,
        intent: undefined,
        proofId: undefined,
      });
    }
    if (accepted.length) commitItems([...itemsRef.current, ...accepted]);
    setNotice(rejected.join(" "));
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files) addFiles(event.currentTarget.files);
    event.currentTarget.value = "";
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const files = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
    if (files.length) {
      event.preventDefault();
      addFiles(files);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  async function finishCancellation(item: UploadItem) {
    const proofId = item.proofId ?? item.intent?.id;
    try {
      if (proofId) {
        await apiData(`/api/v1/proofs/${proofId}`, proofDeleteResultSchema, { method: "DELETE" });
      }
      cancellationRequests.current.delete(item.clientId);
      removeLocalItem(item.clientId);
    } catch (error) {
      cancellationRequests.current.delete(item.clientId);
      updateItem(item.clientId, { state: "failed", error: publicUploadError(error, t) });
    }
  }

  function cancelItem(item: UploadItem) {
    const hasActiveRequest = ["preparing", "uploading", "verifying", "cancelling"].includes(item.state);
    if (!hasActiveRequest && !item.intent && !item.proofId) {
      removeLocalItem(item.clientId);
      return;
    }
    cancellationRequests.current.add(item.clientId);
    updateItem(item.clientId, { state: "cancelling", error: undefined });
    const xhr = activeXhrs.current.get(item.clientId);
    if (xhr) xhr.abort();
    else if (!hasActiveRequest) void finishCancellation(item);
  }

  async function uploadOne(clientId: string) {
    const item = itemsRef.current.find((candidate) => candidate.clientId === clientId);
    if (!item || item.state === "stored" || item.state === "uploading" || item.state === "verifying" || item.state === "preparing") return;
    if (!available) {
      updateItem(clientId, { state: "failed", error: t("Penyimpanan bukti belum diaktifkan.", "Proof storage is not enabled yet.") });
      return;
    }
    if (!storeConsent) {
      setNotice(t("Setujui penyimpanan privat sebelum mengirim bukti.", "Consent to private storage before uploading proof."));
      return;
    }

    try {
      updateItem(clientId, { state: "preparing", error: undefined });
      let intent = item.intent;
      if (!intent) {
        let uploadFile = item.file;
        if (!item.sanitized) {
          uploadFile = await sanitizeProofImage(item.file);
          if (cancellationRequests.current.has(clientId)) {
            await finishCancellation({ ...item, file: uploadFile });
            return;
          }
          const previewUrl = URL.createObjectURL(uploadFile);
          URL.revokeObjectURL(item.previewUrl);
          updateItem(clientId, { file: uploadFile, previewUrl, sanitized: true });
        }
        const sha256 = await sha256Hex(await uploadFile.arrayBuffer());
        const request = proofUploadCreateSchema.parse({
          contentType: uploadFile.type,
          sizeBytes: uploadFile.size,
          sha256,
          consentAccepted: storeConsent,
        });
        intent = await apiData("/api/v1/proofs/uploads", proofUploadCreatedSchema, {
          method: "POST",
          body: JSON.stringify(request),
        });
        updateItem(clientId, { intent });
      }
      if (cancellationRequests.current.has(clientId)) {
        await finishCancellation({ ...item, intent });
        return;
      }

      updateItem(clientId, { state: "uploading", progress: 0 });
      const uploadFile = itemsRef.current.find((candidate) => candidate.clientId === clientId)?.file ?? item.file;
      const pending = xhrUpload(uploadFile, intent, (progress) => updateItem(clientId, { progress }));
      activeXhrs.current.set(clientId, pending.xhr);
      await pending.result;
      activeXhrs.current.delete(clientId);
      if (cancellationRequests.current.has(clientId)) {
        await finishCancellation({ ...item, intent });
        return;
      }

      updateItem(clientId, { state: "verifying", progress: 100 });
      await apiData(`/api/v1/proofs/uploads/${intent.id}/complete`, proofUploadCompletionSchema, { method: "POST" });
      if (cancellationRequests.current.has(clientId)) {
        await finishCancellation({ ...item, intent });
        return;
      }
      updateItem(clientId, { state: "stored", progress: 100, proofId: intent.id, intent: undefined });
    } catch (error) {
      activeXhrs.current.delete(clientId);
      if (cancellationRequests.current.has(clientId)) {
        const latest = itemsRef.current.find((candidate) => candidate.clientId === clientId);
        if (latest) await finishCancellation(latest);
        return;
      }
      updateItem(clientId, { state: "failed", error: publicUploadError(error, t) });
    }
  }

  const storedCount = items.filter((item) => item.state === "stored").length;
  const pendingCount = items.filter((item) => item.state !== "stored").length;

  return (
    <section className="proof-upload-page" aria-label={t("Unggah dan proses bukti", "Upload and process proof")}>
      <header className="proof-upload-heading">
        <div>
          <span className="section-kicker">{t("PERLU DITINJAU", "REVIEW")}</span>
          <h1>{t("Unggah & proses bukti", "Upload & process proof")}</h1>
          <p>{t("Unggah struk, nota, atau bukti pembayaran. Bukti tidak pernah langsung menjadi transaksi.", "Upload a receipt, invoice, or payment proof. A proof never becomes a transaction automatically.")}</p>
        </div>
        <Button asChild><Link to="/app/transactions/new"><Upload size={17} />{t("Catat transaksi", "Record transaction")}</Link></Button>
      </header>

      {!available ? (
        <div className="proof-upload-gate" role="status">
          <CircleAlert size={20} />
          <div>
            <strong>{t("Penyimpanan bukti belum aktif", "Proof storage is not active")}</strong>
            <p>{t("Bukti tidak akan dikirim atau disimpan sampai retensi dan penghapusan otomatis diverifikasi. Kamu tetap bisa mencatat transaksi secara manual.", "Proof will not be sent or stored until retention and automatic deletion are verified. You can still record transactions manually.")}</p>
          </div>
        </div>
      ) : null}

      <div className="proof-upload-layout">
        <div className="proof-upload-main-column">
          <Card className="proof-upload-picker-card">
            <div
              ref={pasteArea}
              className={`proof-upload-dropzone${dragging ? " is-dragging" : ""}`}
              role="group"
              tabIndex={0}
              aria-label={t("Area untuk memilih, menyeret, atau menempelkan bukti", "Area to choose, drop, or paste proof")}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
              onDrop={handleDrop}
              onPaste={handlePaste}
            >
              <span className="proof-upload-drop-icon"><Camera size={26} /></span>
              <strong>{t("Tambahkan bukti", "Add proof")}</strong>
              <span>{t("Seret file ke sini, atau pilih metode di bawah.", "Drop a file here, or choose an option below.")}</span>
              <small>{t("Maks. 5 MB · JPG, PNG, WebP", "Max 5 MB · JPG, PNG, WebP")}</small>
              <div className="proof-upload-methods">
                <Button variant="secondary" onClick={() => cameraInput.current?.click()}><Camera size={20} />{t("Kamera", "Camera")}</Button>
                <Button variant="secondary" onClick={() => fileInput.current?.click()}><ImageIcon size={20} />{t("Pilih file", "Choose file")}</Button>
                <div className="proof-paste-hint"><Clipboard size={20} /><strong>{t("Tempel", "Paste")}</strong><span>{t("jika didukung", "if supported")}</span></div>
              </div>
              <input ref={cameraInput} className="sr-only" type="file" accept={ALLOWED_INPUT} capture="environment" onChange={handleInput} aria-label={t("Ambil foto bukti", "Take a proof photo")} />
              <input ref={fileInput} className="sr-only" type="file" accept={ALLOWED_INPUT} multiple onChange={handleInput} aria-label={t("Pilih file bukti", "Choose proof files")} />
            </div>
          </Card>

          {notice ? <p className="proof-upload-notice" role="alert"><CircleAlert size={17} />{notice}</p> : null}

          <Card className="proof-upload-queue-card">
            <div className="proof-queue-heading">
              <h2>{t("Antrean upload", "Upload queue")} ({pendingCount})</h2>
              {items.length > 1 ? <Button variant="ghost" size="small" onClick={() => {
                for (const item of itemsRef.current) cancelItem(item);
              }}>{t("Hapus semua", "Clear all")}</Button> : null}
            </div>
            {items.length ? (
              <ul className="proof-upload-list">
                {items.map((item) => {
                  const busy = ["preparing", "uploading", "verifying", "cancelling"].includes(item.state);
                  const status = item.state === "queued" ? t("Menunggu dikirim", "Waiting to upload")
                    : item.state === "preparing" ? t("Menyiapkan file…", "Preparing file…")
                      : item.state === "uploading" ? t("Sedang dikirim…", "Uploading…")
                        : item.state === "verifying" ? t("Memeriksa isi bukti…", "Verifying proof…")
                          : item.state === "cancelling" ? t("Membatalkan upload…", "Cancelling upload…")
                            : item.state === "stored" ? t("Tersimpan privat · belum dianalisis", "Privately stored · not analyzed")
                              : t("Belum terkirim", "Not uploaded");
                  return (
                    <li className="proof-upload-item" key={item.clientId}>
                      <img src={item.previewUrl} alt="" />
                      <div className="proof-upload-item-info">
                        <strong title={item.file.name}>{item.file.name}</strong>
                        <span>{formatBytes(item.file.size, locale)} · {item.file.type.replace("image/", "").toUpperCase()}</span>
                        {item.state === "uploading" ? <progress value={item.progress} max={100} aria-label={t("Progres upload", "Upload progress")} /> : null}
                        <span className={`proof-upload-status proof-upload-status-${item.state}`} role={item.state === "failed" ? "alert" : undefined}>
                          {item.state === "stored" ? <CircleCheck size={15} /> : busy ? <LoaderCircle className="spin" size={15} /> : item.state === "failed" ? <CircleAlert size={15} /> : null}
                          {item.error ?? status}
                        </span>
                      </div>
                      <div className="proof-upload-item-actions">
                        {item.state === "stored" ? <Button variant="ghost" size="icon" aria-label={t("Hapus bukti", "Delete proof")} onClick={() => cancelItem(item)}><Trash2 size={18} /></Button>
                          : busy ? <Button variant="ghost" size="icon" aria-label={t("Batalkan upload", "Cancel upload")} onClick={() => cancelItem(item)}><X size={18} /></Button>
                            : <Button variant={item.state === "failed" ? "secondary" : "ghost"} size={item.state === "failed" ? "small" : "icon"} aria-label={item.state === "failed" ? undefined : t("Hapus dari antrean", "Remove from queue")} onClick={() => item.state === "failed" ? void uploadOne(item.clientId) : cancelItem(item)}>
                              {item.state === "failed" ? <>{t("Coba lagi", "Retry")}<Upload size={15} /></> : <X size={18} />}
                            </Button>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="proof-queue-empty"><FileImage size={25} /><strong>{t("Belum ada bukti di antrean.", "No proofs in the queue yet.")}</strong><span>{t("Bukti yang dipilih akan muncul di sini untuk ditinjau.", "Selected proofs appear here for review.")}</span></div>
            )}
            {items.some((item) => item.state === "queued" || item.state === "failed") ? (
              <div className="proof-upload-submit-row">
                {!storeConsent ? <span>{t("Setujui penyimpanan privat untuk mengirim.", "Consent to private storage before uploading.")}</span> : null}
                <Button disabled={!available || !storeConsent} onClick={() => {
                  const next = itemsRef.current.find((item) => item.state === "queued" || item.state === "failed");
                  if (next) void uploadOne(next.clientId);
                }}><Upload size={17} />{t("Kirim bukti berikutnya", "Upload next proof")}</Button>
              </div>
            ) : null}
            {storedCount > 0 ? <p className="proof-upload-caution"><Info size={16} />{t("Bukti tersimpan, tetapi OCR/AI belum aktif. Tidak ada gambar yang dikirim ke provider eksternal dan belum ada transaksi dibuat.", "Proof is stored, but OCR/AI is not active. No image was sent to an external provider and no transaction was created.")}</p> : null}
          </Card>
        </div>

        <aside className="proof-upload-side-column">
          <Card className="proof-upload-consent-card">
            <span className="proof-info-icon"><Info size={24} /></span>
            <div>
              <h2>{t("Izin penyimpanan bukti", "Proof storage consent")}</h2>
              <p>{t("Bukti disimpan secara privat dan hanya dapat dibuka dari akunmu. Nama file tidak dikirim ke server.", "Proof is stored privately and can only be opened from your account. The filename is not sent to the server.")}</p>
            </div>
            <label className="proof-consent-check">
              <input type="checkbox" checked={storeConsent} onChange={(event) => setStoreConsent(event.currentTarget.checked)} />
              <span><Check size={14} aria-hidden="true" /></span>
              {t("Saya setuju menyimpan bukti ini di akun saya.", "I agree to store this proof in my account.")}
            </label>
          </Card>

          <Card className="proof-upload-processing-card">
            <h2>{t("Data yang dibutuhkan", "Information to review")}</h2>
            <ul>
              <li><span><FileImage size={19} /></span><div><strong>{t("Tanggal transaksi", "Transaction date")}</strong><small>{t("Tinjau pada formulir manual", "Review in the manual form")}</small></div></li>
              <li><span><ImageIcon size={19} /></span><div><strong>{t("Nama merchant", "Merchant name")}</strong><small>{t("Isi jika terlihat pada bukti", "Enter it if visible on the proof")}</small></div></li>
              <li><span><Upload size={19} /></span><div><strong>{t("Kategori & dompet", "Category & wallet")}</strong><small>{t("Pilih sendiri sebelum mencatat", "Choose before recording")}</small></div></li>
              <li><span><CircleCheck size={19} /></span><div><strong>{t("Jumlah transaksi", "Transaction amount")}</strong><small>{t("Konfirmasi nominal secara manual", "Confirm the amount manually")}</small></div></li>
            </ul>
          </Card>

          <Card className="proof-upload-manual-card">
            <span><FileUp size={22} /></span>
            <div><h2>{t("Alternatif manual", "Manual alternative")}</h2><p>{t("Masukkan detail transaksi sendiri. Bukti tidak akan otomatis mengubah saldo.", "Enter the transaction details yourself. A proof will never change your balance automatically.")}</p></div>
            <Button asChild variant="secondary"><Link to="/app/transactions/new">{t("Tambah manual", "Add manually")}<Upload size={16} /></Link></Button>
          </Card>
        </aside>
      </div>
    </section>
  );
}
