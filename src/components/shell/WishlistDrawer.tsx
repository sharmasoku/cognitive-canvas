import { AnimatePresence, motion } from "framer-motion";
import { Heart, Plus, Trash2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useShop } from "@/context/ShopContext";
import { inr } from "@/lib/format";

export function WishlistDrawer() {
  const { wishlistOpen, setWishlistOpen, wishlist, toggleWishlist, addToCart } = useShop();
  return (
    <AnimatePresence>
      {wishlistOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setWishlistOpen(false)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-card-hover"
          >
            <header className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <div className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Wishlist</h2></div>
              <button onClick={() => setWishlistOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-violet"><X className="h-5 w-5" /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {wishlist.length === 0 ? (
                <div className="grid h-full place-items-center text-center text-text-secondary text-sm">No saved products yet.</div>
              ) : (
                <ul className="space-y-4">
                  {wishlist.map((w) => (
                    <li key={w.product.id} className="flex gap-3 rounded-xl border border-border-light p-3">
                      <Link to="/products/$slug" params={{ slug: w.product.slug }} onClick={() => setWishlistOpen(false)} className="contents">
                        <img src={w.product.image} alt={w.product.name} width={64} height={64} loading="lazy" className="h-16 w-16 rounded-lg object-cover" />
                      </Link>
                      <div className="flex-1">
                        <div className="font-medium">{w.product.name}</div>
                        <div className="text-sm text-text-secondary">{inr(w.product.price)}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => { addToCart(w.product); }} aria-label="Add to cart" className="grid h-8 w-8 place-items-center rounded-md bg-primary text-white"><Plus className="h-4 w-4" /></button>
                        <button onClick={() => toggleWishlist(w.product)} aria-label="Remove" className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}