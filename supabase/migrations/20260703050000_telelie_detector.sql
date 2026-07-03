-- =============================================================
-- Add the TeleLie Detector product (Truth Investigation Kit + mobile app).
-- Sales available to Indian Enforcement Organizations. Idempotent (upsert by slug).
-- =============================================================

INSERT INTO public.products
  (slug, name, tagline, category, technology, short_description, technology_story, warranty,
   price_inr, original_price_inr, sku, stock, image_url, gallery, specifications, faqs)
VALUES
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
  sku = EXCLUDED.sku,
  image_url = EXCLUDED.image_url,
  gallery = EXCLUDED.gallery,
  specifications = EXCLUDED.specifications,
  faqs = EXCLUDED.faqs,
  is_active = true,
  updated_at = now();
