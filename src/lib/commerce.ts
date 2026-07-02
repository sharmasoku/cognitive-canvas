// Client-side data access for the Supabase commerce schema.
// Every call is best-effort: if Supabase env is missing, the user is a guest,
// or the catalogue isn't seeded, helpers return a safe fallback so the
// localStorage-based UI keeps working.
import { supabase } from "@/integrations/supabase/client";
import type { CartItem, ShippingAddress } from "@/context/ShopContext";

export interface DbReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpfulVotes: number;
}

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Map static product slugs to their DB uuids (only those present in the catalogue). */
async function resolveProductIds(slugs: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const { data, error } = await supabase.from("products").select("id, slug").in("slug", slugs);
    if (error || !data) return map;
    for (const row of data) map.set(row.slug, row.id);
  } catch {
    /* env not configured */
  }
  return map;
}

export interface PersistOrderParams {
  items: CartItem[];
  address: ShippingAddress;
  speed: "standard" | "priority";
  shipping: number;
  tax: number;
  discount: number;
}

/**
 * Persist an order atomically via place_order_tx for signed-in users.
 * Returns the DB order uuid, or null when persistence isn't possible
 * (guest, missing env, or catalogue not seeded) so the caller can fall back.
 */
export async function persistOrder(p: PersistOrderParams): Promise<string | null> {
  const userId = await currentUserId();
  if (!userId) return null;

  const ids = await resolveProductIds(p.items.map((i) => i.product.slug));
  const rpcItems = p.items
    .map((i) => {
      const productId = ids.get(i.product.slug);
      return productId ? { product_id: productId, qty: i.quantity } : null;
    })
    .filter((x): x is { product_id: string; qty: number } => x !== null);

  if (rpcItems.length === 0) return null; // catalogue not matched — keep local order

  try {
    const { data, error } = await supabase.rpc("place_order_tx", {
      p_user_id: userId,
      p_items: rpcItems,
      p_shipping_address: {
        name: p.address.fullName,
        email: p.address.email,
        phone: p.address.phone,
        line1: p.address.address,
        city: p.address.city,
        pincode: p.address.postalCode,
      },
      p_delivery_speed: p.speed,
      p_shipping: p.shipping,
      p_tax: p.tax,
      p_discount: p.discount,
    });
    if (error) {
      console.warn("[commerce] place_order_tx failed:", error.message);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** Public reviews for a product, newest first. Empty array if unavailable. */
export async function fetchReviews(productSlug: string): Promise<DbReview[]> {
  try {
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productSlug)
      .maybeSingle();
    if (!product) return [];

    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });
    if (!data) return [];

    return data.map((r) => ({
      id: r.id,
      userName: r.reviewer_name || "TeleAR Customer",
      rating: r.rating,
      comment: r.comment,
      date: r.created_at,
      verified: r.verified,
      helpfulVotes: r.helpful_votes,
    }));
  } catch {
    return [];
  }
}

/** Submit a review (auth required). One review per user per product (DB-enforced). */
export async function submitReview(
  productSlug: string,
  rating: number,
  comment: string,
  reviewerName: string,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in to write a review." };
  try {
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productSlug)
      .maybeSingle();
    if (!product) return { ok: false, error: "Product is not in the catalogue yet." };

    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      user_id: userId,
      rating,
      comment,
      reviewer_name: reviewerName,
    });
    if (error) {
      // 23505 = unique violation (already reviewed)
      if (error.code === "23505") return { ok: false, error: "You've already reviewed this product." };
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Store a contact/feedback message. Allowed for anonymous visitors. */
export async function submitContactMessage(params: {
  name: string;
  email: string;
  message: string;
  phone?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("contact_messages").insert({
      name: params.name,
      email: params.email,
      message: params.message,
      phone: params.phone ?? null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
