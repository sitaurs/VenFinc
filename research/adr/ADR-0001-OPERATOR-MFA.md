# ADR-0001 — MFA operator

Status: **ARAH POC DIPILIH — implementasi produksi menunggu bukti**, 24 Oktober 2026.

## Context

IAM-009, TRUST-011 dan TRD-04 mewajibkan MFA/step-up pada operasi operator. [Roadmap Managed Better Auth](https://neon.com/docs/auth/roadmap) masih menyatakan MFA coming soon pada telaah 24 Oktober 2026. Koneksi Neon aktual dan jalur RLS Worker belum teruji.

## Options

1. Pertahankan Managed Better Auth untuk pengguna dan evaluasi identitas operator terpisah melalui Cloudflare Access dengan MFA yang dapat diverifikasi server. Harus mengikat subjek kedua ke operator aplikasi, melarang jalur bypass, dan menyediakan reauth tindakan sensitif. Access saja tanpa pengikatan tersebut tidak cukup.
2. Evaluasi self-managed Better Auth dengan plugin MFA yang didukung versi terpasang pada host aplikasi yang disetujui. Perubahan candidate auth memerlukan persetujuan dan PoC; jangan memindahkan backend atau menambah layanan diam-diam.
3. Pertahankan candidate dan tahan fitur operator/registrasi publik sampai alur yang sesuai terbukti.

## Decision

Pertahankan Neon Managed Better Auth sebagai candidate identitas pengguna dan evaluasi Cloudflare Access dengan IdP yang mewajibkan MFA untuk jalur operator. Dasar: pemilik mendelegasikan pilihan terbaik setelah membaca pilihan PoC. Password hashing tidak dipindahkan ke Worker Free tanpa pembuktian CPU; layanan dan hostname baru tidak ditambahkan.

Pengikatan subject Managed Auth ke identitas operator Access harus berasal dari registry server, disertai verifikasi JWT issuer/audience/signature/expiry serta bukti policy MFA yang benar-benar aktif. Email atau header buatan browser bukan pengikatan. Perubahan role/kredensial memerlukan step-up baru yang dapat diverifikasi; jika metode ini tidak memenuhi seluruh kontrak, fitur operator tetap tertutup dan pilihan berikutnya dilaporkan sebelum cutover.

Fondasi lokal, kontrak dan fixture terisolasi boleh dikembangkan; akses privat produksi tetap fail-closed. PoC belum dijalankan dan keputusan ini bukan kelulusan G-IDENTITY/G-RLS.

## Safety / scope tradeoff

Jangan mengganti MFA dengan password kedua, OTP palsu, role browser, atau klaim JWT yang tidak diverifikasi. Tidak ada role operator demo pada jalur produksi.

## Impact

DEC-012, IAM-009/010, TRUST-011; TRD-00/04; AUTH-06 dan SYS-05. Perbarui kontrak dan tes setelah keputusan.

## Tests

PoC dua tenant; sesi dicabut; MFA belum dipenuhi/kedaluwarsa; bypass langsung API; pengikatan identitas salah; role change reauth dan audit; tidak ada secret dalam browser/log.

## Owner approval / timestamp

Pemilik produk: **arah PoC didelegasikan melalui instruksi “aturlah yg bagus”, 24 Oktober 2026**. Tidak ada deployment produksi, perubahan live Access, atau pengganti auth yang disetujui diam-diam.

## Rollback

Tahan rollout dan nonaktifkan tindakan operator bila alur verifikasi gagal; jangan mengubah ledger maupun melemahkan otorisasi.
