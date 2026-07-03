-- =============================================================
-- Allow editorial / seeded reviews that aren't tied to an auth user,
-- while still enforcing one review per real user per product.
-- =============================================================

-- Reviews can now exist without a user_id (editorial/seed rows).
ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;

-- Drop the strict (product_id, user_id) unique constraint …
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_user_id_key;

-- … and replace it with a partial unique index that only applies to
-- real (non-null) users, so a signed-in user still can't review twice.
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user
  ON public.reviews (product_id, user_id)
  WHERE user_id IS NOT NULL;
