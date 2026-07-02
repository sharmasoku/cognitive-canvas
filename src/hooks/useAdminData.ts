import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ─── Users ─── */
export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  role: string;
}

export function useAllUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: roles } = await supabase.from("user_roles").select("*");

      const roleMap = new Map<string, string>();
      if (roles) {
        for (const r of roles) roleMap.set(r.user_id, r.role);
      }

      if (profiles) {
        setUsers(
          profiles.map((p) => ({
            ...p,
            role: roleMap.get(p.id) ?? "customer",
          })),
        );
      }
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { users, loading, refetch: fetch };
}

/* ─── Products ─── */
export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  technology: string;
  price_inr: number;
  original_price_inr: number | null;
  stock: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
}

export function useAllProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, category, technology, price_inr, original_price_inr, stock, is_active, image_url, created_at")
        .order("created_at", { ascending: false });
      if (data) setProducts(data);
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, loading, refetch: fetch };
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", productId);
  return { ok: !error, error: error?.message };
}

export async function replenishStock(productId: string, qty: number) {
  try {
    const { error } = await supabase.rpc("replenish_stock", {
      p_product_id: productId,
      p_qty: qty,
    });
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/* ─── Contact Messages ─── */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setMessages(data);
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { messages, loading, refetch: fetch };
}

export async function deleteContactMessage(id: string) {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}

/* ─── Dashboard Stats ─── */
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  recentOrders: any[];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, profilesRes] = await Promise.all([
          supabase.from("orders").select("id, total, status, created_at, payment_status"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);

        const orders = ordersRes.data ?? [];
        const totalRevenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
        const pendingOrders = orders.filter((o) => o.status === "pending").length;

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalUsers: profilesRes.count ?? 0,
          pendingOrders,
          recentOrders: orders.slice(0, 10),
        });
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  return { stats, loading };
}

/* ─── Reviews ─── */
export interface UserReview {
  id: string;
  product_id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  verified: boolean;
  created_at: string;
  product_name?: string;
}

export function useUserReviews(userId: string | null | undefined) {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    async function load() {
      try {
        const { data } = await supabase
          .from("reviews")
          .select("*, products!reviews_product_id_fkey(name)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (data) {
          setReviews(
            data.map((r: any) => ({
              ...r,
              product_name: Array.isArray(r.products) ? r.products[0]?.name : r.products?.name,
            })),
          );
        }
      } catch {
        // Fallback without join
        const { data: d2 } = await supabase
          .from("reviews")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (d2) setReviews(d2.map((r: any) => ({ ...r, product_name: undefined })));
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  return { reviews, loading };
}

/* ─── Addresses ─── */
export interface UserAddress {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export function useUserAddresses(userId: string | null | undefined) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });
      if (data) setAddresses(data);
    } catch { /* */ }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { addresses, loading, refetch: fetch };
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function upsertAddress(address: Partial<UserAddress> & { user_id: string }) {
  if (address.id) {
    const { error } = await supabase
      .from("addresses")
      .update({ ...address, updated_at: new Date().toISOString() })
      .eq("id", address.id);
    return { ok: !error, error: error?.message };
  }
  const { error } = await supabase.from("addresses").insert(address);
  return { ok: !error, error: error?.message };
}
