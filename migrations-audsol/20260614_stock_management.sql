-- Atomic order placement with stock management
-- This function runs the entire order flow in a single transaction:
-- 1. Validate address ownership
-- 2. Lock variant rows (FOR UPDATE) to prevent race conditions
-- 3. Check stock availability
-- 4. Decrement stock
-- 5. Create order + order items
-- If any step fails, the entire transaction rolls back automatically.

CREATE OR REPLACE FUNCTION public.place_order_tx(
  p_user_id uuid,
  p_items jsonb,        -- [{"variant_id":"...","qty":2}, ...]
  p_address_id uuid,
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
  v_item jsonb;
  v_variant record;
  v_address record;
  v_line_total int;
  v_shipping int := 0;
BEGIN
  -- 1. Validate address belongs to user
  SELECT * INTO v_address FROM addresses WHERE id = p_address_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address not found or does not belong to user';
  END IF;

  -- 2. Create the order (we will update subtotal/total after calculating)
  INSERT INTO orders (user_id, status, subtotal, shipping, total, address, payment_status, payment_method, notes)
  VALUES (
    p_user_id, 'pending', 0, v_shipping, 0,
    jsonb_build_object(
      'name', v_address.name, 'phone', v_address.phone,
      'line1', v_address.line1, 'line2', v_address.line2,
      'city', v_address.city, 'state', v_address.state, 'pincode', v_address.pincode
    ),
    'pending', 'cod_placeholder', p_notes
  )
  RETURNING id INTO v_order_id;

  -- 3. Process each item: lock stock, validate, decrement, insert order_item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Lock the variant row to prevent concurrent modification
    SELECT pv.*, p.name AS product_name
    INTO v_variant
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = (v_item->>'variant_id')::uuid
    FOR UPDATE OF pv;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant % not found', v_item->>'variant_id';
    END IF;

    IF v_variant.stock < (v_item->>'qty')::int THEN
      RAISE EXCEPTION 'Insufficient stock for % (%). Available: %, requested: %',
        v_variant.product_name, v_variant.label, v_variant.stock, (v_item->>'qty')::int;
    END IF;

    -- Decrement stock
    UPDATE product_variants
    SET stock = stock - (v_item->>'qty')::int
    WHERE id = v_variant.id;

    -- Calculate line total
    v_line_total := v_variant.price_inr * (v_item->>'qty')::int;
    v_subtotal := v_subtotal + v_line_total;

    -- Insert order item
    INSERT INTO order_items (order_id, variant_id, name, size, unit_price, qty, line_total)
    VALUES (v_order_id, v_variant.id, v_variant.product_name, v_variant.label,
            v_variant.price_inr, (v_item->>'qty')::int, v_line_total);
  END LOOP;

  -- 4. Update order with correct totals
  UPDATE orders
  SET subtotal = v_subtotal, total = v_subtotal + v_shipping
  WHERE id = v_order_id;

  RETURN v_order_id;
END;
$$;

-- Only allow service_role and authenticated users to call this
REVOKE EXECUTE ON FUNCTION public.place_order_tx(uuid, jsonb, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order_tx(uuid, jsonb, uuid, text) TO authenticated, service_role;
