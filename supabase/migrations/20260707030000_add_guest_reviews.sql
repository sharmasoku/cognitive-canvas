-- =============================================================
-- Insert guest feedback comments from Honourable Governor and ISRO Director.
-- Links dynamically to the flagship product 'telear-vision-pro'.
-- =============================================================

-- 1. Insert feedback from Honourable Governor Acharya Devvrat
INSERT INTO public.reviews (product_id, rating, comment, reviewer_name, verified, helpful_votes)
SELECT id, 5, 'Very Good Startups are becoming in India.', 'Honourable Governor Acharya Devvrat', true, 12
FROM public.products
WHERE slug = 'telear-vision-pro'
LIMIT 1;

-- 2. Insert feedback from Nilesh Desai (ISRO Ahmedabad Director)
INSERT INTO public.reviews (product_id, rating, comment, reviewer_name, verified, helpful_votes)
SELECT id, 5, 'Very Good Innovation & He invited Our Startup TeleARGlass at ISRO Facility.', 'Nilesh Desai (ISRO Ahmedabad Director)', true, 18
FROM public.products
WHERE slug = 'telear-vision-pro'
LIMIT 1;
