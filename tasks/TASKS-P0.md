# TASKS-P0 — Feasibility, architecture proof and external launch gates

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P0-001 — Bekukan daftar keputusan dan blocker

- **Status awal:** `todo`; **tujuan tunggal:** Buat decision register terkonfirmasi terhadap PRD, tanpa memutuskan hal baru secara diam-diam
- **Dependensi:** Tidak ada.
- **Rujukan:** [`DECISION-LOG.md`](../research/DECISION-LOG.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** 14 DEC terdaftar dan semua blocker punya owner/status.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P0-002 — Audit perangkat Armbian

- **Status awal:** `todo`; **tujuan tunggal:** Ukur arsitektur ARM64, memori, CPU, storage, uptime dan resource GOWA/9router
- **Dependensi:** `P0-001`.
- **Rujukan:** [`TRD-05-DEPLOY-OPERATIONS.md`](../architecture/TRD-05-DEPLOY-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Log benchmark dan nilai baseline yang dapat direproduksi.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P0-003 — Validasi kemampuan GOWA pinned build

- **Status awal:** `todo`; **tujuan tunggal:** Uji API list/device/QR/pairing/status/logout/delete dan webhook pada sesi milik sendiri
- **Dependensi:** `P0-002`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Contract test dua test-device; bukti API dan restart, tanpa memakai chat orang lain.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.
- **External gate:** `G-GOWA-API`; jika belum diverifikasi, tandai blocked, bukan done.

### P0-004 — Validasi 9router menerima gambar

- **Status awal:** `todo`; **tujuan tunggal:** Kirim bukti transaksi uji yang belum dilihat model, lalu periksa output nominal terhadap ground truth
- **Dependensi:** `P0-002`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Output vision nyata, bukti gambar forwarded, kemampuan fallback dan model ID.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.
- **External gate:** `G-9ROUTER-VISION`; jika belum diverifikasi, tandai blocked, bukan done.

### P0-005 — Uji Neon Auth + RLS Cloudflare Worker

- **Status awal:** `todo`; **tujuan tunggal:** Coba register/verifikasi/reset/sesi JWT/RLS melalui Worker disposable tanpa melemahkan isolasi
- **Dependensi:** `P0-001`.
- **Rujukan:** [`TRD-04-SECURITY.md`](../architecture/TRD-04-SECURITY.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** PoC user A/B, session revoke, role JWT + akses data ditolak; dokumentasi masalah.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.
- **External gate:** `G-IDENTITY`; jika belum diverifikasi, tandai blocked, bukan done.

### P0-006 — Periksa deliverability email produksi

- **Status awal:** `todo`; **tujuan tunggal:** Pastikan pendaftaran, reset, OTP, email transactional dan biaya tanpa mengasumsikan gratis permanen
- **Dependensi:** `P0-005`.
- **Rujukan:** [`DECISION-LOG.md`](../research/DECISION-LOG.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Bukti end-to-end inbox nyata, rate limits, DKIM/SPF dan keputusan fallback.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.
- **External gate:** `G-EMAIL`; jika belum diverifikasi, tandai blocked, bukan done.

### P0-007 — Uji CF Access service-token + tunnel

- **Status awal:** `todo`; **tujuan tunggal:** Buat smoke test rute private dari Worker ke Armbian via Access (tanpa mengekspose kredensial)
- **Dependensi:** `P0-002`.
- **Rujukan:** [`TRD-05-DEPLOY-OPERATIONS.md`](../architecture/TRD-05-DEPLOY-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** 401/403 unauthenticated dan token salah, sukses token valid, pencegahan replay, serta **uji negative bypass Cloudflare Tunnel/Access**: path GOWA biasa tidak bisa mengakses `/internal/v1/*` termasuk encoded slash, dot-segment, alternate case, redirect, dan canonicalization path. Dokumentasikan observed routing serta policies. Sebelum lolos, endpoint internal tidak boleh dianggap aman.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.
- **External gate:** `G-INFRA`; jika belum diverifikasi, tandai blocked, bukan done.

### P0-008 — Uji R2 private dan Neon quota

- **Status awal:** `todo`; **tujuan tunggal:** Verifikasi binding private R2, signed access, Neon quota dan notifikasi batas pemakaian
- **Dependensi:** `P0-001`.
- **Rujukan:** [`TRD-05-DEPLOY-OPERATIONS.md`](../architecture/TRD-05-DEPLOY-OPERATIONS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Bukti API tenant scoped, limit, matriks biaya aktual.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.
- **External gate:** `G-COST`; jika belum diverifikasi, tandai blocked, bukan done.

### P0-009 — Evaluasi privasi/compliance WhatsApp

- **Status awal:** `todo`; **tujuan tunggal:** Catat batas pemrosesan chat, hak data, persetujuan dan keputusan GO/NO-GO publik
- **Dependensi:** `P0-003`.
- **Rujukan:** [`DECISION-LOG.md`](../research/DECISION-LOG.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Keputusan tertulis owner, bukan hanya tersedia endpoint.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.
- **External gate:** `G-WHATSAPP-POLICY`; jika belum diverifikasi, tandai blocked, bukan done.

### P0-010 — Audit asset visual 180 screenshot

- **Status awal:** `todo`; **tujuan tunggal:** Periksa manifest 90x2, fonts licenses, aset, dan catat deviasi sumber
- **Dependensi:** `P0-001`.
- **Rujukan:** [`DESIGN-04-ASSETS-AUDIT.md`](../design/DESIGN-04-ASSETS-AUDIT.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Manifest 180 SHA diverifikasi; licensi aset non-brand dicatat.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.
- **External gate:** `G-VISUAL`; jika belum diverifikasi, tandai blocked, bukan done.

