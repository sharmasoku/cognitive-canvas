import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare — TeleARGlass" }, { name: "description", content: "Side-by-side specs comparison." }] }),
  component: Compare,
});

const ROWS = ["Display", "Resolution", "BCI Channels", "Processor", "Battery Life", "Connectivity", "Weight"] as const;

function Compare() {
  const { compare, removeFromCompare, addToCart } = useShop();
  return (
    <div className="section-container py-12">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Com<span className="gradient-text">pare</span></h1>
      <p className="mt-3 text-text-secondary">Up to three TeleProducts side by side.</p>

      <div className="mt-10 overflow-x-auto rounded-3xl border border-border-light bg-background shadow-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border-light bg-surface">
              <th className="w-40 p-4 text-left text-xs font-mono uppercase tracking-widest text-text-muted">Specification</th>
              {compare.map((p) => (
                <th key={p.id} className="relative min-w-[220px] p-4 text-left align-top">
                  <button onClick={() => removeFromCompare(p.id)} aria-label="Remove" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-text-muted hover:bg-surface-violet"><X className="h-3.5 w-3.5" /></button>
                  <Link to="/products/$slug" params={{ slug: p.slug }} className="block">
                    <img src={p.image} alt={p.name} width={100} height={100} loading="lazy" className="h-24 w-24 rounded-xl object-cover" />
                    <div className="mt-2 font-semibold">{p.name}</div>
                    <div className="text-xs text-text-muted">{p.technology}</div>
                    <div className="mt-1 text-base font-bold">{inr(p.price)}</div>
                  </Link>
                </th>
              ))}
              {Array.from({ length: 3 - compare.length }).map((_, i) => (
                <th key={i} className="min-w-[220px] p-4 align-top">
                  <Link to="/products" className="grid h-32 w-full place-items-center rounded-xl border border-dashed border-border text-text-muted hover:border-primary hover:text-primary">
                    <Plus className="h-5 w-5" /><span className="mt-1 text-xs">Add a product</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row} className={i % 2 === 0 ? "bg-background" : "bg-surface"}>
                <td className="p-4 font-medium text-text-secondary">{row}</td>
                {compare.map((p) => <td key={p.id} className="p-4">{p.specifications[row] ?? "—"}</td>)}
                {Array.from({ length: 3 - compare.length }).map((_, k) => <td key={k} className="p-4 text-text-muted">—</td>)}
              </tr>
            ))}
            <tr>
              <td className="p-4 font-medium text-text-secondary">Action</td>
              {compare.map((p) => (
                <td key={p.id} className="p-4"><button onClick={() => addToCart(p)} className="rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-white magnetic">Add to cart</button></td>
              ))}
              {Array.from({ length: 3 - compare.length }).map((_, k) => <td key={k} className="p-4 text-text-muted">—</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}