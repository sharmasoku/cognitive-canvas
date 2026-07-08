import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

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
export interface SpecEntry { key: string; value: string; }
export interface FaqEntry { question: string; answer: string; }

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category: string;
  technology: string;
  short_description: string | null;
  technology_story: string | null;
  warranty: string | null;
  price_inr: number;
  original_price_inr: number | null;
  sku: string | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  featured_order: number | null;
  advance_type: "percent" | "fixed" | null;
  advance_value: number | null;
  image_url: string | null;
  gallery: string[];
  specifications: Record<string, string>;
  faqs: FaqEntry[];
  created_at: string;
}

function normalizeProduct(row: any): AdminProduct {
  return {
    ...row,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    specifications:
      row.specifications && typeof row.specifications === "object" && !Array.isArray(row.specifications)
        ? row.specifications
        : {},
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
  };
}

export function useAllProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProducts(data.map(normalizeProduct));
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, loading, refetch: fetch };
}

export interface ProductInput {
  slug: string;
  name: string;
  tagline?: string | null;
  category: string;
  technology: string;
  short_description?: string | null;
  technology_story?: string | null;
  warranty?: string | null;
  price_inr: number;
  original_price_inr?: number | null;
  sku?: string | null;
  stock: number;
  is_active: boolean;
  is_featured?: boolean;
  featured_order?: number | null;
  advance_type?: "percent" | "fixed" | null;
  advance_value?: number | null;
  image_url?: string | null;
  gallery?: string[];
  specifications?: Record<string, string>;
  faqs?: FaqEntry[];
}

export async function createProduct(input: ProductInput) {
  // jsonb columns (gallery/specifications/faqs) are validated at runtime; cast past the strict Json type.
  const { error } = await supabase.from("products").insert(input as unknown as TablesInsert<"products">);
  return { ok: !error, error: error?.message };
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { error } = await supabase
    .from("products")
    .update({ ...input, updated_at: new Date().toISOString() } as unknown as TablesUpdate<"products">)
    .eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}

/** Upload an image to the public `admin-assets` bucket and return its URL. */
export async function uploadAdminImage(file: File): Promise<{ url?: string; error?: string }> {
  try {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("admin-assets")
      .upload(path, file, { upsert: true, contentType: file.type || "image/png" });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from("admin-assets").getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", productId);
  return { ok: !error, error: error?.message };
}

export async function toggleProductFeatured(productId: string, isFeatured: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
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
export interface SalesPoint { name: string; total: number; }
export interface LowStockItem { id: string; name: string; stock: number; }

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  activeProducts: number;
  totalProducts: number;
  recentOrders: any[];
  salesByDay: SalesPoint[];
  statusBreakdown: { name: string; value: number }[];
  lowStock: LowStockItem[];
}

/** Build a real last-7-days revenue series from order rows. */
function buildSalesByDay(orders: { total: number | null; created_at: string }[]): SalesPoint[] {
  const days: SalesPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const total = orders
      .filter((o) => (o.created_at ?? "").slice(0, 10) === key)
      .reduce((s, o) => s + (o.total ?? 0), 0);
    days.push({ name: label, total });
  }
  return days;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    activeProducts: 0,
    totalProducts: 0,
    recentOrders: [],
    salesByDay: buildSalesByDay([]),
    statusBreakdown: [],
    lowStock: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, profilesRes, productsRes] = await Promise.all([
          supabase.from("orders").select("id, total, status, created_at, payment_status").order("created_at", { ascending: false }),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id, name, stock, is_active"),
        ]);

        const orders = ordersRes.data ?? [];
        const products = productsRes.data ?? [];
        const totalRevenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
        const pendingOrders = orders.filter((o) => o.status === "pending").length;

        const statusCounts = new Map<string, number>();
        for (const o of orders) statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
        const statusBreakdown = [...statusCounts.entries()].map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }));

        const lowStock = products
          .filter((p) => (p.stock ?? 0) <= 20)
          .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
          .slice(0, 6)
          .map((p) => ({ id: p.id, name: p.name, stock: p.stock ?? 0 }));

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalUsers: profilesRes.count ?? 0,
          pendingOrders,
          activeProducts: products.filter((p) => p.is_active).length,
          totalProducts: products.length,
          recentOrders: orders.slice(0, 10),
          salesByDay: buildSalesByDay(orders),
          statusBreakdown,
          lowStock,
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
          .eq("user_id", userId!)
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
          .eq("user_id", userId!)
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
      .update({ ...address, updated_at: new Date().toISOString() } as unknown as TablesUpdate<"addresses">)
      .eq("id", address.id);
    return { ok: !error, error: error?.message };
  }
  const { error } = await supabase.from("addresses").insert(address as unknown as TablesInsert<"addresses">);
  return { ok: !error, error: error?.message };
}

/* ─── Job Applications (Recruitment) ─── */
export interface JobApplication {
  id: string;
  full_name: string;
  email: string;
  dob: string | null;
  gender: string | null;
  contact: string | null;
  aadhaar: string | null;
  address: string | null;
  message: string | null;
  created_at: string;
}

export function useAllJobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("job_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setApplications(data as JobApplication[]);
      }
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { applications, loading, refetch: fetch };
}

export async function deleteJobApplication(id: string) {
  const { error } = await (supabase as any).from("job_applications").delete().eq("id", id);
  return { ok: !error, error: error?.message };
}
