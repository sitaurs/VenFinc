CREATE TABLE "proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"object_key" text NOT NULL,
	"content_type" varchar(32) NOT NULL,
	"size_bytes" integer NOT NULL,
	"sha256" char(64) NOT NULL,
	"upload_token_hash" char(64) NOT NULL,
	"upload_expires_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"upload_state" text DEFAULT 'pending' NOT NULL,
	"stored_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proofs_user_id_id_uq" UNIQUE("user_id","id"),
	CONSTRAINT "proofs_object_key_shape" CHECK ("proofs"."object_key" ~ '^proofs/[0-9a-f-]{36}/[0-9a-f-]{36}$'),
	CONSTRAINT "proofs_content_type_valid" CHECK ("proofs"."content_type" IN ('image/jpeg', 'image/png', 'image/webp')),
	CONSTRAINT "proofs_size_bytes_valid" CHECK ("proofs"."size_bytes" BETWEEN 1 AND 5242880),
	CONSTRAINT "proofs_sha256_valid" CHECK ("proofs"."sha256" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "proofs_upload_token_hash_valid" CHECK ("proofs"."upload_token_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "proofs_upload_state_valid" CHECK ("proofs"."upload_state" IN ('pending', 'stored', 'deleted')),
	CONSTRAINT "proofs_state_timestamp_shape" CHECK (("proofs"."upload_state" <> 'stored' OR "proofs"."stored_at" IS NOT NULL) AND ("proofs"."upload_state" <> 'deleted' OR "proofs"."deleted_at" IS NOT NULL)),
	CONSTRAINT "proofs_expiry_after_upload_window" CHECK ("proofs"."expires_at" > "proofs"."upload_expires_at")
);
--> statement-breakpoint
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_user_id_user_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "proofs_object_key_uq" ON "proofs" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "proofs_user_created_idx" ON "proofs" USING btree ("user_id","created_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "proofs_expiry_state_idx" ON "proofs" USING btree ("upload_state","expires_at");
--> statement-breakpoint
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.proofs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY proofs_owner ON public.proofs
  USING (
    user_id = public.current_app_user_id() AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
    )
  )
  WITH CHECK (
    user_id = public.current_app_user_id() AND EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.user_id = public.current_app_user_id() AND p.account_status = 'active'
    )
  );
--> statement-breakpoint
REVOKE ALL ON TABLE public.proofs FROM PUBLIC, anonymous, authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON TABLE public.proofs TO venfinance_mutator;
--> statement-breakpoint
CREATE FUNCTION public.create_proof_upload(
  p_proof_id uuid,
  p_object_key text,
  p_content_type text,
  p_size_bytes integer,
  p_sha256 text,
  p_upload_token_hash text,
  p_upload_expires_at timestamptz,
  p_expires_at timestamptz
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
     OR p_object_key IS NULL
     OR p_object_key !~ '^proofs/[0-9a-f-]{36}/[0-9a-f-]{36}$'
     OR p_content_type IS NULL
     OR p_content_type NOT IN ('image/jpeg', 'image/png', 'image/webp')
     OR p_size_bytes IS NULL
     OR p_size_bytes NOT BETWEEN 1 AND 5242880
     OR p_sha256 IS NULL
     OR p_sha256 !~ '^[a-f0-9]{64}$'
     OR p_upload_token_hash IS NULL
     OR p_upload_token_hash !~ '^[a-f0-9]{64}$'
     OR p_upload_expires_at IS NULL
     OR p_upload_expires_at <= current_time
     OR p_upload_expires_at > current_time + interval '15 minutes'
     OR p_expires_at IS NULL
     OR p_expires_at <= p_upload_expires_at
  THEN
    RAISE EXCEPTION 'INVALID_PROOF_UPLOAD' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
  INSERT INTO public.proofs AS proof (
    id, user_id, object_key, content_type, size_bytes, sha256, upload_token_hash,
    upload_expires_at, expires_at, upload_state
  ) VALUES (
    p_proof_id, subject, p_object_key, p_content_type, p_size_bytes, p_sha256,
    p_upload_token_hash, p_upload_expires_at, p_expires_at, 'pending'
  )
  RETURNING proof.id, proof.user_id, proof.object_key, proof.content_type, proof.size_bytes,
    proof.sha256, proof.upload_token_hash, proof.upload_expires_at, proof.expires_at,
    proof.upload_state, proof.created_at, proof.stored_at;
END $$;
--> statement-breakpoint
ALTER FUNCTION public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz)
  OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz)
  FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_proof_upload(uuid, text, text, integer, text, text, timestamptz, timestamptz)
  TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.get_proof_upload(p_proof_id uuid)
RETURNS TABLE (
  id uuid, user_id text, object_key text, content_type text, size_bytes integer,
  sha256 text, upload_token_hash text, upload_expires_at timestamptz,
  expires_at timestamptz, upload_state text, created_at timestamptz, stored_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  SELECT proof.id, proof.user_id, proof.object_key, proof.content_type, proof.size_bytes,
    proof.sha256, proof.upload_token_hash, proof.upload_expires_at, proof.expires_at,
    proof.upload_state, proof.created_at, proof.stored_at
  FROM public.proofs proof
  WHERE proof.id = p_proof_id AND proof.user_id = subject
    AND EXISTS (
      SELECT 1 FROM public.user_profiles profile
      WHERE profile.user_id = subject AND profile.account_status = 'active'
    );
END $$;
--> statement-breakpoint
ALTER FUNCTION public.get_proof_upload(uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_proof_upload(uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_proof_upload(uuid) TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.mark_proof_stored(p_proof_id uuid)
RETURNS TABLE (ok boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  WITH updated AS (
    UPDATE public.proofs proof
    SET upload_state = 'stored', stored_at = coalesce(proof.stored_at, clock_timestamp())
    WHERE proof.id = p_proof_id AND proof.user_id = subject
      AND (proof.upload_state = 'stored' OR (proof.upload_state = 'pending' AND proof.expires_at > clock_timestamp()))
    RETURNING 1
  ) SELECT EXISTS (SELECT 1 FROM updated);
END $$;
--> statement-breakpoint
ALTER FUNCTION public.mark_proof_stored(uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.mark_proof_stored(uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.mark_proof_stored(uuid) TO authenticated;
--> statement-breakpoint
CREATE FUNCTION public.mark_proof_deleted(p_proof_id uuid)
RETURNS TABLE (ok boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE subject text := public.current_app_user_id();
BEGIN
  IF subject IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  WITH updated AS (
    UPDATE public.proofs proof
    SET upload_state = 'deleted', deleted_at = coalesce(proof.deleted_at, clock_timestamp())
    WHERE proof.id = p_proof_id AND proof.user_id = subject
    RETURNING 1
  ) SELECT EXISTS (SELECT 1 FROM updated)
    OR EXISTS (SELECT 1 FROM public.proofs proof WHERE proof.id = p_proof_id AND proof.user_id = subject AND proof.upload_state = 'deleted');
END $$;
--> statement-breakpoint
ALTER FUNCTION public.mark_proof_deleted(uuid) OWNER TO venfinance_mutator;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.mark_proof_deleted(uuid) FROM PUBLIC, anonymous;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.mark_proof_deleted(uuid) TO authenticated;
