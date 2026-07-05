import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbOrder {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address: any;
  delivery_speed: string;
  payment_status: string;
  payment_method: string;
  payment_plan: string;
  amount_paid_inr: number;
  amount_due_inr: number;
  carrier: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: DbOrderItem[];
  payments?: DbOrderPayment[];
  profile?: { full_name: string | null; email: string | null } | null;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  unit_price: number;
  qty: number;
  line_total: number;
}

export interface DbOrderPayment {
  id: string;
  order_id: string;
  type: "advance" | "balance";
  amount_inr: number;
  method: string | null;
  status: "pending" | "paid" | "failed";
  gateway: string | null;
  gateway_ref: string | null;
  collected_by: string | null;
  paid_at: string | null;
  created_at: string;
}

export function useUserOrders(userId: string | null | undefined) {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(
          data.map((o: any) => ({ ...o, items: o.order_items ?? [] })),
        );
      }
    } catch { /* */ }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, loading, refetch: fetch };
}

export function useAllOrders() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), profiles!orders_user_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(
          data.map((o: any) => ({
            ...o,
            items: o.order_items ?? [],
            profile: Array.isArray(o.profiles) ? o.profiles[0] ?? null : o.profiles ?? null,
          })),
        );
      } else if (error) {
        // Fallback: fetch without join if FK alias doesn't work
        const { data: d2 } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false });
        if (d2) {
          setOrders(d2.map((o: any) => ({ ...o, items: o.order_items ?? [], profile: null })));
        }
      }
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, loading, refetch: fetch };
}

export function useOrder(id: string | undefined) {
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), order_payments(*), profiles!orders_user_id_fkey(full_name, email)")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        const o: any = data;
        setOrder({
          ...o,
          items: o.order_items ?? [],
          payments: o.order_payments ?? [],
          profile: Array.isArray(o.profiles) ? o.profiles[0] ?? null : o.profiles ?? null,
        });
      } else if (error) {
        // Fallback: fetch without the profiles join if the FK alias fails.
        const { data: d2 } = await supabase
          .from("orders")
          .select("*, order_items(*), order_payments(*)")
          .eq("id", id)
          .maybeSingle();
        setOrder(
          d2
            ? { ...(d2 as any), items: (d2 as any).order_items ?? [], payments: (d2 as any).order_payments ?? [], profile: null }
            : null,
        );
      } else {
        setOrder(null);
      }
    } catch { /* */ }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { order, loading, refetch: fetch };
}

type OrderStatusValue = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
type PaymentStatusValue = "pending" | "paid" | "failed" | "refunded";

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status: status as OrderStatusValue, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  return { ok: !error, error: error?.message };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus as PaymentStatusValue, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  return { ok: !error, error: error?.message };
}

export async function recordOrderPayment(paymentId: string, method: "cash" | "upi") {
  try {
    const { error } = await supabase.rpc("record_order_payment", {
      p_payment_id: paymentId,
      p_method: method,
    });
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateOrderTracking(orderId: string, carrier: string, trackingNumber: string) {
  const { error } = await supabase
    .from("orders")
    .update({
      carrier: carrier.trim() || null,
      tracking_number: trackingNumber.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  return { ok: !error, error: error?.message };
}
