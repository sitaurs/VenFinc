# REQ-01-PRODUCT-IAM — User Stories & Acceptance Criteria

**PRD dasar:** [`PRD-01-VISION-SCOPE.md`](../docs/prd/PRD-01-VISION-SCOPE.md), [`PRD-02-IDENTITY-RBAC.md`](../docs/prd/PRD-02-IDENTITY-RBAC.md).

**Interpretasi:** AC-A adalah observasi dasar untuk satu ID; AC-B adalah skenario batas/negatif (bila berlaku). Semua kasus rinci wajib juga lolos [REQ-09-SCENARIOS.md](./REQ-09-SCENARIOS.md).

Tabel/entri di bawah mengikat ID persyaratan sumber. Apabila visual mockup berbeda dari hasil test ini, perilaku mengikuti requirement dan keputusan produk, bukan angka raster pada gambar.

## PROD: Acceptance per requirement

<a id="prod-001"></a>

### PROD-001 — Dapat digunakan banyak pengguna terdaftar dengan isolasi data yang ketat.

- **US-PROD-001:** Sebagai pengguna atau pengelola platform, saya ingin dapat digunakan banyak pengguna terdaftar dengan isolasi data yang ketat, agar produk bermanfaat dan dapat dipercaya.
- **AC-PROD-001-A (G/W/T):** **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Dapat digunakan banyak pengguna terdaftar dengan isolasi data yang ketat.", **maka** Semua objek privat scoped terhadap pemiliknya; uji lintas akun 100% ditolak.
- **AC-PROD-001-B (batas):** Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang.

<a id="prod-002"></a>

### PROD-002 — Pengeluaran/pemasukan mudah dicatat dengan teks, nominal, foto, atau WA.

- **US-PROD-002:** Sebagai pengguna atau pengelola platform, saya ingin pengeluaran/pemasukan mudah dicatat dengan teks, nominal, foto, atau WA, agar produk bermanfaat dan dapat dipercaya.
- **AC-PROD-002-A (G/W/T):** **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Pengeluaran/pemasukan mudah dicatat dengan teks, nominal, foto, atau WA.", **maka** Pengguna baru dapat membuat transaksi manual sah tanpa AI/WA dalam <=30 detik setelah login.
- **AC-PROD-002-B (batas):** Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang.

<a id="prod-003"></a>

### PROD-003 — Anggaran secara real-time menunjukkan sisa kategori, keseluruhan, dan tren.

- **US-PROD-003:** Sebagai pengguna atau pengelola platform, saya ingin anggaran secara real-time menunjukkan sisa kategori, keseluruhan, dan tren, agar produk bermanfaat dan dapat dipercaya.
- **AC-PROD-003-A (G/W/T):** **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Anggaran secara real-time menunjukkan sisa kategori, keseluruhan, dan tren.", **maka** Setiap perubahan transaksi terkonfirmasi langsung tercermin di sisa anggaran dan laporan.
- **AC-PROD-003-B (batas):** Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang.

<a id="prod-004"></a>

### PROD-004 — Pengingat mendorong kebiasaan tanpa mempermalukan.

- **US-PROD-004:** Sebagai pengguna atau pengelola platform, saya ingin pengingat mendorong kebiasaan tanpa mempermalukan, agar produk bermanfaat dan dapat dipercaya.
- **AC-PROD-004-A (G/W/T):** **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Pengingat mendorong kebiasaan tanpa mempermalukan.", **maka** Semua notifikasi non-keamanan opt-in/konfigurabel; dapat dijeda/dimatikan.
- **AC-PROD-004-B (batas):** Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang.

<a id="prod-005"></a>

### PROD-005 — AI tidak boleh merusak pembukuan.

- **US-PROD-005:** Sebagai pengguna atau pengelola platform, saya ingin aI tidak boleh merusak pembukuan, agar produk bermanfaat dan dapat dipercaya.
- **AC-PROD-005-A (G/W/T):** **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "AI tidak boleh merusak pembukuan.", **maka** Hasil ambigu/provisional tetap dapat dikoreksi; tidak ada perubahan nominal diam-diam.
- **AC-PROD-005-B (batas):** Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang.

<a id="prod-006"></a>

### PROD-006 — Produk tetap berguna selama gangguan integrasi.

- **US-PROD-006:** Sebagai pengguna atau pengelola platform, saya ingin produk tetap berguna selama gangguan integrasi, agar produk bermanfaat dan dapat dipercaya.
- **AC-PROD-006-A (G/W/T):** **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Produk tetap berguna selama gangguan integrasi.", **maka** Pencatatan manual online tersedia walau WA/AI offline; draft offline antre tanpa hilang.
- **AC-PROD-006-B (batas):** Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang.

<a id="prod-007"></a>

### PROD-007 — Platform siap untuk demo/lomba, namun dapat dioperasikan sebagai produk publik.

- **US-PROD-007:** Sebagai pengguna atau pengelola platform, saya ingin platform siap untuk demo/lomba, namun dapat dioperasikan sebagai produk publik, agar produk bermanfaat dan dapat dipercaya.
- **AC-PROD-007-A (G/W/T):** **Diberikan** pengguna menggunakan sistem sesuai izin dan status yang berlaku, **ketika** pengguna menjalankan kemampuan "Platform siap untuk demo/lomba, namun dapat dioperasikan sebagai produk publik.", **maka** Landing page, onboarding, panel admin, kebijakan privasi, ekspor data, audit, dan pengujian rilis terpenuhi.
- **AC-PROD-007-B (batas):** Tidak ada proses opsional yang membuat pencatatan manual atau isolasi pengguna hilang.

## IAM: Acceptance per requirement

<a id="iam-001"></a>

### IAM-001 — Daftar publik dengan email dan password, disertai verifikasi email.

- **US-IAM-001:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin daftar publik dengan email dan password, disertai verifikasi email, agar akses aman dan pribadi.
- **AC-IAM-001-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Daftar publik dengan email dan password, disertai verifikasi email.", **maka** Akun baru selalu `user`, status belum terverifikasi dibatasi, password disimpan oleh provider auth tepercaya.
- **AC-IAM-001-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-002"></a>

### IAM-002 — Login, logout, lupa password, reset password, ganti email, verifikasi ulang email.

- **US-IAM-002:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin login, logout, lupa password, reset password, ganti email, verifikasi ulang email, agar akses aman dan pribadi.
- **AC-IAM-002-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Login, logout, lupa password, reset password, ganti email, verifikasi ulang email.", **maka** Sesi lama yang relevan dapat dicabut setelah tindakan keamanan kritis.
- **AC-IAM-002-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-003"></a>

### IAM-003 — Pilihan login federasi Google jika konfigurasi OAuth diaktifkan.

- **US-IAM-003:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin pilihan login federasi Google jika konfigurasi OAuth diaktifkan, agar akses aman dan pribadi.
- **AC-IAM-003-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Pilihan login federasi Google jika konfigurasi OAuth diaktifkan.", **maka** Akun dapat ditautkan tanpa duplikasi identitas; konflik email ditangani aman.
- **AC-IAM-003-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-004"></a>

### IAM-004 — Session management mandiri: daftar perangkat aktif, revoke sesi, logout semua perangkat.

- **US-IAM-004:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin session management mandiri: daftar perangkat aktif, revoke sesi, logout semua perangkat, agar akses aman dan pribadi.
- **AC-IAM-004-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Session management mandiri: daftar perangkat aktif, revoke sesi, logout semua perangkat.", **maka** Operasi tidak membocorkan token atau rincian autentikasi.
- **AC-IAM-004-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-005"></a>

### IAM-005 — Perlindungan pendaftaran/login: rate limit, Turnstile bila perlu, pencegahan enumerasi email.

- **US-IAM-005:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin perlindungan pendaftaran/login: rate limit, Turnstile bila perlu, pencegahan enumerasi email, agar akses aman dan pribadi.
- **AC-IAM-005-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Perlindungan pendaftaran/login: rate limit, Turnstile bila perlu, pencegahan enumerasi email.", **maka** Pesan kesalahan tidak memberitahu penyerang apakah alamat email telah terdaftar.
- **AC-IAM-005-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-006"></a>

### IAM-006 — Onboarding: zona waktu, mata uang dasar, nama panggilan, siklus keuangan, preferensi AI/WA, budget awal.

- **US-IAM-006:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin onboarding: zona waktu, mata uang dasar, nama panggilan, siklus keuangan, preferensi AI/WA, budget awal, agar akses aman dan pribadi.
- **AC-IAM-006-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Onboarding: zona waktu, mata uang dasar, nama panggilan, siklus keuangan, preferensi AI/WA, budget awal.", **maka** Semua pilihan dapat diubah kemudian; jangan memaksa input sensitif selain yang diperlukan.
- **AC-IAM-006-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-007"></a>

### IAM-007 — Pengelolaan profil: nama tampilan, foto opsional, bahasa, tema, zona waktu, notifikasi.

- **US-IAM-007:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin pengelolaan profil: nama tampilan, foto opsional, bahasa, tema, zona waktu, notifikasi, agar akses aman dan pribadi.
- **AC-IAM-007-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Pengelolaan profil: nama tampilan, foto opsional, bahasa, tema, zona waktu, notifikasi.", **maka** Perubahan tersimpan dan tidak mengubah kepemilikan transaksi.
- **AC-IAM-007-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-008"></a>

### IAM-008 — Peran akses platform 3 tingkat; otorisasi server-side untuk tiap operasi.

- **US-IAM-008:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin peran akses platform 3 tingkat; otorisasi server-side untuk tiap operasi, agar akses aman dan pribadi.
- **AC-IAM-008-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Peran akses platform 3 tingkat; otorisasi server-side untuk tiap operasi.", **maka** Default-deny, bukan sekadar sembunyi menu UI.
- **AC-IAM-008-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-009"></a>

### IAM-009 — Hanya Superuser dapat mengangkat/menurunkan Admin; role Superuser tidak bisa diperoleh melalui register/API publik.

- **US-IAM-009:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin hanya Superuser dapat mengangkat/menurunkan Admin; role Superuser tidak bisa diperoleh melalui register/API publik, agar akses aman dan pribadi.
- **AC-IAM-009-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Hanya Superuser dapat mengangkat/menurunkan Admin; role Superuser tidak bisa diperoleh melalui register/API publik.", **maka** Kenaikan role membutuhkan autentikasi ulang dan audit.
- **AC-IAM-009-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-010"></a>

### IAM-010 — Superuser pertama dibuat melalui bootstrap terkontrol dengan kredensial aman.

- **US-IAM-010:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin superuser pertama dibuat melalui bootstrap terkontrol dengan kredensial aman, agar akses aman dan pribadi.
- **AC-IAM-010-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Superuser pertama dibuat melalui bootstrap terkontrol dengan kredensial aman.", **maka** Tidak ada akun default/password hard-coded publik.
- **AC-IAM-010-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-011"></a>

### IAM-011 — Suspensi, penonaktifan, pemulihan status akun dengan alasan dan jalur keberatan.

- **US-IAM-011:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin suspensi, penonaktifan, pemulihan status akun dengan alasan dan jalur keberatan, agar akses aman dan pribadi.
- **AC-IAM-011-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Suspensi, penonaktifan, pemulihan status akun dengan alasan dan jalur keberatan.", **maka** Admin dapat menangani kebijakan, tetapi tidak menghapus ledger tanpa dasar/prosedur.
- **AC-IAM-011-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-012"></a>

### IAM-012 — Identitas WhatsApp melalui proses pengikatan dan pembuktian kendali nomor/sesi.

- **US-IAM-012:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin identitas WhatsApp melalui proses pengikatan dan pembuktian kendali nomor/sesi, agar akses aman dan pribadi.
- **AC-IAM-012-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Identitas WhatsApp melalui proses pengikatan dan pembuktian kendali nomor/sesi.", **maka** Nomor tidak dapat diam-diam ditautkan ke dua akun aktif tanpa penyelesaian konflik aman.
- **AC-IAM-012-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

<a id="iam-013"></a>

### IAM-013 — Permintaan export/delete akun dan seluruh datanya secara mandiri.

- **US-IAM-013:** Sebagai pengguna terdaftar atau calon pengguna, saya ingin permintaan export/delete akun dan seluruh datanya secara mandiri, agar akses aman dan pribadi.
- **AC-IAM-013-A (G/W/T):** **Diberikan** identitas, status akun, dan kewenangan telah diperiksa, **ketika** pengguna menjalankan kemampuan "Permintaan export/delete akun dan seluruh datanya secara mandiri.", **maka** Harus dibuktikan oleh user login dan melewati konfirmasi risiko tindakan.
- **AC-IAM-013-B (batas):** Orang yang tidak berhak, akun belum sah, atau sesi kedaluwarsa tidak memperoleh akses privat; respons tidak membocorkan informasi akun.

