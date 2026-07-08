-- =============================================================
-- TeleARGlass Complete Unified Production Schema & Seed Migration
-- Recreates the entire relational database catalog from scratch.
-- Suitable for client handover and deployment on a fresh database.
-- =============================================================

-- ---------- PostgreSQL Extensions ----------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- Enums ----------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- tg_set_updated_at helper ----------
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- =============================================================
-- PROFILES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Policies
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admins read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-profile creation function on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- USER ROLES (admin/customer role management)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- RLS & Grants
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Policies
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Role check helper function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =============================================================
-- ADDRESSES (customer shipping address book)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;

-- Policies
CREATE POLICY "own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- PRODUCTS (catalog, inventory, pricing, features, advances)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  category text NOT NULL,
  technology text NOT NULL,
  short_description text,
  technology_story text,
  warranty text,
  price_inr int NOT NULL CHECK (price_inr >= 0),
  original_price_inr int CHECK (original_price_inr IS NULL OR original_price_inr >= 0),
  sku text,
  stock int NOT NULL DEFAULT 100 CHECK (stock >= 0),
  image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  featured_order int,
  advance_type text CHECK (advance_type IN ('percent', 'fixed')),
  advance_value int CHECK (advance_value IS NULL OR advance_value >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_advance_consistency CHECK (
    (advance_type IS NULL AND advance_value IS NULL)
    OR (advance_type IS NOT NULL AND advance_value IS NOT NULL
        AND (advance_type <> 'percent' OR advance_value <= 100))
  )
);

-- RLS & Grants
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Policies
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal int NOT NULL,
  discount int NOT NULL DEFAULT 0,
  shipping int NOT NULL DEFAULT 0,
  tax int NOT NULL DEFAULT 0,
  total int NOT NULL,
  shipping_address jsonb NOT NULL,
  delivery_speed text NOT NULL DEFAULT 'standard',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'cod_placeholder',
  carrier text,
  tracking_number text,
  notes text,
  payment_plan text NOT NULL DEFAULT 'full' CHECK (payment_plan IN ('full', 'partial')),
  amount_paid_inr int NOT NULL DEFAULT 0 CHECK (amount_paid_inr >= 0),
  amount_due_inr int NOT NULL DEFAULT 0 CHECK (amount_due_inr >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Policies
CREATE POLICY "own orders select" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- ORDER ITEMS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  unit_price int NOT NULL,
  qty int NOT NULL CHECK (qty > 0),
  line_total int NOT NULL
);

-- RLS & Grants
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

-- Policies
CREATE POLICY "items via own order" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "insert items via own order" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

-- =============================================================
-- ORDER PAYMENTS (ledger aggregates for part payment tracking)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.order_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('advance', 'balance')),
  amount_inr int NOT NULL CHECK (amount_inr >= 0),
  method text CHECK (method IS NULL OR method IN ('cash', 'upi', 'payu')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  gateway text,
  gateway_ref text,
  collected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.order_payments TO authenticated;
GRANT ALL ON public.order_payments TO service_role;

-- Policies
CREATE POLICY "own payments select" ON public.order_payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "admins manage payments" ON public.order_payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- WISHLIST
-- =============================================================
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- RLS & Grants
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;

-- Policies
CREATE POLICY "own wishlist" ON public.wishlist_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- REVIEWS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  reviewer_name text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  helpful_votes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

-- Policies
CREATE POLICY "public read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- CONTACT MESSAGES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

-- Policies
CREATE POLICY "anyone can submit contact" ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 120
    AND length(trim(email)) BETWEEN 3 AND 255
    AND length(trim(message)) BETWEEN 1 AND 2000
  );
CREATE POLICY "admins read contact" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete contact" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- JOB APPLICATIONS (Recruitment)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  dob date,
  gender text,
  contact text,
  aadhaar text,
  address text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;

-- Policies
CREATE POLICY "admins read applications" ON public.job_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete applications" ON public.job_applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- LICENSE PLANS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.license_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_inr int NOT NULL CHECK (price_inr >= 0),
  billing_period text NOT NULL DEFAULT 'year' CHECK (billing_period IN ('month', 'year')),
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
ALTER TABLE public.license_plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.license_plans TO anon, authenticated;
GRANT ALL ON public.license_plans TO service_role;

-- Policies
CREATE POLICY "public read active license plans" ON public.license_plans FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admins manage license plans" ON public.license_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER license_plans_updated_at BEFORE UPDATE ON public.license_plans FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- LICENSE SUBSCRIPTIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.license_subscriptions (
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

-- RLS & Grants
ALTER TABLE public.license_subscriptions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.license_subscriptions TO authenticated;
GRANT ALL ON public.license_subscriptions TO service_role;

-- Policies
CREATE POLICY "own subscriptions select" ON public.license_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage subscriptions" ON public.license_subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER license_subscriptions_updated_at BEFORE UPDATE ON public.license_subscriptions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- PROCEDURES & RPC FUNCTIONS
-- =============================================================

-- place_order_tx: processes transaction split and stock checking
CREATE OR REPLACE FUNCTION public.place_order_tx(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_delivery_speed text DEFAULT 'standard',
  p_shipping int DEFAULT 0,
  p_tax int DEFAULT 0,
  p_discount int DEFAULT 0,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_subtotal int := 0;
  v_advance_total int := 0;
  v_balance_total int := 0;
  v_item jsonb;
  v_product record;
  v_qty int;
  v_line_total int;
  v_item_advance int;
  v_payment_plan text;
  v_total int;
BEGIN
  INSERT INTO orders (user_id, status, subtotal, discount, shipping, tax, total,
                      shipping_address, delivery_speed, payment_status, payment_method, notes)
  VALUES (p_user_id, 'pending', 0, p_discount, p_shipping, p_tax, 0,
          p_shipping_address, p_delivery_speed, 'pending', 'cod_placeholder', p_notes)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'qty')::int;
    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for item %', v_item;
    END IF;

    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::uuid AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found or inactive', v_item->>'product_id';
    END IF;

    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for % (available: %, requested: %)',
        v_product.name, v_product.stock, v_qty;
    END IF;

    UPDATE products SET stock = stock - v_qty WHERE id = v_product.id;

    v_line_total := v_product.price_inr * v_qty;
    v_subtotal := v_subtotal + v_line_total;

    IF v_product.advance_type = 'percent' THEN
      v_item_advance := LEAST(v_line_total, ROUND(v_line_total * v_product.advance_value / 100.0));
    ELSIF v_product.advance_type = 'fixed' THEN
      v_item_advance := LEAST(v_line_total, v_product.advance_value * v_qty);
    ELSE
      v_item_advance := v_line_total; -- no part-payment configured: full line due now
    END IF;
    v_advance_total := v_advance_total + v_item_advance;

    INSERT INTO order_items (order_id, product_id, name, unit_price, qty, line_total)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.price_inr, v_qty, v_line_total);
  END LOOP;

  v_balance_total := v_subtotal - v_advance_total;
  v_total := v_subtotal + p_shipping + p_tax - p_discount;
  v_payment_plan := CASE WHEN v_balance_total > 0 THEN 'partial' ELSE 'full' END;

  UPDATE orders
  SET subtotal = v_subtotal,
      total = v_total,
      payment_plan = v_payment_plan,
      amount_paid_inr = 0,
      amount_due_inr = v_total
  WHERE id = v_order_id;

  INSERT INTO order_payments (order_id, type, amount_inr, status)
  VALUES (v_order_id, 'advance', v_advance_total + p_shipping + p_tax - p_discount, 'pending');

  IF v_balance_total > 0 THEN
    INSERT INTO order_payments (order_id, type, amount_inr, status)
    VALUES (v_order_id, 'balance', v_balance_total, 'pending');
  END IF;

  RETURN v_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_order_tx(uuid, jsonb, jsonb, text, int, int, int, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order_tx(uuid, jsonb, jsonb, text, int, int, int, text) TO authenticated, service_role;

-- replenish_stock: returns inventory back on order cancels
CREATE OR REPLACE FUNCTION public.replenish_stock(p_product_id uuid, p_qty int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products SET stock = stock + p_qty WHERE id = p_product_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.replenish_stock(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.replenish_stock(uuid, int) TO authenticated, service_role;

-- record_order_payment: rolls total paid/due/status parameters forward
CREATE OR REPLACE FUNCTION public.record_order_payment(
  p_payment_id uuid,
  p_method text DEFAULT 'cash'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment record;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can record payments';
  END IF;

  SELECT * INTO v_payment FROM order_payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment % not found', p_payment_id;
  END IF;
  IF v_payment.status = 'paid' THEN
    RETURN;
  END IF;

  UPDATE order_payments
  SET status = 'paid', method = p_method, collected_by = auth.uid(), paid_at = now()
  WHERE id = p_payment_id;

  UPDATE orders
  SET amount_paid_inr = amount_paid_inr + v_payment.amount_inr,
      amount_due_inr = GREATEST(0, amount_due_inr - v_payment.amount_inr),
      payment_status = CASE
        WHEN amount_due_inr - v_payment.amount_inr <= 0 THEN 'paid'::payment_status
        ELSE payment_status
      END,
      updated_at = now()
  WHERE id = v_payment.order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_order_payment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_order_payment(uuid, text) TO authenticated, service_role;

-- subscribe_to_license_tx: seeds license plan subscriptions
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

-- Secure standard functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- =============================================================
-- PERFORMANCE INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_products_catalog_active
ON public.products (category, technology, price_inr, created_at DESC, id DESC)
INCLUDE (slug, name, tagline, stock, image_url)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_orders_analytics_date
ON public.orders (created_at DESC, total)
WHERE (status <> 'cancelled');

CREATE INDEX IF NOT EXISTS idx_orders_user_date
ON public.orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_lookup
ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_ordering
ON public.reviews (product_id, verified DESC, helpful_votes DESC, created_at DESC)
INCLUDE (reviewer_name, rating, comment);

CREATE INDEX IF NOT EXISTS idx_products_featured
ON public.products (featured_order)
WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_order_payments_order_id 
ON public.order_payments(order_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id 
ON public.reviews(user_id);

CREATE INDEX IF NOT EXISTS job_applications_created_at_idx
ON public.job_applications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_license_subscriptions_user_id 
ON public.license_subscriptions(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user
ON public.reviews (product_id, user_id)
WHERE user_id IS NOT NULL;

-- =============================================================
-- STORAGE BUCKETS & POLICIES
-- =============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('admin-assets', 'admin-assets', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access for admin-assets" ON storage.objects;
CREATE POLICY "Public Access for admin-assets" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'admin-assets');

DROP POLICY IF EXISTS "Admin Upload to admin-assets" ON storage.objects;
CREATE POLICY "Admin Upload to admin-assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'admin-assets' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin Delete from admin-assets" ON storage.objects;
CREATE POLICY "Admin Delete from admin-assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'admin-assets' AND public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- SEED DATA (Products, License plans, and Reviews catalog)
-- =============================================================

-- 1. Insert seed products
INSERT INTO public.products
  (slug, name, tagline, category, technology, short_description, technology_story, warranty,
   price_inr, original_price_inr, sku, stock, image_url, gallery, specifications, faqs)
VALUES
(
  'telear-vision-pro', 'TeleAR Vision Pro',
  'The flagship neural-AR system for cognitive professionals.',
  'Smart Glasses', 'BCI + AR',
  'Silent neural drafting, dual waveguide lenses, and spatial dashboards in a 48 g titanium frame.',
  'Vision Pro pairs sixteen dry EEG biosensors with our TeleOS neural decoder to translate intention into action — no controllers, no voice, no taps. The dual waveguide lens reaches 2400 nits so spatial content stays readable in direct sunlight.',
  '2-year limited warranty with free annual calibration.',
  58999, 64999, 'TLG-001', 100, 'product-vision-pro.jpg',
  '["product-vision-pro.jpg","product-lite-ar.jpg","product-charging-dock.jpg"]'::jsonb,
  '{"Display":"Dual full-color waveguide, 2400 nits","Resolution":"2560 × 2160 per eye","BCI Channels":"16 dry EEG biosensors","Processor":"Qualcomm XR2 Gen 2 + TeleOS neural co-processor","Battery Life":"8 hours active use","Connectivity":"Wi-Fi 7, BT 5.4, UWB","Weight":"48 g","Frame":"Aerospace titanium with sapphire coating"}'::jsonb,
  '[{"question":"Do I need to calibrate it?","answer":"Initial calibration is a 4-minute guided session. The headset re-baselines automatically every wear."},{"question":"Is my neural data private?","answer":"All decoding happens on-device. Nothing leaves the headset unless you explicitly share it."},{"question":"Can I wear prescription lenses?","answer":"Yes — every Vision Pro ships with a custom Rx insert kit."}]'::jsonb
),
(
  'telear-lite', 'TeleAR Lite',
  'Everyday AR clarity in a brushed-aluminum silhouette.',
  'Smart Glasses', 'AR',
  'Compact 32 g frame with full-color HUD and 6-hour battery — the daily driver for AR.',
  'Lite carries the same waveguide research as Vision Pro into an everyday silhouette. Pair it with any phone and your spatial dashboards travel with you.',
  '2-year limited warranty.',
  32999, NULL, 'TLG-002', 100, 'product-lite-ar.jpg',
  '["product-lite-ar.jpg","product-vision-pro.jpg"]'::jsonb,
  '{"Display":"Single full-color waveguide, 1800 nits","Resolution":"1920 × 1080 per eye","BCI Channels":"—","Processor":"Qualcomm XR2 Gen 2","Battery Life":"6 hours active use","Connectivity":"Wi-Fi 6E, BT 5.3","Weight":"32 g","Frame":"Brushed 6061 aluminum"}'::jsonb,
  '[{"question":"Does Lite include BCI?","answer":"No — Lite is the pure AR experience. Upgrade to Vision Pro for neural input."},{"question":"Is it good for outdoor use?","answer":"Yes, the photochromic lenses adapt to ambient light automatically."}]'::jsonb
),
(
  'neural-band-x', 'Neural Band X',
  'Sixteen-channel BCI headband for clinicians and researchers.',
  'BCI Devices', 'BCI',
  'Medical-grade EEG headband with TeleOS SDK support for biomedical and HCI research.',
  'Neural Band X opens the same biosensor array used in Vision Pro to research teams. Stream raw EEG, run inference on-device, or pair it with our SDK to build your own BCI workflows.',
  '1-year limited warranty.',
  24999, NULL, 'TLG-003', 100, 'product-neural-band.jpg',
  '["product-neural-band.jpg"]'::jsonb,
  '{"Display":"—","Resolution":"—","BCI Channels":"16 active dry EEG + 4 reference","Processor":"On-board ARM M55 with neural inference","Battery Life":"12 hours streaming","Connectivity":"BT 5.3, USB-C","Weight":"210 g","Frame":"Carbon-fiber over hypoallergenic silicone"}'::jsonb,
  '[{"question":"Is it CE / FDA marked?","answer":"CE-marked. FDA filing in progress for clinical use."},{"question":"What''s in the SDK?","answer":"Python + TypeScript bindings, sample notebooks, and pre-trained decoders for typing, focus, and meditation."}]'::jsonb
),
(
  'neural-buds', 'TeleSense Neural Buds',
  'Earbud-form BCI for focus, sleep, and ambient typing.',
  'BCI Devices', 'BCI',
  'Four-channel in-ear EEG that turns micro-intentions into shortcuts.',
  'TeleSense brings BCI to a form factor you already wear. Pinch-to-focus, intent-to-skip, and a continuous focus score that nudges you back when your attention drifts.',
  '1-year limited warranty.',
  12999, NULL, 'TLG-004', 100, 'product-neural-buds.jpg',
  '["product-neural-buds.jpg"]'::jsonb,
  '{"Display":"—","Resolution":"—","BCI Channels":"4 in-ear dry electrodes","Processor":"Dual M55 inference cores","Battery Life":"5h + 18h case","Connectivity":"BT 5.4","Weight":"5.2 g per bud","Frame":"Medical-grade silicone"}'::jsonb,
  '[{"question":"Can I use them as regular earbuds?","answer":"Absolutely — ANC, spatial audio, and 24-bit playback."}]'::jsonb
),
(
  'telear-dev-kit', 'TeleAR Dev Kit',
  'The everything-included toolkit for building on TeleOS.',
  'Developer Tools', 'BCI + AR',
  'Vision Pro reference unit, Neural Band X, edge inference puck, and full TeleOS SDK access.',
  'Everything you need to ship a TeleOS app, in one case. Includes priority support, beta features, and the Think2Speak training corpus.',
  '1-year hardware + 12 months SDK premium support.',
  49999, NULL, 'TLG-005', 100, 'product-dev-kit.jpg',
  '["product-dev-kit.jpg"]'::jsonb,
  '{"Display":"Vision Pro reference headset","Resolution":"2560 × 2160 per eye","BCI Channels":"16 + 4 reference","Processor":"Edge inference puck (12 TOPS)","Battery Life":"Headset 8h, puck 10h","Connectivity":"Wi-Fi 7, BT 5.4, UWB, USB4","Weight":"Kit 1.4 kg","Frame":"Pelican case"}'::jsonb,
  '[{"question":"Is the SDK open source?","answer":"Core SDK is Apache-2; advanced decoders ship under a research license."}]'::jsonb
),
(
  'charging-dock', 'Aurora Charging Dock',
  'Magnetic stone-base dock with calibration-grade lighting.',
  'Accessories', 'Standard',
  'Cradles any TeleAR headset; charges, calibrates, and gently breathes a violet halo.',
  'The dock isn''t just power — it runs a 90-second nightly waveguide calibration so your lenses stay perfectly aligned.',
  '2-year limited warranty.',
  6999, NULL, 'TLG-006', 100, 'product-charging-dock.jpg',
  '["product-charging-dock.jpg"]'::jsonb,
  '{"Display":"—","Resolution":"—","BCI Channels":"—","Processor":"Calibration controller","Battery Life":"Mains powered","Connectivity":"USB-C PD 30 W","Weight":"640 g","Frame":"Volcanic basalt over aluminum"}'::jsonb,
  '[{"question":"Universal fit?","answer":"Yes, magnetic alignment fits Vision Pro and Lite."}]'::jsonb
),
(
  'telesmartglass', 'TeleSmartGlass',
  'The TeleARGlass base model — control your world by thought.',
  'Smart Glasses', 'AR',
  'Think-to-act smart glasses: music & video streaming, phone, computer, home automation and car controls via the TeleSmartGlass app.',
  'TeleSmartGlass is the entry into the TeleARGlass world. Powered by the TeleSmartGlass app, it works from thinking with the Telepathy engine — stream music and video through TeleShaft, take calls, control your phone and computer, automate your home, manage car driving controls, and even skip YouTube ads, all hands-free.',
  '3-month hardware warranty; software issues resolved anytime.',
  30000, NULL, 'TAG-SMART', 100, 'tele-ar-glass-smart-glass.jpeg',
  '["tele-ar-glass-smart-glass.jpeg"]'::jsonb,
  '{"Control":"Think-to-act via the Telepathy app","Streaming":"Music & Video (TeleShaft)","Devices":"Phone & Computer pairing","Home Automation":"Supported","Vehicle":"Car driving controls","App":"TeleSmartGlass"}'::jsonb,
  '[{"question":"How do I control it?","answer":"Through the TeleSmartGlass app — think a command and it acts, from music playback to home automation."},{"question":"Does it work with my car?","answer":"Yes, it supports car driving controls and hands-free actions on the move."}]'::jsonb
),
(
  'telearglass-legacy', 'TeleARGlass Legacy',
  'Immersive AR with the full suite of Tele apps.',
  'Smart Glasses', 'BCI + AR',
  'TeleCall, TeleYad, TravelDiaries, TeleSurf and 12+ built-in apps — works from thinking with immersive AR and speaking accessibility.',
  'TeleARGlass Legacy is the complete everyday AR companion. It bundles a full suite of Tele apps — from TeleCall and TeleSurf to TeleYad, which reinvents your memories in immersive AR — plus TeleAnuVad translation, TeleARLearning and more. Everything works from thinking, with speaking accessibility and support for third-party in-app purchases.',
  '3-month hardware warranty; software issues resolved anytime.',
  49000, NULL, 'TAG-LEGACY', 100, 'tele-ar-glass-legacy.jpeg',
  '["tele-ar-glass-legacy.jpeg"]'::jsonb,
  '{"Built-in Apps":"TeleCall, TeleYad, TravelDiaries, TeleSurf, Tellege, TeleClick, TeleTask, TeleClock, TeleWatch","More Apps":"TeleAnuVad, TeleWeather, TeleARLearning, TeleCalender, TeleShaft, TeleCalculator","Experience":"Immersive AR","Control":"Works from Thinking","Accessibility":"Speaking accessibility","Marketplace":"Third-party in-app purchases"}'::jsonb,
  '[{"question":"What is TeleYad?","answer":"TeleYad lets you reinvent and relive your memories as an immersive AR experience."},{"question":"Can I add more apps?","answer":"Yes — Legacy supports third-party in-app purchases so the catalogue keeps growing."}]'::jsonb
),
(
  'telearglass-home-auto', 'TeleARGlass Home Auto',
  'Everything in Legacy, plus full home appliance control.',
  'Home Automation', 'BCI + AR',
  'All TeleARGlass Legacy features plus TeleARHome — control your consumer appliances with a thought.',
  'TeleARGlass Home Auto takes everything in Legacy and adds TeleARHome — a thought-driven control layer for your consumer appliances. Dim the lights, set the AC, switch the TV and orchestrate your whole home without lifting a finger.',
  '3-month hardware warranty; software issues resolved anytime.',
  59000, NULL, 'TAG-HOME', 100, 'tele-ar-glass-home-auto.jpeg',
  '["tele-ar-glass-home-auto.jpeg"]'::jsonb,
  '{"Includes":"All TeleARGlass Legacy features","Home Control":"Consumer appliance control (TeleARHome)","Experience":"Immersive AR","Control":"Works from Thinking"}'::jsonb,
  '[{"question":"What can I control at home?","answer":"TeleARHome controls your consumer appliances — lights, AC, TV and more — directly from thinking."},{"question":"Does it keep the Legacy apps?","answer":"Yes, Home Auto includes the entire TeleARGlass Legacy app suite."}]'::jsonb
),
(
  'telearglass-gaming', 'TeleARGlass Gaming',
  'Legacy power plus AR gaming — Xbox & PlayStation ready.',
  'Gaming', 'BCI + AR',
  'All Legacy features plus ARGaming control with TeleARGames — compatible with Xbox and SONY PlayStation series.',
  'TeleARGlass Gaming layers a full ARGaming control system over the Legacy feature set. Play our own TeleARGames catalogue or connect to Xbox and SONY PlayStation series consoles and play with thought-speed reactions.',
  '3-month hardware warranty; software issues resolved anytime.',
  64000, NULL, 'TAG-GAMING', 100, 'tele-ar-glass-gaming-and-optimization.jpeg',
  '["tele-ar-glass-gaming-and-optimization.jpeg"]'::jsonb,
  '{"Includes":"All TeleARGlass Legacy features","Gaming":"ARGaming control with TeleARGames","Console Support":"Xbox, SONY PlayStation series","Experience":"Immersive AR","Control":"Works from Thinking"}'::jsonb,
  '[{"question":"Which consoles are supported?","answer":"TeleARGlass Gaming is compatible with Xbox and SONY PlayStation series consoles."},{"question":"Are there native games?","answer":"Yes — our own TeleARGames library is built specifically for AR gaming control."}]'::jsonb
),
(
  'telearglass-customization', 'TeleARGlass Customization',
  'Specialized AR for enterprise, space, defence and robotics.',
  'Enterprise', 'BCI + AR',
  'Legacy plus specialized applications — social (Tellar/TeleImmerse), AutoEV (TeleCar), Robotics (TeleRobo), Space (TeleARSpace), Defence (TeleARMY) and full computer control (TeleComp).',
  'TeleARGlass Customization is the flagship, built for organizations. On top of Legacy it unlocks specialized applications: social presence (Tellar, TeleImmerse, Telepathy), AutoEV mobility (TeleCar), robotics (TeleRobo), space communication (TeleARSpace), army & defence (TeleARMY), and full computer systems control across Mac, Windows and Linux (TeleComp).',
  '3-month hardware warranty with priority enterprise support; software issues resolved anytime.',
  159000, NULL, 'TAG-CUSTOM', 50, 'tele-ar-glass-gaming-and-optimization.jpeg',
  '["tele-ar-glass-gaming-and-optimization.jpeg"]'::jsonb,
  '{"Includes":"All TeleARGlass Legacy features","Social Media":"Tellar, TeleImmerse, Telepathy","Mobility":"AutoEV (TeleCar)","Robotics":"TeleRobo","Space":"Space Communication (TeleARSpace)","Defence":"Army & Defence (TeleARMY)","Computers":"Mac, Windows, Linux (TeleComp)"}'::jsonb,
  '[{"question":"Who is this for?","answer":"Enterprise, research, defence and space teams that need specialized, mission-grade AR applications."},{"question":"Can it control computers?","answer":"Yes — TeleComp gives thought-driven control of Mac, Windows and Linux systems."}]'::jsonb
),
(
  'telelie-detector', 'TeleLie Detector',
  'Truth Investigation Kit powered by Think Data — for Indian enforcement.',
  'Enterprise', 'BCI + AR',
  'A Truth Investigation Kit: the SmartGlass captures precise Think Data and the TeleLie Detector mobile app reports the output — location, person or material name, date and more. Available to Indian Enforcement Organizations.',
  'The TeleLie Detector is a complete Truth Investigation Kit. The SmartGlass captures precise, useful Think Data directly, while the dedicated TeleLie Detector mobile app interprets and displays the output — including location, person or material name, date and more. Sales are available exclusively to Indian Enforcement Organizations, and procurement is available through our GeM portal (Seller ID: GX6Q260013874543).',
  '3-month hardware warranty; software issues resolved anytime.',
  1500000, NULL, 'TAG-TELELIE', 25, 'tele-ar-glass-smart-glass.jpeg',
  '["tele-ar-glass-smart-glass.jpeg"]'::jsonb,
  '{"Kit":"SmartGlass + TeleLie Detector mobile app","Function":"Truth investigation via Think Data capture","App Output":"Location, Person / Material Name, Date & more","Availability":"Indian Enforcement Organizations only","Control":"Works from Thinking","GeM Seller ID":"GX6Q260013874543"}'::jsonb,
  '[{"question":"Who can purchase the TeleLie Detector?","answer":"Sales are available exclusively to Indian Enforcement Organizations."},{"question":"What does a TeleLie Detector Setup include?","answer":"Each setup includes the SmartGlass to capture Think Data and the TeleLie Detector mobile app that displays the output — location, person or material name, date and more."},{"question":"How do we procure it?","answer":"It is available through our Government e-Marketplace (GeM) portal — Seller ID GX6Q260013874543."}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  category = EXCLUDED.category,
  technology = EXCLUDED.technology,
  short_description = EXCLUDED.short_description,
  technology_story = EXCLUDED.technology_story,
  warranty = EXCLUDED.warranty,
  price_inr = EXCLUDED.price_inr,
  original_price_inr = EXCLUDED.original_price_inr,
  sku = EXCLUDED.sku,
  image_url = EXCLUDED.image_url,
  gallery = EXCLUDED.gallery,
  specifications = EXCLUDED.specifications,
  faqs = EXCLUDED.faqs,
  is_active = true,
  updated_at = now();

-- 2. Seed reviews
INSERT INTO public.reviews (product_id, user_id, rating, comment, reviewer_name, verified, helpful_votes)
SELECT p.id, NULL, v.rating, v.comment, v.reviewer_name, true, v.helpful_votes
FROM (
  VALUES
    -- TeleAR Vision Pro
    ('telear-vision-pro', 5, 'The neural typing is genuinely life-changing. Drafted an entire pitch deck hands-free on a flight. Waveguide clarity in sunlight is unreal.', 'Aarav Mehta', 142),
    ('telear-vision-pro', 5, 'Premium titanium build and it''s feather-light on the nose. Calibration took two short sessions, then it just works.', 'Priya Sharma', 98),
    ('telear-vision-pro', 4, 'Astonishing hardware. Battery comfortably lasts my workday. Docked a star only because the Rx insert took a week to arrive.', 'Kunal Verma', 54),
    ('telear-vision-pro', 5, 'On-device decoding means my data never leaves the headset — exactly the privacy stance I wanted. Highly recommend.', 'Ishita Rao', 73),
    -- TeleAR Lite
    ('telear-lite', 5, 'The perfect daily driver. 32g means I forget I''m wearing it, and the HUD is crisp for navigation and notifications.', 'Rohan Iyer', 61),
    ('telear-lite', 4, 'Great value AR. No BCI as expected, but the photochromic lenses outdoors are a lovely touch.', 'Sneha Kapoor', 39),
    ('telear-lite', 5, 'Paired with my phone in seconds. Spatial dashboards while cooking is my new normal.', 'Vikram Nair', 28),
    -- Neural Band X
    ('neural-band-x', 5, 'As a researcher this opened up our HCI experiments overnight. Raw EEG streaming plus the SDK decoders are excellent.', 'Dr. Ananya Bose', 87),
    ('neural-band-x', 4, 'Solid 16-channel signal quality and comfortable for long sessions. Documentation could be a little deeper.', 'Meera Joshi', 45),
    ('neural-band-x', 5, 'CE-marked and reliable. The Python bindings saved us weeks of integration work.', 'Arjun Reddy', 33),
    -- TeleSense Neural Buds
    ('neural-buds', 5, 'Pinch-to-focus actually works. The continuous focus score nudges me back when I drift — brilliant for deep work.', 'Nisha Menon', 52),
    ('neural-buds', 4, 'Double as proper earbuds with great ANC. In-ear EEG is a clever form factor; fit takes a day to get used to.', 'Karthik Rao', 41),
    ('neural-buds', 5, 'Sleep tracking via the buds is surprisingly accurate. Best money I''ve spent on focus tech.', 'Divya Pillai', 36),
    -- TeleAR Dev Kit
    ('telear-dev-kit', 5, 'Everything in one Pelican case. Shipped our first TeleOS app in a weekend hackathon thanks to the reference unit.', 'Siddharth Jain', 47),
    ('telear-dev-kit', 5, 'Priority support is real — engineers replied within hours. The Think2Speak corpus is gold for training.', 'Ritika Agarwal', 29),
    ('telear-dev-kit', 4, 'Comprehensive kit. The edge inference puck runs hot under sustained load but performance is superb.', 'Manish Gupta', 22),
    -- Aurora Charging Dock
    ('charging-dock', 5, 'The nightly calibration keeps my lenses perfectly aligned. Also the violet halo looks gorgeous on the desk.', 'Tara Krishnan', 40),
    ('charging-dock', 4, 'Solid basalt base, no sliding around. Magnetic alignment fits both my Vision Pro and Lite.', 'Aditya Shetty', 25),
    ('charging-dock', 5, 'Wish I''d bought it sooner — charge, calibrate and store in one spot. Premium feel.', 'Pooja Desai', 18)
) AS v(slug, rating, comment, reviewer_name, helpful_votes)
JOIN public.products p ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.reviews r WHERE r.product_id = p.id AND r.user_id IS NULL
);

-- 3. Seed guest reviews (Governor & ISRO Director)
INSERT INTO public.reviews (product_id, rating, comment, reviewer_name, verified, helpful_votes)
SELECT id, 5, 'Very Good Startups are becoming in India.', 'Honourable Governor Acharya Devvrat', true, 12
FROM public.products
WHERE slug = 'telear-vision-pro'
LIMIT 1;

INSERT INTO public.reviews (product_id, rating, comment, reviewer_name, verified, helpful_votes)
SELECT id, 5, 'Very Good Innovation & He invited Our Startup TeleARGlass at ISRO Facility.', 'Nilesh Desai (ISRO Ahmedabad Director)', true, 18
FROM public.products
WHERE slug = 'telear-vision-pro'
LIMIT 1;

-- 4. Seed patent license plans
INSERT INTO public.license_plans (name, price_inr, billing_period, features, is_active)
VALUES (
  'TeleARGlass Enterprise Patent License',
  90000000,
  'year',
  '["Full patent & platform license","PanOS + the entire 30+ app suite","Priority onboarding, training & support"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
