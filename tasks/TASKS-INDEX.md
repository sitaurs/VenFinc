# TASKS-INDEX — Eksekusi Production yang dapat diaudit

**Status:** planned / 0 implemented. Semua tugas awal `todo`; tidak ada klaim kode dibuat.

**Total:** 373 task individual (termasuk seluruh 177 PRD requirement IDs, 90 design screen IDs, dan fondasi/tes integrasi).

## Urutan dan jumlah

| Phase | Task | Fokus | Berkas |
|---|---:|---|---|
| P0 | 10 | Feasibility, architecture proof and external launch gates | [`TASKS-P0.md`](./TASKS-P0.md) |
| P1 | 12 | Monorepo, toolchain, tests and platform foundation | [`TASKS-P1.md`](./TASKS-P1.md) |
| P2 | 24 | Identity, RBAC, cross-tenant security and registration | [`TASKS-P2.md`](./TASKS-P2.md) |
| P3 | 52 | Atomic finance ledger, budgets, debts and reports | [`TASKS-P3.md`](./TASKS-P3.md) |
| P4 | 111 | Design system, PWA UX, 90 screen reference states | [`TASKS-P4.md`](./TASKS-P4.md) |
| P5 | 22 | Offline, privacy, import/export and object storage | [`TASKS-P5.md`](./TASKS-P5.md) |
| P6 | 8 | Armbian Finance Worker, durable queue, access and recovery | [`TASKS-P6.md`](./TASKS-P6.md) |
| P7 | 33 | GOWA shared bot, personal sessions and reminders | [`TASKS-P7.md`](./TASKS-P7.md) |
| P8 | 35 | 9router vision, Tesseract OCR, review and recheck | [`TASKS-P8.md`](./TASKS-P8.md) |
| P9 | 29 | Admin, superuser, policies and operational visibility | [`TASKS-P9.md`](./TASKS-P9.md) |
| P10 | 37 | Production hardening, performance and go/no-go | [`TASKS-P10.md`](./TASKS-P10.md) |

## Aturan status dan bukti
- `todo`: belum dimulai; `in_progress`: dikerjakan sesuai scope; `blocked`: eksternal gate/akses/gagal yang belum diselesaikan; `done`: semua tes pass dengan bukti; `failed`: tes/fungsi gagal.
- Satu task wajib memiliki **satu objective**, dependensi, referensi REQ/AC dan TRD/Design, serta cara verifikasi. Task fitur yang dipecah tetap harus membuktikan AC induknya di integration gate.
- **DAG diverifikasi:** semua dependensi ID ada, tidak ada duplikat task ID, tidak ada siklus.
- QA final harus menggabungkan tasks UI + integrasi data sesungguhnya; UI dengan mock tidak berarti fitur backend sudah production. Khusus layar REV-01..05, dependensi P5-003 dan P8-005 adalah **gate integrasi**, bukan dependensi eksekusi UI P4.
- Minta approval sebelum deploy live / kirim pesan WhatsApp ke pengguna / migrasi produksi / konsumsi biaya.

## Gate per phase
| Phase | Gate |
|---|---|
| P0 | Semua 10 tugas dalam [`TASKS-P0.md`](./TASKS-P0.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P1 | Semua 12 tugas dalam [`TASKS-P1.md`](./TASKS-P1.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P2 | Semua 24 tugas dalam [`TASKS-P2.md`](./TASKS-P2.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P3 | Semua 52 tugas dalam [`TASKS-P3.md`](./TASKS-P3.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P4 | Semua 111 tugas dalam [`TASKS-P4.md`](./TASKS-P4.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P5 | Semua 22 tugas dalam [`TASKS-P5.md`](./TASKS-P5.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P6 | Semua 8 tugas dalam [`TASKS-P6.md`](./TASKS-P6.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P7 | Semua 33 tugas dalam [`TASKS-P7.md`](./TASKS-P7.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P8 | Semua 35 tugas dalam [`TASKS-P8.md`](./TASKS-P8.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P9 | Semua 29 tugas dalam [`TASKS-P9.md`](./TASKS-P9.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |
| P10 | Semua 37 tugas dalam [`TASKS-P10.md`](./TASKS-P10.md) memiliki bukti; ketentuan keluar [`PLAN.md`](../plan/PLAN.md) diperiksa. |

## Sources
- [PRD](../docs/prd/PRD-00-INDEX.md) · [Requirements](../requirements/REQ-00-INDEX.md) · [Traceability](../requirements/REQ-10-TRACEABILITY.md) · [TRD](../architecture/TRD-00-OVERVIEW.md) · [Design](../design/DESIGN-00-FOUNDATIONS.md) · [QA acceptance](../qa/ACCEPTANCE-MATRIX.md).
