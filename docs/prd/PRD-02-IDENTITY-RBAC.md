# PRD-02 — Identitas, Registrasi Publik, Peran, dan Hak Akses

**Relasi:** [Indeks](./PRD-00-INDEX.md) · [Privasi](./PRD-08-PRIVACY-SECURITY.md) · [Admin](./PRD-07-ADMIN-OPERATIONS.md) · [WhatsApp](./PRD-05-WHATSAPP-GOWA.md)

## 1. Lingkup identitas

Setiap pengguna adalah pemilik tunggal **tenant keuangan personal**. Role `user`, `admin`, `superuser` menunjukkan tugas pengelolaan *platform*; role admin/superuser **tidak** menjadikan mereka pemilik keuangan pengguna lain.

Identitas sesi aplikasi dan identitas perangkat WhatsApp adalah dua hal berbeda. Menautkan WA tidak boleh otomatis mengizinkan login aplikasi, dan mengetahui nomor WA pengguna tidak memberi akses ke data finansialnya.

## 2. Spesifikasi fungsi — `IAM-*`

| ID | Kebutuhan wajib | Hasil/aturan |
|---|---|---|
| `IAM-001` | Daftar publik dengan email dan password, disertai verifikasi email. | Akun baru selalu `user`, status belum terverifikasi dibatasi, password disimpan oleh provider auth tepercaya. |
| `IAM-002` | Login, logout, lupa password, reset password, ganti email, verifikasi ulang email. | Sesi lama yang relevan dapat dicabut setelah tindakan keamanan kritis. |
| `IAM-003` | Pilihan login federasi Google jika konfigurasi OAuth diaktifkan. | Akun dapat ditautkan tanpa duplikasi identitas; konflik email ditangani aman. |
| `IAM-004` | Session management mandiri: daftar perangkat aktif, revoke sesi, logout semua perangkat. | Operasi tidak membocorkan token atau rincian autentikasi. |
| `IAM-005` | Perlindungan pendaftaran/login: rate limit, Turnstile bila perlu, pencegahan enumerasi email. | Pesan kesalahan tidak memberitahu penyerang apakah alamat email telah terdaftar. |
| `IAM-006` | Onboarding: zona waktu, mata uang dasar, nama panggilan, siklus keuangan, preferensi AI/WA, budget awal. | Semua pilihan dapat diubah kemudian; jangan memaksa input sensitif selain yang diperlukan. |
| `IAM-007` | Pengelolaan profil: nama tampilan, foto opsional, bahasa, tema, zona waktu, notifikasi. | Perubahan tersimpan dan tidak mengubah kepemilikan transaksi. |
| `IAM-008` | Peran akses platform 3 tingkat; otorisasi server-side untuk tiap operasi. | Default-deny, bukan sekadar sembunyi menu UI. |
| `IAM-009` | Hanya Superuser dapat mengangkat/menurunkan Admin; role Superuser tidak bisa diperoleh melalui register/API publik. | Kenaikan role membutuhkan autentikasi ulang dan audit. |
| `IAM-010` | Superuser pertama dibuat melalui bootstrap terkontrol dengan kredensial aman. | Tidak ada akun default/password hard-coded publik. |
| `IAM-011` | Suspensi, penonaktifan, pemulihan status akun dengan alasan dan jalur keberatan. | Admin dapat menangani kebijakan, tetapi tidak menghapus ledger tanpa dasar/prosedur. |
| `IAM-012` | Identitas WhatsApp melalui proses pengikatan dan pembuktian kendali nomor/sesi. | Nomor tidak dapat diam-diam ditautkan ke dua akun aktif tanpa penyelesaian konflik aman. |
| `IAM-013` | Permintaan export/delete akun dan seluruh datanya secara mandiri. | Harus dibuktikan oleh user login dan melewati konfirmasi risiko tindakan. |

## 3. Matriks RBAC

| Aksi | User | Admin | Superuser |
|---|:---:|:---:|:---:|
| Mengelola ledger, budget, file, WA milik sendiri | Ya | Ya (milik sendiri) | Ya (milik sendiri) |
| Melihat/mengedit transaksi dan lampiran pengguna lain | **Tidak** | **Tidak** | **Tidak secara default** |
| Melihat metrik agregat platform (tanpa PII mentah) | Tidak | Ya | Ya |
| Daftar akun dan status operasional tanpa data finansial privat | Tidak | Ya, terbatas | Ya |
| Suspend/unsuspend akun menurut kebijakan | Tidak | Ya, dalam mandat | Ya |
| Melihat laporan penyalahgunaan yang dikirim secara sengaja | Tidak | Ya, secara terbatas | Ya |
| Mengubah role `user` ↔ `admin` | Tidak | Tidak | Ya |
| Membuat/menonaktifkan role Superuser | Tidak | Tidak | Prosedur bootstrap/break-glass khusus |
| Mengatur konfigurasi model, domain endpoint, kunci & quota global | Tidak | Tidak | Ya |
| Melihat error dan status layanan teragregasi | Sendiri | Ya | Ya |
| Mengunduh data privat orang lain tanpa consent | Tidak | Tidak | Tidak |

**Support session berizin:** jika suatu saat diperlukan bantuan membaca data akun, pengguna secara eksplisit membagikan dataset/tiket terpilih dalam periode terbatas, dengan audit dan dapat dicabut. Implementasi support tidak boleh berupa 'impersonate account' tanpa jejak.

## 4. Siklus akun dan status

| Status | Arti | Perlakuan |
|---|---|---|
| `pending_verification` | Email belum diverifikasi. | Hanya konfirmasi dan operasi aman tertentu. |
| `active` | Pengguna sah dan dapat mengakses fitur. | Akses normal sesuai role, paket gratis dan quota. |
| `suspended` | Terindikasi spam/penyalahgunaan atau pelanggaran kebijakan. | Akses dibatasi; pengguna memperoleh alasan yang sesuai dan mekanisme banding. |
| `deletion_pending` | Permintaan hapus sedang dalam masa konfirmasi/tenggang. | Integrasi WA/AI dihentikan dan sesi baru ditolak. |
| `deleted` | Data produksi dihapus sesuai kebijakan. | Tidak ada pemulihan akun lama di UI; backup diperlakukan menurut retensi. |

## 5. Aturan onboarding

1. Pengguna memahami bahwa aplikasi **pencatatan**, bukan layanan bank dan bukan pemblokir transaksi QRIS.
2. Pengguna memilih mata uang (default IDR) dan zona waktu (default Asia/Jakarta) serta dapat memilih periode anggaran bulanan/tanggal mulai siklus.
3. Pilihan: template Mahasiswa Kos, template umum, atau kosong. Template tidak otomatis menyimpan pengeluaran sebagai kejadian nyata.
4. Pengguna dapat langsung masuk dashboard setelah identitas diverifikasi tanpa menautkan WhatsApp atau mengizinkan AI.
5. Prompt untuk menghubungkan WA/AI ditawarkan pada momen relevan, dapat dilewati, dan tidak muncul memaksa setiap login.
6. Jika user berumur di bawah persyaratan usia legal yang diterapkan produk, pendaftaran diperlakukan sesuai kebijakan usia dan review hukum; jangan mengklaim dukungan anak otomatis.

## 6. Kriteria penerimaan contoh

- **AC-IAM-01:** `Given` pengunjung mendaftar, `When` verifikasi selesai, `Then` role = `user` dan hanya akses ke tenant sendiri.
- **AC-IAM-02:** Mengubah `role` di request, JavaScript browser, path objek, atau cookie tidak dapat menaikkan akses.
- **AC-IAM-03:** Login pada dua perangkat dapat ditinjau; revoke perangkat A membuat token/perizinannya tidak valid.
- **AC-IAM-04:** Pengguna A meminta catatan WA, file, transaksi atau anggaran B menggunakan ID langsung → `403` atau `404` aman; tidak membocorkan keberadaan data B.
- **AC-IAM-05:** Admin suspend akun, tetapi query admin ke transaksi akun tersebut tetap ditolak.
- **AC-IAM-06:** Superuser membuat admin disertai reauth dan jejak audit; admin gagal melakukan operasi sama.
- **AC-IAM-07:** Dua user mencoba klaim nomor/perangkat WA sama → konflik aman, tidak ada takeover sesi.
- **AC-IAM-08:** Fitur login dan manajemen sesi tetap berfungsi saat GOWA/9router mati.

## 7. Risiko dan keputusan tersisa

- Provider autentikasi yang direkomendasikan ialah **Neon Managed Better Auth**, sesuai dokumentasi produk 2026. Namun konfigurasi provider email, kuota verifikasi, OAuth, dan kesesuaian Worker perlu diuji sebelum dianggap final; auth gratis tidak berarti layanan email transaksional tanpa batas.
- Untuk keamanan admin/superuser, **MFA/step-up authentication** wajib tersedia sebelum peluncuran publik. Pilihan authenticator/passkey/OTP ditentukan dalam TRD berikutnya.
- Pengguna tidak boleh menerima tautan reset kata sandi melalui WhatsApp saja tanpa verifikasi identitas aplikasi.

**Referensi terverifikasi:** [Neon Managed Auth](https://neon.com/blog/neon-auth-branchable-identity-in-your-database) · [Neon Free](https://neon.com/blog/neon-free-plan-1-gb-per-project) · [OWASP ASVS](https://asvs.owasp.org/) · [UU PDP](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/crc32/)
