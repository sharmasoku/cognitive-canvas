import smartGlass from "@/assets/tele-ar-glass-smart-glass.jpeg";
import legacy from "@/assets/tele-ar-glass-legacy.jpeg";
import homeAuto from "@/assets/tele-ar-glass-home-auto.jpeg";
import gaming from "@/assets/tele-ar-glass-gaming-and-optimization.jpeg";

export type Category = "Smart Glasses" | "Home Automation" | "Gaming" | "Enterprise";
export type Technology = "BCI + AR" | "AR" | "BCI" | "Standard";

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpfulVotes: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: Category;
  technology: Technology;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  image: string;
  gallery: string[];
  shortDescription: string;
  specifications: Record<string, string>;
  warranty: string;
  technologyStory: string;
  faqs: { question: string; answer: string }[];
  reviewsList: Review[];
  /** Part-payment rule, if the admin has enabled it for this product. */
  advanceType: "percent" | "fixed" | null;
  advanceValue: number | null;
  whenItWillDeliver?: string;
}

/**
 * Amount due now for one line of this product (matches the server-side
 * place_order_tx calculation): the advance portion if part-payment is
 * configured, otherwise the full line total.
 */
export function computeAdvanceAmount(product: Product, qty: number): number {
  const lineTotal = product.price * qty;
  if (product.advanceType === "percent" && product.advanceValue != null) {
    return Math.min(lineTotal, Math.round((lineTotal * product.advanceValue) / 100));
  }
  if (product.advanceType === "fixed" && product.advanceValue != null) {
    return Math.min(lineTotal, product.advanceValue * qty);
  }
  return lineTotal;
}

/**
 * Maps the bundled product image filenames (as stored in `products.image_url`
 * for seeded rows) back to their imported asset URLs, so seeded products still
 * render an image in the admin panel.
 */
export const productImageByFile: Record<string, string> = {
  "tele-ar-glass-smart-glass.jpeg": smartGlass,
  "tele-ar-glass-legacy.jpeg": legacy,
  "tele-ar-glass-home-auto.jpeg": homeAuto,
  "tele-ar-glass-gaming-and-optimization.jpeg": gaming,
};

/** Neutral inline placeholder used when a product has no resolvable image. */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' rx='12' fill='%23ede9fe'/><path d='M24 52l12-14 9 10 6-7 9 11z' fill='%237c3aed' opacity='.5'/><circle cx='30' cy='30' r='5' fill='%237c3aed' opacity='.5'/></svg>`,
  );

/**
 * Resolve any `image_url` value to something an <img> can render safely:
 * absolute URLs / data URIs pass through, known bundled filenames map to their
 * asset, everything else falls back to a placeholder (never a broken image).
 */
export function resolveProductImage(url?: string | null): string {
  if (!url) return PLACEHOLDER_IMAGE;
  if (/^(https?:|data:|blob:|\/)/.test(url)) return url;
  return productImageByFile[url] ?? PLACEHOLDER_IMAGE;
}
