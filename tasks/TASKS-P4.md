# TASKS-P4 — Design system, PWA UX, 90 screen reference states

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya. **P4 screens are UI/scaffold tasks**: fixture-only external integrations are allowed if labeled and isolated; production funcionality remains blocked until P5/P7/P8/P9 integration tasks and P10 UAT. Never claim a complete feature merely because its screenshot matches.

### P4-001 — Apply semantic tokens and fonts

- **Status awal:** `todo`; **tujuan tunggal:** Map guides/design_tokens.json to accessible CSS variables, light/dark
- **Dependensi:** `P1-012`, `P1-005`.
- **Rujukan:** [`DESIGN-00-FOUNDATIONS.md`](../design/DESIGN-00-FOUNDATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Computed CSS token values match guide and 4.5:1 normal text contrast.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-002 — Create accessible core components

- **Status awal:** `todo`; **tujuan tunggal:** Buttons, inputs, dialogs, nav, toast, tabs, money, skeleton, status
- **Dependensi:** `P4-001`.
- **Rujukan:** [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Story fixtures cover hover/focus/disabled/error/keyboard.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-003 — Build responsive shells

- **Status awal:** `todo`; **tujuan tunggal:** Create separate public/auth/onboarding/user/admin/system shells
- **Dependensi:** `P4-002`, `P2-004`.
- **Rujukan:** [`DESIGN-03-INTERACTIONS-RESPONSIVE.md`](../design/DESIGN-03-INTERACTIONS-RESPONSIVE.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Bottom nav 360/390, desktop sidebar 1024+, active states correct.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-004 — Setup screen registry and visual fixtures

- **Status awal:** `todo`; **tujuan tunggal:** Generate typed route/screen registry from DESIGN-01 manifest; nav and role guards
- **Dependensi:** `P4-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Every 90 source ID reachable as route/state and has test fixture.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-005 — Implement language and theme preferences

- **Status awal:** `todo`; **tujuan tunggal:** ID default, EN, system/light/dark persisted per user
- **Dependensi:** `P4-003`.
- **Rujukan:** [`DESIGN-05-COPY-A11Y-I18N.md`](../design/DESIGN-05-COPY-A11Y-I18N.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Both locales/themes at mobile & desktop, language mismatch tests.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-006 — Implement chart accessible equivalents

- **Status awal:** `todo`; **tujuan tunggal:** Charts include text/table reading and labeled category color semantics
- **Dependensi:** `P4-002`.
- **Rujukan:** [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Screen reader can access values without chart shape/color.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-001 — PWA installable di Android/Desktop dan browser pendukung

- **Status awal:** `todo`; **tujuan tunggal:** PWA installable di Android/Desktop dan browser pendukung. Perilaku persis mengikuti UX-001 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "PWA installable di Android/Desktop dan browser pendukung" dari UX-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-001-A dan AC-UX-001-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "PWA installable di Android/Desktop dan browser pendukung.", **maka** Manifest, ikon, instalasi, layar orientasi, tampilan stand-alone, prompt install tidak agresif. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-002 — UI responsif HP kecil sampai desktop, termasuk dark/light mode

- **Status awal:** `todo`; **tujuan tunggal:** UI responsif HP kecil sampai desktop, termasuk dark/light mode. Perilaku persis mengikuti UX-002 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "UI responsif HP kecil sampai desktop, termasuk dark/light mode" dari UX-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-002-A dan AC-UX-002-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "UI responsif HP kecil sampai desktop, termasuk dark/light mode.", **maka** Navigasi tidak overflow; font ukuran nyaman; semua tindakan penting tersedia di mobile. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-003 — Dashboard dengan total saldo, budget, transaksi terbaru, catatan belum diverifikasi, dana tabungan dan utang

- **Status awal:** `todo`; **tujuan tunggal:** Dashboard dengan total saldo, budget, transaksi terbaru, catatan belum diverifikasi, dana tabungan dan utang. Perilaku persis mengikuti UX-003 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Dashboard dengan total saldo, budget, transaksi terbaru, catatan belum diverifikasi, dana tabungan dan utang" dari UX-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-003-A dan AC-UX-003-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Dashboard dengan total saldo, budget, transaksi terbaru, catatan belum diverifikasi, dana tabungan dan utang.", **maka** Setiap angka punya label aktual/rencana/provisional. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-004 — Quick Add 1-langkah angka + kategori; 2-langkah bila dompet/tanggal butuh konfirmasi

- **Status awal:** `todo`; **tujuan tunggal:** Quick Add 1-langkah angka + kategori; 2-langkah bila dompet/tanggal butuh konfirmasi. Perilaku persis mengikuti UX-004 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Quick Add 1-langkah angka + kategori; 2-langkah bila dompet/tanggal butuh konfirmasi" dari UX-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-004-A dan AC-UX-004-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Quick Add 1-langkah angka + kategori; 2-langkah bila dompet/tanggal butuh konfirmasi.", **maka** Bisa digunakan offline untuk catatan manual; satu klik simpan memberikan feedback. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-005 — Input kalimat natural, contohnya 'lauk 10k bensin 20k'

- **Status awal:** `todo`; **tujuan tunggal:** Input kalimat natural, contohnya 'lauk 10k bensin 20k'. Perilaku persis mengikuti UX-005 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Input kalimat natural, contohnya 'lauk 10k bensin 20k'" dari UX-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-005-A dan AC-UX-005-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Input kalimat natural, contohnya 'lauk 10k bensin 20k'.", **maka** Parser memperlihatkan daftar transaksi hasil ekstraksi sebelum konfirmasi bila ambigu. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-006 — Upload foto/SS bukti dari file, kamera, dan paste jika browser mendukung

- **Status awal:** `todo`; **tujuan tunggal:** Upload foto/SS bukti dari file, kamera, dan paste jika browser mendukung. Perilaku persis mengikuti UX-006 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Upload foto/SS bukti dari file, kamera, dan paste jika browser mendukung" dari UX-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-006-A dan AC-UX-006-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Upload foto/SS bukti dari file, kamera, dan paste jika browser mendukung.", **maka** Validasi ukuran/tipe, progress, retry, metadata dibatasi. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-008 — Halaman review: foto di sebelah daftar transaksi usulan, nominal, kategori, merchant, tanggal

- **Status awal:** `todo`; **tujuan tunggal:** Halaman review: foto di sebelah daftar transaksi usulan, nominal, kategori, merchant, tanggal. Perilaku persis mengikuti UX-008 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Halaman review: foto di sebelah daftar transaksi usulan, nominal, kategori, merchant, tanggal" dari UX-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-008-A dan AC-UX-008-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Halaman review: foto di sebelah daftar transaksi usulan, nominal, kategori, merchant, tanggal.", **maka** User dapat mengedit atau menolak sebelum final. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-010 — Kalender riwayat pengeluaran dan penanda hari nihil/belum dilaporkan

- **Status awal:** `todo`; **tujuan tunggal:** Kalender riwayat pengeluaran dan penanda hari nihil/belum dilaporkan. Perilaku persis mengikuti UX-010 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kalender riwayat pengeluaran dan penanda hari nihil/belum dilaporkan" dari UX-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-010-A dan AC-UX-010-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Kalender riwayat pengeluaran dan penanda hari nihil/belum dilaporkan.", **maka** Hari yang belum dilaporkan tidak otomatis tercatat nol. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-011 — Pencarian/filter transaksi cepat, undo aksi non-destruktif, edit & batch operations

- **Status awal:** `todo`; **tujuan tunggal:** Pencarian/filter transaksi cepat, undo aksi non-destruktif, edit & batch operations. Perilaku persis mengikuti UX-011 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pencarian/filter transaksi cepat, undo aksi non-destruktif, edit & batch operations" dari UX-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-011-A dan AC-UX-011-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Pencarian/filter transaksi cepat, undo aksi non-destruktif, edit & batch operations.", **maka** Konfirmasi jelas untuk tindakan permanen; aksesibilitas keyboard. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-012 — Notifikasi budget, jatuh tempo, reminder dan status AI

- **Status awal:** `todo`; **tujuan tunggal:** Notifikasi budget, jatuh tempo, reminder dan status AI. Perilaku persis mengikuti UX-012 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Notifikasi budget, jatuh tempo, reminder dan status AI" dari UX-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-012-A dan AC-UX-012-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Notifikasi budget, jatuh tempo, reminder dan status AI.", **maka** Kanal dan waktu dapat dikonfigurasi, quiet hours, dedup dan opt-out. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-013 — Dashboard status integrasi (WA, AI, sinkronisasi, upload)

- **Status awal:** `todo`; **tujuan tunggal:** Dashboard status integrasi (WA, AI, sinkronisasi, upload). Perilaku persis mengikuti UX-013 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Dashboard status integrasi (WA, AI, sinkronisasi, upload)" dari UX-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-013-A dan AC-UX-013-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Dashboard status integrasi (WA, AI, sinkronisasi, upload).", **maka** Selalu membedakan 'aktif', 'sedang menghubungkan', 'terganggu', 'butuh login ulang'. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-014 — Simulasi pengeluaran sebelum jajan dan tantangan kebiasaan opsional

- **Status awal:** `todo`; **tujuan tunggal:** Simulasi pengeluaran sebelum jajan dan tantangan kebiasaan opsional. Perilaku persis mengikuti UX-014 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-014), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Simulasi pengeluaran sebelum jajan dan tantangan kebiasaan opsional" dari UX-014; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-014-A dan AC-UX-014-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Simulasi pengeluaran sebelum jajan dan tantangan kebiasaan opsional.", **maka** Tidak otomatis membuat transaksi; user boleh mematikan tanpa kehilangan ledger. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-016 — Halaman bantuan & permintaan support, kesalahan sistem ramah pengguna

- **Status awal:** `todo`; **tujuan tunggal:** Halaman bantuan & permintaan support, kesalahan sistem ramah pengguna. Perilaku persis mengikuti UX-016 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-016), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Halaman bantuan & permintaan support, kesalahan sistem ramah pengguna" dari UX-016; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-016-A dan AC-UX-016-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Halaman bantuan & permintaan support, kesalahan sistem ramah pengguna.", **maka** Tidak mengekspos stack trace, token atau PII dalam pesan error. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-017 — Bahasa Indonesia default; toggle English untuk antarmuka umum

- **Status awal:** `todo`; **tujuan tunggal:** Bahasa Indonesia default; toggle English untuk antarmuka umum. Perilaku persis mengikuti UX-017 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-017), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Bahasa Indonesia default; toggle English untuk antarmuka umum" dari UX-017; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-017-A dan AC-UX-017-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Bahasa Indonesia default; toggle English untuk antarmuka umum.", **maka** Nominal/tanggal diformat sesuai locale, istilah keuangan tidak berubah makna. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-UX-018 — Komponen demo tanpa login menggunakan data sintetis

- **Status awal:** `todo`; **tujuan tunggal:** Komponen demo tanpa login menggunakan data sintetis. Perilaku persis mengikuti UX-018 (bukan ilustrasi statis).
- **Dependensi:** `P4-004`.
- **Rujukan:** [`REQ-03-PWA-INPUT.md`](../requirements/REQ-03-PWA-INPUT.md#ux-018), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Komponen demo tanpa login menggunakan data sintetis" dari UX-018; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-UX-018-A dan AC-UX-018-B yang relevan: **Diberikan** pengguna membuka aplikasi pada perangkat/browser yang mendukung, **ketika** pengguna menjalankan kemampuan "Komponen demo tanpa login menggunakan data sintetis.", **maka** Terisolasi dari akun dan backend produksi, memiliki label 'contoh'. Negative/boundary: Kegagalan jaringan, browser tidak kompatibel, atau input salah harus memberikan tindakan alternatif tanpa kehilangan data yang sudah diisi. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-PUB-01 — UI PUB-01 — Landing

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen PUB-01 pada ``/``: Nilai produk, cara kerja, preview, CTA daftar, akses demo, penjelasan sebagai pencatat keuangan.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/PUB-01__landing.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/PUB-01__landing.png`.
- **Deliverable:** Komponen route atau state PUB-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot PUB-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-PUB-02 — UI PUB-02 — Demo interaktif

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen PUB-02 pada ``/demo``: Shell aplikasi dengan data sintetis dan label Contoh; jalur menuju daftar.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/PUB-02__demo-interaktif.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/PUB-02__demo-interaktif.png`.
- **Deliverable:** Komponen route atau state PUB-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot PUB-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-PUB-03 — UI PUB-03 — FAQ & pusat bantuan publik

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen PUB-03 pada ``/faq``: Pencarian topik manual, anggaran, AI, WA, privasi, offline.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/PUB-03__faq-pusat-bantuan-publik.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/PUB-03__faq-pusat-bantuan-publik.png`.
- **Deliverable:** Komponen route atau state PUB-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot PUB-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-PUB-04 — UI PUB-04 — Kontak dukungan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen PUB-04 pada ``/contact``: Pilihan masalah, form, pemberitahuan agar tidak mengirim data sensitif yang tidak diperlukan.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/PUB-04__kontak-dukungan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/PUB-04__kontak-dukungan.png`.
- **Deliverable:** Komponen route atau state PUB-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot PUB-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-PUB-05 — UI PUB-05 — Status layanan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen PUB-05 pada ``/status``: Status layanan dan riwayat insiden, waktu pembaruan serta alternatif pencatatan.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/PUB-05__status-layanan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/PUB-05__status-layanan.png`.
- **Deliverable:** Komponen route atau state PUB-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot PUB-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-PUB-06 — UI PUB-06 — Kebijakan privasi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen PUB-06 pada ``/legal/privacy``: Dokumen terbaca, daftar isi, versi, tanggal berlaku.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/PUB-06__kebijakan-privasi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/PUB-06__kebijakan-privasi.png`.
- **Deliverable:** Komponen route atau state PUB-06, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot PUB-06 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-PUB-07 — UI PUB-07 — Syarat layanan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen PUB-07 pada ``/legal/terms``: Dokumen terbaca, batas fungsi dan versi; tidak mengarang kebijakan yang belum disahkan.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/PUB-07__syarat-layanan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/PUB-07__syarat-layanan.png`.
- **Deliverable:** Komponen route atau state PUB-07, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot PUB-07 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-PUB-08 — UI PUB-08 — Pembaruan produk

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen PUB-08 pada ``/changelog``: Changelog dan catatan fitur.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/PUB-08__pembaruan-produk.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/PUB-08__pembaruan-produk.png`.
- **Deliverable:** Komponen route atau state PUB-08, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot PUB-08 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-AUTH-01 — UI AUTH-01 — Masuk

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen AUTH-01 pada ``/login``: Email, password, pemulihan; Google hanya jika diaktifkan.
- **Dependensi:** `P4-004`, `P2-IAM-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/AUTH-01__masuk.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/AUTH-01__masuk.png`.
- **Deliverable:** Komponen route atau state AUTH-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot AUTH-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-AUTH-02 — UI AUTH-02 — Daftar

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen AUTH-02 pada ``/register``: Email, password, syarat, petunjuk validasi; tanpa pilihan role.
- **Dependensi:** `P4-004`, `P2-IAM-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/AUTH-02__daftar.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/AUTH-02__daftar.png`.
- **Deliverable:** Komponen route atau state AUTH-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot AUTH-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-AUTH-03 — UI AUTH-03 — Verifikasi email

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen AUTH-03 pada ``/verify-email``: Kirim ulang, ubah alamat sesuai kebijakan, tautan kedaluwarsa, hasil verifikasi.
- **Dependensi:** `P4-004`, `P2-IAM-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/AUTH-03__verifikasi-email.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/AUTH-03__verifikasi-email.png`.
- **Deliverable:** Komponen route atau state AUTH-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot AUTH-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-AUTH-04 — UI AUTH-04 — Lupa password

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen AUTH-04 pada ``/forgot-password``: Permintaan reset dengan respons yang tidak membocorkan keberadaan akun.
- **Dependensi:** `P4-004`, `P2-IAM-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/AUTH-04__lupa-password.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/AUTH-04__lupa-password.png`.
- **Deliverable:** Komponen route atau state AUTH-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot AUTH-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-AUTH-05 — UI AUTH-05 — Reset password

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen AUTH-05 pada ``/reset-password``: Password baru, validasi, tautan invalid/kedaluwarsa, selesai.
- **Dependensi:** `P4-004`, `P2-IAM-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/AUTH-05__reset-password.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/AUTH-05__reset-password.png`.
- **Deliverable:** Komponen route atau state AUTH-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot AUTH-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-AUTH-06 — UI AUTH-06 — Verifikasi keamanan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen AUTH-06 pada ``/verify-security``: MFA/step-up; bentuk final mengikuti metode autentikasi yang dipilih.
- **Dependensi:** `P4-004`, `P2-IAM-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/AUTH-06__verifikasi-keamanan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/AUTH-06__verifikasi-keamanan.png`.
- **Deliverable:** Komponen route atau state AUTH-06, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot AUTH-06 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-AUTH-07 — UI AUTH-07 — Akses akun dibatasi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen AUTH-07 pada ``/account-restricted``: Alasan yang boleh ditampilkan, bantuan, banding, status pengajuan.
- **Dependensi:** `P4-004`, `P2-IAM-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/AUTH-07__akses-akun-dibatasi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/AUTH-07__akses-akun-dibatasi.png`.
- **Deliverable:** Komponen route atau state AUTH-07, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot AUTH-07 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ONB-01 — UI ONB-01 — Kenalan & preferensi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ONB-01 pada ``/onboarding/intro``: Nama panggilan, bahasa, IDR, Asia/Jakarta, awal siklus.
- **Dependensi:** `P4-004`, `P2-IAM-006`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ONB-01__kenalan-preferensi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ONB-01__kenalan-preferensi.png`.
- **Deliverable:** Komponen route atau state ONB-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ONB-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ONB-02 — UI ONB-02 — Sumber uang awal

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ONB-02 pada ``/onboarding/wallets``: Buat dompet virtual dan saldo pembuka; dapat dilewati untuk disiapkan nanti.
- **Dependensi:** `P4-004`, `P2-IAM-006`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ONB-02__sumber-uang-awal.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ONB-02__sumber-uang-awal.png`.
- **Deliverable:** Komponen route atau state ONB-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ONB-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ONB-03 — UI ONB-03 — Pilih rencana anggaran

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ONB-03 pada ``/onboarding/template``: Mahasiswa Kos, umum, atau mulai kosong.
- **Dependensi:** `P4-004`, `P2-IAM-006`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ONB-03__pilih-rencana-anggaran.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ONB-03__pilih-rencana-anggaran.png`.
- **Deliverable:** Komponen route atau state ONB-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ONB-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ONB-04 — UI ONB-04 — Sesuaikan anggaran

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ONB-04 pada ``/onboarding/budget``: Edit nominal, cek pemasukan dan kebutuhan termasuk kos/listrik; tidak mencatat rencana sebagai pengeluaran.
- **Dependensi:** `P4-004`, `P2-IAM-006`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ONB-04__sesuaikan-anggaran.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ONB-04__sesuaikan-anggaran.png`.
- **Deliverable:** Komponen route atau state ONB-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ONB-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ONB-05 — UI ONB-05 — Fitur opsional & selesai

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ONB-05 pada ``/onboarding/connectors``: AI, bukti, WA, pengingat dengan izin terpisah; Lewati tetap jelas.
- **Dependensi:** `P4-004`, `P2-IAM-006`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ONB-05__fitur-opsional-selesai.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ONB-05__fitur-opsional-selesai.png`.
- **Deliverable:** Komponen route atau state ONB-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ONB-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-01 — UI FIN-UI-01 — Beranda

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-01 pada ``/app``: Saldo terkonfirmasi, sisa anggaran, jatah hari ini, review, transaksi, tagihan, status hari.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-01__beranda.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-01__beranda.png`.
- **Deliverable:** Komponen route atau state FIN-UI-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-02 — UI FIN-UI-02 — Riwayat transaksi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-02 pada ``/app/transactions``: Search, filter gabungan, pengelompokan tanggal, bulk action dan ekspor.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-02__riwayat-transaksi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-02__riwayat-transaksi.png`.
- **Deliverable:** Komponen route atau state FIN-UI-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-03 — UI FIN-UI-03 — Detail transaksi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-03 pada ``/app/transactions/:id``: Jenis, nominal, sumber uang, kategori/split, bukti, asal input, edit, void/restore, riwayat.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-03__detail-transaksi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-03__detail-transaksi.png`.
- **Deliverable:** Komponen route atau state FIN-UI-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-04 — UI FIN-UI-04 — Kalender pencatatan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-04 pada ``/app/calendar``: Belum dilaporkan, sebagian, selesai, nihil; rincian per hari dan koreksi.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-04__kalender-pencatatan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-04__kalender-pencatatan.png`.
- **Deliverable:** Komponen route atau state FIN-UI-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-05 — UI FIN-UI-05 — Daftar dompet

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-05 pada ``/app/wallets``: Total saldo dan sumber uang, tambah, arsip, transfer.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-05__daftar-dompet.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-05__daftar-dompet.png`.
- **Deliverable:** Komponen route atau state FIN-UI-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-06 — UI FIN-UI-06 — Detail dompet

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-06 pada ``/app/wallets/:id``: Saldo virtual, mutasi, rekonsiliasi, penyesuaian dan arsip.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-06__detail-dompet.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-06__detail-dompet.png`.
- **Deliverable:** Komponen route atau state FIN-UI-06, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-06 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-07 — UI FIN-UI-07 — Ringkasan anggaran

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-07 pada ``/app/budgets``: Periode, budget, terpakai, sisa, lebih budget, copy periode/template.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-07__ringkasan-anggaran.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-07__ringkasan-anggaran.png`.
- **Deliverable:** Komponen route atau state FIN-UI-07, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-07 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-08 — UI FIN-UI-08 — Detail kantong anggaran

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-08 pada ``/app/budgets/:id``: Batas, transaksi terkait, threshold, rollover, riwayat perubahan.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-08__detail-kantong-anggaran.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-08__detail-kantong-anggaran.png`.
- **Deliverable:** Komponen route atau state FIN-UI-08, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-08 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-09 — UI FIN-UI-09 — Daftar target tabungan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-09 pada ``/app/goals``: Target, realisasi, tanggal, kemajuan.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-09__daftar-target-tabungan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-09__daftar-target-tabungan.png`.
- **Deliverable:** Komponen route atau state FIN-UI-09, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-09 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-10 — UI FIN-UI-10 — Detail target

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-10 pada ``/app/goals/:id``: Riwayat setoran/transfer, sumber uang, sisa target dan edit.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-10__detail-target.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-10__detail-target.png`.
- **Deliverable:** Komponen route atau state FIN-UI-10, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-10 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-11 — UI FIN-UI-11 — Daftar utang & piutang

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-11 pada ``/app/debts``: Sisa pokok, jatuh tempo, pihak opsional, filter status.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-11__daftar-utang-piutang.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-11__daftar-utang-piutang.png`.
- **Deliverable:** Komponen route atau state FIN-UI-11, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-11 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-12 — UI FIN-UI-12 — Detail utang/piutang

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-12 pada ``/app/debts/:id``: Pokok, pembayaran, bunga/biaya terpisah, jadwal, catat cicilan/pelunasan.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-12__detail-utang-piutang.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-12__detail-utang-piutang.png`.
- **Deliverable:** Komponen route atau state FIN-UI-12, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-12 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-13 — UI FIN-UI-13 — Tagihan & catatan berulang

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-13 pada ``/app/recurring``: Daftar/kalender, jatuh tempo, dana tersedia, pengingat atau draft otomatis.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-13__tagihan-catatan-berulang.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-13__tagihan-catatan-berulang.png`.
- **Deliverable:** Komponen route atau state FIN-UI-13, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-13 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-14 — UI FIN-UI-14 — Detail tagihan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-14 pada ``/app/recurring/:id``: Jadwal, nominal rencana, sumber uang, riwayat; Bayar berarti catat pembayaran nyata.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-14__detail-tagihan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-14__detail-tagihan.png`.
- **Deliverable:** Komponen route atau state FIN-UI-14, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-14 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-15 — UI FIN-UI-15 — Laporan & insight

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-15 pada ``/app/insights``: Periode, kategori, arus kas, perbandingan, data grafik, ekspor dan preview berbagi.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-15__laporan-insight.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-15__laporan-insight.png`.
- **Deliverable:** Komponen route atau state FIN-UI-15, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-15 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FIN-UI-16 — UI FIN-UI-16 — Simulasi belanja

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FIN-UI-16 pada ``/app/simulate``: Masukkan nominal/kategori → lihat dampak; tidak menyimpan transaksi otomatis.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FIN-UI-16__simulasi-belanja.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FIN-UI-16__simulasi-belanja.png`.
- **Deliverable:** Komponen route atau state FIN-UI-16, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FIN-UI-16 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-REV-01 — UI REV-01 — Inbox perlu ditinjau

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen REV-01 pada ``/app/review``: Usulan, sementara, konflik, duplikat, gagal; jumlah dan prioritas jelas.
- **Dependensi:** `P4-004`. **Batas P4:** tampilan/interaction dengan fixture nonprivat; R2 nyata P5-003 dan ekstraksi AI P8-005 wajib pada integrasi akhir.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/REV-01__inbox-perlu-ditinjau.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/REV-01__inbox-perlu-ditinjau.png`.
- **Deliverable:** Komponen route atau state REV-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot REV-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-REV-02 — UI REV-02 — Unggah & proses bukti

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen REV-02 pada ``/app/review/upload``: Kamera/file/paste bila didukung, izin, validasi, progress, antrean, batal, manual.
- **Dependensi:** `P4-004`. **Batas P4:** tampilan/interaction dengan fixture nonprivat; R2 nyata P5-003 dan ekstraksi AI P8-005 wajib pada integrasi akhir.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/REV-02__unggah-proses-bukti.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/REV-02__unggah-proses-bukti.png`.
- **Deliverable:** Komponen route atau state REV-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot REV-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-REV-03 — UI REV-03 — Review hasil bacaan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen REV-03 pada ``/app/review/:id``: Bukti asli, nominal, tanggal, merchant, kategori, dompet, item/split, konfirmasi.
- **Dependensi:** `P4-004`. **Batas P4:** tampilan/interaction dengan fixture nonprivat; R2 nyata P5-003 dan ekstraksi AI P8-005 wajib pada integrasi akhir.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/REV-03__review-hasil-bacaan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/REV-03__review-hasil-bacaan.png`.
- **Deliverable:** Komponen route atau state REV-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot REV-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-REV-04 — UI REV-04 — Bandingkan hasil berbeda

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen REV-04 pada ``/app/review/:id/conflict``: OCR vs hasil pemeriksaan ulang vs nilai tersimpan bila ada; pilih/koreksi dengan alasan.
- **Dependensi:** `P4-004`. **Batas P4:** tampilan/interaction dengan fixture nonprivat; R2 nyata P5-003 dan ekstraksi AI P8-005 wajib pada integrasi akhir.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/REV-04__bandingkan-hasil-berbeda.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/REV-04__bandingkan-hasil-berbeda.png`.
- **Deliverable:** Komponen route atau state REV-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot REV-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-REV-05 — UI REV-05 — Periksa kemungkinan duplikat

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen REV-05 pada ``/app/review/:id/duplicate``: Dua kandidat, bukti dan asal, gabungkan/simpan terpisah/batalkan.
- **Dependensi:** `P4-004`. **Batas P4:** tampilan/interaction dengan fixture nonprivat; R2 nyata P5-003 dan ekstraksi AI P8-005 wajib pada integrasi akhir.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/REV-05__periksa-kemungkinan-duplikat.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/REV-05__periksa-kemungkinan-duplikat.png`.
- **Deliverable:** Komponen route atau state REV-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot REV-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-01 — UI SET-01 — Pusat pengaturan / Lainnya

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-01 pada ``/app/settings``: Direktori yang mudah dipindai; status integrasi dan akses cepat.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-01__pusat-pengaturan-lainnya.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-01__pusat-pengaturan-lainnya.png`.
- **Deliverable:** Komponen route atau state SET-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-02 — UI SET-02 — Profil

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-02 pada ``/app/settings/profile``: Nama, foto opsional, email dan verifikasi perubahan.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-02__profil.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-02__profil.png`.
- **Deliverable:** Komponen route atau state SET-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-03 — UI SET-03 — Tampilan & preferensi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-03 pada ``/app/settings/appearance``: Bahasa ID/EN, light/dark/system, timezone, siklus, sembunyikan nominal.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-03__tampilan-preferensi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-03__tampilan-preferensi.png`.
- **Deliverable:** Komponen route atau state SET-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-04 — UI SET-04 — Keamanan & perangkat

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-04 pada ``/app/settings/security``: Password, sesi aktif, cabut perangkat, logout semua, keamanan akun.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-04__keamanan-perangkat.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-04__keamanan-perangkat.png`.
- **Deliverable:** Komponen route atau state SET-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-05 — UI SET-05 — WhatsApp — pilihan & status

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-05 pada ``/app/settings/whatsapp``: Bot bersama/pribadi, status aktual, fitur yang tersedia dan koneksi opsional.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-05__whatsapp-pilihan-status.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-05__whatsapp-pilihan-status.png`.
- **Deliverable:** Komponen route atau state SET-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-06 — UI SET-06 — Verifikasi nomor bot bersama

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-06 pada ``/app/settings/whatsapp/shared``: Pembuktian nomor dan hasil; tidak meminta QR sesi pribadi.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-06__verifikasi-nomor-bot-bersama.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-06__verifikasi-nomor-bot-bersama.png`.
- **Deliverable:** Komponen route atau state SET-06, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-06 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-07 — UI SET-07 — Tautkan WhatsApp pribadi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-07 pada ``/app/settings/whatsapp/personal``: Mobile mengutamakan kode pairing; desktop dapat mengutamakan QR; masa berlaku dan petunjuk.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-07__tautkan-whatsapp-pribadi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-07__tautkan-whatsapp-pribadi.png`.
- **Deliverable:** Komponen route atau state SET-07, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-07 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-08 — UI SET-08 — Izin & aktivitas WhatsApp

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-08 pada ``/app/settings/whatsapp/consent``: Chat/tujuan diizinkan, reconnect, login ulang, logout, hapus sesi, cabut izin.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-08__izin-aktivitas-whatsapp.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-08__izin-aktivitas-whatsapp.png`.
- **Deliverable:** Komponen route atau state SET-08, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-08 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-09 — UI SET-09 — AI, bukti & pemakaian

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-09 pada ``/app/settings/ai``: Izin upstream, simpan bukti, kuota aktual, preferensi kategori, cabut izin.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-09__ai-bukti-pemakaian.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-09__ai-bukti-pemakaian.png`.
- **Deliverable:** Komponen route atau state SET-09, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-09 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-10 — UI SET-10 — Pengingat & notifikasi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-10 pada ``/app/settings/reminders``: Kanal, jam, hari, timezone, quiet hours, threshold dan STOP/jeda.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-10__pengingat-notifikasi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-10__pengingat-notifikasi.png`.
- **Deliverable:** Komponen route atau state SET-10, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-10 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-11 — UI SET-11 — Kategori & subkategori

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-11 pada ``/app/settings/categories``: Buat, ubah, arsip, ikon, pengaruh ke histori.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-11__kategori-subkategori.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-11__kategori-subkategori.png`.
- **Deliverable:** Komponen route atau state SET-11, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-11 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-12 — UI SET-12 — Data & privasi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-12 pada ``/app/settings/privacy``: Ekspor CSV/JSON, bukti terpisah, retensi, izin, status permintaan.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-12__data-privasi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-12__data-privasi.png`.
- **Deliverable:** Komponen route atau state SET-12, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-12 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-13 — UI SET-13 — Impor — pemetaan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-13 pada ``/app/settings/import/map``: Upload CSV, mapping kolom, format tanggal/nominal, validasi.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-13__impor-pemetaan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-13__impor-pemetaan.png`.
- **Deliverable:** Komponen route atau state SET-13, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-13 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-14 — UI SET-14 — Impor — pratinjau & hasil

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-14 pada ``/app/settings/import/review``: Valid/error/duplikat, keputusan sebelum posting, hasil dan rollback sesuai aturan.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-14__impor-pratinjau-hasil.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-14__impor-pratinjau-hasil.png`.
- **Deliverable:** Komponen route atau state SET-14, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-14 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-15 — UI SET-15 — Pusat notifikasi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-15 pada ``/app/notifications``: Budget, jatuh tempo, review, keamanan; kontrol data sensitif.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-15__pusat-notifikasi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-15__pusat-notifikasi.png`.
- **Deliverable:** Komponen route atau state SET-15, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-15 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-16 — UI SET-16 — Bantuan & tiket saya

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-16 pada ``/app/help/tickets``: Artikel, buat tiket, pilih lampiran dan izin akses terbatas.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-16__bantuan-tiket-saya.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-16__bantuan-tiket-saya.png`.
- **Deliverable:** Komponen route atau state SET-16, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-16 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-17 — UI SET-17 — Detail tiket saya

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-17 pada ``/app/help/tickets/:id``: Status, balasan, lampiran yang dibagikan, masa akses dan cabut akses.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-17__detail-tiket-saya.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-17__detail-tiket-saya.png`.
- **Deliverable:** Komponen route atau state SET-17, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-17 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-18 — UI SET-18 — Sinkronisasi & konflik

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-18 pada ``/app/settings/sync``: Antrean lokal, syncing, gagal, versi lokal/server, retry dan keputusan konflik.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-18__sinkronisasi-konflik.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-18__sinkronisasi-konflik.png`.
- **Deliverable:** Komponen route atau state SET-18, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-18 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SET-19 — UI SET-19 — Hapus akun & progres

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SET-19 pada ``/app/settings/delete-account``: Dampak, reauth, ekspor opsional, tenggang jika disahkan, status proses/pengecualian.
- **Dependensi:** `P4-004`, `P2-002`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SET-19__hapus-akun-progres.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SET-19__hapus-akun-progres.png`.
- **Deliverable:** Komponen route atau state SET-19, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SET-19 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ADM-01 — UI ADM-01 — Dashboard operasional

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ADM-01 pada ``/admin``: Pengguna agregat, error, antrean, kuota, status layanan.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ADM-01__dashboard-operasional.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ADM-01__dashboard-operasional.png`.
- **Deliverable:** Komponen route atau state ADM-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ADM-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ADM-02 — UI ADM-02 — Daftar akun

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ADM-02 pada ``/admin/users``: Metadata minimum, identitas tersamar, status dan pencarian terbatas.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ADM-02__daftar-akun.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ADM-02__daftar-akun.png`.
- **Deliverable:** Komponen route atau state ADM-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ADM-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ADM-03 — UI ADM-03 — Moderasi & banding akun

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ADM-03 pada ``/admin/appeals``: Alasan, warn/suspend/unsuspend, banding, jejak tindakan; tanpa tab transaksi pribadi.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ADM-03__moderasi-banding-akun.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ADM-03__moderasi-banding-akun.png`.
- **Deliverable:** Komponen route atau state ADM-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ADM-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ADM-04 — UI ADM-04 — Antrean support

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ADM-04 pada ``/admin/support``: Tiket, kategori, prioritas, masa akses lampiran.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ADM-04__antrean-support.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ADM-04__antrean-support.png`.
- **Deliverable:** Komponen route atau state ADM-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ADM-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ADM-05 — UI ADM-05 — Detail tiket berizin

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ADM-05 pada ``/admin/support/:id``: Konten yang sengaja dibagikan, batas izin/waktu, tanggapan.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ADM-05__detail-tiket-berizin.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ADM-05__detail-tiket-berizin.png`.
- **Deliverable:** Komponen route atau state ADM-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ADM-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ADM-06 — UI ADM-06 — Insiden & antrean pekerjaan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ADM-06 pada ``/admin/jobs``: Metadata aman, retry/cancel sesuai mandat dan status insiden.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ADM-06__insiden-antrean-pekerjaan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ADM-06__insiden-antrean-pekerjaan.png`.
- **Deliverable:** Komponen route atau state ADM-06, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ADM-06 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-ADM-07 — UI ADM-07 — Audit operasional

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen ADM-07 pada ``/admin/audit``: Tindakan aktor, waktu, alasan dan hasil; filter tanpa payload pribadi.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/ADM-07__audit-operasional.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/ADM-07__audit-operasional.png`.
- **Deliverable:** Komponen route atau state ADM-07, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot ADM-07 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-01 — UI SYS-01 — Ringkasan sistem

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-01 pada ``/system``: Health, kapasitas, insiden, kontrol yang memerlukan perhatian.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-01__ringkasan-sistem.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-01__ringkasan-sistem.png`.
- **Deliverable:** Komponen route atau state SYS-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-02 — UI SYS-02 — Integrasi & kredensial

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-02 pada ``/system/integrations``: Konfigurasi gateway/model, kapabilitas teruji, status, rotasi; secret tersamarkan.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-02__integrasi-kredensial.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-02__integrasi-kredensial.png`.
- **Deliverable:** Komponen route atau state SYS-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-03 — UI SYS-03 — Kuota & biaya

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-03 pada ``/system/quotas``: Per-user/global, soft/hard limit, penggunaan dan peringatan.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-03__kuota-biaya.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-03__kuota-biaya.png`.
- **Deliverable:** Komponen route atau state SYS-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-04 — UI SYS-04 — Feature flags

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-04 pada ``/system/flags``: Dampak fitur, rollout dan fallback, perubahan dengan audit.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-04__feature-flags.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-04__feature-flags.png`.
- **Deliverable:** Komponen route atau state SYS-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-05 — UI SYS-05 — Peran & akses

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-05 pada ``/system/roles``: User ↔ Admin, reauth, alasan, audit; tidak menyediakan promosi Superuser publik.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-05__peran-akses.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-05__peran-akses.png`.
- **Deliverable:** Komponen route atau state SYS-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-06 — UI SYS-06 — Kebijakan reminder

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-06 pada ``/system/reminders``: Antispam, batas global, quiet hours, emergency stop; opt-out pengguna dihormati.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-06__kebijakan-reminder.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-06__kebijakan-reminder.png`.
- **Deliverable:** Komponen route atau state SYS-06, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-06 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-07 — UI SYS-07 — Konten & kebijakan publik

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-07 pada ``/system/content``: FAQ, terms, privacy, changelog, versi dan publikasi terkendali.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-07__konten-kebijakan-publik.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-07__konten-kebijakan-publik.png`.
- **Deliverable:** Komponen route atau state SYS-07, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-07 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-08 — UI SYS-08 — Backup & pemulihan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-08 pada ``/system/backups``: Status backup, pengujian restore, ringkasan dampak dan alur otorisasi.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-08__backup-pemulihan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-08__backup-pemulihan.png`.
- **Deliverable:** Komponen route atau state SYS-08, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-08 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-09 — UI SYS-09 — Audit sensitif

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-09 pada ``/system/audit``: Role, konfigurasi, kuota, kredensial, kebijakan dan hasil tindakan.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-09__audit-sensitif.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-09__audit-sensitif.png`.
- **Deliverable:** Komponen route atau state SYS-09, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-09 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-10 — UI SYS-10 — Permintaan data

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-10 pada ``/system/data-requests``: Progres ekspor/hapus, tenggat dan pengecualian; tidak membuka isi ekspor.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-10__permintaan-data.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-10__permintaan-data.png`.
- **Deliverable:** Komponen route atau state SYS-10, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-10 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-SYS-11 — UI SYS-11 — Insiden & pengumuman

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen SYS-11 pada ``/system/incidents``: Dampak, banner, maintenance, mitigasi, pemulihan dan riwayat.
- **Dependensi:** `P4-004`, `P2-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/SYS-11__insiden-pengumuman.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/SYS-11__insiden-pengumuman.png`.
- **Deliverable:** Komponen route atau state SYS-11, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot SYS-11 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FLOW-01 — UI FLOW-01 — Catat angka cepat

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FLOW-01 pada ``/app/transactions/new``: Quick add nominal, kategori, dompet, tanggal; validasi & keyboard mobile.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FLOW-01__catat-angka-cepat.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FLOW-01__catat-angka-cepat.png`.
- **Deliverable:** Komponen route atau state FLOW-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FLOW-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FLOW-02 — UI FLOW-02 — Teks natural dan preview

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FLOW-02 pada ``/app/transactions/parse``: Teks natural menghasilkan beberapa usulan tanpa langsung post; dapat diedit.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FLOW-02__teks-natural-dan-preview.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FLOW-02__teks-natural-dan-preview.png`.
- **Deliverable:** Komponen route atau state FLOW-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FLOW-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FLOW-03 — UI FLOW-03 — Catat transfer

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FLOW-03 pada ``/app/wallets/transfer``: Transfer antar dompet preview dari-ke, bukan expense.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FLOW-03__catat-transfer.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FLOW-03__catat-transfer.png`.
- **Deliverable:** Komponen route atau state FLOW-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FLOW-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FLOW-04 — UI FLOW-04 — Split kategori

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FLOW-04 pada ``/app/transactions/:id/split``: Split kategori wajib jumlah sama nominal asli.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FLOW-04__split-kategori.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FLOW-04__split-kategori.png`.
- **Deliverable:** Komponen route atau state FLOW-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FLOW-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FLOW-05 — UI FLOW-05 — Atur anggaran periode

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FLOW-05 pada ``/app/budgets/edit``: Atur periode, kategori, limit dan rollover tanpa mengubah uang riil.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FLOW-05__atur-anggaran-periode.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FLOW-05__atur-anggaran-periode.png`.
- **Deliverable:** Komponen route atau state FLOW-05, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FLOW-05 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-FLOW-06 — UI FLOW-06 — Catat cicilan

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen FLOW-06 pada ``/app/debts/:id/pay``: Cicilan mengurangi utang dan saldo satu kali.
- **Dependensi:** `P4-004`, `P3-003`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/FLOW-06__catat-cicilan.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/FLOW-06__catat-cicilan.png`.
- **Deliverable:** Komponen route atau state FLOW-06, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot FLOW-06 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-STATE-01 — UI STATE-01 — Belum ada transaksi

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen STATE-01 pada ``state: /app/transactions empty``: Tanpa catatan, CTA buat transaksi/impor, tidak tampil angka palsu.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/STATE-01__belum-ada-transaksi.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/STATE-01__belum-ada-transaksi.png`.
- **Deliverable:** Komponen route atau state STATE-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot STATE-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-STATE-02 — UI STATE-02 — Upload gagal

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen STATE-02 pada ``state: /app/review/upload error``: Upload gagal, retry aman, draft tersimpan, manual tetap ada.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/STATE-02__upload-gagal.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/STATE-02__upload-gagal.png`.
- **Deliverable:** Komponen route atau state STATE-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot STATE-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-STATE-03 — UI STATE-03 — Kode whatsapp kedaluwarsa

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen STATE-03 pada ``state: WhatsApp pairing code expired``: Kode kedaluwarsa/scan ulang tanpa kehilangan link yang sah.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/STATE-03__kode-whatsapp-kedaluwarsa.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/STATE-03__kode-whatsapp-kedaluwarsa.png`.
- **Deliverable:** Komponen route atau state STATE-03, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot STATE-03 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-STATE-04 — UI STATE-04 — Lebih anggaran

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen STATE-04 pada ``state: /app/budgets overspend``: Budget negatif jelas, transaksi tetap boleh disimpan.
- **Dependensi:** `P4-004`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/STATE-04__lebih-anggaran.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/STATE-04__lebih-anggaran.png`.
- **Deliverable:** Komponen route atau state STATE-04, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot STATE-04 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-DARK-01 — UI DARK-01 — Beranda dark

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen DARK-01 pada ``variant: /app dark``: Dashboard dark merujuk color tokens dark, bukan route baru.
- **Dependensi:** `P4-005`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/DARK-01__beranda-dark.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/DARK-01__beranda-dark.png`.
- **Deliverable:** Komponen route atau state DARK-01, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot DARK-01 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P4-SCREEN-DARK-02 — UI DARK-02 — Review dark

- **Status awal:** `todo`; **tujuan tunggal:** Realisasikan screen DARK-02 pada ``variant: /app/review/:id dark``: Review dark, bukti/field terbaca, mempertahankan status.
- **Dependensi:** `P4-005`.
- **Rujukan:** [`DESIGN-01-SCREEN-MAP.md`](../design/DESIGN-01-SCREEN-MAP.md), [`DESIGN-02-COMPONENTS-STATES.md`](../design/DESIGN-02-COMPONENTS-STATES.md), `../reference-design/full/VenFinance_UIUX_ImageGen/screens/mobile/DARK-02__review-dark.png`, `../reference-design/full/VenFinance_UIUX_ImageGen/screens/web/DARK-02__review-dark.png`.
- **Deliverable:** Komponen route atau state DARK-02, sesuai gambar mobile/web, bukan gambar statis yang digunakan sebagai seluruh interface.
- **Verifikasi minimal:** Visual diff mobile+web dari screenshot DARK-02 asli; route/state hidup, role gate valid, keyboard, focus, skeleton/empty/error, dark/ID-EN; uji viewport 360/390/768/1024/1440/1920. **Lulus UI belum berarti lulus integrasi fitur P7/P8/P9.**
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

