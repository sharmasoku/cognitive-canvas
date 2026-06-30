import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { inr } from "@/lib/format";

export function CartDrawer() {
  const { cartOpen, setCartOpen, cart, removeFromCart, updateCartQty, cartSubtotal, discountPct, applyCoupon, coupon } = useShop();
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function submitCoupon() {
    const ok = applyCoupon(code);
    setFeedback(ok ? "Coupon applied — 10% off." : "Invalid code. Try FUTURE10.");
  }

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-card-hover"
          >
            <header className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Your cart</h2>
              </div>
              <button onClick={() => setCartOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-violet">
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-surface-violet text-primary"><ShoppingBag className="h-7 w-7" /></div>
                    <p className="mt-4 text-sm text-text-secondary">Your cart is empty.</p>
                    <Link to="/products" onClick={() => setCartOpen(false)} className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">Browse products</Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((c) => (
                    <li key={c.product.id} className="flex gap-4 rounded-xl border border-border-light p-3">
                      <img src={c.product.image} alt={c.product.name} width={80} height={80} loading="lazy" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between gap-2">
                          <div>
                            <div className="font-medium leading-tight">{c.product.name}</div>
                            <div className="text-xs text-text-muted">{c.product.technology}</div>
                          </div>
                          <button onClick={() => removeFromCart(c.product.id)} aria-label="Remove" className="text-text-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-border">
                            <button onClick={() => updateCartQty(c.product.id, c.quantity - 1)} className="px-2 py-1"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="min-w-6 text-center text-sm">{c.quantity}</span>
                            <button onClick={() => updateCartQty(c.product.id, c.quantity + 1)} className="px-2 py-1"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <div className="font-semibold">{inr(c.product.price * c.quantity)}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {cart.length > 0 && (
              <footer className="space-y-4 border-t border-border-light px-6 py-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <button onClick={submitCoupon} className="rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:border-primary hover:text-primary">Apply</button>
                </div>
                {feedback && <p className="text-xs text-text-secondary">{feedback}</p>}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>{inr(cartSubtotal)}</span></div>
                  {discountPct > 0 && <div className="flex justify-between text-accent"><span>Discount ({coupon})</span><span>− {inr(Math.round(cartSubtotal * discountPct))}</span></div>}
                  <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>Calculated at checkout</span></div>
                </div>
                <Link to="/checkout" onClick={() => setCartOpen(false)} className="block w-full rounded-xl bg-gradient-primary py-3 text-center font-semibold text-white magnetic">Checkout · {inr(cartSubtotal - Math.round(cartSubtotal * discountPct))}</Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}