-- =============================================================
-- TeleAR — full relational commerce schema
-- Adapted from the Adusol reference (blogs intentionally excluded).
-- Fresh build: drops the previous minimal profiles/orders/wishlist
-- and recreates the complete model. Prices are stored in whole INR.
-- =============================================================

-- ---------- Drop previous minimal objects ----------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

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

-- ---------- updated_at helper ----------
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- =============================================================
-- PROFILES
-- =============================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create a profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- USER ROLES (admin management)
-- =============================================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- SECURITY DEFINER role check (avoids recursive RLS on user_roles)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =============================================================
-- ADDRESSES
-- =============================================================
CREATE TABLE public.addresses (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- PRODUCTS (single-SKU; stock held on the product row)
-- =============================================================
CREATE TABLE public.products (
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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON public.products(category);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TABLE public.orders (
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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders select" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- ORDER ITEMS
-- =============================================================
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  unit_price int NOT NULL,
  qty int NOT NULL CHECK (qty > 0),
  line_total int NOT NULL
);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items via own order" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "insert items via own order" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

-- =============================================================
-- WISHLIST
-- =============================================================
CREATE TABLE public.wishlist_items (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wishlist" ON public.wishlist_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- REVIEWS
-- =============================================================
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  reviewer_name text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  helpful_votes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- one review per user per product
  UNIQUE (product_id, user_id)
);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============================================================
-- CONTACT MESSAGES (feedback form)
-- =============================================================
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit contact" ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 120
    AND length(trim(email)) BETWEEN 3 AND 255
    AND length(trim(message)) BETWEEN 1 AND 2000
  );
CREATE POLICY "admins read contact" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- ATOMIC ORDER PLACEMENT (locks stock, validates, decrements)
-- =============================================================
CREATE OR REPLACE FUNCTION public.place_order_tx(
  p_user_id uuid,
  p_items jsonb,            -- [{"product_id":"...","qty":2}, ...]
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
  v_item jsonb;
  v_product record;
  v_qty int;
  v_line_total int;
BEGIN
  -- Create the order shell (totals filled in after items)
  INSERT INTO orders (user_id, status, subtotal, discount, shipping, tax, total,
                      shipping_address, delivery_speed, payment_status, payment_method, notes)
  VALUES (p_user_id, 'pending', 0, p_discount, p_shipping, p_tax, 0,
          p_shipping_address, p_delivery_speed, 'pending', 'cod_placeholder', p_notes)
  RETURNING id INTO v_order_id;

  -- Process each line: lock product row, validate stock, decrement, insert item
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

    INSERT INTO order_items (order_id, product_id, name, unit_price, qty, line_total)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.price_inr, v_qty, v_line_total);
  END LOOP;

  -- Finalise totals
  UPDATE orders
  SET subtotal = v_subtotal,
      total = v_subtotal + p_shipping + p_tax - p_discount
  WHERE id = v_order_id;

  RETURN v_order_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.place_order_tx(uuid, jsonb, jsonb, text, int, int, int, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order_tx(uuid, jsonb, jsonb, text, int, int, int, text) TO authenticated, service_role;

-- =============================================================
-- REPLENISH STOCK (used on cancellation/refund)
-- =============================================================
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

-- =============================================================
-- Lock down helper/trigger functions
-- =============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- =============================================================
-- STORAGE: admin-assets bucket (product image uploads)
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
-- SEED: TeleAR catalogue (mirrors src/data/products.ts)
-- =============================================================
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
);
