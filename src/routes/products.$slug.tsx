import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, Minus, Plus, RefreshCw,
  ShieldCheck, ShoppingCart, Star, ThumbsUp, Truck, Zap,
} from "lucide-react";
import { computeAdvanceAmount, type Product } from "@/data/products";
import { fetchProductBySlug } from "@/hooks/useProducts";
import { useShop } from "@/context/ShopContext";
import { inr, shortDate } from "@/lib/format";
import { fetchReviews, submitReview, type DbReview } from "@/lib/commerce";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.name} — TeleARGlass` },
      { name: "description", content: loaderData.product.shortDescription },
      { property: "og:title", content: loaderData.product.name },
      { property: "og:description", content: loaderData.product.shortDescription },
      { property: "og:image", content: loaderData.product.image },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="section-container py-32 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/products" className="mt-4 inline-block text-primary">Back to catalogue</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="section-container py-32">{(error as Error).message}</div>,
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, inWishlist, setCartOpen } = useShop();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"spec" | "tech" | "warranty" | "faq" | "reviews">("spec");
  const [imgIdx, setImgIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const wished = inWishlist(product.id);

  const [reviews, setReviews] = useState<DbReview[]>([]);
  const loadReviews = useCallback(() => {
    fetchReviews(product.slug).then(setReviews);
  }, [product.slug]);
  useEffect(() => { loadReviews(); }, [loadReviews]);

  const reviewCount = reviews.length;
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  const hasMultipleImages = product.gallery.length > 1;
  const showPrevImage = () => setImgIdx((i) => (i - 1 + product.gallery.length) % product.gallery.length);
  const showNextImage = () => setImgIdx((i) => (i + 1) % product.gallery.length);

  const lineTotal = product.price * qty;
  const advanceNow = computeAdvanceAmount(product, qty);
  const dueLater = lineTotal - advanceNow;
  const isPartPayment = product.advanceType != null && dueLater > 0;
  const advancePct = lineTotal > 0 ? Math.round((advanceNow / lineTotal) * 100) : 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setJustAdded(true);
    setCartOpen(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div className="pb-28 lg:pb-0">
      <div className="section-container py-8 sm:py-12 lg:py-16">
        <Link to="/products" className="group mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-primary">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Catalogue
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-20 xl:gap-24">
          {/* ─── Gallery ─── */}
          <div className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-[2rem] border border-border-light shadow-soft bg-surface h-[280px] sm:h-[360px] md:h-[400px] w-full max-w-[480px] mx-auto flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  src={product.gallery[imgIdx]}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {hasMultipleImages && (
                <>
                  <button
                    onClick={showPrevImage}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur transition hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={showNextImage}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur transition hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="scrollbar-hide mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 justify-center">
              {product.gallery.map((g: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-16 shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-200 ${
                    i === imgIdx ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={g} alt="" width={64} height={64} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ─── Purchase panel ─── */}
          <div>
            <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-primary sm:text-5xl lg:text-6xl">{product.name}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-secondary">{product.tagline}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {avgRating !== null ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`h-4 w-4 ${i <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                    ))}
                  </span>
                  <span className="font-semibold text-foreground">{avgRating}</span>
                  <span className="text-text-muted">({reviewCount})</span>
                </span>
              ) : (
                <span className="text-text-muted">No reviews yet</span>
              )}
              <span className="inline-flex items-center gap-1 text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />In stock
              </span>
            </div>

            <div className="mt-7 flex items-end gap-3">
              <div className="text-4xl font-bold gradient-text sm:text-5xl">{inr(product.price)}</div>
              {product.originalPrice && <div className="mb-1 text-text-muted line-through">{inr(product.originalPrice)}</div>}
            </div>

            {isPartPayment && (
              <div className="mt-5 max-w-sm rounded-2xl border border-border-light bg-surface p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Pay today</span>
                  <span className="font-bold text-foreground">{inr(advanceNow)}</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border-light">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${advancePct}%` }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="h-full rounded-full bg-gradient-to-r from-accent to-secondary"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>{advancePct}% now</span>
                  <span>{inr(dueLater)} on delivery</span>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-border">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="grid h-12 w-12 place-items-center text-text-secondary transition hover:text-foreground">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" className="grid h-12 w-12 place-items-center text-text-secondary transition hover:text-foreground">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => toggleWishlist(product)}
                  aria-label="Wishlist"
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border transition ${
                    wished ? "border-destructive/30 text-destructive" : "border-border text-text-secondary hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  className="cta-button-premium inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-primary px-8 py-4 text-sm font-semibold text-white"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {justAdded ? (
                      <motion.span key="added" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="inline-flex items-center gap-2">
                        <Check className="h-4 w-4" /> Added to cart
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="inline-flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" /> Add to cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <Link
                  to="/checkout"
                  onClick={() => addToCart(product, qty)}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
                >
                  Buy now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Content tabs ─── */}
        <div className="mt-16 sm:mt-24">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-border-light">
            {[
              { id: "spec", label: "Specifications" },
              { id: "tech", label: "Technology" },
              { id: "warranty", label: "Warranty" },
              { id: "faq", label: "FAQs" },
              { id: "reviews", label: `Reviews (${reviewCount})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`relative -mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                  tab === t.id ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="py-8 sm:py-10">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {tab === "spec" && <SpecTable product={product} />}
                {tab === "tech" && <p className="max-w-3xl text-lg leading-relaxed text-text-secondary">{product.technologyStory}</p>}
                {tab === "warranty" && <p className="max-w-3xl text-lg leading-relaxed text-text-secondary">{product.warranty}</p>}
                {tab === "faq" && <FaqList product={product} />}
                {tab === "reviews" && <ReviewsList product={product} reviews={reviews} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Sticky mobile CTA ─── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-light bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-text-muted">{product.name}</div>
            <div className="text-lg font-bold gradient-text">{isPartPayment ? inr(advanceNow) : inr(lineTotal)}</div>
          </div>
          <button
            onClick={handleAddToCart}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow-primary"
          >
            {justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {justAdded ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-text-secondary">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      {label}
    </div>
  );
}

function SpecTable({ product }: { product: Product }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-light">
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(product.specifications).map(([k, v], i) => (
            <tr key={k} className={i % 2 === 0 ? "bg-surface" : "bg-background"}>
              <th className="w-1/3 px-4 py-3.5 text-left font-medium text-text-secondary sm:px-6">
                {k === "when_it_will_deliver" ? "Delivery Date" : k}
              </th>
              <td className="px-4 py-3.5 text-foreground sm:px-6">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FaqList({ product }: { product: Product }) {
  return (
    <div className="max-w-3xl space-y-2">
      {product.faqs.map((f, i) => (
        <details key={i} className="group rounded-2xl border border-border-light bg-background p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
            {f.question}
            <ChevronDown className="h-4 w-4 shrink-0 text-text-muted transition group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

function ReviewsList({ product, reviews }: { product: Product; reviews: DbReview[] }) {
  const [sort, setSort] = useState<"new" | "helpful">("new");
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Genuine customer reviews only — sourced entirely from the database.
  const sorted = [...reviews].sort((a, b) => {
    if (sort === "helpful") return (b.helpfulVotes + (likedReviews[b.id] ? 1 : 0)) - (a.helpfulVotes + (likedReviews[a.id] ? 1 : 0));
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div>
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-light bg-background p-10 text-center text-sm text-text-muted">
          No reviews yet — be the first to review the {product.name} by placing an order.
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-text-secondary">Sort by:</span>
            <button onClick={() => setSort("new")} className={`rounded-full px-3 py-1 text-xs ${sort === "new" ? "bg-primary text-white" : "border border-border"}`}>Newest</button>
            <button onClick={() => setSort("helpful")} className={`rounded-full px-3 py-1 text-xs ${sort === "helpful" ? "bg-primary text-white" : "border border-border"}`}>Most helpful</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border-light bg-background p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                        {r.userName?.[0]?.toUpperCase() ?? "T"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          {r.userName}
                          {r.verified && <span className="rounded-full bg-surface-green px-2 py-0.5 text-[10px] font-medium text-accent-dark">Verified Purchaser</span>}
                        </div>
                        <div className="text-xs text-text-muted">{shortDate(r.date)}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />)}
                    </div>
                  </div>
                  <p className="mt-3 text-text-secondary">{r.comment}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border-light/40">
                  <button
                    onClick={() => setLikedReviews((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
                    className={`inline-flex items-center gap-1 text-xs transition-colors ${likedReviews[r.id] ? "text-primary font-semibold" : "text-text-muted hover:text-primary"}`}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${likedReviews[r.id] ? "fill-primary text-primary" : ""}`} />
                    Helpful · {r.helpfulVotes + (likedReviews[r.id] ? 1 : 0)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
