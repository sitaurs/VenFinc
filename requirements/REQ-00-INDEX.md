# Requirements — Index & Konvensi

**Sumber kebenaran:** [`../docs/prd/PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md). Turunan harus mempertahankan niat PRD. Tidak boleh mengubah keputusan produk lewat tugas coding.

## Kelompok requirement

| Dokumen | ID sumber | Ruang lingkup |
|---|---|---|
| [REQ-01-PRODUCT-IAM.md](./REQ-01-PRODUCT-IAM.md) | `PROD-001…007`; `IAM-001…013` | Produk, signup, role, akun |
| [REQ-02-FINANCE.md](./REQ-02-FINANCE.md) | `FIN-001…035` | Ledger, dompet, budget, target, utang, analitik |
| [REQ-03-PWA-INPUT.md](./REQ-03-PWA-INPUT.md) | `UX-001…018` | UI, onboarding, input, offline, i18n, impor/ekspor |
| [REQ-04-WHATSAPP.md](./REQ-04-WHATSAPP.md) | `WA-001…020` | Bot bersama, personal sessions, session controls |
| [REQ-05-AI.md](./REQ-05-AI.md) | `AI-001…020` | Vision/OCR, review, konflik, verifikasi ulang |
| [REQ-06-OPERATIONS.md](./REQ-06-OPERATIONS.md) | `OPS-001…020` | Admin/Superuser, support, monitoring, flags |
| [REQ-07-TRUST.md](./REQ-07-TRUST.md) | `TRUST-001…020` | Privasi, consent, hak data, security |
| [REQ-08-QUALITY.md](./REQ-08-QUALITY.md) | `QUAL-001…024` | NFR & release criteria |
| [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md) | cross-cutting | Gherkin end-to-end kritis |
| [REQ-10-TRACEABILITY.md](./REQ-10-TRACEABILITY.md) | seluruh `PRD-ID` | Matriks 177 requirement + 14 keputusan (191 total) → dokumen/spec/phase |

### Format wajib

- **US-[PRD-ID]**: `Sebagai [aktor], saya ingin [kemampuan], agar [hasil]`.
- **AC-[PRD-ID]-A/B**: persyaratan lulus/gagal dari sudut pandang pengamat, bukan nama class/fungsi.
- **GIVEN/WHEN/THEN**: konteks jelas, pemicu, hasil yang teramati; jangan mengacu ke database, UI framework, atau endpoint di bagian ini.
- **NFR `QUAL-*`**: non-fungsional memakai pernyataan NFR + AC-A/AC-B yang terukur, bukan narasi user story; parameter uji, sampel, ambang, dan hasil yang dinilai wajib tersedia.
- **DEC-*` bukan functional requirement**: dipetakan ke [`../research/DECISION-LOG.md`](../research/DECISION-LOG.md), tidak dipaksakan menjadi user story.

### Aturan pengujian bersama

1. Akun A dan akun B menjalankan semua kasus dasar; tidak pernah dapat saling mengakses catatan privat.
2. Semua transaksi diuji ulang dengan *duplicate submission*, permintaan out-of-order, offline, dan pemulihan dari error.
3. Bedakan **saved locally**, **pending**, **server confirmed**, **provisional**, **posted**, dan **void**; nilai-nilai ini tidak boleh dianggap setara.
4. Uji nominal Rp1, Rp8.000, Rp10.000, Rp100.000, 0, nilai negatif, integer sangat besar, dan 28/29/30/31 hari.
5. UI tidak menolak transaksi QRIS nyata/bank: limit VenFinance hanyalah pengingat virtual.
6. Tidak ada *acceptance* “cukup terlihat benar”; harus bisa dibuktikan dengan interaksi, assertion, atau laporan hasil tes yang dapat direproduksi.
