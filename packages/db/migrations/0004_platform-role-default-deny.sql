-- Normal users must never be able to write their own platform role. The
-- SECURITY DEFINER profile trigger is the only application path that inserts
-- the default `user` grant; role elevation requires a separate privileged
-- workflow and must not be reachable through an owner-scoped RLS policy.
DROP POLICY platform_roles_mutator ON platform.roles;
--> statement-breakpoint
CREATE POLICY platform_roles_self_select ON platform.roles
  FOR SELECT
  USING (user_id = public.current_app_user_id());
--> statement-breakpoint
CREATE POLICY platform_roles_default_user_insert ON platform.roles
  FOR INSERT
  WITH CHECK (
    user_id = public.current_app_user_id()
    AND role = 'user'
    AND assigned_by IS NULL
  );
--> statement-breakpoint
REVOKE ALL ON TABLE platform.roles FROM PUBLIC, anonymous, authenticated;
--> statement-breakpoint
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE platform.roles FROM venfinance_mutator;
--> statement-breakpoint
GRANT SELECT, INSERT ON TABLE platform.roles TO venfinance_mutator;
