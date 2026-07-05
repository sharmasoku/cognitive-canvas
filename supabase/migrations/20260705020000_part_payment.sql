-- =============================================================
-- Part-payment orders: pay a configurable advance now, remainder
-- (cash/UPI) collected by the delivery agent and marked paid by
-- an admin. Per-product advance rule; ledgered via order_payments
-- so future online capture (e.g. PayU) can slot in without a
-- schema change (see gateway/gateway_ref columns, unused for now).
-- =============================================================

-- ---------- PRODUCTS: per-product advance rule ----------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS advance_type text CHECK (advance_type IN ('percent', 'fixed')),
  ADD COLUMN IF NOT EXISTS advance_value int CHECK (advance_value IS NULL OR advance_value >= 0);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_advance_consistency;
ALTER TABLE public.products
  ADD CONSTRAINT products_advance_consistency CHECK (
    (advance_type IS NULL AND advance_value IS NULL)
    OR (advance_type IS NOT NULL AND advance_value IS NOT NULL
        AND (advance_type <> 'percent' OR advance_value <= 100))
  );

-- ---------- ORDERS: payment plan + running balance ----------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_plan text NOT NULL DEFAULT 'full' CHECK (payment_plan IN ('full', 'partial')),
  ADD COLUMN IF NOT EXISTS amount_paid_inr int NOT NULL DEFAULT 0 CHECK (amount_paid_inr >= 0),
  ADD COLUMN IF NOT EXISTS amount_due_inr int NOT NULL DEFAULT 0 CHECK (amount_due_inr >= 0);

-- =============================================================
-- ORDER PAYMENTS (ledger: advance + balance, each tracked to paid)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.order_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('advance', 'balance')),
  amount_inr int NOT NULL CHECK (amount_inr >= 0),
  method text CHECK (method IS NULL OR method IN ('cash', 'upi', 'payu')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  gateway text,
  gateway_ref text,
  collected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON public.order_payments(order_id);
GRANT SELECT ON public.order_payments TO authenticated;
GRANT INSERT, UPDATE ON public.order_payments TO authenticated;
GRANT ALL ON public.order_payments TO service_role;
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments select" ON public.order_payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "admins manage payments" ON public.order_payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- place_order_tx: compute the advance/balance split per item from
-- each product's advance_type/advance_value (server-trusted, not
-- client-supplied) and seed the order_payments ledger.
-- Signature is unchanged, so existing callers keep working.
-- =============================================================
CREATE OR REPLACE FUNCTION public.place_order_tx(
  p_user_id uuid,
  p_items jsonb,
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
  v_advance_total int := 0;
  v_balance_total int := 0;
  v_item jsonb;
  v_product record;
  v_qty int;
  v_line_total int;
  v_item_advance int;
  v_payment_plan text;
  v_total int;
BEGIN
  INSERT INTO orders (user_id, status, subtotal, discount, shipping, tax, total,
                      shipping_address, delivery_speed, payment_status, payment_method, notes)
  VALUES (p_user_id, 'pending', 0, p_discount, p_shipping, p_tax, 0,
          p_shipping_address, p_delivery_speed, 'pending', 'cod_placeholder', p_notes)
  RETURNING id INTO v_order_id;

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

    IF v_product.advance_type = 'percent' THEN
      v_item_advance := LEAST(v_line_total, ROUND(v_line_total * v_product.advance_value / 100.0));
    ELSIF v_product.advance_type = 'fixed' THEN
      v_item_advance := LEAST(v_line_total, v_product.advance_value * v_qty);
    ELSE
      v_item_advance := v_line_total; -- no part-payment configured: full line due now
    END IF;
    v_advance_total := v_advance_total + v_item_advance;

    INSERT INTO order_items (order_id, product_id, name, unit_price, qty, line_total)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.price_inr, v_qty, v_line_total);
  END LOOP;

  v_balance_total := v_subtotal - v_advance_total;
  v_total := v_subtotal + p_shipping + p_tax - p_discount;
  v_payment_plan := CASE WHEN v_balance_total > 0 THEN 'partial' ELSE 'full' END;

  UPDATE orders
  SET subtotal = v_subtotal,
      total = v_total,
      payment_plan = v_payment_plan,
      amount_paid_inr = 0,
      amount_due_inr = v_total
  WHERE id = v_order_id;

  INSERT INTO order_payments (order_id, type, amount_inr, status)
  VALUES (v_order_id, 'advance', v_advance_total + p_shipping + p_tax - p_discount, 'pending');

  IF v_balance_total > 0 THEN
    INSERT INTO order_payments (order_id, type, amount_inr, status)
    VALUES (v_order_id, 'balance', v_balance_total, 'pending');
  END IF;

  RETURN v_order_id;
END;
$$;
