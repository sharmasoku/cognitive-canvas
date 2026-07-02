-- Migration to add compare-at price column for product variants
-- And function to replenish stock atomically on cancellation.

ALTER TABLE public.product_variants
ADD COLUMN compare_at_price_inr integer DEFAULT NULL;

-- Function to safely replenish stock
CREATE OR REPLACE FUNCTION public.replenish_stock(
  p_variant_id uuid,
  p_qty integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_variants
  SET stock = stock + p_qty
  WHERE id = p_variant_id;
END;
$$;

-- Only allow service_role and authenticated users to call this
REVOKE EXECUTE ON FUNCTION public.replenish_stock(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.replenish_stock(uuid, integer) TO authenticated, service_role;
