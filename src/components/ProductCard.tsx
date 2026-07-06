import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { computeAdvanceAmount, type Product } from "@/data/products";
import { inr } from "@/lib/format";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, setCartOpen, toggleWishlist, inWishlist } = useShop();
  const [justAdded, setJustAdded] = useState(false);
  const wished = inWishlist(product.id);
  const advanceNow = computeAdvanceAmount(product, 1);
  const isPartPayment = product.advanceType != null && advanceNow < product.price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border-light bg-background transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-card-hover"
    >
      {/* Floating Action Button */}
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label="Wishlist"
          className={`grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition-all duration-200 hover:scale-110 ${
            wished ? "text-destructive" : "text-text-secondary hover:text-primary"
          }`}
        >
          <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Visual Header */}
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gradient-dark">
          <img
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>
      </Link>

      {/* Product Information Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-semibold text-text-muted">{product.category}</div>
        <Link to="/products/$slug" params={{ slug: product.slug }}>
          <h3 className="mt-1 text-lg font-bold leading-tight text-primary hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-text-secondary leading-relaxed">{product.tagline}</p>
        
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-foreground">{product.rating}</span>
          <span className="text-text-muted">· {product.reviewCount} reviews</span>
        </div>

        {isPartPayment && (
          <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-surface-green px-2.5 py-1 text-[11px] font-medium text-accent-dark">
            Pay {inr(advanceNow)} now, rest on delivery
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="text-xl font-bold gradient-text">{inr(product.price)}</div>
            {product.originalPrice && <div className="text-xs text-text-muted line-through">{inr(product.originalPrice)}</div>}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
              setJustAdded(true);
              setCartOpen(true);
              setTimeout(() => setJustAdded(false), 900);
            }}
            aria-label="Add to cart"
            className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-4 py-2.5 text-xs font-semibold text-white shadow-soft transition-all duration-300 hover:shadow-glow-primary hover:translate-y-[-2px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span key="added" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Added
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="inline-flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.article>
  );
}