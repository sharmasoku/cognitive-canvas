-- =============================================================
-- TeleLicence: admin-configurable pricing for the enterprise patent
-- license (was hardcoded "₹9 Cr / year" in the page) and a real
-- subscription record created the instant payment succeeds.
-- =============================================================

-- =============================================================
-- LICENSE PLANS (admin edits the one active row; price/period can change)
-- =============================================================
CREATE TABLE public.license_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_inr int NOT NULL CHECK (price_inr >= 0),
  billing_period text NOT NULL DEFAULT 'year' CHECK (billing_period IN ('month', 'year')),
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.license_plans TO anon, authenticated;
GRANT ALL ON public.license_plans TO service_role;
ALTER TABLE public.license_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active license plans" ON public.license_plans FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admins manage license plans" ON public.license_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER license_plans_updated_at BEFORE UPDATE ON public.license_plans FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- LICENSE SUBSCRIPTIONS (price/name snapshotted at purchase time,
-- so a later plan price edit never rewrites what a customer already bought)
-- =============================================================
CREATE TABLE public.license_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.license_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  price_inr int NOT NULL,
  billing_period text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  renews_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_license_subscriptions_user_id ON public.license_subscriptions(user_id);
GRANT SELECT ON public.license_subscriptions TO authenticated;
GRANT ALL ON public.license_subscriptions TO service_role;
ALTER TABLE public.license_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscriptions select" ON public.license_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage subscriptions" ON public.license_subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER license_subscriptions_updated_at BEFORE UPDATE ON public.license_subscriptions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- subscribe_to_license_tx: looks up the current active plan
-- server-side (never trusts a client-supplied price) and starts
-- the subscription. Called right after payment succeeds.
-- =============================================================
CREATE OR REPLACE FUNCTION public.subscribe_to_license_tx(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan record;
  v_sub_id uuid;
  v_renews_at timestamptz;
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot subscribe on behalf of another user';
  END IF;

  SELECT * INTO v_plan FROM license_plans WHERE is_active = true ORDER BY created_at DESC LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active license plan configured';
  END IF;

  v_renews_at := CASE
    WHEN v_plan.billing_period = 'month' THEN now() + interval '1 month'
    ELSE now() + interval '1 year'
  END;

  INSERT INTO license_subscriptions (user_id, plan_id, plan_name, price_inr, billing_period, status, started_at, renews_at)
  VALUES (p_user_id, v_plan.id, v_plan.name, v_plan.price_inr, v_plan.billing_period, 'active', now(), v_renews_at)
  RETURNING id INTO v_sub_id;

  RETURN v_sub_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.subscribe_to_license_tx(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.subscribe_to_license_tx(uuid) TO authenticated, service_role;

-- =============================================================
-- SEED: the current enterprise plan (mirrors src/routes/licence.tsx)
-- =============================================================
INSERT INTO public.license_plans (name, price_inr, billing_period, features, is_active)
VALUES (
  'TeleARGlass Enterprise Patent License',
  90000000,
  'year',
  '["Full patent & platform license","PanOS + the entire 30+ app suite","Priority onboarding, training & support"]'::jsonb,
  true
);
