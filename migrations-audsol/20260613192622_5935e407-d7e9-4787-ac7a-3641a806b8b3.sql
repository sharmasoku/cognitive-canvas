
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- ===== updated_at helper =====
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== USER ROLES =====
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

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ===== ADDRESSES =====
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

-- ===== PRODUCTS =====
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  usage text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ===== PRODUCT VARIANTS =====
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label text NOT NULL,
  size_ml int,
  price_inr int NOT NULL,
  sku text,
  stock int NOT NULL DEFAULT 100,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read variants" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage variants" ON public.product_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== ORDERS =====
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal int NOT NULL,
  shipping int NOT NULL DEFAULT 0,
  total int NOT NULL,
  address jsonb NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'cod_placeholder',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders select" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ===== ORDER ITEMS =====
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id),
  name text NOT NULL,
  size text,
  unit_price int NOT NULL,
  qty int NOT NULL,
  line_total int NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items via own order" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "insert items via own order" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

-- ===== BLOGS =====
CREATE TABLE public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  cover_url text,
  content_md text NOT NULL,
  author text NOT NULL DEFAULT 'Ajanta Adusol Editorial',
  read_minutes int NOT NULL DEFAULT 5,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blogs TO anon, authenticated;
GRANT ALL ON public.blogs TO service_role;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admins manage blogs" ON public.blogs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER blogs_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ===== CONTACT MESSAGES =====
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
CREATE POLICY "anyone can submit contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read contact" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ===== SEED =====
WITH p AS (
  INSERT INTO public.products (slug, name, tagline, description, ingredients, benefits, usage)
  VALUES (
    'adusol-ayurvedic-cough-syrup',
    'Adusol Ayurvedic Cough Syrup',
    'Ayurvedic Cough Relief Since 1972',
    'A trusted Ayurvedic cough relief formula crafted from time-tested herbal ingredients for families across India. Adusol combines the wisdom of Ayurveda with modern quality standards to provide gentle, effective respiratory support for adults and children alike.',
    '[
      {"name":"Adulsa","benefit":"Time-honoured Ayurvedic herb traditionally used to soothe the throat and ease coughing."},
      {"name":"Mulethi (Jethimadh)","benefit":"Liquorice root that calms throat irritation and supports clear breathing."},
      {"name":"Tulsi","benefit":"The sacred basil — a respected herb for respiratory wellness."},
      {"name":"Ginger (Adrak)","benefit":"Warming spice that supports comfort during seasonal changes."},
      {"name":"Lemongrass","benefit":"Aromatic herb that adds a fresh, gentle finish to the formula."},
      {"name":"Peppermint Oil","benefit":"Cooling botanical oil that refreshes the throat."},
      {"name":"Pimpali","benefit":"Long pepper used in classical Ayurveda for respiratory care."},
      {"name":"Menthol","benefit":"Provides a cooling sensation for instant comfort."}
    ]'::jsonb,
    '[
      {"title":"Natural & Holistic","desc":"Plant-based relief without harsh chemicals."},
      {"title":"Safe & Effective","desc":"Ingredients trusted for generations in traditional medicine."},
      {"title":"Suitable for All Ages","desc":"Gentle formula appropriate for both adults and children."},
      {"title":"Widely Available","desc":"Available online and across pharmacies in India."}
    ]'::jsonb,
    'Adults: 2 teaspoons (10 ml) three times a day. Children: 1 teaspoon (5 ml) three times a day, or as directed by a physician. Shake well before use.'
  ) RETURNING id
)
INSERT INTO public.product_variants (product_id, label, size_ml, price_inr, sku, sort_order)
SELECT id, '100 ml', 100, 105, 'ADUSOL-100', 1 FROM p
UNION ALL
SELECT id, '200 ml', 200, 180, 'ADUSOL-200', 2 FROM p;

INSERT INTO public.blogs (slug, title, excerpt, content_md, read_minutes) VALUES
('natural-ayurvedic-remedies-for-seasonal-cough',
 'Natural Ayurvedic Remedies for Seasonal Cough',
 'Discover time-tested Ayurvedic approaches that help families navigate seasonal coughs gently and naturally.',
 E'## A gentler approach to seasonal coughs\n\nSeasonal changes bring shifts in temperature and humidity that often unsettle the respiratory tract. Ayurveda, the ancient Indian science of life, has long offered gentle plant-based ways to soothe these everyday discomforts.\n\n### Warm fluids and steam\nSipping warm water with a pinch of turmeric or inhaling steam infused with tulsi leaves can offer immediate comfort.\n\n### Honey and ginger\nA classic remedy — a teaspoon of honey blended with fresh ginger juice can calm an irritated throat.\n\n### Ayurvedic formulations\nFormulas like Adusol bring together herbs such as Adulsa, Mulethi, and Tulsi in carefully balanced proportions, drawing on centuries of Ayurvedic wisdom.\n\n### When to seek help\nIf a cough persists for more than a week or is accompanied by fever, please consult a qualified physician.', 6),
('understanding-dry-vs-wet-cough',
 'Understanding Dry vs Wet Cough',
 'Knowing the difference between a dry and a wet cough helps you choose the most suitable Ayurvedic care.',
 E'## Two common kinds of cough\n\n**Dry cough** is unproductive — there is no mucus, only a persistent tickle and irritation. It often follows exposure to dust, smoke, or dry air.\n\n**Wet cough** is productive — the body is clearing mucus from the airways, usually during or after a cold.\n\n### Ayurvedic perspective\nAyurveda sees dry cough as a Vata imbalance and wet cough as a Kapha imbalance. The herbs chosen for each are subtly different.\n\n### How Adusol helps\nThe Adusol formulation includes both soothing herbs (Mulethi, Adulsa) and warming ones (Ginger, Pimpali), creating a balanced support for both kinds of cough.\n\nAlways read the label and consult a physician for persistent symptoms.', 5),
('benefits-of-tulsi-for-respiratory-wellness',
 'Benefits of Tulsi for Respiratory Wellness',
 'Why the sacred basil has been honoured for centuries as a gentle ally for the lungs and airways.',
 E'## Tulsi: the queen of herbs\n\nTulsi (Ocimum sanctum) holds a sacred place in Indian homes and in Ayurvedic medicine. Beyond its spiritual significance, tulsi is celebrated for its supportive role in respiratory wellness.\n\n### A traditional ally\nTulsi leaves have long been brewed into teas or chewed fresh to support clear breathing during seasonal shifts.\n\n### In modern Ayurvedic formulas\nAdusol includes tulsi alongside complementary herbs to deliver its benefits in a convenient syrup form, suitable for everyday family use.\n\n### Simple daily ritual\nA few fresh tulsi leaves added to morning tea can be a calming way to begin the day.', 4);
