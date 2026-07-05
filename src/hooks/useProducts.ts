import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { resolveProductImage, type Category, type Product, type Technology } from "@/data/products";

type ProductRow = Tables<"products">;

function aggregateRatings(reviews: { product_id: string; rating: number }[]) {
  const map = new Map<string, { sum: number; count: number }>();
  for (const r of reviews) {
    const entry = map.get(r.product_id) ?? { sum: 0, count: 0 };
    entry.sum += r.rating;
    entry.count += 1;
    map.set(r.product_id, entry);
  }
  const result = new Map<string, { rating: number; reviewCount: number }>();
  for (const [productId, { sum, count }] of map) {
    result.set(productId, { rating: Math.round((sum / count) * 10) / 10, reviewCount: count });
  }
  return result;
}

function mapDbProduct(row: ProductRow, ratings: Map<string, { rating: number; reviewCount: number }>): Product {
  const agg = ratings.get(row.id);
  const gallery = Array.isArray(row.gallery) ? (row.gallery as string[]) : [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    category: row.category as Category,
    technology: row.technology as Technology,
    price: row.price_inr,
    originalPrice: row.original_price_inr ?? undefined,
    rating: agg?.rating ?? 0,
    reviewCount: agg?.reviewCount ?? 0,
    inStock: row.stock > 0,
    image: resolveProductImage(row.image_url),
    gallery: gallery.length ? gallery.map(resolveProductImage) : [resolveProductImage(row.image_url)],
    shortDescription: row.short_description ?? "",
    specifications: (row.specifications as Record<string, string>) ?? {},
    warranty: row.warranty ?? "",
    technologyStory: row.technology_story ?? "",
    faqs: (row.faqs as { question: string; answer: string }[]) ?? [],
    reviewsList: [],
    advanceType: (row.advance_type as "percent" | "fixed" | null) ?? null,
    advanceValue: row.advance_value ?? null,
  };
}

/** All active products, with rating/reviewCount aggregated from the reviews table. */
export async function fetchActiveProducts(): Promise<Product[]> {
  const [{ data: rows }, { data: reviews }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("reviews").select("product_id, rating"),
  ]);
  const ratings = aggregateRatings(reviews ?? []);
  return (rows ?? []).map((row) => mapDbProduct(row, ratings));
}

/** Active products marked for the homepage, ordered by featured_order (nulls last). */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  const [{ data: rows }, { data: reviews }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("featured_order", { ascending: true, nullsFirst: false }),
    supabase.from("reviews").select("product_id, rating"),
  ]);
  const ratings = aggregateRatings(reviews ?? []);
  return (rows ?? []).map((row) => mapDbProduct(row, ratings));
}

/** A single active product by slug, or null if missing/inactive. */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data: row } = await supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!row) return null;
  const { data: reviews } = await supabase.from("reviews").select("product_id, rating").eq("product_id", row.id);
  const ratings = aggregateRatings(reviews ?? []);
  return mapDbProduct(row, ratings);
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await fetchActiveProducts());
    } catch {
      /* best-effort */
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, loading, refetch: fetch };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedProducts()
      .then((p) => { if (!cancelled) setProducts(p); })
      .catch(() => { /* best-effort */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { products, loading };
}
