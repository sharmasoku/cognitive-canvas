import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Heart, Minus, Plus, RotateCw, ShieldCheck, Sparkles, Star, ThumbsUp } from "lucide-react";
import { getProductBySlug, type Product } from "@/data/products";
import { useShop } from "@/context/ShopContext";
import { inr, shortDate } from "@/lib/format";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
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
  const { addToCart, toggleWishlist, inWishlist, addToCompare, inCompare, setCartOpen } = useShop();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"spec" | "tech" | "warranty" | "faq" | "reviews">("spec");
  const [mode, setMode] = useState<"gallery" | "360">("gallery");
  const [imgIdx, setImgIdx] = useState(0);
  const [rotation, setRotation] = useState(0);
  const wished = inWishlist(product.id);
  const compared = inCompare(product.id);

  return (
    <div className="section-container py-10">
      <Link to="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"><ArrowLeft className="h-4 w-4" />Catalogue</Link>
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex rounded-full border border-border bg-background p-1 text-xs">
              <button onClick={() => setMode("gallery")} className={`rounded-full px-3 py-1 ${mode === "gallery" ? "bg-primary text-white" : ""}`}>Gallery</button>
              <button onClick={() => setMode("360")} className={`rounded-full px-3 py-1 ${mode === "360" ? "bg-primary text-white" : ""}`}>360°</button>
            </div>
            {mode === "360" && (
              <div className="inline-flex items-center gap-2 text-xs text-text-muted">
                <RotateCw className="h-3.5 w-3.5" /> Drag or use buttons
              </div>
            )}
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-border-light bg-gradient-dark aspect-square">
            {mode === "gallery" ? (
              <motion.img key={imgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={product.gallery[imgIdx]} alt={product.name} width={800} height={800} className="h-full w-full object-cover" />
            ) : (
              <motion.img
                src={product.image}
                alt={`${product.name} 360°`}
                width={800} height={800}
                style={{ rotate: rotation }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDrag={(_, info) => setRotation((r) => r + info.delta.x * 0.5)}
                className="h-full w-full object-cover cursor-grab active:cursor-grabbing"
              />
            )}
          </div>
          {mode === "gallery" ? (
            <div className="mt-3 flex gap-2">
              {product.gallery.map((g: string, i: number) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`h-16 w-16 overflow-hidden rounded-xl border ${i === imgIdx ? "border-primary" : "border-border"}`}>
                  <img src={g} alt="" width={64} height={64} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex justify-center gap-2">
              <button onClick={() => setRotation((r) => r - 30)} className="rounded-full border border-border bg-background px-4 py-2 text-sm">⟲ Left</button>
              <button onClick={() => setRotation(0)} className="rounded-full border border-border bg-background px-4 py-2 text-sm">Reset</button>
              <button onClick={() => setRotation((r) => r + 30)} className="rounded-full border border-border bg-background px-4 py-2 text-sm">Right ⟳</button>
            </div>
          )}
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-violet px-3 py-1 text-xs font-mono uppercase tracking-widest text-primary">
            {product.technology}
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">{product.name}</h1>
          <p className="mt-2 italic text-text-secondary">{product.tagline}</p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />)}
            </div>
            <span className="font-semibold">{product.rating}</span>
            <span className="text-text-muted">· {product.reviewCount} reviews</span>
            <span className="inline-flex items-center gap-1 text-accent"><ShieldCheck className="h-3.5 w-3.5" />In stock</span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <div className="text-4xl font-bold gradient-text">{inr(product.price)}</div>
            {product.originalPrice && <div className="text-text-muted line-through">{inr(product.originalPrice)}</div>}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2"><Minus className="h-4 w-4" /></button>
              <span className="min-w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={() => { addToCart(product, qty); setCartOpen(true); }} className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">Add to cart</button>
            <Link to="/checkout" onClick={() => addToCart(product, qty)} className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:border-primary">Buy now</Link>
            <button onClick={() => toggleWishlist(product)} aria-label="Wishlist" className={`grid h-11 w-11 place-items-center rounded-full border border-border ${wished ? "text-destructive" : "text-text-secondary"}`}>
              <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
            </button>
            <button onClick={() => addToCompare(product)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium ${compared ? "border-primary text-primary" : "border-border text-text-secondary hover:border-primary/40"}`}>
              <Sparkles className="h-4 w-4" /> {compared ? "In comparison" : "Compare"}
            </button>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-border-light bg-surface p-4 text-sm text-text-secondary sm:grid-cols-2">
            <Feature label="Free shipping across India" />
            <Feature label="2-year limited warranty" />
            <Feature label="14-day calibration window" />
            <Feature label="Lifetime TeleOS updates" />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex flex-wrap gap-2 border-b border-border-light">
          {[
            { id: "spec", label: "Specifications" },
            { id: "tech", label: "Technology" },
            { id: "warranty", label: "Warranty" },
            { id: "faq", label: "FAQs" },
            { id: "reviews", label: `Reviews (${product.reviewsList.length})` },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className={`relative -mb-px border-b-2 px-4 py-3 text-sm font-medium ${tab === t.id ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-foreground"}`}>{t.label}</button>
          ))}
        </div>
        <div className="py-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {tab === "spec" && <SpecTable product={product} />}
              {tab === "tech" && <p className="max-w-3xl text-lg leading-relaxed text-text-secondary">{product.technologyStory}</p>}
              {tab === "warranty" && <p className="max-w-3xl text-lg leading-relaxed text-text-secondary">{product.warranty}</p>}
              {tab === "faq" && <FaqList product={product} />}
              {tab === "reviews" && <ReviewsList product={product} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Feature({ label }: { label: string }) {
  return <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{label}</div>;
}
function SpecTable({ product }: { product: Product }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-light">
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(product.specifications).map(([k, v], i) => (
            <tr key={k} className={i % 2 === 0 ? "bg-surface" : "bg-background"}>
              <th className="w-1/3 px-4 py-3 text-left font-medium text-text-secondary">{k}</th>
              <td className="px-4 py-3 text-foreground">{v}</td>
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
        <details key={i} className="group rounded-2xl border border-border-light bg-background p-4">
          <summary className="flex cursor-pointer items-center justify-between font-medium">{f.question}<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary>
          <p className="mt-3 text-sm text-text-secondary">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
function ReviewsList({ product }: { product: Product }) {
  const [sort, setSort] = useState<"new" | "helpful">("new");
  const [votes, setVotes] = useState<Record<string, number>>({});
  const sorted = [...product.reviewsList].sort((a, b) => {
    if (sort === "helpful") return (b.helpfulVotes + (votes[b.id] ?? 0)) - (a.helpfulVotes + (votes[a.id] ?? 0));
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-text-secondary">Sort by:</span>
        <button onClick={() => setSort("new")} className={`rounded-full px-3 py-1 text-xs ${sort === "new" ? "bg-primary text-white" : "border border-border"}`}>Newest</button>
        <button onClick={() => setSort("helpful")} className={`rounded-full px-3 py-1 text-xs ${sort === "helpful" ? "bg-primary text-white" : "border border-border"}`}>Most helpful</button>
      </div>
      <div className="space-y-3">
        {sorted.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border-light bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold">{r.userName}{r.verified && <span className="rounded-full bg-surface-green px-2 py-0.5 text-[10px] font-medium text-accent-dark">Verified</span>}</div>
                <div className="text-xs text-text-muted">{shortDate(r.date)}</div>
              </div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />)}
              </div>
            </div>
            <p className="mt-3 text-text-secondary">{r.comment}</p>
            <button onClick={() => setVotes((v) => ({ ...v, [r.id]: (v[r.id] ?? 0) + 1 }))} className="mt-3 inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary">
              <ThumbsUp className="h-3.5 w-3.5" /> Helpful · {r.helpfulVotes + (votes[r.id] ?? 0)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}