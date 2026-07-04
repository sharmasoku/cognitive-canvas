-- =============================================================
-- Job applications (recruitment form)
-- The /recruitment form previously never persisted anything. This table
-- stores each submission. Inserts happen server-side through the service-role
-- client (submitRecruitmentFn), which bypasses RLS — so there is intentionally
-- NO anonymous/authenticated INSERT policy. Only admins can read the rows.
--
-- NOTE: aadhaar is sensitive PII (India DPDP Act). It is stored in full here
-- per requirement; keep table grants restricted to admins/service_role only.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.job_applications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text        NOT NULL,
  email       text        NOT NULL,
  dob         date,
  gender      text,
  contact     text,
  aadhaar     text,
  address     text,
  message     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_applications_created_at_idx
  ON public.job_applications (created_at DESC);

-- Full control for the server (service_role bypasses RLS anyway).
GRANT ALL ON public.job_applications TO service_role;
-- Admins read (and clean up) applications from the admin panel.
GRANT SELECT, DELETE ON public.job_applications TO authenticated;

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Admins can read every application (mirrors "admins read profiles").
DROP POLICY IF EXISTS "admins read applications" ON public.job_applications;
CREATE POLICY "admins read applications" ON public.job_applications
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete applications.
DROP POLICY IF EXISTS "admins delete applications" ON public.job_applications;
CREATE POLICY "admins delete applications" ON public.job_applications
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
