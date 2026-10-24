# TASKS-P7 — GOWA shared bot, personal sessions and reminders

**Status semua task:** `todo`. File ini spesifikasi pekerjaan, bukan bukti implementasi.

Untuk tugas dengan beberapa dependensi, seluruh ID harus sudah **done dan terbukti** sebelum task ini dapat ditandai selesai.
Jika sumber gambar asli tidak tersedia, UI task tidak boleh dianggap lulus QA visual. Jika external release gate tidak lulus, jangan menerobosnya.

### P7-001 — GOWA typed adapter pinned API

- **Status awal:** `todo`; **tujuan tunggal:** Build internal authorized device API adapter and contract tests
- **Dependensi:** `P6-004`, `P0-003`.
- **Rujukan:** [`TRD-03-INTEGRATIONS-JOBS.md`](../architecture/TRD-03-INTEGRATIONS-JOBS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** QR, pairing code, status, reconnect, logout, delete validate versioned API.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-002 — WhatsApp account linking ownership

- **Status awal:** `todo`; **tujuan tunggal:** Verified phone/device owner relation with one active ownership invariant
- **Dependensi:** `P7-001`, `P2-003`.
- **Rujukan:** [`TRD-01-DATA-MODEL.md`](../architecture/TRD-01-DATA-MODEL.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** User A cannot manage device B by spoofing ID.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-003 — WhatsApp inbox parser and receipts

- **Status awal:** `todo`; **tujuan tunggal:** Parse known commands, persist candidate, send idempotent delivery receipt
- **Dependensi:** `P7-002`, `P6-004`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Mixed messages + replay = one update, never raw chat exposed to admin.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-004 — WhatsApp outbound consent guard

- **Status awal:** `todo`; **tujuan tunggal:** STOP/start, quiet hours, opt-in and rate cap before every send
- **Dependensi:** `P7-002`, `P6-005`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** STOP immediately suppresses all optional reminders.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-001 — Pilihan WhatsApp opsional pada onboarding & pengaturan

- **Status awal:** `todo`; **tujuan tunggal:** Pilihan WhatsApp opsional pada onboarding & pengaturan. Perilaku persis mengikuti WA-001 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-001), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pilihan WhatsApp opsional pada onboarding & pengaturan" dari WA-001; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-001-A dan AC-WA-001-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pilihan WhatsApp opsional pada onboarding & pengaturan.", **maka** User bisa memakai PWA tanpa koneksi WhatsApp; menautkan memerlukan persetujuan. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-002 — Mode bot bersama dengan verifikasi kepemilikan nomor

- **Status awal:** `todo`; **tujuan tunggal:** Mode bot bersama dengan verifikasi kepemilikan nomor. Perilaku persis mengikuti WA-002 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-002), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Mode bot bersama dengan verifikasi kepemilikan nomor" dari WA-002; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-002-A dan AC-WA-002-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Mode bot bersama dengan verifikasi kepemilikan nomor.", **maka** Chat dari nomor tidak terverifikasi tidak otomatis dikaitkan ke akun tertentu. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-003 — Sesi pribadi per user, multi-device pada satu GOWA

- **Status awal:** `todo`; **tujuan tunggal:** Sesi pribadi per user, multi-device pada satu GOWA. Perilaku persis mengikuti WA-003 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-003), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Sesi pribadi per user, multi-device pada satu GOWA" dari WA-003; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-003-A dan AC-WA-003-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Sesi pribadi per user, multi-device pada satu GOWA.", **maka** Pemetaan user ↔ session/device unik; akses ke session orang lain tidak pernah diizinkan. Negative/boundary: Saat user A menebak ID device user B, status, login QR, logout, dan delete semua ditolak; tidak ada bocoran nomor/detail sesi B. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-004-01 — QR pairing dari PWA

- **Status awal:** `todo`; **tujuan tunggal:** QR pairing dari PWA. Perilaku persis mengikuti WA-004 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "QR pairing dari PWA" dari WA-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-004-A dan AC-WA-004-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Membuat slot dan QR/pairing code dari PWA.", **maka** Pengguna melihat petunjuk WhatsApp, status masa berlaku kode, dan feedback keberhasilan/kegagalan. Negative/boundary: Pairing code bisa diminta dari HP yang sama, menampilkan countdown, kedaluwarsa tidak dipakai; QR hanya dipakai pada perangkat lain. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-004-02 — Kode pairing dari PWA di perangkat yang sama

- **Status awal:** `todo`; **tujuan tunggal:** Kode pairing dari PWA di perangkat yang sama. Perilaku persis mengikuti WA-004 (bukan ilustrasi statis).
- **Dependensi:** `P7-WA-004-01`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-004), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Kode pairing dari PWA di perangkat yang sama" dari WA-004; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-004-A dan AC-WA-004-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Membuat slot dan QR/pairing code dari PWA.", **maka** Pengguna melihat petunjuk WhatsApp, status masa berlaku kode, dan feedback keberhasilan/kegagalan. Negative/boundary: Pairing code bisa diminta dari HP yang sama, menampilkan countdown, kedaluwarsa tidak dipakai; QR hanya dipakai pada perangkat lain. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-005 — Status sesi: belum terhubung, pairing, connected, disconnected, reconnecting, memerlukan login ulang, error

- **Status awal:** `todo`; **tujuan tunggal:** Status sesi: belum terhubung, pairing, connected, disconnected, reconnecting, memerlukan login ulang, error. Perilaku persis mengikuti WA-005 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-005), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Status sesi: belum terhubung, pairing, connected, disconnected, reconnecting, memerlukan login ulang, error" dari WA-005; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-005-A dan AC-WA-005-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Status sesi: belum terhubung, pairing, connected, disconnected, reconnecting, memerlukan login ulang, error.", **maka** State di PWA berubah setelah server memverifikasi keadaan terkini, bukan hanya klik tombol. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-006 — Reconnect sesi terputus dan login ulang saat session invalid

- **Status awal:** `todo`; **tujuan tunggal:** Reconnect sesi terputus dan login ulang saat session invalid. Perilaku persis mengikuti WA-006 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-006), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Reconnect sesi terputus dan login ulang saat session invalid" dari WA-006; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-006-A dan AC-WA-006-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Reconnect sesi terputus dan login ulang saat session invalid.", **maka** Retriable error tidak memaksa logout; pengguna mendapat tindakan selanjutnya. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-007-01 — Logout tanpa kehilangan slot

- **Status awal:** `todo`; **tujuan tunggal:** Logout tanpa kehilangan slot. Perilaku persis mengikuti WA-007 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Logout tanpa kehilangan slot" dari WA-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-007-A dan AC-WA-007-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Logout WA tanpa menghapus slot, dan hapus slot/sesi permanen.", **maka** Dua tindakan berbeda, keduanya bisa dari PWA; konfirmasi efek terhadap pengingat. Negative/boundary: Logout menyisakan slot, delete menghilangkan slot; ledger Neon dan lampiran transaksi tetap tersimpan setelah keduanya. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-007-02 — Hapus slot dan data sesi GOWA setelah konfirmasi

- **Status awal:** `todo`; **tujuan tunggal:** Hapus slot dan data sesi GOWA setelah konfirmasi. Perilaku persis mengikuti WA-007 (bukan ilustrasi statis).
- **Dependensi:** `P7-WA-007-01`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Hapus slot dan data sesi GOWA setelah konfirmasi" dari WA-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-007-A dan AC-WA-007-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Logout WA tanpa menghapus slot, dan hapus slot/sesi permanen.", **maka** Dua tindakan berbeda, keduanya bisa dari PWA; konfirmasi efek terhadap pengingat. Negative/boundary: Logout menyisakan slot, delete menghilangkan slot; ledger Neon dan lampiran transaksi tetap tersimpan setelah keduanya. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-008 — Pengguna dapat menonaktifkan sinkronisasi WA, mencabut izin, atau melepas nomor

- **Status awal:** `todo`; **tujuan tunggal:** Pengguna dapat menonaktifkan sinkronisasi WA, mencabut izin, atau melepas nomor. Perilaku persis mengikuti WA-008 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-008), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengguna dapat menonaktifkan sinkronisasi WA, mencabut izin, atau melepas nomor" dari WA-008; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-008-A dan AC-WA-008-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengguna dapat menonaktifkan sinkronisasi WA, mencabut izin, atau melepas nomor.", **maka** Penghentian pemrosesan dan pengiriman berlangsung sesuai kebijakan; histori ledger tetap aman. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-009 — Input pesan teks natural, contohnya 'lauk 10k bensin 20k'

- **Status awal:** `todo`; **tujuan tunggal:** Input pesan teks natural, contohnya 'lauk 10k bensin 20k'. Perilaku persis mengikuti WA-009 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-009), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Input pesan teks natural, contohnya 'lauk 10k bensin 20k'" dari WA-009; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-009-A dan AC-WA-009-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Input pesan teks natural, contohnya 'lauk 10k bensin 20k'.", **maka** Diparsing menjadi draft yang dipetakan ke akun pengirim terverifikasi, dengan konfirmasi bila ambigu. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-010 — Input foto/SS/struk dari pesan WA

- **Status awal:** `todo`; **tujuan tunggal:** Input foto/SS/struk dari pesan WA. Perilaku persis mengikuti WA-010 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-010), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Input foto/SS/struk dari pesan WA" dari WA-010; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-010-A dan AC-WA-010-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Input foto/SS/struk dari pesan WA.", **maka** Bukti diteruskan ke AI/OCR hanya jika consent masih aktif; status dapat dibalas. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-011 — Balasan bukti pencatatan, rincian, kategori, budget tersisa, dan kontrol koreksi

- **Status awal:** `todo`; **tujuan tunggal:** Balasan bukti pencatatan, rincian, kategori, budget tersisa, dan kontrol koreksi. Perilaku persis mengikuti WA-011 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-011), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Balasan bukti pencatatan, rincian, kategori, budget tersisa, dan kontrol koreksi" dari WA-011; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-011-A dan AC-WA-011-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Balasan bukti pencatatan, rincian, kategori, budget tersisa, dan kontrol koreksi.", **maka** Balasan memuat cukup konteks; data sensitif diminimalkan sesuai pengaturan privasi. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-012-01 — Perintah informasi saldo/budget/periode

- **Status awal:** `todo`; **tujuan tunggal:** Perintah informasi saldo/budget/periode. Perilaku persis mengikuti WA-012 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Perintah informasi saldo/budget/periode" dari WA-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-012-A dan AC-WA-012-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Perintah chat singkat: `saldo`, `budget`, `hari ini`, `minggu ini`, `bantuan`, `batal`, `nihil`, `selesai`, `STOP`, `MULAI`.", **maka** Perintah bisa dipahami dengan variasi bahasa wajar; `STOP` langsung dihormati. Negative/boundary: Perintah STOP menghentikan pengingat non-keamanan dan membalas konfirmasi sekali; MULAI hanya aktif setelah opt-in kembali. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-012-02 — Perintah STOP,MULAI,batal,selesai,nihil

- **Status awal:** `todo`; **tujuan tunggal:** Perintah STOP,MULAI,batal,selesai,nihil. Perilaku persis mengikuti WA-012 (bukan ilustrasi statis).
- **Dependensi:** `P7-WA-012-01`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-012), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Perintah STOP,MULAI,batal,selesai,nihil" dari WA-012; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-012-A dan AC-WA-012-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Perintah chat singkat: `saldo`, `budget`, `hari ini`, `minggu ini`, `bantuan`, `batal`, `nihil`, `selesai`, `STOP`, `MULAI`.", **maka** Perintah bisa dipahami dengan variasi bahasa wajar; `STOP` langsung dihormati. Negative/boundary: Perintah STOP menghentikan pengingat non-keamanan dan membalas konfirmasi sekali; MULAI hanya aktif setelah opt-in kembali. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-013-01 — Pilih waktu dan zona waktu

- **Status awal:** `todo`; **tujuan tunggal:** Pilih waktu dan zona waktu. Perilaku persis mengikuti WA-013 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pilih waktu dan zona waktu" dari WA-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-013-A dan AC-WA-013-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengingat harian berdasarkan timezone dan keadaan pencatatan.", **maka** Tidak mengirim reminder identik berkali-kali atau menandai hari kosong sebagai nol otomatis. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-013-02 — Reminder kondisional tanpa spam

- **Status awal:** `todo`; **tujuan tunggal:** Reminder kondisional tanpa spam. Perilaku persis mengikuti WA-013 (bukan ilustrasi statis).
- **Dependensi:** `P7-WA-013-01`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-013), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Reminder kondisional tanpa spam" dari WA-013; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-013-A dan AC-WA-013-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengingat harian berdasarkan timezone dan keadaan pencatatan.", **maka** Tidak mengirim reminder identik berkali-kali atau menandai hari kosong sebagai nol otomatis. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-014 — Pengingat tagihan, budget hampir habis, dan status pending hanya sesuai opt-in

- **Status awal:** `todo`; **tujuan tunggal:** Pengingat tagihan, budget hampir habis, dan status pending hanya sesuai opt-in. Perilaku persis mengikuti WA-014 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-014), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengingat tagihan, budget hampir habis, dan status pending hanya sesuai opt-in" dari WA-014; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-014-A dan AC-WA-014-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengingat tagihan, budget hampir habis, dan status pending hanya sesuai opt-in.", **maka** Quiet hours, frekuensi, dan template dapat diatur. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-015-01 — Verifikasi tanda tangan dan pengirim

- **Status awal:** `todo`; **tujuan tunggal:** Verifikasi tanda tangan dan pengirim. Perilaku persis mengikuti WA-015 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Verifikasi tanda tangan dan pengirim" dari WA-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-015-A dan AC-WA-015-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Proses webhook aman, idempotent, dan multi-device aware.", **maka** Event dari GOWA diverifikasi, memiliki asal device/message; replay tidak membuat transaksi dobel. Negative/boundary: Kirim webhook message_id sama tiga kali dan satu kali dalam urutan tertukar: user mendapat tepat satu draft/transaksi yang benar. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-015-02 — Dedup webhook/replay multi-device

- **Status awal:** `todo`; **tujuan tunggal:** Dedup webhook/replay multi-device. Perilaku persis mengikuti WA-015 (bukan ilustrasi statis).
- **Dependensi:** `P7-WA-015-01`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-015), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Dedup webhook/replay multi-device" dari WA-015; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-015-A dan AC-WA-015-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Proses webhook aman, idempotent, dan multi-device aware.", **maka** Event dari GOWA diverifikasi, memiliki asal device/message; replay tidak membuat transaksi dobel. Negative/boundary: Kirim webhook message_id sama tiga kali dan satu kali dalam urutan tertukar: user mendapat tepat satu draft/transaksi yang benar. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-016 — Batas anti-spam dan kontrol kirim pesan platform

- **Status awal:** `todo`; **tujuan tunggal:** Batas anti-spam dan kontrol kirim pesan platform. Perilaku persis mengikuti WA-016 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-016), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Batas anti-spam dan kontrol kirim pesan platform" dari WA-016; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-016-A dan AC-WA-016-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Batas anti-spam dan kontrol kirim pesan platform.", **maka** Quota per user, global, per session, rate limit & emergency stop. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-017 — Mode degradasi ketika WA/GOWA/tunnel mati

- **Status awal:** `todo`; **tujuan tunggal:** Mode degradasi ketika WA/GOWA/tunnel mati. Perilaku persis mengikuti WA-017 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-017), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Mode degradasi ketika WA/GOWA/tunnel mati" dari WA-017; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-017-A dan AC-WA-017-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Mode degradasi ketika WA/GOWA/tunnel mati.", **maka** PWA menunjukkan gangguan, transaksi manual tetap tersedia, antrean tidak hilang. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-018 — Permintaan bantuan tanpa memberikan isi chat pribadi ke admin

- **Status awal:** `todo`; **tujuan tunggal:** Permintaan bantuan tanpa memberikan isi chat pribadi ke admin. Perilaku persis mengikuti WA-018 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-018), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Permintaan bantuan tanpa memberikan isi chat pribadi ke admin" dari WA-018; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-018-A dan AC-WA-018-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Permintaan bantuan tanpa memberikan isi chat pribadi ke admin.", **maka** Pengguna hanya membagikan laporan relevan secara eksplisit. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-019 — Audit tindakan sesi sendiri dan aktivitas keamanan

- **Status awal:** `todo`; **tujuan tunggal:** Audit tindakan sesi sendiri dan aktivitas keamanan. Perilaku persis mengikuti WA-019 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-019), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Audit tindakan sesi sendiri dan aktivitas keamanan" dari WA-019; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-019-A dan AC-WA-019-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Audit tindakan sesi sendiri dan aktivitas keamanan.", **maka** Timestamp create, pairing, reconnect, logout, delete, stop/enable reminder; tanpa isi chat default. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-WA-020 — Pengelolaan kapasitas sesi multiuser

- **Status awal:** `todo`; **tujuan tunggal:** Pengelolaan kapasitas sesi multiuser. Perilaku persis mengikuti WA-020 (bukan ilustrasi statis).
- **Dependensi:** `P7-002`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md#wa-020), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Pengelolaan kapasitas sesi multiuser" dari WA-020; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-WA-020-A dan AC-WA-020-B yang relevan: **Diberikan** pengguna telah memilih mode WhatsApp dan memberikan izin yang diperlukan, **ketika** pengguna menjalankan kemampuan "Pengelolaan kapasitas sesi multiuser.", **maka** Maksimum sesi aktif ditentukan dari bench/resource Armbian dan kuota platform; perubahan bisa diatur Superuser. Negative/boundary: Tidak ada tindakan lintas-sesi, pengiriman tanpa opt-in, penyimpanan percakapan tak diizinkan, atau pemrosesan berulang untuk pesan yang sama. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-TRUST-007 — Akses hanya ke konten WA yang dipilih/diizinkan pengguna

- **Status awal:** `todo`; **tujuan tunggal:** Akses hanya ke konten WA yang dipilih/diizinkan pengguna. Perilaku persis mengikuti TRUST-007 (bukan ilustrasi statis).
- **Dependensi:** `P7-003`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-007), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Akses hanya ke konten WA yang dipilih/diizinkan pengguna" dari TRUST-007; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-007-A dan AC-TRUST-007-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Akses hanya ke konten WA yang dipilih/diizinkan pengguna.", **maka** Tidak ada ekspor chat/contacts/grup WA untuk tujuan pencatatan keuangan. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-TRUST-020 — Dokumentasi dan kendali keselamatan integrasi WhatsApp tidak resmi

- **Status awal:** `todo`; **tujuan tunggal:** Dokumentasi dan kendali keselamatan integrasi WhatsApp tidak resmi. Perilaku persis mengikuti TRUST-020 (bukan ilustrasi statis).
- **Dependensi:** `P7-003`.
- **Rujukan:** [`REQ-07-TRUST.md`](../requirements/REQ-07-TRUST.md#trust-020), [`PRD-00-INDEX.md`](../docs/prd/PRD-00-INDEX.md).
- **Deliverable:** Implementasi terfokus dan tes untuk bagian "Dokumentasi dan kendali keselamatan integrasi WhatsApp tidak resmi" dari TRUST-020; tidak boleh dummy success. [Bukti AC dan hasil tes wajib]
- **Verifikasi minimal:** Buktikan AC-TRUST-020-A dan AC-TRUST-020-B yang relevan: **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Dokumentasi dan kendali keselamatan integrasi WhatsApp tidak resmi.", **maka** Sebelum publik ada risk assessment terkait aturan WA, sesi, kebocoran, dan alternatif. Negative/boundary: Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default. Tes dua tenant + retry/idempotency jika operasi menyentuh data pengguna.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-005 — Connect PWA WhatsApp settings to GOWA API

- **Status awal:** `todo`; **tujuan tunggal:** Wire SET-05/06/07/08 to real authorized gateway bridge, scoped device ownership
- **Dependensi:** `P7-001`, `P7-002`, `P4-SCREEN-SET-07`.
- **Rujukan:** [`TRD-02-API-CONTRACTS.md`](../architecture/TRD-02-API-CONTRACTS.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** Pairing, status, reconnect, logout/delete from app, no exposed credentials.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

### P7-006 — Verify multiple WhatsApp sessions isolation

- **Status awal:** `todo`; **tujuan tunggal:** Run two linked user sessions with crash, reconnect and forged ID attempts
- **Dependensi:** `P7-005`, `P7-004`.
- **Rujukan:** [`REQ-04-WHATSAPP.md`](../requirements/REQ-04-WHATSAPP.md).
- **Deliverable:** Kode, test, dan bukti yang spesifik pada tujuan task; tidak boleh hanya UI statis.
- **Verifikasi minimal:** No cross user messages/actions, worker health healthy after reconnect.
- **Evidence saat selesai:** commit/file yang berubah, nama tes, perintah yang benar-benar dijalankan, stdout/exit code, screenshot bila UI, dan catatan keamanan/konflik.

