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
  carrier: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: DbOrderItem[];
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

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  return { ok: !error, error: error?.message };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  return { ok: !error, error: error?.message };
}
