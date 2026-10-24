# DESIGN-04 — Audit Desain Asli, Aset, Integritas & Koreksi

**Sumber yang benar-benar diperiksa:** empat ZIP pengguna pada 23 Oktober 2026, seluruh daftar file, `guides/design_tokens.json`, `Design_System.md`, `Flows_and_Handoff.md`, `Design_Plan.md`, `screen_inventory.json`, `qa/QA_Review.md`, dan contact sheets hasil gabungan screenshot mobile/web. Evaluasi di sini adalah **audit sumber raster**, bukan implementasi berjalan.

## 1. Inventaris terverifikasi

| Sumber | Isi | Status |
|---|---:|---|
| ZIP 01 Mobile | 90 PNG mobile | ditemukan |
| ZIP 02 Web A | 45 PNG web | ditemukan |
| ZIP 03 Web B | 45 PNG web | ditemukan |
| ZIP 04 Assets Galeri | 59 aset PNG, 90 preview dan panduan | ditemukan |
| Gabungan | **180 screenshot**, 90 pasang + 59 aset | cocok dengan README/manifest |
| Screen utama dalam `screen_inventory.json` | 78 | ditambah 6 FLOW + 4 STATE + 2 DARK untuk 90 total |

All source images are **raster** and aspect may differ from target actual browser; they are not pixel-perfect source code. Fonts/colors are derived from guide and visual not extracted design-layer properties; therefore component-level spacing is normative in this spec, not an exact Figma export.

## 2. Struktur aset yang digunakan

- `assets/brand/venfinance-app-icon.png`, `venfinance-mark-*`, `venfinance-wordmark-*` as shared identity across public/app/login/owner panels; no variants constructed by recreating icon.
- `assets/icons/navigation/` and `assets/icons/categories/` for distinct route/category symbols; optional icon library only when matching the design family.
- `assets/illustrations/` alpha-backed onboarding, savings, review, offline. Avoid use as decorative full-width giant cards when purpose is functional.
- `assets/backgrounds/*` may be used as backgrounds only; never bake in actual text or numbers.
- `assets/components/*` cropped examples (e.g. saldo/budget card) contain fixed text: must **not** be used as live UI. Use CSS+HTML for dynamic components.
- `assets/extracted/*` contains baked backgrounds; use only when visual purpose cannot be recreated as scalable illustration and readability remains good.
- Detailed file metadata already bundled: [`asset_manifest.json`](../reference-design/guides/asset_manifest.json), [`screen_manifest.json`](../reference-design/guides/screen_manifest.json), [`design_tokens.json`](../reference-design/guides/design_tokens.json).

## 3. Discrepancies / normalization found

| Finding | Source/evidence | Implementation rule |
|---|---|---|
| Desktop sidebar selected 'Ringkasan' on some deeper screens | `qa/QA_Review.md`, desktop references | active nav derives real router state, not raster |
| Some screenshot demo numbers/composition mix example and preview | mobile home, budget, review screenshots | all values computed from fixture/ledger; labels actual/estimate/provisional distinct |
| WhatsApp pairing mock code `DEMO-CODE`, demo phone masked | SET-06/07/STATE-03 | replace with real code on consented flow; never hardcode/demo in production |
| Operator dashboard sample service counts not fully self-consistent | SYS-01 / original QA | status cards derive backend health timestamps; never static healthy counters |
| SYS-06 pause copy could imply all notifications pause | original QA | pause only routine reminders; security notices independently governed |
| SYS-09 label 'transaksi' occasionally refers system activity | original QA | label 'Aktivitas sistem', keep finance ledger private |
| ADM-05 sample title vs reporter inconsistent | original QA | ticket title and reporter separate data fields, authoritative ticket metadata |
| Dark only two samples, full app needs dark variants | DARK-01/02 | derive all tokens, verify 90 routes/states in dark (not 2 dark-only URLs) |
| Long forms single raster viewport | README/Handoff | content scrolls; footer must not cover keyboard/safe-area |
| UI copy privacy/retention/quotas appears concrete in demo | public/privacy, SET-09, SYS-03 | release values from approved configuration/policy, not bitmap text |
| Auth mock Google social button present | AUTH-01 screenshot | hide or disable until OAuth configured and tested |
| Desktop and mobile differ in density & navigation | contact sheets | same source data and product behavior, adaptive layout only |

## 4. Reference extraction procedure for coding agent

1. Extract original 4 ZIP files to **one merged folder** `reference-design/full/VenFinance_UIUX_ImageGen/` without discarding common README/manifest.
2. Verify `screens/mobile`=90 files and `screens/web`=90 files; extract alpha assets and ensure no repeated resize artefacts.
3. For each task/screen, identify ID in [`DESIGN-01`](./DESIGN-01-SCREEN-MAP.md), inspect mobile PNG+web PNG at actual full resolution, and compare against guide.
4. Implement UI as living DOM/components; use original asset only for brand/icons/illustrations.
5. Capture screenshot at screenshot reference widths (~361 mobile, ~1211 web) **plus realistic widths** 360/390/768/1024/1440/1920, compare visually. Use original images as a *directional* target not excuse to keep bad text clipping/contrast.
6. Log visual divergence in task QA: reason, test, source ID, before/after. Unverified image quality ≠ completed design.

## 5. QA status and limits

- Existing original `QA_Review.md` validates **design assets only**, not app functionality.
- This review examined contact sheets for key patterns and source QA; **no claim of screenshot-by-screenshot automated semantic inspection or pixel diff of all 180 screenshots** is made.
- Production implementation must separately run accessibility/keyboard/contrast audit, E2E/visual capture, locale regression, security check, actual LLM/WA behavior and import/export tests.
- **Full Design + Specs** menyertakan seluruh `reference-design/full/VenFinance_UIUX_ImageGen/` (180 layar + 59 aset). **Specs Lite** sengaja tidak menyertakan folder penuh; untuk pengguna Lite, lampirkan/extract keempat ZIP asli agar QA seluruh screenshot dapat dijalankan. Brand, manifest, dan 4 contact sheet ada pada kedua edisi.
