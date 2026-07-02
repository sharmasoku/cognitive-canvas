import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Plus, Sparkles, Star } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import type { Product } from "@/data/products";
import { inr } from "@/lib/format";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, toggleWishlist, inWishlist, addToCompare, inCompare } = useShop();
  const wished = inWishlist(product.id);
  const compared = inCompare(product.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border-light bg-background transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-card-hover"
    >
      {/* Floating Action Buttons */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
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
        <button
          onClick={(e) => {
            e.preventDefault();
            addToCompare(product);
          }}
          aria-label="Compare"
          className={`grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition-all duration-200 hover:scale-110 ${
            compared ? "text-primary" : "text-text-secondary hover:text-primary"
          }`}
        >
          <Sparkles className="h-4 w-4" />
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
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {product.technology}
          </div>
        </div>
      </Link>

      {/* Product Information Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-semibold text-text-muted">{product.category}</div>
        <Link to="/products/$slug" params={{ slug: product.slug }}>
          <h3 className="mt-1 text-lg font-bold leading-tight hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-text-secondary leading-relaxed">{product.tagline}</p>
        
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-foreground">{product.rating}</span>
          <span className="text-text-muted">· {product.reviewCount} reviews</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="text-xl font-bold gradient-text">{inr(product.price)}</div>
            {product.originalPrice && <div className="text-xs text-text-muted line-through">{inr(product.originalPrice)}</div>}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            aria-label="Add to cart"
            className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-4 py-2.5 text-xs font-semibold text-white shadow-soft transition-all duration-300 hover:shadow-glow-primary hover:translate-y-[-2px]"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}