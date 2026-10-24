# REQ-07-TRUST — User Stories & Acceptance Criteria

**PRD dasar:** [`PRD-08-PRIVACY-SECURITY.md`](../docs/prd/PRD-08-PRIVACY-SECURITY.md).

**Interpretasi:** AC-A adalah observasi dasar untuk satu ID; AC-B adalah skenario batas/negatif (bila berlaku). Semua kasus rinci wajib juga lolos [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md).

Tabel/entri di bawah mengikat ID persyaratan sumber. Apabila visual mockup berbeda dari hasil test ini, perilaku mengikuti requirement dan keputusan produk, bukan angka raster pada gambar.

## TRUST: Acceptance per requirement

<a id="trust-001"></a>

### TRUST-001 — Pemisahan tenant/user pada semua catatan, object storage, job AI dan WA.

- **US-TRUST-001:** Sebagai pemilik data atau pengelola yang sah, saya ingin pemisahan tenant/user pada semua catatan, object storage, job AI dan WA, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-001-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Pemisahan tenant/user pada semua catatan, object storage, job AI dan WA.", **maka** Akses lintas pemilik ditolak pada server dan lapisan data.
- **AC-TRUST-001-B (batas):** A mengakses ID transaksi atau object R2 B → selalu ditolak, termasuk ketika file URL lama atau role operator dipakai.

<a id="trust-002"></a>

### TRUST-002 — Pengelolaan identitas dan RBAC default-deny.

- **US-TRUST-002:** Sebagai pemilik data atau pengelola yang sah, saya ingin pengelolaan identitas dan RBAC default-deny, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-002-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Pengelolaan identitas dan RBAC default-deny.", **maka** Privilege platform tidak memberi akses otomatis ke ledger personal.
- **AC-TRUST-002-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-003"></a>

### TRUST-003 — R2 storage private; file hanya tersedia kepada pemilik dengan autorisasi dan masa akses terbatas.

- **US-TRUST-003:** Sebagai pemilik data atau pengelola yang sah, saya ingin r2 storage private; file hanya tersedia kepada pemilik dengan autorisasi dan masa akses terbatas, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-003-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "R2 storage private; file hanya tersedia kepada pemilik dengan autorisasi dan masa akses terbatas.", **maka** Tidak ada bucket public untuk struk atau QR pribadi.
- **AC-TRUST-003-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-004"></a>

### TRUST-004 — Secret server-only untuk GOWA, 9router, Neon dan Cloudflare Access.

- **US-TRUST-004:** Sebagai pemilik data atau pengelola yang sah, saya ingin secret server-only untuk GOWA, 9router, Neon dan Cloudflare Access, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-004-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Secret server-only untuk GOWA, 9router, Neon dan Cloudflare Access.", **maka** API key/token tidak dimasukkan ke PWA, URL publik, log, atau repository.
- **AC-TRUST-004-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-005"></a>

### TRUST-005 — Semua komunikasi internet dengan HTTPS dan autentikasi server-to-server.

- **US-TRUST-005:** Sebagai pemilik data atau pengelola yang sah, saya ingin semua komunikasi internet dengan HTTPS dan autentikasi server-to-server, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-005-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Semua komunikasi internet dengan HTTPS dan autentikasi server-to-server.", **maka** Tunnel bukan pengganti kontrol akses aplikasi.
- **AC-TRUST-005-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-006"></a>

### TRUST-006 — Consent terpisah untuk koneksi WhatsApp, reminder, unggah bukti, dan pengiriman data ke provider Vision upstream.

- **US-TRUST-006:** Sebagai pemilik data atau pengelola yang sah, saya ingin consent terpisah untuk koneksi WhatsApp, reminder, unggah bukti, dan pengiriman data ke provider Vision upstream, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-006-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Consent terpisah untuk koneksi WhatsApp, reminder, unggah bukti, dan pengiriman data ke provider Vision upstream.", **maka** User dapat menolak tiap modul tanpa kehilangan pencatatan manual.
- **AC-TRUST-006-B (batas):** Cabut consent AI saat job pending mencegah pemrosesan berikutnya dan membatalkan antrean yang masih dapat dibatalkan.

<a id="trust-007"></a>

### TRUST-007 — Akses hanya ke konten WA yang dipilih/diizinkan pengguna.

- **US-TRUST-007:** Sebagai pemilik data atau pengelola yang sah, saya ingin akses hanya ke konten WA yang dipilih/diizinkan pengguna, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-007-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Akses hanya ke konten WA yang dipilih/diizinkan pengguna.", **maka** Tidak ada ekspor chat/contacts/grup WA untuk tujuan pencatatan keuangan.
- **AC-TRUST-007-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-008"></a>

### TRUST-008 — Transparansi vendor/subprocessor dan perubahan tujuan pemrosesan.

- **US-TRUST-008:** Sebagai pemilik data atau pengelola yang sah, saya ingin transparansi vendor/subprocessor dan perubahan tujuan pemrosesan, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-008-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Transparansi vendor/subprocessor dan perubahan tujuan pemrosesan.", **maka** User mendapat penjelasan bahwa 9router dapat meneruskan gambar ke provider upstream.
- **AC-TRUST-008-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-009"></a>

### TRUST-009 — Data minimization & retention.

- **US-TRUST-009:** Sebagai pemilik data atau pengelola yang sah, saya ingin data minimization & retention, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-009-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Data minimization & retention.", **maka** Hanya simpan field yang dibutuhkan; ada masa retensi dan penghapusan file bukti/log.
- **AC-TRUST-009-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-010"></a>

### TRUST-010 — Hak melihat, koreksi, unduh, portabilitas, hapus, dan tarik izin.

- **US-TRUST-010:** Sebagai pemilik data atau pengelola yang sah, saya ingin hak melihat, koreksi, unduh, portabilitas, hapus, dan tarik izin, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-010-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Hak melihat, koreksi, unduh, portabilitas, hapus, dan tarik izin.", **maka** Permintaan mandiri tersedia di PWA, dengan status pemrosesan.
- **AC-TRUST-010-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-011"></a>

### TRUST-011 — Keamanan autentikasi, MFA admin, revocation session, dan catatan login.

- **US-TRUST-011:** Sebagai pemilik data atau pengelola yang sah, saya ingin keamanan autentikasi, MFA admin, revocation session, dan catatan login, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-011-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Keamanan autentikasi, MFA admin, revocation session, dan catatan login.", **maka** Penyerang tidak bisa memulihkan akun hanya dari nomor WA.
- **AC-TRUST-011-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-012"></a>

### TRUST-012 — Anti-enumeration, rate limit, upload validation, bot protection.

- **US-TRUST-012:** Sebagai pemilik data atau pengelola yang sah, saya ingin anti-enumeration, rate limit, upload validation, bot protection, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-012-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Anti-enumeration, rate limit, upload validation, bot protection.", **maka** Daftar publik tidak menjadi saluran spam/penyebaran malware.
- **AC-TRUST-012-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-013"></a>

### TRUST-013 — Audit trail keuangan dan akses administratif minim PII.

- **US-TRUST-013:** Sebagai pemilik data atau pengelola yang sah, saya ingin audit trail keuangan dan akses administratif minim PII, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-013-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Audit trail keuangan dan akses administratif minim PII.", **maka** Setiap perubahan nominal/izin/status memiliki provenance dan user-facing history.
- **AC-TRUST-013-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-014"></a>

### TRUST-014 — Backup & restore terenkripsi, diuji, dan mengikuti lifecycle penghapusan.

- **US-TRUST-014:** Sebagai pemilik data atau pengelola yang sah, saya ingin backup & restore terenkripsi, diuji, dan mengikuti lifecycle penghapusan, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-014-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Backup & restore terenkripsi, diuji, dan mengikuti lifecycle penghapusan.", **maka** Recovery tidak menghidupkan kembali data user terhapus secara tidak sah.
- **AC-TRUST-014-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-015"></a>

### TRUST-015 — Prosedur insiden: klasifikasi, investigasi, mitigasi, pencabutan kunci, pemberitahuan bila diwajibkan hukum.

- **US-TRUST-015:** Sebagai pemilik data atau pengelola yang sah, saya ingin prosedur insiden: klasifikasi, investigasi, mitigasi, pencabutan kunci, pemberitahuan bila diwajibkan hukum, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-015-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Prosedur insiden: klasifikasi, investigasi, mitigasi, pencabutan kunci, pemberitahuan bila diwajibkan hukum.", **maka** Tim/operator punya tindakan jelas tanpa menyembunyikan masalah kritis.
- **AC-TRUST-015-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-016"></a>

### TRUST-016 — Kebijakan usia dan penggunaan bertanggung jawab.

- **US-TRUST-016:** Sebagai pemilik data atau pengelola yang sah, saya ingin kebijakan usia dan penggunaan bertanggung jawab, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-016-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Kebijakan usia dan penggunaan bertanggung jawab.", **maka** Pendaftaran anak/minor dievaluasi secara hukum sebelum aktivasi publik.
- **AC-TRUST-016-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-017"></a>

### TRUST-017 — Anti prompt injection dan konten tidak tepercaya.

- **US-TRUST-017:** Sebagai pemilik data atau pengelola yang sah, saya ingin anti prompt injection dan konten tidak tepercaya, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-017-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Anti prompt injection dan konten tidak tepercaya.", **maka** Teks gambar/chat tidak dapat memerintah perubahan role atau mengambil data user lain.
- **AC-TRUST-017-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-018"></a>

### TRUST-018 — Proteksi privasi offline cache/perangkat bersama.

- **US-TRUST-018:** Sebagai pemilik data atau pengelola yang sah, saya ingin proteksi privasi offline cache/perangkat bersama, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-018-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Proteksi privasi offline cache/perangkat bersama.", **maka** Logout/ganti akun membersihkan data pribadi user sebelumnya dari tampilan/caches yang relevan.
- **AC-TRUST-018-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-019"></a>

### TRUST-019 — Data keuangan tidak digunakan untuk periklanan atau training AI tanpa dasar/izin spesifik terpisah.

- **US-TRUST-019:** Sebagai pemilik data atau pengelola yang sah, saya ingin data keuangan tidak digunakan untuk periklanan atau training AI tanpa dasar/izin spesifik terpisah, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-019-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Data keuangan tidak digunakan untuk periklanan atau training AI tanpa dasar/izin spesifik terpisah.", **maka** Tidak ada iklan tertarget memakai struk/saldo/riwayat transaksi.
- **AC-TRUST-019-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

<a id="trust-020"></a>

### TRUST-020 — Dokumentasi dan kendali keselamatan integrasi WhatsApp tidak resmi.

- **US-TRUST-020:** Sebagai pemilik data atau pengelola yang sah, saya ingin dokumentasi dan kendali keselamatan integrasi WhatsApp tidak resmi, agar privasi dan hak atas data tetap terjaga.
- **AC-TRUST-020-A (G/W/T):** **Diberikan** pengguna atau operator memulai tindakan yang memproses data pribadi, **ketika** pengguna menjalankan kemampuan "Dokumentasi dan kendali keselamatan integrasi WhatsApp tidak resmi.", **maka** Sebelum publik ada risk assessment terkait aturan WA, sesi, kebocoran, dan alternatif.
- **AC-TRUST-020-B (batas):** Penolakan atau pencabutan izin menghentikan pemrosesan opsional yang terkait; admin tak melihat ledger/chat privat secara default.

