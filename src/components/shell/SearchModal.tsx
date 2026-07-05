import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useShop } from "@/context/ShopContext";
import { useProducts } from "@/hooks/useProducts";
import { inr } from "@/lib/format";

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useShop();
  const { products } = useProducts();
  const [q, setQ] = useState("");
  useEffect(() => { if (!searchOpen) setQ(""); }, [searchOpen]);

  const hits = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return products.slice(0, 5);
    return products.filter((p) =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.technology.toLowerCase().includes(s) ||
      p.tagline.toLowerCase().includes(s)
    );
  }, [products, q]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24 backdrop-blur-md">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-xl overflow-hidden rounded-2xl border border-border-light bg-background shadow-card-hover">
            <div className="flex items-center gap-3 border-b border-border-light px-4 py-3">
              <Search className="h-5 w-5 text-text-muted" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, technology, category…" className="flex-1 bg-transparent text-sm outline-none" />
              <button onClick={() => setSearchOpen(false)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-surface-violet"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {hits.length === 0 ? (
                <div className="p-8 text-center text-sm text-text-muted">No matches.</div>
              ) : (
                hits.map((p) => (
                  <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-lg p-3 hover:bg-surface-violet">
                    <img src={p.image} alt={p.name} width={48} height={48} loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-text-muted">{p.technology} · {p.category}</div>
                    </div>
                    <div className="text-sm font-semibold">{inr(p.price)}</div>
                  </Link>
                ))
              )}
            </div>
            <div className="border-t border-border-light bg-surface px-4 py-2 text-xs text-text-muted">
              Tip: press <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> anytime.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}