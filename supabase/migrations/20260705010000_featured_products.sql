-- =============================================================
-- Homepage featured products: let admins choose which products
-- appear in the homepage showcase, with a manual display order.
-- =============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_order int;

CREATE INDEX IF NOT EXISTS idx_products_featured
  ON public.products (featured_order)
  WHERE is_featured = true;
