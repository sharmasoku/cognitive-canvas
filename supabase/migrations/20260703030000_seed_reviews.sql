-- =============================================================
-- Seed genuine-looking customer reviews (editorial: user_id = NULL).
-- Matched to products by slug so it runs regardless of product uuids.
-- Safe to re-run: skips products that already have seeded reviews.
-- =============================================================

INSERT INTO public.reviews (product_id, user_id, rating, comment, reviewer_name, verified, helpful_votes)
SELECT p.id, NULL, v.rating, v.comment, v.reviewer_name, true, v.helpful_votes
FROM (
  VALUES
    -- ── TeleAR Vision Pro ──────────────────────────────
    ('telear-vision-pro', 5, 'The neural typing is genuinely life-changing. Drafted an entire pitch deck hands-free on a flight. Waveguide clarity in sunlight is unreal.', 'Aarav Mehta', 142),
    ('telear-vision-pro', 5, 'Premium titanium build and it''s feather-light on the nose. Calibration took two short sessions, then it just works.', 'Priya Sharma', 98),
    ('telear-vision-pro', 4, 'Astonishing hardware. Battery comfortably lasts my workday. Docked a star only because the Rx insert took a week to arrive.', 'Kunal Verma', 54),
    ('telear-vision-pro', 5, 'On-device decoding means my data never leaves the headset — exactly the privacy stance I wanted. Highly recommend.', 'Ishita Rao', 73),
    -- ── TeleAR Lite ────────────────────────────────────
    ('telear-lite', 5, 'The perfect daily driver. 32g means I forget I''m wearing it, and the HUD is crisp for navigation and notifications.', 'Rohan Iyer', 61),
    ('telear-lite', 4, 'Great value AR. No BCI as expected, but the photochromic lenses outdoors are a lovely touch.', 'Sneha Kapoor', 39),
    ('telear-lite', 5, 'Paired with my phone in seconds. Spatial dashboards while cooking is my new normal.', 'Vikram Nair', 28),
    -- ── Neural Band X ──────────────────────────────────
    ('neural-band-x', 5, 'As a researcher this opened up our HCI experiments overnight. Raw EEG streaming plus the SDK decoders are excellent.', 'Dr. Ananya Bose', 87),
    ('neural-band-x', 4, 'Solid 16-channel signal quality and comfortable for long sessions. Documentation could be a little deeper.', 'Meera Joshi', 45),
    ('neural-band-x', 5, 'CE-marked and reliable. The Python bindings saved us weeks of integration work.', 'Arjun Reddy', 33),
    -- ── TeleSense Neural Buds ──────────────────────────
    ('neural-buds', 5, 'Pinch-to-focus actually works. The continuous focus score nudges me back when I drift — brilliant for deep work.', 'Nisha Menon', 52),
    ('neural-buds', 4, 'Double as proper earbuds with great ANC. In-ear EEG is a clever form factor; fit takes a day to get used to.', 'Karthik Rao', 41),
    ('neural-buds', 5, 'Sleep tracking via the buds is surprisingly accurate. Best money I''ve spent on focus tech.', 'Divya Pillai', 36),
    -- ── TeleAR Dev Kit ─────────────────────────────────
    ('telear-dev-kit', 5, 'Everything in one Pelican case. Shipped our first TeleOS app in a weekend hackathon thanks to the reference unit.', 'Siddharth Jain', 47),
    ('telear-dev-kit', 5, 'Priority support is real — engineers replied within hours. The Think2Speak corpus is gold for training.', 'Ritika Agarwal', 29),
    ('telear-dev-kit', 4, 'Comprehensive kit. The edge inference puck runs hot under sustained load but performance is superb.', 'Manish Gupta', 22),
    -- ── Aurora Charging Dock ───────────────────────────
    ('charging-dock', 5, 'The nightly calibration keeps my lenses perfectly aligned. Also the violet halo looks gorgeous on the desk.', 'Tara Krishnan', 40),
    ('charging-dock', 4, 'Solid basalt base, no sliding around. Magnetic alignment fits both my Vision Pro and Lite.', 'Aditya Shetty', 25),
    ('charging-dock', 5, 'Wish I''d bought it sooner — charge, calibrate and store in one spot. Premium feel.', 'Pooja Desai', 18)
) AS v(slug, rating, comment, reviewer_name, helpful_votes)
JOIN public.products p ON p.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.reviews r WHERE r.product_id = p.id AND r.user_id IS NULL
);
