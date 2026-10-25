-- Rollback is intentionally blocked while any proof metadata exists.
-- Before running this on a VenFinance environment:
--   1. Set PROOF_STORAGE_ENABLED=0 and wait for the Worker config to propagate.
--   2. Verify the `proofs/` prefix is empty in the corresponding VenFinance bucket.
--   3. Never inspect or modify the unrelated `sap` bucket.
DO $$ BEGIN
  IF to_regclass('public.proofs') IS NOT NULL AND EXISTS (SELECT 1 FROM public.proofs) THEN
    RAISE EXCEPTION 'PROOFS_ROLLBACK_BLOCKED: export/audit records and remove VenFinance R2 objects first';
  END IF;
END $$;
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz, text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.get_proof_upload(uuid);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.mark_proof_stored(uuid);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.mark_proof_deleted(uuid);
--> statement-breakpoint
DROP TABLE IF EXISTS public.proofs;
