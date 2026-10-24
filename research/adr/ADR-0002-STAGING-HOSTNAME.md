# ADR-0002 — Hostname staging

Status: **DRAFT — keputusan pemilik diperlukan**, 24 Oktober 2026.

## Context

DEC-002/AGENTS membatasi baseline pada finance.venlab.tech, gowa.venlab.tech dan 9r.venlab.tech. Tabel staging TRD-05 memuat staging-finance.venlab.tech. Tidak ada persetujuan hostname keempat.

## Options

1. Gunakan pengujian lokal dengan Worker emulator dan fixture terisolasi sambil menunggu keputusan lingkungan staging eksternal.
2. Evaluasi URL preview penyedia yang dilindungi, dengan auth origin/cookie, R2 dan DB terisolasi; URL tambahan tetap harus disetujui sesuai batas domain.
3. Setujui hostname staging tambahan melalui ADR eksplisit, termasuk Access, trusted origins, pemisahan binding dan prosedur penghapusan.

## Decision

Belum dipilih. Konfigurasi yang dibuat sekarang tidak mendaftarkan domain atau route live dan hanya memakai binding lokal R2 bernama ven.

## Safety / scope tradeoff

Tidak berbagi secret/data produksi ke preview. Jangan memakai bucket sap atau mengubah ingress layanan lain.

## Impact

DEC-002, TRD-00/05, P0-007, P1-005/007 dan konfigurasi auth/CI.

## Tests

Origin/cookie/CSRF, Access/path bypass, bindings terpisah, private R2 dan dua tenant. Pengujian staging cloud belum dijalankan.

## Owner approval / timestamp

Pemilik produk: **PENDING**. Tanggal draf: 24 Oktober 2026. Tidak ada hostname yang ditambahkan.

## Rollback

Kembali ke pengujian lokal; cabut deployment preview yang disetujui bila kelak ada, tanpa menyentuh produksi.
