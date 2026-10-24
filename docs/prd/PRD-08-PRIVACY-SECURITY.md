# PRD-08 — Privasi, Keamanan, Hak Data, dan Kepercayaan Pengguna

**Relasi:** [Identitas](./PRD-02-IDENTITY-RBAC.md) · [WhatsApp](./PRD-05-WHATSAPP-GOWA.md) · [AI](./PRD-06-AI-OCR.md) · [Operasi](./PRD-07-ADMIN-OPERATIONS.md) · [Acceptance](./PRD-09-NFR-ACCEPTANCE.md)

## 1. Klasifikasi data dan prinsip hukum

Produk menyimpan data keuangan pribadi, nomor kontak/WA, foto transaksi, dan metadata akun. UU Indonesia **No. 27 Tahun 2022 tentang Pelindungan Data Pribadi** memasukkan **data keuangan pribadi** sebagai data pribadi bersifat spesifik. Karena itu, layanan publik memerlukan kebijakan privasi, dasar pemrosesan yang sah, minimisasi, perlindungan, hak subjek data, dan evaluasi hukum sebelum launch — **tidak cukup hanya menambahkan checkbox persetujuan**.

PRD ini menyatakan kontrol produk, **bukan opini hukum final atau sertifikasi kepatuhan**. Review yuridis dan implementasi keamanan wajib dilakukan sebelum menerima pengguna publik.

## 2. Persyaratan privasi dan kepercayaan — `TRUST-*`

| ID | Syarat wajib | Perilaku |
|---|---|---|
| `TRUST-001` | Pemisahan tenant/user pada semua catatan, object storage, job AI dan WA. | Akses lintas pemilik ditolak pada server dan lapisan data. |
| `TRUST-002` | Pengelolaan identitas dan RBAC default-deny. | Privilege platform tidak memberi akses otomatis ke ledger personal. |
| `TRUST-003` | R2 storage private; file hanya tersedia kepada pemilik dengan autorisasi dan masa akses terbatas. | Tidak ada bucket public untuk struk atau QR pribadi. |
| `TRUST-004` | Secret server-only untuk GOWA, 9router, Neon dan Cloudflare Access. | API key/token tidak dimasukkan ke PWA, URL publik, log, atau repository. |
| `TRUST-005` | Semua komunikasi internet dengan HTTPS dan autentikasi server-to-server. | Tunnel bukan pengganti kontrol akses aplikasi. |
| `TRUST-006` | Consent terpisah untuk koneksi WhatsApp, reminder, unggah bukti, dan pengiriman data ke provider Vision upstream. | User dapat menolak tiap modul tanpa kehilangan pencatatan manual. |
| `TRUST-007` | Akses hanya ke konten WA yang dipilih/diizinkan pengguna. | Tidak ada ekspor chat/contacts/grup WA untuk tujuan pencatatan keuangan. |
| `TRUST-008` | Transparansi vendor/subprocessor dan perubahan tujuan pemrosesan. | User mendapat penjelasan bahwa 9router dapat meneruskan gambar ke provider upstream. |
| `TRUST-009` | Data minimization & retention. | Hanya simpan field yang dibutuhkan; ada masa retensi dan penghapusan file bukti/log. |
| `TRUST-010` | Hak melihat, koreksi, unduh, portabilitas, hapus, dan tarik izin. | Permintaan mandiri tersedia di PWA, dengan status pemrosesan. |
| `TRUST-011` | Keamanan autentikasi, MFA admin, revocation session, dan catatan login. | Penyerang tidak bisa memulihkan akun hanya dari nomor WA. |
| `TRUST-012` | Anti-enumeration, rate limit, upload validation, bot protection. | Daftar publik tidak menjadi saluran spam/penyebaran malware. |
| `TRUST-013` | Audit trail keuangan dan akses administratif minim PII. | Setiap perubahan nominal/izin/status memiliki provenance dan user-facing history. |
| `TRUST-014` | Backup & restore terenkripsi, diuji, dan mengikuti lifecycle penghapusan. | Recovery tidak menghidupkan kembali data user terhapus secara tidak sah. |
| `TRUST-015` | Prosedur insiden: klasifikasi, investigasi, mitigasi, pencabutan kunci, pemberitahuan bila diwajibkan hukum. | Tim/operator punya tindakan jelas tanpa menyembunyikan masalah kritis. |
| `TRUST-016` | Kebijakan usia dan penggunaan bertanggung jawab. | Pendaftaran anak/minor dievaluasi secara hukum sebelum aktivasi publik. |
| `TRUST-017` | Anti prompt injection dan konten tidak tepercaya. | Teks gambar/chat tidak dapat memerintah perubahan role atau mengambil data user lain. |
| `TRUST-018` | Proteksi privasi offline cache/perangkat bersama. | Logout/ganti akun membersihkan data pribadi user sebelumnya dari tampilan/caches yang relevan. |
| `TRUST-019` | Data keuangan tidak digunakan untuk periklanan atau training AI tanpa dasar/izin spesifik terpisah. | Tidak ada iklan tertarget memakai struk/saldo/riwayat transaksi. |
| `TRUST-020` | Dokumentasi dan kendali keselamatan integrasi WhatsApp tidak resmi. | Sebelum publik ada risk assessment terkait aturan WA, sesi, kebocoran, dan alternatif. |

## 3. Kebijakan pengolahan per jenis data

| Jenis data | Tujuan | Akses | Retensi produk yang diusulkan |
|---|---|---|---|
| Email/nama akun | Identitas, keamanan, dukungan | Pemilik; admin metadata terbatas | Selama akun aktif; hapus sesuai proses akun |
| Transaksi/kategori/budget | Pelaporan finansial pengguna | Pemilik, bukan operator secara default | Selama akun aktif hingga user delete/eksport |
| Screenshot/struk di R2 | Evidence/recheck/correction | Pemilik; pemroses dengan izin | Default usulan **90 hari setelah final**, opsi simpan lebih lama dengan consent & kuota |
| Hasil OCR/Vision | Usulan transaksi dan validasi | Pemilik; pemroses | Hasil ringkas mengikuti ledger; raw payload diberi masa retensi lebih pendek |
| Session GOWA | Konektivitas akun WA | Gateway/worker sistem | Dihapus saat logout/delete menurut semantik GOWA & prosedur produk |
| Isi pesan WA | Parser input yang dipilih | Sistem otomatis sesuai izin | Jangan simpan isi percakapan umum; hanya pesan yang memang menjadi evidence pencatatan |
| Audit keamanan | Deteksi kesalahan & insiden | Operator terbatas | Contoh default 90 hari dengan penyesuaian regulasi; jangan simpan secret |
| Backup | Pemulihan bencana | Operator minimum | Rotasi/retensi terpisah, diuji agar mematuhi penghapusan |

Durasi pada tabel adalah **usulan kebijakan**, bukan klaim kewajiban hukum. Penghapusan bisa memerlukan pengecualian jika ada kewajiban hukum yang sah; hal tersebut harus dijelaskan kepada pengguna secara transparan.

## 4. Pemrosesan dan penghapusan akun

**Permintaan ekspor:** user dapat meminta unduh data keuangan dalam CSV/JSON, serta file bukti dengan paket terpisah. File ekspor sensitif harus berumur terbatas dan hanya dapat diunduh setelah autentikasi.

**Permintaan penghapusan:** user reauth → lihat konsekuensi → opsional periode tenggang (usulan 7 hari) → hentikan WA/AI/notification → hapus ledger personal, metadata, file privat, mapping identitas, dan rencanakan purging backup sesuai retensi. Pengguna melihat progres `requested`, `processing`, `completed`, `exception`.

**Pencabutan izin Vision:** menolak kiriman gambar baru ke 9router; queued jobs yang belum diproses harus dihapus/dibatalkan sesuai pilihan. Hasil keuangan final tetap dapat dipertahankan sebagai catatan pribadi kecuali user menghapusnya.

**Pencabutan WA:** menonaktifkan pengingat, pemrosesan webhook, dan menutup sesi yang terkait sesuai pilihan; jangan hapus ledger.

**Catatan jujur:** bila konten sudah dikirim ke provider upstream, 'cabut izin' tidak selalu dapat menarik kembali data yang telah diproses; kebijakan penyedia harus disampaikan.

## 5. Model ancaman produk

| Ancaman | Risiko | Control produk |
|---|---|---|
| User A menebak ID file B | Kebocoran struk sensitif | Authz object-level, private bucket, short-lived signed access |
| Session GOWA salah mapping | Cross-account WhatsApp | Ownership binding, allowlist, webhook verification, anti replay |
| API key 9router bocor | Akses AI tak berizin, biaya/kuota rusak | Secret server only, Cloudflare Access, rotate key, rate limit |
| Foto berisi instruksi berbahaya | Prompt injection | Treat input untrusted; peran AI hanya ekstraksi, bukan tools admin |
| Registrasi bot/spam | Abuse, WA ban, kuota habis | Turnstile, rate limits, email verification, moderation |
| SSRF via URL gambar | Akses ke internal services | Jangan fetch URL arbitrary dari user tanpa validation dan isolasi |
| Gambar/file berbahaya | Malware, DoS, quota exhaustion | MIME sniff, ukuran, type allowlist, scan jika tersedia, no executable |
| Perangkat pinjaman | Catatan tertinggal di browser | Logout clear private view/cache dan biometrik opsional jika memungkinkan |
| Admin salah pakai privilege | Kebocoran data | RBAC least privilege, audit, no raw ledger access |
| Database backup bocor | Data keuangan banyak pengguna | Encryption, backup access controls, retention, restore drill |
| Unofficial WA account banned | Reminder gagal dan kemungkinan reputasi | WA optional, rate limiting, terms risk gate, fallback PWA |
| Model AI salah nominal | Budget keliru | Provisional, cross validation, manual confirmation, immutable change history |

## 6. Cloudflare Tunnel dan domain

- `finance.venlab.tech` adalah **aplikasi publik** dengan autentikasi pengguna sendiri dan proteksi DDoS/WAF/rate limiting sewajarnya.
- `gowa.venlab.tech` adalah **layanan backend sensitif**; harus dilindungi Cloudflare Access/service token + autentikasi aplikasi GOWA. Tidak ditujukan untuk browser user.
- `9r.venlab.tech` adalah **AI backend sensitif**; harus dilindungi Cloudflare Access/service token + API key 9router; tidak ditujukan untuk browser user.
- **Tidak ada domain tambahan wajib** untuk produk: `/api/*` berada pada hostname finance; endpoint job tambahan jika diperlukan kelak diputuskan dalam TRD. Akses lokal di Armbian lebih baik dari public tunnel untuk komunikasi GOWA/9router/Finance Worker internal.
- DNS/subdomain di atas direncanakan; PRD **tidak mengklaim** konfigurasi sudah diterapkan.

## 7. Kebutuhan privasi WhatsApp yang tidak dapat diabaikan

Walau GOWA dapat mengelola banyak akun, integrasi akun WA pribadi membuka risiko akses teknis ke percakapan lebih luas daripada fitur keuangan. Hanya menerapkan filter aplikasi belum menjamin operator root tidak dapat membaca sesi. Oleh karena itu perlu disclosure yang jujur, desain least data, security review, aturan admin yang ketat, dan evaluasi keberlanjutan penggunaan WhatsApp sesuai ToS. **Tidak boleh memasarkan integrasi ini sebagai API WhatsApp resmi.**

Untuk opsi bot bersama, kebijakan opt-in, STOP, batas kirim, dan antispam berlaku sama. Blast promosi ke akun tanpa permintaan tidak termasuk fitur.

## 8. Acceptance `AC-TRUST-*`

- **AC-TRUST-01:** User A, Admin, atau tamu mencoba akses file B lewat URL/payload → ditolak.
- **AC-TRUST-02:** Tidak ada secret GOWA/9router/Neon/Cloudflare pada JavaScript bundle, response API, telemetry dan log yang dapat dibuka klien.
- **AC-TRUST-03:** Semua request sesi WA memverifikasi identitas dan owner, termasuk reconnect, logout dan delete.
- **AC-TRUST-04:** Mematikan consent AI mencegah request pemrosesan baru ke provider; user tetap bisa input manual.
- **AC-TRUST-05:** Ekspor hanya berisi data pemilik dan dapat diunduh setelah verifikasi akun.
- **AC-TRUST-06:** Akun terhapus tidak bisa login lagi dengan sesi lama; status purging serta backup retention dijelaskan.
- **AC-TRUST-07:** Beralih akun pada perangkat yang sama tidak memperlihatkan data privat user lain dari cache/offline.
- **AC-TRUST-08:** Admin audit/bug report tidak berisi body chat personal atau data transaksi penuh secara default.
- **AC-TRUST-09:** Upload instruksi bermusuhan tidak mengubah role, hak akses, endpoint atau mengirim gambar ke URL attacker.
- **AC-TRUST-10:** Perubahan security-critical setting melibatkan MFA/reauth dan audit.

## 9. Standar dan sumber

- [UU No. 27 Tahun 2022 — JDIH Kemkomdigi](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/crc32/)
- [Ringkasan UU PDP — BPK](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)
- [OWASP ASVS 5.0](https://asvs.owasp.org/) dan [OWASP authorization multi-tenant](https://cornucopia.owasp.org/edition/webapp/AZ2)
- [Cloudflare Access service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/)
- [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [WhatsApp Terms](https://www.whatsapp.com/legal/terms-of-service?lang=en)
