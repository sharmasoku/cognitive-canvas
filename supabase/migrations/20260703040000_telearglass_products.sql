-- =============================================================
-- Replace the placeholder catalogue with the real TeleARGlass Product Range.
-- Idempotent: upserts by slug and removes the old fictional products.
-- =============================================================

-- Ensure editorial reviews are allowed (safe if already applied).
-- These let a review exist without an auth user, while still enforcing
-- one review per real (signed-in) user per product.
ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user
  ON public.reviews (product_id, user_id)
  WHERE user_id IS NOT NULL;

-- Remove the earlier placeholder products (cascades their seeded reviews).
DELETE FROM public.products WHERE slug IN (
  'telear-vision-pro', 'telear-lite', 'neural-band-x',
  'neural-buds', 'telear-dev-kit', 'charging-dock'
);

INSERT INTO public.products
  (slug, name, tagline, category, technology, short_description, technology_story, warranty,
   price_inr, original_price_inr, sku, stock, image_url, gallery, specifications, faqs)
VALUES
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

-- Editorial reviews for the real range (user_id NULL = seeded/editorial).
INSERT INTO public.reviews (product_id, user_id, rating, comment, reviewer_name, verified, helpful_votes)
SELECT p.id, NULL, v.rating, v.comment, v.reviewer_name, true, v.helpful_votes
FROM (
  VALUES
    ('telesmartglass', 5, 'Controlling music and my home lights just by thinking still feels like magic. Setup with the TeleSmartGlass app took minutes.', 'Aarav Mehta', 61),
    ('telesmartglass', 4, 'Great base model. Streaming through TeleShaft is smooth and the car controls are genuinely useful on my commute.', 'Sneha Kapoor', 34),
    ('telesmartglass', 5, 'Perfect entry point into TeleARGlass. Hands-free calls and YouTube skip are my daily favourites.', 'Vikram Nair', 27),
    ('telearglass-legacy', 5, 'The app suite is incredible — TeleYad brought my old travel memories back to life in AR. Worth every rupee.', 'Priya Sharma', 88),
    ('telearglass-legacy', 5, 'Works purely from thinking and the speaking accessibility is a game-changer for my father. Beautifully done.', 'Ishita Rao', 72),
    ('telearglass-legacy', 4, 'So many built-in apps I''m still discovering them. TeleAnuVad translation saved me on a trip abroad.', 'Kunal Verma', 45),
    ('telearglass-legacy', 5, 'Immersive AR that actually feels natural. TeleSurf and TeleARLearning are brilliant.', 'Meera Joshi', 39),
    ('telearglass-home-auto', 5, 'TeleARHome runs my entire flat — lights, AC and TV — with a thought. Never going back.', 'Rohan Iyer', 57),
    ('telearglass-home-auto', 5, 'All the Legacy apps plus full appliance control. The automation is fast and reliable.', 'Divya Pillai', 41),
    ('telearglass-home-auto', 4, 'Fantastic for a smart home. Took a short while to pair every device but it''s rock solid now.', 'Arjun Reddy', 26),
    ('telearglass-gaming', 5, 'ARGaming with thought-speed reactions is unreal. Pairs perfectly with my PlayStation.', 'Karthik Rao', 74),
    ('telearglass-gaming', 5, 'TeleARGames library is genuinely fun and Xbox compatibility just works. Best AR gaming I''ve tried.', 'Siddharth Jain', 63),
    ('telearglass-gaming', 4, 'Immersive and responsive. Would love even more native titles, but what''s there is excellent.', 'Manish Gupta', 31),
    ('telearglass-customization', 5, 'We deployed TeleComp across Windows and Linux workstations — thought-driven control has transformed our lab.', 'Dr. Ananya Bose', 52),
    ('telearglass-customization', 5, 'TeleARSpace and TeleARMY modules are exactly what our program needed. Mission-grade and dependable.', 'Ritika Agarwal', 44)
) AS v(slug, rating, comment, reviewer_name, helpful_votes)
JOIN public.products p ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.reviews r WHERE r.product_id = p.id AND r.user_id IS NULL
);
