# ADR-0003 — Isolasi bucket R2 staging

Status: **APPROVED — owner selected option 1 in chat on 2026-10-25**

## Context

Pemilik menetapkan bucket R2 VenFinance `ven` dan melarang penggunaan `sap`, milik proyek lain. [TRD-05](../../architecture/TRD-05-DEPLOY-OPERATIONS.md) juga mewajibkan storage staging terpisah dari production. [ADR-0002](./ADR-0002-STAGING-HOSTNAME.md) melarang binding staging yang mengirim data uji ke `ven` secara sembarang sampai adapter owner-check dan isolasi terbukti. Keadaan Cloudflare terakhir menunjukkan `ven` private, Standard, lokasi APAC, `r2.dev` mati, dan belum ada object yang dibaca/ditulis.

## Options

1. Buat bucket privat khusus staging bernama `ven-staging`; bind hanya ke Worker staging setelah tes owner-check lokal lulus. `ven` tetap menjadi bucket production dan `sap` tidak disentuh. Pemakaian object/API tetap dapat menimbulkan biaya melewati allowance.
2. Pertahankan P0-008 pada emulator lokal dan jangan jalankan tes R2 live staging. Ini menghindari resource baru, tetapi menahan bukti binding, isolasi real Worker, dan gate `G-COST`.
3. Gunakan `ven` untuk staging dengan prefix terpisah. Opsi ini ditolak sebagai default karena binding Worker memiliki akses bucket-level; prefix bukan boundary IAM dan kesalahan konfigurasi dapat mencampur data staging dengan production.

## Decision

**Keputusan pemilik:** opsi 1 disetujui pada 2026-10-25. Buat `ven-staging` untuk data sintetis QA; bucket harus tetap private, `r2.dev` disabled, tanpa browser credentials atau public CORS. Test objects memakai prefix acak dan hanya object yang dibuat test tersebut yang boleh dibersihkan. `ven` tidak menerima data staging dan `sap` tidak pernah diakses.

Persetujuan mencakup provisioning `ven-staging` dan pemakaian terbatas untuk synthetic QA; binding staging dan remote object tests hanya dilakukan sesudah adapter owner-check dan isolasi lulus tes lokal. Keputusan ini tidak mengubah binding production atau memberi izin production go-live.

## Safety / scope tradeoff

Bucket terpisah memperkecil risiko kebocoran lintas lingkungan, tetapi memperkenalkan resource tambahan dan kemungkinan biaya pemakaian di luar allowance. Dashboard kuota dan threshold harus menjadi bagian dari `G-COST`; tidak ada asumsi bahwa object storage gratis tanpa batas.

## Impact

`P0-008`, `P1-007`, `P1-008`, `P5-003`; `TRD-01`, `TRD-02`, `TRD-04`, `TRD-05`; `TRUST-001`, `TRUST-003`, `TRUST-009`; Cloudflare staging binding dan runbook.

## Tests

- Local: owner A dapat menulis/membaca object miliknya; B tidak dapat membaca atau menghapus object A meskipun mengetahui proof ID.
- Worker: MIME/magic mismatch, byte limit + 1, hash mismatch, expired intent, missing binding, stale session, dan request tanpa session ditolak.
- Staging setelah keputusan: synthetic A/B melalui Worker pada `ven-staging`, private bucket dan `r2.dev` tetap nonaktif, object uji terhapus, tidak ada request ke bucket `ven` atau `sap`.
- Cost: verifikasi allowance/usage alerts aktual dan pastikan manual finance tetap dapat dipakai jika upload ditahan.

## Owner approval / timestamp

Disetujui pemilik di percakapan pada 2026-10-25: opsi 1 (`ven-staging`, private, synthetic QA only).

## Rollback

Matikan binding dan route upload staging, cabut DNS/Worker staging sesuai ADR-0002, lalu hapus hanya bucket staging setelah memastikan isinya milik VenFinance dan tidak diperlukan untuk audit. Jangan menghapus atau mengubah bucket `ven`/`sap` sebagai bagian rollback ADR ini.
