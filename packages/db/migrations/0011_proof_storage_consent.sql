DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.proofs) THEN
    RAISE EXCEPTION 'PROOF_CONSENT_BACKFILL_REQUIRES_REVIEW';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "proofs" ADD COLUMN "consent_version" varchar(40) NOT NULL;--> statement-breakpoint
ALTER TABLE "proofs" ADD COLUMN "consented_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_consent_version_valid" CHECK ("proofs"."consent_version" = 'proof-storage-v1');
--> statement-breakpoint
DROP FUNCTION public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz);--> statement-breakpoint
CREATE FUNCTION public.create_proof_upload(
  p_proof_id uuid,
  p_object_key text,
  p_content_type text,
  p_size_bytes integer,
  p_sha256 text,
  p_upload_token_hash text,
  p_upload_expires_at timestamptz,
  p_expires_at timestamptz,
  p_consent_version text
) RETURNS TABLE (
  id uuid, user_id text, object_key text, content_type text, size_bytes integer,
  sha256 text, upload_token_hash text, upload_expires_at timestamptz,
  expires_at timestamptz, upload_state text, created_at timestamptz, stored_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE
  subject text := public.current_app_user_id();
  current_time timestamptz := clock_timestamp();
BEGIN
  IF subject IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.user_id = subject AND p.account_status = 'active'
  ) THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
  END IF;
  IF p_proof_id IS NULL
     OR p_object_key IS NULL OR p_object_key !~ '^proofs/[0-9a-f-]{36}/[0-9a-f-]{36}$'
     OR p_content_type IS NULL OR p_content_type NOT IN ('image/jpeg', 'image/png', 'image/webp')
     OR p_size_bytes IS NULL OR p_size_bytes NOT BETWEEN 1 AND 5242880
     OR p_sha256 IS NULL OR p_sha256 !~ '^[a-f0-9]{64}$'
     OR p_upload_token_hash IS NULL OR p_upload_token_hash !~ '^[a-f0-9]{64}$'
     OR p_upload_expires_at IS NULL OR p_upload_expires_at <= current_time
     OR p_upload_expires_at > current_time + interval '15 minutes'
     OR p_expires_at IS NULL OR p_expires_at <= p_upload_expires_at
     OR p_consent_version IS DISTINCT FROM 'proof-storage-v1'
  THEN
    RAISE EXCEPTION 'INVALID_PROOF_UPLOAD' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
  INSERT INTO public.proofs AS proof (
    id, user_id, object_key, content_type, size_bytes, sha256, upload_token_hash,
    consent_version, consented_at, upload_expires_at, expires_at, upload_state
  ) VALUES (
    p_proof_id, subject, p_object_key, p_content_type, p_size_bytes, p_sha256,
    p_upload_token_hash, p_consent_version, current_time, p_upload_expires_at,
    p_expires_at, 'pending'
  )
  RETURNING proof.id, proof.user_id, proof.object_key, proof.content_type, proof.size_bytes,
    proof.sha256, proof.upload_token_hash, proof.upload_expires_at, proof.expires_at,
    proof.upload_state, proof.created_at, proof.stored_at;
END $$;--> statement-breakpoint
ALTER FUNCTION public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz, text)
  OWNER TO venfinance_mutator;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz, text)
  FROM PUBLIC, anonymous;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz, text)
  TO authenticated;
