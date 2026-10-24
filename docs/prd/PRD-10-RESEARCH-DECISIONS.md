# PRD-10 — Hasil Riset, Keputusan Terbuka, Asumsi, dan Risiko Production

**Relasi:** [Indeks](./PRD-00-INDEX.md) · [WA](./PRD-05-WHATSAPP-GOWA.md) · [AI](./PRD-06-AI-OCR.md) · [Kualitas](./PRD-09-NFR-ACCEPTANCE.md)

**Tanggal telaah sumber:** 23 Oktober 2026 (tanggal konteks). Informasi platform dapat berubah sewaktu-waktu dan harus diverifikasi ulang sebelum implementation/deploy.

## 1. Temuan yang terkonfirmasi dari sumber primer

| Topik | Temuan yang dapat dijadikan dasar PRD | Sumber |
|---|---|---|
| Cloudflare Workers Free | 100.000 request/hari, 10 ms CPU per invocation, 128 MB memory, 100 Worker per akun; free static asset requests bukan API requests. | [CF Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) |
| Hosting React PWA | Worker dapat menghosting React static assets dan API bersama. | [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) |
| R2 Standard Free | 10 GB-month, 1M operasi Class A, 10M Class B; egress free. Overage dapat dikenakan biaya. | [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) |
| Neon Free 2026 | 1 GB storage, 100 CU-hours per project per bulan; Neon mengumumkannya 2 Okt 2026. | [Neon Free plan](https://neon.com/blog/neon-free-plan-1-gb-per-project) |
| Neon Auth | Managed Better Auth terintegrasi identitas di Neon; tidak sama dengan self-hosted Better Auth plugin. | [Neon Auth](https://neon.com/blog/neon-auth-branchable-identity-in-your-database) |
| GOWA v8+ | Satu instance menangani banyak akun/device; API device memerlukan scoping, webhook menyertakan `device_id`. | [GOWA README](https://github.com/aldinokemal/go-whatsapp-web-multidevice) |
| GOWA v9 API | Endpoint create/login QR/pairing/status/reconnect/logout/delete per device terdokumentasi; identitas sesi dipilih dengan `X-Device-Id` atau `device_id` sesuai endpoint. | [OpenAPI GOWA](https://github.com/aldinokemal/go-whatsapp-web-multidevice/blob/main/docs/openapi.yaml) |
| GOWA security settings | `APP_BASIC_AUTH`, `WHATSAPP_WEBHOOK_SECRET`, `MCP_ENABLED`, dan lain-lain terdapat di dokumentasi; harus diset eksplisit agar aman. | [GOWA README](https://github.com/aldinokemal/go-whatsapp-web-multidevice) |
| Cloudflare Tunnel | Multiple public hostnames dapat memetakan ke service lokal, memakai domain terkelola Cloudflare. | [Tunnel published apps](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/) |
| Cloudflare Access | Server-to-server dapat memakai pasangan `CF-Access-Client-Id`/`CF-Access-Client-Secret`. | [Access Service Tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/) |
| 9router | Repo `decolua/9router` memiliki image ARM64 dan proxy OpenAI-compatible di `/v1`; dukungan vision bergantung model/provider. | [9router README](https://github.com/decolua/9router), [Integration guide](https://github.com/decolua/9router/blob/master/gitbook/content/en/integration/other-tools.md) |
| PWA Share Target | Belum universal di semua browser; perlu fallback pemilihan file. | [MDN Share Target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target) |
| PWA background | Service worker tidak selalu hidup; background sync tidak dapat diandalkan sebagai satu-satunya scheduler. | [MDN PWA Background](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) |
| UU PDP | Data keuangan pribadi adalah data pribadi spesifik; pemrosesan mensyaratkan prinsip dan dasar sah sesuai UU 27/2022. | [JDIH UU PDP](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/crc32/), [BPK](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) |
| WhatsApp Terms | WhatsApp membatasi automated/bulk/unauthorized access dan dapat menonaktifkan akun untuk pelanggaran; GOWA bukan platform resmi. | [WhatsApp Terms](https://www.whatsapp.com/legal/terms-of-service?lang=en), [Responsible Use](https://faq.whatsapp.com/361005896189245/) |
| Standar keamanan | OWASP ASVS 5 dan rekomendasi otorisasi multi-tenant adalah baseline relevan. | [OWASP ASVS](https://asvs.owasp.org/), [OWASP Cornucopia authorization](https://cornucopia.owasp.org/edition/webapp/AZ2) |

## 2. Fakta yang **belum** dapat diasumsikan

| Item | Status | Konsekuensi |
|---|---|---|
| 9router meneruskan gambar ke setiap upstream vision | **Belum terbukti secara operasional** | Uji gambar real dan JSON image payload pada model yang operator pilih. |
| Semua model OpenAI/Anthropic-compatible mendukung image | **Tidak otomatis** | Model capability registry dan test per model diperlukan. |
| GOWA aman untuk jumlah sesi WA tak terbatas | **Tidak** | Batas sesi ditentukan oleh benchmark ARM RAM/CPU dan stabilitas. |
| GOWA diizinkan WhatsApp untuk digunakan sebagai layanan multiuser publik | **Risiko kebijakan tinggi** | Perlu penilaian ToS/legal dan alternatif API resmi; jangan klaim resmi. |
| Pengingat GOWA/Armbian berjalan 24/7 tanpa gangguan | **Tidak terjamin** | Fallback PWA, queued jobs, banner status. |
| Semua penyedia layanan selamanya $0 | **Tidak** | Free allowances, biaya listrik/domain, overage R2, upstream AI dipantau. |
| Neon Managed Auth cocok untuk semua MFA/email scenarios | **Belum dipilih final** | Uji dukungan end-to-end dan penyedia email. |
| Cloudflare Workers 10ms CPU cukup untuk semua handler | **Belum diuji beban** | Keep API ringan dan pindahkan heavy processing ke Armbian. |
| Pengguna mau WA pribadi diakses melalui server pihak ketiga | **Belum diuji lewat user research** | Mode bot bersama disediakan, consent jelas, opsi non-WA. |
| Browser apa pun bisa 'Share screenshot to PWA' | **Tidak universal** | Upload file manual wajib selalu tersedia. |

## 3. Decision register — `DEC-*`

| ID | Keputusan produk | Status | Catatan |
|---|---|---|---|
| `DEC-001` | Nama kerja VenFinance | **Usulan** | Rebranding dapat dilakukan; nama legal/trademark belum dicek. |
| `DEC-002` | Domain `finance.venlab.tech`, `gowa.venlab.tech`, `9r.venlab.tech` | **Disepakati konseptual** | Aset Cloudflare belum dibuat. Domain tambahan tidak wajib. |
| `DEC-003` | React PWA pada Cloudflare Worker, Neon, R2, Armbian GOWA/9router | **Disepakati konseptual** | Rincian implementasi nanti di TRD/DESIGN. |
| `DEC-004` | Pendaftaran publik multiuser, 3 role (`user`, `admin`, `superuser`) | **Disepakati** | User public tidak bisa menentukan role. |
| `DEC-005` | Bot WA bersama default + sesi WA pribadi opsional | **Rekomendasi** | Sesi pribadi ada dalam spesifikasi, tetapi perlu gating keamanan dan ToS. |
| `DEC-006` | 1 sesi WA pribadi aktif per akun saat awal | **Usulan** | Batas dapat dinaikkan setelah uji memori/CPU dan persetujuan operator. |
| `DEC-007` | Pengingat awal 20.30 Asia/Jakarta, dapat diubah user | **Usulan** | Tidak wajib bagi seluruh user. |
| `DEC-008` | 5 ekstraksi AI/hari, 5 MB/file, 100 MB storage/user | **Usulan** | Quota harus dapat diatur oleh Superuser. |
| `DEC-009` | Bahasa Indonesia default, English opsional | **Usulan** | Baik untuk skenario lomba/demonstrasi. |
| `DEC-010` | Data bukti disimpan privat, default retensi 90 hari setelah final | **Usulan** | Butuh privacy/legal review, dapat disesuaikan. |
| `DEC-011` | Tidak ada integrasi bank atau kontrol QRIS fisik | **Disepakati dari scope** | Pencatatan tetap manual, chat, atau bukti foto. |
| `DEC-012` | Login Neon Managed Better Auth | **Kandidat kuat** | Uji MFA, verifikasi email, Worker compatibility dan biaya email. |
| `DEC-013` | OCR fallback lokal Armbian dan AI recheck ketika pulih | **Disepakati** | Tidak boleh ubah ledger final diam-diam. |
| `DEC-014` | Target $0 biaya layanan di free tier | **Disepakati sebagai sasaran** | Bukan SLA gratis selamanya atau kapasitas tak terbatas. |

## 4. Keputusan yang masih perlu konfirmasi pemilik produk (tidak menghalangi penulisan PRD)

Ini bukan pertanyaan yang harus dijawab sekarang untuk mulai dokumen berikutnya. Bila tidak ada perubahan, defaults dalam tabel decision register dipakai sebagai *working assumptions*.

1. **Nama final** apakah tetap VenFinance atau nama yang dipilih nanti.
2. **Moda WA publik**: apakah fitur personal session memang akan dibuka luas sejak launch, atau diaktifkan hanya bagi pengguna yang memenuhi syarat/terpilih setelah audit; default aman yang disarankan ialah gated rollout.
3. **Kebijakan privasi data**: lama penyimpanan struk asli, kebutuhan export/lupa data, dan apakah user boleh menahan file lebih lama dengan kuota.
4. **Identitas admin**: siapa yang mengelola support dan bagaimana MFA/approval role change dilakukan.
5. **Kuota**: angka awal foto/hari, ukuran file, storage/user serta batas sesi pada perangkat Armbian yang tersedia.
6. **Kanal verifikasi**: hanya email atau tambah Google OAuth dan email provider yang dapat berjalan pada target gratis.
7. **Bahasa/brand**: untuk lomba, apakah antarmuka ID/EN wajib dan aset identitas visual akan dipilih kemudian.
8. **Notifikasi**: jam default, frekuensi ringkasan, quiet hours, serta apakah email summary juga diinginkan.

## 5. Risk register untuk peluncuran publik

| Risiko | Dampak | Probabilitas kualitatif | Mitigasi produk |
|---|---|---|---|
| GOWA integrasi WA tak resmi | Akun WA/sesi terganggu atau dibatasi | Tinggi untuk layanan publik tanpa evaluasi | Consent, opsi non-WA, rate limiting, feature flag, kaji alternatif resmi |
| Banyak WA personal sessions | Armbian memory exhaustion / cross impact | Menengah–tinggi, tergantung hardware | Cap sesi berbasis load test, restart recovery, isolasi event, monitoring |
| Kesalahan ekstraksi AI/OCR | Keputusan budget salah | Menengah | Provisional, rules validation, user confirmation, audit |
| Tenant data leak | Pelanggaran privasi berat | Kritis; target kemungkinan ditekan serendah mungkin | RBAC/RLS, private files, test IDOR, audit, security review |
| Penyalahgunaan free quota | API/AI mati atau biaya storage | Menengah | Per-user quota, global cap, retention, warnings, degraded mode |
| Public access to 9router/GOWA | Secret/sesi diambil pihak lain | Kritis | Cloudflare Access + aplikasi auth, credential rotation, no direct browser |
| Neon downtime | Server read/write tak tersedia | Menengah | Offline draft, status transparan, antrean untuk operasi tertentu |
| R2 downtime atau bug upload | Evidence hilang/salah owner | Menengah | Ownership checks, object lifecycle, retry dan input teks alternatif |
| Penyalahgunaan pendaftaran | Spam, biaya, WA ban | Menengah | Email verification, Turnstile, rate limit, abuse queue |
| Kurang pemahaman 'budget vs uang bank' | User salah menganggap transaksi diblokir | Menengah | Onboarding jelas, label virtual, preview sebelum jajan |
| Aturan privasi Indonesia | Risiko kepatuhan/pelanggaran hak | Kritis | Legal review UU PDP, disclosure, consent, export/delete & retention |

## 6. Hal-hal yang perlu dijabarkan setelah PRD, bukan sekarang

**REQUIREMENTS.md:** kebutuhan formal yang dapat ditelusuri sampai tes, dependency matrix, input/output constraints.

**TRD.md:** kontrak API, deployment runtime, provider compatibility, DB transaction semantics, queue/event approach, observability, security controls teknis.

**DESIGN.md:** diagram arsitektur final, model data/ERD, sequence diagrams, wireframes, design system, flow states.

**PLAN.md:** strategi implementasi dan integrasi yang realistis, prioritas, release sequencing, resource allocation.

**TASK.md/TASKS.md:** tugas per fase dan definition-of-done teknis.

**AGENTS.md:** instruksi agent, policy tool usage, dependency docs, QA gate dan panduan kolaborasi.

Seluruh dokumen di atas **belum dibuat** sesuai instruksi pemilik produk untuk fokus hanya PRD dalam paket ini.

## 7. Bibliografi sumber yang dipakai

- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers Static Assets & billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare Tunnel published applications](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/)
- [Cloudflare Access service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/)
- [Neon Free storage and compute, 2 October 2026](https://neon.com/blog/neon-free-plan-1-gb-per-project)
- [Neon Managed Better Auth](https://neon.com/blog/neon-auth-branchable-identity-in-your-database)
- [GOWA repository](https://github.com/aldinokemal/go-whatsapp-web-multidevice)
- [GOWA OpenAPI 9.x](https://github.com/aldinokemal/go-whatsapp-web-multidevice/blob/main/docs/openapi.yaml)
- [9router repository](https://github.com/decolua/9router)
- [9router integration guide](https://github.com/decolua/9router/blob/master/gitbook/content/en/integration/other-tools.md)
- [Tesseract.js](https://github.com/naptha/tesseract.js)
- [MDN PWA Offline](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [MDN Share Target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target)
- [UU PDP JDIH](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/crc32/)
- [UU PDP BPK](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)
- [WhatsApp Terms](https://www.whatsapp.com/legal/terms-of-service?lang=en)
- [WhatsApp responsible use](https://faq.whatsapp.com/361005896189245/)
- [OWASP ASVS](https://asvs.owasp.org/)
