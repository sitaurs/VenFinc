# PRD-07 — Admin, Superuser, Kuota, dan Operasi Produk

**Relasi:** [Role](./PRD-02-IDENTITY-RBAC.md) · [WhatsApp](./PRD-05-WHATSAPP-GOWA.md) · [AI](./PRD-06-AI-OCR.md) · [Privasi](./PRD-08-PRIVACY-SECURITY.md) · [Kualitas](./PRD-09-NFR-ACCEPTANCE.md)

## 1. Pembagian kewenangan

`Admin` membantu operasional publik: melihat status platform, memproses laporan penyalahgunaan, menangguhkan akun dalam kebijakan, dan menjalankan support tanpa data finansial mentah. `Superuser` bertanggung jawab atas pengaturan sistem, penunjukan Admin, integrasi GOWA/9router, kuota, perubahan kebijakan produk, darurat dan proses pemulihan.

**Admin/Superuser tetap pengguna biasa pada ledger miliknya sendiri**, tetapi privilege platform tidak memberinya akses ledger pengguna lain. Pengaturan hak akses dijelaskan di [PRD-02](./PRD-02-IDENTITY-RBAC.md).

## 2. Persyaratan panel — `OPS-*`

| ID | Fitur | Perilaku |
|---|---|---|
| `OPS-001` | Dashboard kesehatan: jumlah pengguna aktif, rate error, status gateway, antrean AI, status worker, pemakaian kuota. | Metrik agregat, tanpa transaksi/struk/chat raw. |
| `OPS-002` | Daftar akun dan status dengan pencarian terbatas. | Email disamarkan bila mungkin, alasan akses dicatat, tidak membuka ledger. |
| `OPS-003` | Moderasi: warn, suspend, unsuspend, tangani banding. | Jejak alasan, actor, waktu dan status; tidak berlaku diam-diam. |
| `OPS-004` | Tiket support/bug report yang dibuat user. | Hanya lampiran yang user pilih secara sengaja; ada masa akses dan penghapusan. |
| `OPS-005` | Kuota per user/role global: ukuran file, AI/day, penyimpanan, WA session, reminder. | Menolak penggunaan di atas kuota secara ramah dengan fallback manual; role admin tidak bebas mengganti limit sistem. |
| `OPS-006` | Superuser mengubah feature flags untuk integrasi bermasalah. | Dapat mematikan personal WA, shared bot, ekstraksi AI, upload saat incident tanpa mematikan pencatatan manual. |
| `OPS-007` | Monitor kesehatan integrasi GOWA, 9router, Cloudflare Tunnel, Neon, R2, Finance Worker. | Hanya status dan timestamp; tidak menampilkan secret. |
| `OPS-008` | Rotasi kredensial layanan dan rekam jejak perubahan. | Tindakan superuser dengan MFA/reauth, log audit, no secret display after save. |
| `OPS-009` | Pengaturan reminder global & anti-spam, termasuk emergency stop. | Opt-out user tidak dapat dipaksa lewat kembali, bahkan oleh admin. |
| `OPS-010` | Kontrol risiko biaya: pemakaian Workers/Neon/R2/model dan threshold. | Ketika mendekati batas, operator mendapat peringatan dan fitur mahal dapat diperlambat/dibatasi. |
| `OPS-011` | Pengaturan pengumuman maintenance & banner gangguan layanan. | PWA menampilkan dampak dan jalur alternatif; tidak mengklaim integrasi aktif saat down. |
| `OPS-012` | Statistik kinerja produk untuk lomba/demo. | Data diaggregasi, anonymized secukupnya; demo dataset sintetis terpisah. |
| `OPS-013` | Retensi log, audit, serta permintaan penghapusan/ekspor. | Admin melihat progres pemrosesan permintaan tanpa akses isi keuangan. |
| `OPS-014` | Perbaikan data operasional melalui job retry/cancel. | Retry idempotent; operator tidak boleh mengubah nominal transaksi user atas nama sistem. |
| `OPS-015` | Kebijakan moderasi & konfigurasi izin WhatsApp. | Persetujuan publik yang jelas; opsi koneksi WA pribadi dapat dihentikan secara global. |
| `OPS-016` | Pengaturan konten publik: FAQ, terms, privacy policy, pengumuman versi, changelog. | Perubahan dokumen hukum dikontrol dan ada jejak versi. |
| `OPS-017` | Monitoring backup/restore, penggunaan storage, dan pemeriksaan restore terjadwal. | Insiden penyimpanan dapat dilaporkan/diinvestigasi tanpa membuka data pengguna lebih dari perlu. |
| `OPS-018` | Dashboard audit tindakan sensitif per role. | Audit admin/superuser tidak dapat dihapus oleh actor yang sama tanpa proses khusus. |
| `OPS-019` | Onboarding serta konfigurasi Superuser pertama. | Bootstrap terbatas, tidak tersedia dari form publik. |
| `OPS-020` | Health incident & kanal laporan bug keamanan. | Eskalasi prioritas tinggi dan pembekuan fitur berisiko saat insiden. |

## 3. Contoh dashboard operasional

| Widget | Yang terlihat | Yang tidak boleh terlihat |
|---|---|---|
| Pengguna terdaftar/aktif | Jumlah, pertumbuhan agregat | Saldo masing-masing |
| Jumlah transaksi diproses | Volume/persentase berhasil | Isi per merchant pengguna tanpa izin |
| AI extractor | Error/timeout/latensi, pekerjaan pending | Foto struk atau teks prompt sensitif |
| GOWA | Total sesi, status sehat/tidak sehat | Daftar chat pribadi user |
| Neon | Indikator penggunaan storage/compute | Isi tabel akun secara bebas tanpa reason |
| R2 | Storage total dan operasi | File pribadi user tanpa consent |
| Worker | Request/error dan quota remaining | Authorization header/token |

## 4. Kebijakan akun dan kuota

**Usulan nilai awal yang harus bisa dikonfigurasi (bukan limit teknologi universal):**

| Dimensi | Default uji publik | Kontrol saat limit |
|---|---|---|
| Manual input | 100 kejadian/hari/user | Tolak spam ekstrem dengan pesan; tetap bisa mengajukan koreksi sah |
| AI image extractions | 5/hari/user | OCR/manual & penjelasan limit |
| File bukti | 5 MB/file | Tampilkan ukuran dan opsi kompresi aman |
| Penyimpanan pribadi | 100 MB/user | Tolak upload baru setelah peringatan, **jangan** hapus tanpa kebijakan |
| Personal WA session | 1 aktif/user | Ganti sesi dengan konfirmasi/logout; platform cap mengikuti bench |
| Automated reminder | 1 reminder harian + notifikasi event yang disetujui | Rate limit total, quiet hours, STOP |
| Public API | Rate limit per user/IP dan action | Jangan merusak akses sah oleh satu pengguna aktif |

Konfigurasi saat produksi **wajib ditinjau ulang** berdasarkan pengujian kapasitas Armbian dan biaya free tier. Kuota harus dibedakan antara *soft warning* dan *hard stop*, tidak boleh mendadak membuat riwayat data tidak dapat dibaca oleh pemilik.

## 5. Health status dan pengendalian bencana

| Gangguan | Langkah produk |
|---|---|
| 9router down | AI menjadi degraded; OCR lokal atau input manual masih tersedia. |
| GOWA down atau akun banned | Hentikan reminder; tampilkan banner dan cara catat via PWA; tidak mencoba spam reconnect. |
| Armbian offline | PWA dan laporan berbasis Neon tetap tersedia; job antre dan diproses setelah pulih. |
| Neon unavailable | PWA offline dapat menyimpan draft lokal, UI jujur belum sinkron; jangan klaim transaksi tersimpan di server. |
| R2 unavailable | Beri opsi simpan transaksi teks tanpa bukti; upload antre jika memungkinkan dengan batas aman. |
| Cloudflare Worker quota habis | App static mungkin tetap termuat tetapi API gagal; tampilkan instruksi offline draft; pantau quota dan fallback operasional. |
| Dugaan data breach | Isolasi layanan terdampak, revoke credentials, investigasi dengan jejak audit, komunikasi sesuai kewajiban hukum. |

## 6. Perubahan pengaturan produk sensitif

Tindakan seperti mengangkat admin, mengubah gateway AI, mengaktifkan integrasi WA pribadi publik, mengubah retention, menaikkan hard quota atau menghapus pengguna massal adalah **high-risk operations**. UI wajib memberi ringkasan dampak, meminta reauth/MFA, merekam aktor/alasan, dan jika memungkinkan menyediakan rollback aman.

## 7. Statistik untuk demo/lomba

Produk boleh menampilkan demo dataset sintetis yang menunjukkan bagaimana pencatatan harian menaikkan kepatuhan budget. Semua grafik demonstrasi wajib jelas berlabel **data simulasi**, bukan bukti efikasi berdasarkan data pribadi pengguna. Tidak boleh membuat angka pengguna aktif, biaya, atau akurasi model tanpa pengukuran.

## 8. Acceptance `AC-OPS-*`

- **AC-OPS-01:** Admin dapat suspend user spam tetapi tidak dapat membaca transaksi/struk/WA user tersebut.
- **AC-OPS-02:** Superuser mengubah kuota gambar; efek tercermin ke operasi berikutnya tanpa mengubah data lama.
- **AC-OPS-03:** Saat 9router down, Superuser nonaktifkan Vision via feature flag; PWA manual tetap berjalan.
- **AC-OPS-04:** Superuser rotate GOWA key; lama tidak berlaku, status integrasi jelas, tidak ada kebocoran secret pada UI.
- **AC-OPS-05:** User STOP reminder, Admin tidak dapat mengabaikan preferensi tersebut untuk notifikasi marketing.
- **AC-OPS-06:** Upload melampaui kapasitas R2 threshold → peringatan operator dan perlambatan yang dapat diprediksi; jangan ada tagihan lewat tanpa peringatan.
- **AC-OPS-07:** Semua perubahan role, quota, feature flags dan security config direkam ke audit noneditable lewat UI biasa.
- **AC-OPS-08:** Statistik demo memakai data sintetis dan tidak mempunyai endpoint bocoran transaksi pengguna.

## 9. Indikator keberhasilan operasi

- Zero insiden peningkatan privilege yang tidak sah dan zero accidental cross-tenant access.
- Pengguna selalu dapat melihat alasan kegagalan penting tanpa detail internal yang bisa dieksploitasi.
- Pelaporan kuota dan penggunaan layanan cukup untuk menjaga target biaya Rp0 selama dalam free allowances.
- Pengelola dapat melakukan pemeliharaan integrasi tanpa menghapus transaksi pengguna.
