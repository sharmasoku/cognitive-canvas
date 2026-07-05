-- =============================================================
-- record_order_payment: admin marks an advance/balance ledger row
-- as collected (cash/UPI today; 'payu' reserved for the future
-- online-gateway flow) and atomically rolls the order's running
-- amount_paid_inr/amount_due_inr/payment_status forward.
-- =============================================================
CREATE OR REPLACE FUNCTION public.record_order_payment(
  p_payment_id uuid,
  p_method text DEFAULT 'cash'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment record;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can record payments';
  END IF;

  SELECT * INTO v_payment FROM order_payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment % not found', p_payment_id;
  END IF;
  IF v_payment.status = 'paid' THEN
    RETURN;
  END IF;

  UPDATE order_payments
  SET status = 'paid', method = p_method, collected_by = auth.uid(), paid_at = now()
  WHERE id = p_payment_id;

  UPDATE orders
  SET amount_paid_inr = amount_paid_inr + v_payment.amount_inr,
      amount_due_inr = GREATEST(0, amount_due_inr - v_payment.amount_inr),
      payment_status = CASE
        WHEN amount_due_inr - v_payment.amount_inr <= 0 THEN 'paid'::payment_status
        ELSE payment_status
      END,
      updated_at = now()
  WHERE id = v_payment.order_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.record_order_payment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_order_payment(uuid, text) TO authenticated, service_role;
