# DESIGN-00 — Visual Foundations / Tokens (Implemented UI Spec)

**Visual sources:** 180 PNG screens from four uploaded design ZIPs; actual native image dimensions ~361×867 mobile and ~1211×867 web, **not Figma or source HTML**. Brand and guides included under [`../reference-design`](../reference-design/guides/Design_System.md). Audit contact sheets available [`mobile-core`](../reference-design/previews/mobile-core.jpg), [`web-core`](../reference-design/previews/web-core.jpg).

## 1. Visual DNA yang harus dipertahankan

Arah: **clean, tenang, ramah mahasiswa**, putih/lavender dominan, ungu sebagai identitas, pastel kategori, sudut membulat, tipografi angka yang besar. Jangan mengganti identitas dengan dashboard SaaS generik biru/hijau, hero template stock-photo, gradient berlebihan, atau ilustrasi tidak sesuai aset. Heading bersih, ruang putih cukup, kartu informatif berjenjang. Prioritaskan satu aksi **Catat** yang selalu mudah ditemukan.

Raster adalah **referensi visual**, bukan HTML; angka, label, input, tabel, pie/chart/progress, dan ikon navigasi harus menjadi elemen hidup dari data. Logo dari `reference-design/brand` dipakai asli tanpa digambar ulang dari teks/emoji, jaga rasio.

## 2. Color design tokens

| Semantic token | Light | Dark | Pemakaian |
|---|---|---|---|
| `--brand-primary` | `#6D4CE8` | `#B8A4FF` | CTA, active nav, focus accent |
| `--bg-page` | `#F7F7FC` | `#13151F` | canvas |
| `--bg-surface` | `#FFFFFF` | `#1D2030` | cards, menus, dialogs |
| `--bg-lavender` | `#EEE9FF` | derived `#302748` pending contrast QA | gentle highlights |
| `--text-primary` | `#202334` | `#F3F4FA` | headings, money figures |
| `--text-secondary` | `#62677B` | derived high-contrast `#C2C6D5` | descriptions |
| `--success` | `#16724A` | ensure >=4.5:1 on context | confirmed/synced |
| `--warning` | `#885500` | ensure >=4.5:1 on context | pending/overspend/urgent |
| `--danger` | `#B4233A` | ensure >=4.5:1 on context | errors/destructive |
| `--info` | `#155B94` | ensure >=4.5:1 on context | informative |

Reference colors extracted from original `guides/design_tokens.json`; dark derived surface secondary values are **implementation proposals**, verify on rendered app. Contrast calculations for normal text on white: primary purple 5.46:1, secondary gray 5.61:1; dark purple on dark base ~8.48:1. **These isolated ratios do not certify whole app WCAG compliance.**

Category mapping: Makan peach, Transportasi mint/blue, Jajan pink, Lainnya lavender; retain text and category icon, never rely only on color. Graph legend uses same categories in both themes and can be read without color (labels/table).

## 3. Type scale, numeric formatting

- Heading: **Plus Jakarta Sans** 600–700, fallback system. Body: **Inter** 400–600/system sans. Reference font files are **not** included; use standard package/CSS hosted subset with license review, don't ship proprietary font files from container.
- `text-xs` 12px only non-essential metadata, `small` 14px (caption), `body` 16px line-height ~1.45–1.6, H3 18–20px, H2 24px, H1 mobile 24–28px, H1 desktop 28–36px.
- Money display 28–36px (dashboard), 16–20px list, **font-variant-numeric: tabular-nums**. Exact `Rp650.000` style according to `id-ID` locale; negatives `−Rp10.000`, transaction type/sign explicit in accessible label.
- Avoid tiny labels visible in raster due to scaled screenshots. Maintain readable 14px supporting text and strong semantic contrast.
- Copy ID default, EN available. Short, nonjudgmental: `Anggaran jajan terlampaui Rp1.000`, not shame language. Never say `transaksi diblokir` for budget-only warnings.

## 4. Spacing/elevation/radius

| Token | Value | Usage |
|---|---:|---|
| scale | `4,8,12,16,20,24,32,40,48,64` px | gaps and spacing rhythm |
| mobile horizontal padding | 16px base; up to 20px | 360–599 |
| tablet content padding | 24px | 600–1023 |
| desktop padding | 24–32px | 1024+ |
| `radius-card` | 24px (20 when dense) | content blocks |
| `radius-field` | 12–14px | selects/inputs |
| `radius-dialog` | 24px | modal/sheets |
| focus ring | ≥2px contrast safe | keyboard state |
| touch target | **44×44px recommended** | buttons/menu/row controls; WCAG 2.2 AA min is 24×24 CSS px or exceptions |
| elevation | very subtle shadow + border | calm card style, not neon |

Cards use disciplined hierarchy: label small → primary figure large → contextual change/progress → action. Budget uses track/progress with textual percentage and overspend state; don't put actual balance into planned budget cards.

## 5. Layout shell conventions

### Mobile (`FIN-UI-01`, `FIN-UI-02`)

- Header: brand/avatar, greeting + period, notification, amount privacy toggle; mobile finance home scrolls vertically.
- Bottom tab bar: **Beranda, Transaksi, + Catat, Anggaran, Lainnya**; `Catat` is an action opening sheet (not separate selected page). Safe area bottom respected; only one active tab.
- Details: top back header + title; bottom nav may remain except modal full screen where footer pinned CTA and safe area required.
- Quick add uses **bottom sheet** with number pad/open keyboard, visible wallet/category/date, submit + cancel. Prevent keyboard overlapping CTA.
- First viewport prioritize saldo → sisa budget → category quick tiles → review inbox → recent transactions. Beyond fold may include tagihan/status hari.

### Desktop (`FIN-UI-01`, `REV-03`, `ADM-01`, `SYS-01`)

- Persistent ~220–248px sidebar for app; header aligned with content action `+ Catat transaksi`, period selector, user avatar.
- 12-col responsive content grid; home 3–4 KPI and charts, review two panels (proof left, editable form right), transactions table with filters & sticky/accessible headers.
- Admin and Superuser have **distinct operational sidebar**, not hidden quick nav in a user dashboard; links respect role.
- Footer only for public pages; internal application spaces avoid stock commercial hero banner.

## 6. Themes & assets

- Default light, user may select dark/system. Two designed dark anchors `DARK-01`, `DARK-02` serve as token references; all other ~88 templates must be implemented in both themes systematically, not treated as 2 dark-only routes.
- Brand raster assets at `reference-design/brand/*`, full set of category/nav icons at `reference-design/full/VenFinance_UIUX_ImageGen/assets/icons/*` after extracting supplied design ZIPs.
- Use original `assets/illustrations` for public/onboarding/empty, **not** image-cropped text blocks as functioning UI.
- Screen refs: [`DESIGN-01-SCREEN-MAP.md`](./DESIGN-01-SCREEN-MAP.md); detailed states [`DESIGN-02-COMPONENTS-STATES.md`](./DESIGN-02-COMPONENTS-STATES.md).

## 7. Design tokens to code

- Single token source in `packages/ui/src/tokens.css` / Tailwind theme maps semantic CSS variables. Components consume semantic `--brand-*`, `--text-*`, not hardcoded magic hex across screens.
- Components must have hover, pressed, focus-visible, disabled, error, pending, skeleton/empty states and honor `prefers-reduced-motion`.
- Accessibility pass at 360px, 390px, 768px, 1024px, 1440px, 1920px and 200% zoom. Mobile portrait primary; don't lock screen heights to PNG canvas.
- Visual QA compares side-by-side screenshot from Playwright vs original for each of 90 paired screen IDs, at natural 361px and 1211px as **reference**, then additional usable widths. Source/reference differences require documented reasons, not random visual invention.
