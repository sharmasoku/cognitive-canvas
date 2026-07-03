-- =============================================================
-- Admin panel privileges
-- The base schema granted `authenticated` only SELECT on several tables,
-- so admin writes were blocked at the GRANT level even though RLS policies
-- allowed them. This migration broadens the table grants and adds the
-- missing admin RLS policies. Row access is still restricted to admins by
-- the has_role() checks in each policy.
-- =============================================================

-- ---------- PRODUCTS: admins can create / edit / delete ----------
-- (RLS "admins manage products" already restricts these to admins.)
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- ---------- PROFILES: admins can read every profile (users page) ----------
DROP POLICY IF EXISTS "admins read profiles" ON public.profiles;
CREATE POLICY "admins read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------- USER ROLES: admins can manage everyone's roles ----------
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- CONTACT MESSAGES: admins can read & delete ----------
GRANT SELECT, DELETE ON public.contact_messages TO authenticated;
DROP POLICY IF EXISTS "admins delete contact" ON public.contact_messages;
CREATE POLICY "admins delete contact" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- Bootstrap the first admin (optional convenience)
-- Replace the email below, or run this manually once, to grant yourself admin.
-- =============================================================
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
