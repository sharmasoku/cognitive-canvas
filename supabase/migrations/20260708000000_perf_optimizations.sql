-- =============================================================
-- TeleARGlass DB Performance Optimizations Migration
-- Adaptable for PostgreSQL 17 / Supabase
-- Creates partial, composite, and covering indexes to resolve
-- bottleneck catalog queries, N+1 lookups, and analytics aggregates.
-- =============================================================

-- 1. Optimized B-Tree index for catalog listing and search filters
CREATE INDEX IF NOT EXISTS idx_products_catalog_active
ON public.products (category, technology, price_inr, created_at DESC, id DESC)
INCLUDE (slug, name, tagline, stock, image_url)
WHERE is_active = true;

-- 2. Optimized partial B-Tree index for admin dashboard analytics
CREATE INDEX IF NOT EXISTS idx_orders_analytics_date
ON public.orders (created_at DESC, total)
WHERE (status <> 'cancelled');

-- 3. Optimized composite index for user order history sorting
CREATE INDEX IF NOT EXISTS idx_orders_user_date
ON public.orders (user_id, created_at DESC);

-- 4. Optimized index for order items lookup (prevents N+1 lookup latency)
CREATE INDEX IF NOT EXISTS idx_order_items_lookup
ON public.order_items (order_id);

-- 5. Optimized covering composite index for reviews sorting (verified first, helpful, newest)
CREATE INDEX IF NOT EXISTS idx_reviews_product_ordering
ON public.reviews (product_id, verified DESC, helpful_votes DESC, created_at DESC)
INCLUDE (reviewer_name, rating, comment);
