# DESIGN-05 — UX Writing, Accessibility, Content & Localization

## 1. Content principles

- Bahasa Indonesia **default**, English opt-in. Tone professional, concise, clear, not formal stiff or jokey in financial data. No shame/punishment language for overspending.
- Distinguish **Saldo tercatat** (virtual), **Sisa anggaran** (plan minus confirmed), **Estimasi** (forecast), **Perlu ditinjau** (AI/OCR unverified), **Tersimpan di perangkat** (offline), **Tersimpan di akun** (server).
- Never claim bank integration, actual money transfer, QRIS blocking, automatic email bank notifications, official WhatsApp API, or guaranteed zero fees.
- Terms/privacy/changelog not generated as legally binding text from screenshots. They require actual reviewed content with version/date and acceptance gating.

## 2. Error & status copy samples

| Code / condition | ID copy | Next action |
|---|---|---|
| `LOCAL_DRAFT` | "Tersimpan di perangkat. Akan dikirim saat internet kembali." | Lihat antrean / hapus draft |
| `SYNC_CONFLICT` | "Ada perubahan berbeda pada catatan ini di perangkat lain." | Bandingkan versi |
| `UPLOAD_FAILED` | "Foto belum berhasil diunggah. Catatanmu masih aman." | Coba lagi / input manual |
| `AI_UNAVAILABLE` | "Pembacaan AI sedang terganggu. Kamu bisa periksa hasil OCR atau isi sendiri." | Tinjau / input manual |
| `AI_AMOUNT_CONFLICT` | "Nominal hasil bacaan berbeda. Pilih angka sesuai bukti." | Bandingkan dan konfirmasi |
| `WA_NOT_CONNECTED` | "WhatsApp belum tersambung. Catatan manual tetap bisa digunakan." | Lihat status / tautkan ulang |
| `WA_CODE_EXPIRED` | "Kode tautan sudah kedaluwarsa." | Buat kode baru |
| `BUDGET_EXCEEDED` | "Jatah Jajan terlampaui Rp1.000. Catatan tetap bisa disimpan." | Lihat anggaran |
| `QUOTA_EXCEEDED` | "Jatah pemrosesan bukti hari ini habis. Pencatatan manual tetap tersedia." | Kembali ke Catat |
| `FORBIDDEN` | "Halaman ini tidak tersedia untuk akunmu." | Kembali |
| `ACCOUNT_DELETE_PENDING` | "Permintaan hapus akun sedang diproses. Periksa perkembangannya." | Lihat progres |

Translate to English through curated locale dictionaries, not machine-translation at runtime. Escape untrusted merchant/notes, never render AI markdown/html unsanitized.

## 3. Accessibility acceptance

- Aim WCAG 2.2 AA: all actionable controls keyboard accessible, visible 2px focus, modal focus trap+return, screen reader name/role/value, form error described with `aria-describedby`, skip links, correct heading hierarchy.
- WCAG 2.2 AA target minimum 24×24 CSS px (or exceptions); VenFinance design **prefers 44×44** for mobile taps.
- Contrasts: normal text >=4.5:1, large text >=3:1, important UI components/nontext >=3:1 where applicable. Verify rendered theme, not just tokens.
- Charts include readable numeric totals and optional data table; progress bars have text labels for current/limit/remaining; day calendar state has legend and accessible names.
- Announce transaction saved locally vs server and AI status via polite live regions; destructive errors via appropriate alert. No rapidly flashing toasts.
- Handle zoom 200%, viewport small, keyboard open, screen reader focus order, reduced motion, offline/install differences. Critical flows don't require precise drag or hover.
- Privacy mask visually hides money **and** adjusts accessibility label if user wants amounts concealed; no amount retained in `title`/offscreen accessible text in mask mode.

## 4. Format localization & calendar

- IDR in id-ID: display `Rp1.200.000`, negative `−Rp10.000`, no cents; English may show `IDR 1,200,000` by preferred format; underlying JSON `"1200000"` and unchanged id/precision.
- Date labels based on user timezone; API includes `effectiveAt` with ISO offset, `localDate`/period. `23 Oktober 2026` vs `Oct 23, 2026`. No cross-midnight day confusion.
- Copy supports long English strings (no `text-overflow:ellipsis` on primary action labels or required consent), and Indonesian sentence wrapping.
- Prefer limited predefined icon labels; emojis optional in chat response but not sole color/meaning in UI.

## 5. Content governance & launch

- Page `PUB-06` privacy and `PUB-07` terms must have verified version, effective date, data categories, subprocessors, retention, contact and accessible download/copy.
- Status page `PUB-05` includes last update timestamps; old heartbeat shown stale, not all green.
- Admin editing public FAQ/incident/terms needs draft-review-publish flow and audit; never silently republish legal changes.
- In-app demo explicitly shows `Data contoh`; demo CTA creates real account only after separate signup. No export of synthetic demo as user's real report.
