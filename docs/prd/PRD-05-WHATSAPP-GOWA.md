# PRD-05 — Integrasi WhatsApp Multiuser via GOWA

**Relasi:** [Identitas/RBAC](./PRD-02-IDENTITY-RBAC.md) · [Finance](./PRD-03-FINANCE-CORE.md) · [PWA](./PRD-04-PWA-UX-INPUT.md) · [Privasi](./PRD-08-PRIVACY-SECURITY.md) · [Riset](./PRD-10-RESEARCH-DECISIONS.md)

## 1. Keputusan produk

VenFinance akan menyediakan **dua cara** menggunakan WhatsApp dengan satu sistem keuangan yang sama:

1. **Bot bersama (default yang direkomendasikan):** user menghubungkan nomor WA-nya dengan akun PWA dan chat ke satu nomor bot VenFinance. Pengguna **tidak harus scan QR** untuk sesi pribadi. Bot menerima teks/foto dan mengirim reminder/rekap opt-in.
2. **Sesi WA pribadi (opsional):** user menautkan akun WhatsApp miliknya sendiri lewat GOWA dan mengelolanya dari PWA (QR/pairing code, status, reconnect, logout, hapus). Pemrosesan pesan dibatasi pada chat/tujuan yang disetujui; aplikasi **tidak boleh menjelajahi semua percakapan/contacts pengguna**.

GOWA memang mendukung beberapa perangkat/akun sekaligus pada satu instance. **Akan tetapi ini bukan jaminan dukungan platform WhatsApp untuk produk SaaS publik.** Pengoperasian WA otomatis melalui integrasi tidak resmi berisiko dibatasi atau ditangguhkan. Peluncuran opsi ini perlu penilaian kebijakan, persetujuan, uji beban, dan tombol pemutus layanan. Lihat [Risiko](./PRD-10-RESEARCH-DECISIONS.md).

## 2. Sasaran pengalaman

- Seluruh manajemen koneksi dilakukan di `finance.venlab.tech/app/settings/whatsapp`; user biasa **tidak pernah membutuhkan akses ke `gowa.venlab.tech`**.
- Setiap user mendapat halaman status pribadi, bukan daftar seluruh perangkat GOWA.
- Data pesan WA hanyalah **kanal input**; penyimpanan, isolasi, koreksi transaksi mengikuti `FIN-*` dan `TRUST-*`.
- Semua tindakan sensitif seperti 'hapus sesi' meminta konfirmasi jelas; jangan menghapus transaksi Neon akibat logout GOWA.

## 3. Product requirements — `WA-*`

| ID | Kebutuhan | Perilaku wajib |
|---|---|---|
| `WA-001` | Pilihan WhatsApp opsional pada onboarding & pengaturan. | User bisa memakai PWA tanpa koneksi WhatsApp; menautkan memerlukan persetujuan. |
| `WA-002` | Mode bot bersama dengan verifikasi kepemilikan nomor. | Chat dari nomor tidak terverifikasi tidak otomatis dikaitkan ke akun tertentu. |
| `WA-003` | Sesi pribadi per user, multi-device pada satu GOWA. | Pemetaan user ↔ session/device unik; akses ke session orang lain tidak pernah diizinkan. |
| `WA-004` | Membuat slot dan QR/pairing code dari PWA. | Pengguna melihat petunjuk WhatsApp, status masa berlaku kode, dan feedback keberhasilan/kegagalan. |
| `WA-005` | Status sesi: belum terhubung, pairing, connected, disconnected, reconnecting, memerlukan login ulang, error. | State di PWA berubah setelah server memverifikasi keadaan terkini, bukan hanya klik tombol. |
| `WA-006` | Reconnect sesi terputus dan login ulang saat session invalid. | Retriable error tidak memaksa logout; pengguna mendapat tindakan selanjutnya. |
| `WA-007` | Logout WA tanpa menghapus slot, dan hapus slot/sesi permanen. | Dua tindakan berbeda, keduanya bisa dari PWA; konfirmasi efek terhadap pengingat. |
| `WA-008` | Pengguna dapat menonaktifkan sinkronisasi WA, mencabut izin, atau melepas nomor. | Penghentian pemrosesan dan pengiriman berlangsung sesuai kebijakan; histori ledger tetap aman. |
| `WA-009` | Input pesan teks natural, contohnya 'lauk 10k bensin 20k'. | Diparsing menjadi draft yang dipetakan ke akun pengirim terverifikasi, dengan konfirmasi bila ambigu. |
| `WA-010` | Input foto/SS/struk dari pesan WA. | Bukti diteruskan ke AI/OCR hanya jika consent masih aktif; status dapat dibalas. |
| `WA-011` | Balasan bukti pencatatan, rincian, kategori, budget tersisa, dan kontrol koreksi. | Balasan memuat cukup konteks; data sensitif diminimalkan sesuai pengaturan privasi. |
| `WA-012` | Perintah chat singkat: `saldo`, `budget`, `hari ini`, `minggu ini`, `bantuan`, `batal`, `nihil`, `selesai`, `STOP`, `MULAI`. | Perintah bisa dipahami dengan variasi bahasa wajar; `STOP` langsung dihormati. |
| `WA-013` | Pengingat harian berdasarkan timezone dan keadaan pencatatan. | Tidak mengirim reminder identik berkali-kali atau menandai hari kosong sebagai nol otomatis. |
| `WA-014` | Pengingat tagihan, budget hampir habis, dan status pending hanya sesuai opt-in. | Quiet hours, frekuensi, dan template dapat diatur. |
| `WA-015` | Proses webhook aman, idempotent, dan multi-device aware. | Event dari GOWA diverifikasi, memiliki asal device/message; replay tidak membuat transaksi dobel. |
| `WA-016` | Batas anti-spam dan kontrol kirim pesan platform. | Quota per user, global, per session, rate limit & emergency stop. |
| `WA-017` | Mode degradasi ketika WA/GOWA/tunnel mati. | PWA menunjukkan gangguan, transaksi manual tetap tersedia, antrean tidak hilang. |
| `WA-018` | Permintaan bantuan tanpa memberikan isi chat pribadi ke admin. | Pengguna hanya membagikan laporan relevan secara eksplisit. |
| `WA-019` | Audit tindakan sesi sendiri dan aktivitas keamanan. | Timestamp create, pairing, reconnect, logout, delete, stop/enable reminder; tanpa isi chat default. |
| `WA-020` | Pengelolaan kapasitas sesi multiuser. | Maksimum sesi aktif ditentukan dari bench/resource Armbian dan kuota platform; perubahan bisa diatur Superuser. |

## 4. Fitur mandiri koneksi WA dari PWA

Untuk *personal session*, PWA mengurus seluruh operasi berikut secara aman melalui backend pemilik sesi:

| Aksi UI | Kemampuan GOWA yang diverifikasi | Outcome produk |
|---|---|---|
| Tambah sesi | `POST /devices` | Slot perangkat yang terkait satu pengguna |
| Menampilkan QR | `GET /devices/{device_id}/login` | QR berlaku sementara dan status pairing |
| Login kode nomor HP | `POST /devices/{device_id}/login/code` | Pairing code bagi pengguna HP yang sama |
| Lihat status | `GET /devices/{device_id}/status` | Connected/disconnected dll. terjemahan aplikasi |
| Reconnect | `POST /devices/{device_id}/reconnect` | Pengguna bisa mencoba sambung ulang tanpa scan bila sesi masih sah |
| Logout | `POST /devices/{device_id}/logout` | Mengeluarkan akun WA dan menghapus session; slot tetap ada untuk pairing ulang |
| Hapus sesi | `DELETE /devices/{device_id}` | Menghapus slot/sesi dari GOWA dan pemetaan aplikasi setelah prosedur aman |

**Peringatan:** detail payload dan perilaku edge-case *harus* dicocokkan dengan versi image GOWA yang benar-benar dipasang. PRD menetapkan pengalaman; API contract teknis disusun di TRD. Sumber utama: [GOWA README](https://github.com/aldinokemal/go-whatsapp-web-multidevice), [GOWA OpenAPI](https://github.com/aldinokemal/go-whatsapp-web-multidevice/blob/main/docs/openapi.yaml).

### UX pairing perangkat yang sama

Jika pengguna memakai PWA dan WhatsApp di satu HP, sediakan **pairing code** sebagai opsi utama, QR sebagai alternatif bila WhatsApp berada di HP lain. Aplikasi tidak meminta pengguna memfoto QR dengan HP yang sedang menampilkannya.

### Status dan perbedaan tindakan

- **Reconnect:** sesi masih ada, coba buat koneksi ulang.
- **Scan/kode ulang:** token WA invalid/ditolak, perlu verifikasi dari WhatsApp.
- **Logout:** sesi WA dikeluarkan, slot tetap dapat digunakan untuk login baru.
- **Hapus sesi:** slot perangkat beserta pemetaan dihapus permanen setelah konfirmasi; **ledger dan lampiran transaksi yang sudah disimpan tidak otomatis dihapus**.
- **Cabut persetujuan WA:** hentikan webhook dan pengingat untuk pemilik tanpa harus menghapus keuangannya.

## 5. Proses input multiuser yang aman

1. Pesan masuk melalui GOWA dengan `device_id`, identitas pengirim, ID pesan, jenis pesan, dan waktu.
2. Finance Worker **menentukan mode** shared bot atau personal session; periksa pemetaan pemilik yang telah diverifikasi. Abaikan event nomor atau chat di luar allowlist.
3. Verifikasi otentisitas event (signing secret/HMAC sesuai konfigurasi versi), anti-replay dan idempotency.
4. Hanya pesan yang secara eksplisit ditujukan untuk mencatat keuangan yang masuk parser/AI; pesan lain diabaikan dan sebaiknya tidak disimpan.
5. Bangun usulan transaksi dan minta konfirmasi bila dibutuhkan menurut `FIN-*`/`AI-*`.
6. Setelah final, balas status dan sisa budget pemilik melalui channel yang sudah diizinkan.

**Larangan penting:** backend PWA tidak boleh menerima `device_id` mentah dari client lalu memanggil API GOWA atas nama user tanpa verifikasi kepemilikan. Header `X-Device-Id` adalah kemampuan pemilihan device GOWA, bukan mekanisme otorisasi tenant aplikasi.

## 6. Model privasi personal session

Sesi WhatsApp pribadi memberi layanan GOWA kemampuan teknis yang lebih luas daripada sekadar mengirim reminder. Oleh karena itu, sejak onboarding sampai koneksi:

- Jelaskan bahwa ini **perangkat tertaut pihak ketiga** ke WhatsApp pribadi pengguna, dengan risiko privasi dan pembatasan akun.
- Perlihatkan ringkasan data yang diproses (hanya pesan chat dipilih, konten bukti yang dikirim untuk pencatatan, metadata koneksi terbatas).
- **Nonaktifkan secara default** pengambilan riwayat chat, sinkronisasi contacts, grup, broadcast, dan fungsi lain yang tidak dibutuhkan.
- User memilih chat/nomor tujuan tertentu untuk pencatatan; pesan lain difilter sebelum pencatatan persistennya.
- Consent penyimpanan foto dan pengiriman ke Vision terpisah dari consent koneksi WA.
- User dapat revoke/logout/delete dalam satu layar, mendapatkan konfirmasi bahwa token/perangkat telah dicabut.
- Operator platform (termasuk superuser) tidak mempunyai menu membaca pesan pribadi pengguna.

Persyaratan produk ini **mengurangi risiko, bukan menghapus kemampuan teknis root/operator server** untuk mengakses sesi. Harus ada pemeriksaan keamanan nyata sebelum mengizinkan pihak publik menautkan akun WA.

## 7. Pengingat harian berbasis status

**Default yang diusulkan:** 20.30 `Asia/Jakarta` untuk pengguna yang memilih reminder. Seluruh user dapat mengubah, menunda, mematikan, dan mengatur hari aktif.

| Kondisi | Bot |
|---|---|
| Belum pernah mencatat hari ini | Tanya 'Hari ini ada pengeluaran apa saja? Bisa tulis, foto, atau jawab nihil.' |
| Sudah mencatat tetapi belum menutup hari | Tanya 'Masih ada yang belum tercatat hari ini?' |
| Sudah menyatakan 'selesai' atau 'nihil' | Jangan mengulang reminder laporan harian. |
| Ada usulan OCR belum dikonfirmasi | Minta review ringkas (hindari spam). |
| Belum opt-in/STOP aktif | Tidak mengirim reminder. |
| Armbian offline melewati jam reminder | Saat pulih, evaluasi apakah reminder masih relevan menurut quiet hours, kebijakan missed reminder, dan status hari; jangan mengirim rentetan pesan lama. |

**Rollover tanggal:** awal/akhir hari menurut zona waktu pengguna, bukan timezone mesin Armbian. **`nihil`** hanya mencatat pernyataan user bahwa tak ada pengeluaran, tidak otomatis membuat transaksi Rp0.

## 8. Batas rate, anti-spam, dan error

- User dapat `STOP` melalui chat kapan saja, termasuk jika sesi aplikasi web sudah logout. Bot mengonfirmasi berhenti sekali tanpa pesan lanjutan yang tidak diminta.
- Kirim pesan hanya atas persetujuan user, hindari blast/bulk, ada quiet hours dan batas per user + global yang dapat dikonfigurasi.
- Event duplikat, pesan terlambat, media download gagal, pairing QR kedaluwarsa, WA logout sendiri dan webhook berulang semuanya diberi penanganan pengguna yang jelas.
- Jika personal session tidak dapat dijalankan secara aman/diizinkan, fitur ditutup melalui feature flag dan pengguna tetap memiliki PWA serta mode input manual; alternatif resmi WA harus dievaluasi sebelum operasi publik jangka panjang.

## 9. Acceptance cases `AC-WA-*`

- **AC-WA-01:** Dua user dengan sesi GOWA berbeda masuk bersamaan; setiap user hanya melihat status sesi sendiri.
- **AC-WA-02:** User A menebak ID device B dan mencoba status/logout/delete; semuanya ditolak bahkan jika URL diubah manual.
- **AC-WA-03:** User A memakai pairing code dari HP yang sama, berhasil menautkan WA tanpa membuka UI GOWA.
- **AC-WA-04:** QR kedaluwarsa → UI memberitahu dan menawarkan regenerasi, tidak menandai connected palsu.
- **AC-WA-05:** Disconnect sementara → reconnect; token invalid → arahkan scan ulang, tanpa menghapus ledger.
- **AC-WA-06:** Logout menyisakan slot untuk pairing lagi; delete benar-benar membersihkan slot & mapping setelah konfirmasi.
- **AC-WA-07:** Pesan 'lauk 10k, bensin 20k' dicatat pada pemilik yang benar; webhook terkirim dua kali tetap satu set transaksi.
- **AC-WA-08:** Foto dikirim saat AI mati → OCR sementara; saat AI pulih tidak membuat pengeluaran baru.
- **AC-WA-09:** `STOP` menyebabkan semua reminder non-keamanan dari bot berhenti, meski user tetap memiliki akun aplikasi.
- **AC-WA-10:** WA offline 8 jam → web manual masih berfungsi; ketika pulih tidak ada spam reminder tertunda.
- **AC-WA-11:** Mode personal session memfilter dan mengabaikan pesan grup/chat yang tidak termasuk allowlist; **lapisan aplikasi VenFinance** tidak menyimpan history/contacts yang tidak diizinkan. Implementasi GOWA lokal dapat memiliki data sesi/cakupan teknis lebih luas; retensi, izin akses dan isolasinya diaudit pada launch gate, bukan diklaim nol.
- **AC-WA-12:** Admin hanya mendapat jumlah sesi/status agregat, tidak dapat mendownload konten WA user.

## 10. Poin verifikasi sebelum public launch

1. Versi GOWA yang dipasang, endpoint, webhook signature dan device status benar secara operasional.
2. Evaluasi kontrak/ketentuan WhatsApp untuk otomatisasi dan penautan akun pengguna; jangan menganggap karena API GOWA tersedia maka penggunaannya resmi diizinkan.
3. Uji memori/CPU dan stabilitas saat banyak sesi aktif, restart GOWA, sesi rusak, dan pemadaman Armbian.
4. Tentukan jumlah maksimal sesi aman dari **pengujian nyata**, bukan angka sembarang (satu sesi pribadi/user adalah kebijakan awal, bukan kapasitas server).
5. Pastikan Cloudflare Access dan autentikasi GOWA aktif sehingga API admin GOWA tidak diakses langsung browser publik.

**Sumber risiko:** [WhatsApp Terms](https://www.whatsapp.com/legal/terms-of-service?lang=en) · [WhatsApp responsible use](https://faq.whatsapp.com/361005896189245/). Informasi kebijakan wajib diverifikasi ulang menjelang peluncuran.
