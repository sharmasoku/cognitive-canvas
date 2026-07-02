import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Loader2, RefreshCw, Search, ToggleLeft, ToggleRight, Plus, Minus } from "lucide-react";
import { useAllProducts, toggleProductActive, replenishStock } from "@/hooks/useAdminData";
import { inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const { products, loading, refetch } = useAllProducts();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockInput, setStockInput] = useState<Record<string, string>>({});

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" /> Products
          </h1>
          <p className="mt-1 text-sm text-gray-500">{products.length} total products</p>
        </div>
        <button onClick={refetch} className="rounded-xl border border-white/10 bg-[#111420] p-2.5 text-gray-400 hover:text-white transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-white/10 bg-[#111420] pl-10 pr-4 py-2.5 text-sm text-gray-300 outline-none focus:border-primary transition placeholder:text-gray-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#111420] px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-primary transition"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111420] py-16 text-center text-sm text-gray-500">
          No products found
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#111420] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Replenish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover bg-white/5" />
                        )}
                        <div>
                          <div className="font-medium text-gray-200">{product.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-400">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{inr(product.price_inr)}</div>
                      {product.original_price_inr && (
                        <div className="text-xs text-gray-500 line-through">{inr(product.original_price_inr)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.stock <= 5 ? "text-red-400" : product.stock <= 20 ? "text-amber-400" : "text-emerald-400"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={async () => {
                          const { ok, error } = await toggleProductActive(product.id, !product.is_active);
                          if (ok) { toast.success(`Product ${!product.is_active ? "activated" : "deactivated"}`); refetch(); }
                          else toast.error(error || "Failed");
                        }}
                        className="transition hover:opacity-80"
                      >
                        {product.is_active ? (
                          <ToggleRight className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="qty"
                          value={stockInput[product.id] ?? ""}
                          onChange={(e) => setStockInput((prev) => ({ ...prev, [product.id]: e.target.value }))}
                          className="w-16 rounded-lg border border-white/10 bg-[#0a0d14] px-2 py-1.5 text-xs text-gray-300 outline-none focus:border-primary text-center"
                        />
                        <button
                          onClick={async () => {
                            const qty = parseInt(stockInput[product.id] ?? "0", 10);
                            if (!qty || qty <= 0) { toast.error("Enter a valid quantity"); return; }
                            const { ok, error } = await replenishStock(product.id, qty);
                            if (ok) {
                              toast.success(`Added ${qty} units`);
                              setStockInput((prev) => ({ ...prev, [product.id]: "" }));
                              refetch();
                            } else toast.error(error || "Failed");
                          }}
                          className="rounded-lg bg-emerald-600/20 p-1.5 text-emerald-400 hover:bg-emerald-600/30 transition"
                          title="Add stock"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
