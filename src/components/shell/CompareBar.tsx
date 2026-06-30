import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export function CompareBar() {
  const { compare, removeFromCompare, clearCompare } = useShop();
  return (
    <AnimatePresence>
      {compare.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="fixed bottom-4 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-background/90 p-3 shadow-card-hover backdrop-blur-xl">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <div className="hidden text-sm font-medium sm:block">Compare</div>
            <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide">
              {compare.map((p) => (
                <div key={p.id} className="group relative flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                  <img src={p.image} alt={p.name} width={32} height={32} loading="lazy" className="h-8 w-8 rounded object-cover" />
                  <span className="text-xs font-medium">{p.name}</span>
                  <button onClick={() => removeFromCompare(p.id)} aria-label="Remove" className="text-text-muted hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {Array.from({ length: 3 - compare.length }).map((_, i) => (
                <div key={i} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-dashed border-border text-text-muted text-xs">+</div>
              ))}
            </div>
            <button onClick={clearCompare} className="hidden text-xs text-text-muted hover:text-foreground sm:block">Clear</button>
            <Link to="/compare" className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white">Compare</Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}