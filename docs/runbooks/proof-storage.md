# Proof storage implementation and release gate

The `/app/review/upload` route now supports local image selection, camera input, paste/drop, consent, validation, progress, retry/cancel, and manual transaction entry. Before an image leaves the device, the browser re-encodes it to a metadata-free WebP (JPEG fallback) and caps dimensions at 12,000 pixels per edge / 40 megapixels. The Worker checks the owner-bound intent, exact checksum and byte count, image signature, dimensions, and metadata chunks before writing to a private R2 binding. Upload and completion are separate; no extraction or ledger posting is triggered.

The API and `proofs` migrations are code only. They have **not** been applied to Neon and the Worker has **not** been deployed. Both Wrangler configurations keep `PROOF_STORAGE_ENABLED=0` and `PROOF_RETENTION_CLEANUP_READY=0`. Keep both flags at `0`: this repository does not yet contain a verified retention cleanup job or an owner-approved retention/legal policy. The upload feature must stay unavailable until those exist and staging tenant isolation has been tested through the deployed Worker.

Before a future staging enablement, require all of the following:

1. Record the approved retention period and the exact consent text/version; update the browser disclosure so the user sees that period before consenting.
2. Implement and test a scheduled cleanup process for expired pending and stored proofs. It must be owner-independent, bounded, retry-safe, and physically delete only objects under the VenFinance proof prefix; tombstones must remain auditable.
3. Apply the reviewed migrations to the VenFinance staging branch with a backup/rollback plan. Do not run this rollback against data; it deliberately refuses while proof rows remain.
4. Test A/B tenant isolation, upload/complete/read/delete, malformed images, oversize/dimension limits, retries, cancellation races, and cleanup against `ven-staging` through the Worker. Never access the unrelated `sap` bucket.
5. Review R2/Neon quota alerts and cost limits, then explicitly approve staging enablement. Production still requires a separate go-live approval.

Current automated coverage uses local fakes and browser-mocked APIs. It does not prove a live Neon migration, real R2 isolation, virus scanning, OCR/AI, or production readiness.
