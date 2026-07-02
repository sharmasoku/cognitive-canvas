import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { products, type Category, type Technology } from "@/data/products";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "TeleProducts — Catalogue" },
      { name: "description", content: "Smart glasses, BCI bands, developer kits and accessories from TeleARGlass." },
      { property: "og:title", content: "TeleProducts Catalogue" },
      { property: "og:description", content: "Browse Vision Pro, Lite, Neural Band X, dev kits and more." },
    ],
  }),
  component: ProductList,
});

const CATEGORIES: ("All" | Category)[] = ["All", "Smart Glasses", "BCI Devices", "Developer Tools", "Accessories"];
const TECHS: ("All" | Technology)[] = ["All", "BCI + AR", "AR", "BCI", "Standard"];
const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price · Low to High" },
  { id: "price-desc", label: "Price · High to Low" },
  { id: "rated", label: "Top rated" },
] as const;

function ProductList() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [tech, setTech] = useState<(typeof TECHS)[number]>("All");
  const [maxPrice, setMaxPrice] = useState(60000);
  const [minRating, setMinRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("featured");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let arr = products.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (tech !== "All" && p.technology !== tech) return false;
      if (p.price > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (inStock && !p.inStock) return false;
      if (q.trim() && !`${p.name} ${p.tagline}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    if (sort === "price-asc") arr = [...arr].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") arr = [...arr].sort((a, b) => b.price - a.price);
    else if (sort === "rated") arr = [...arr].sort((a, b) => b.rating - a.rating);
    return arr;
  }, [cat, tech, maxPrice, minRating, inStock, q, sort]);

  const Sidebar = (
    <aside className="space-y-6 rounded-3xl border border-border-light bg-background p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Filter className="h-4 w-4 text-primary" /> Filters</h2>
        <button onClick={() => { setCat("All"); setTech("All"); setMaxPrice(60000); setMinRating(0); setInStock(false); setQ(""); }} className="text-xs text-text-muted hover:text-primary">Clear all</button>
      </div>
      <FilterGroup label="Category">
        <div className="space-y-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${cat === c ? "bg-surface-violet text-primary font-semibold" : "text-text-secondary hover:bg-surface"}`}>{c}</button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label="Technology">
        <div className="flex flex-wrap gap-2">
          {TECHS.map((t) => (
            <button key={t} onClick={() => setTech(t)} className={`rounded-full border px-3 py-1 text-xs ${tech === t ? "border-primary bg-primary text-white" : "border-border text-text-secondary"}`}>{t}</button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup label={`Max price · ${inr(maxPrice)}`}>
        <input type="range" min={1999} max={60000} step={1000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[--color-primary]" />
        <div className="mt-1 flex justify-between text-[10px] text-text-muted"><span>{inr(1999)}</span><span>{inr(60000)}</span></div>
      </FilterGroup>
      <FilterGroup label="Rating">
        <div className="flex flex-wrap gap-2">
          {[0, 3, 4, 5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${minRating === r ? "border-primary bg-primary text-white" : "border-border text-text-secondary"}`}>
              {r === 0 ? "All" : <>{r}<Star className="h-3 w-3 fill-current" />+</>}
            </button>
          ))}
        </div>
      </FilterGroup>
      <label className="flex items-center justify-between text-sm">
        <span>Only in stock</span>
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 accent-[--color-primary]" />
      </label>
    </aside>
  );

  return (
    <div className="relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: "#7c3aed", top: -200, right: -150, opacity: 0.12 }} />
      <div className="orb" style={{ width: 500, height: 500, background: "#2563eb", bottom: -200, left: -150, opacity: 0.08 }} />

      <div className="section-container relative">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Tele<span className="gradient-text">Products</span></h1>
          <p className="mt-3 max-w-xl text-text-secondary">The full TeleAR catalogue — engineered, calibrated, and shipped from our Bengaluru atelier.</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">{Sidebar}</div>

          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <button onClick={() => setFilterOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-full border border-border bg-background py-2.5 px-4 text-sm">
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div className="mb-4 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-text-muted">
              <span>Results count</span>
              <span>Showing {filtered.length} {filtered.length === 1 ? "product" : "products"}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-surface p-16 text-center text-text-secondary">No products match those filters.</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setFilterOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><span className="font-semibold">Filters</span><button onClick={() => setFilterOpen(false)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-surface"><X className="h-4 w-4" /></button></div>
            {Sidebar}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-mono uppercase tracking-widest text-text-muted">{label}</div>
      {children}
    </div>
  );
}