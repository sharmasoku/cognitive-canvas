import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Search, Star, ToggleLeft, ToggleRight, Plus, Pencil, Trash2 } from "lucide-react";
import {
  useAllProducts, toggleProductActive, toggleProductFeatured, replenishStock, deleteProduct, type AdminProduct,
} from "@/hooks/useAdminData";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { ProductForm } from "@/components/admin/ProductForm";
import { resolveProductImage, PLACEHOLDER_IMAGE } from "@/data/products";
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
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ product: AdminProduct; type: "active" | "featured" } | null>(null);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: AdminProduct) => { setEditing(p); setFormOpen(true); };

  const handleDelete = async (p: AdminProduct) => {
    const { ok, error } = await deleteProduct(p.id);
    if (ok) { toast.success("Product deleted"); setConfirmDelete(null); refetch(); }
    else toast.error(error || "Failed to delete");
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle) return;
    const { product, type } = confirmToggle;
    setConfirmToggle(null);
    if (type === "active") {
      const { ok, error } = await toggleProductActive(product.id, !product.is_active);
      if (ok) { toast.success(`Product ${!product.is_active ? "activated" : "deactivated"}`); refetch(); }
      else toast.error(error || "Failed");
    } else {
      const { ok, error } = await toggleProductFeatured(product.id, !product.is_featured);
      if (ok) { toast.success(product.is_featured ? "Removed from homepage" : "Now showing on homepage"); refetch(); }
      else toast.error(error || "Failed");
    }
  };

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
        <AdminHeading word="Products" sub={`${products.length} total products`} />
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-gray-900 transition shadow-sm">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary transition placeholder:text-gray-400 shadow-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary transition shadow-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Products Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
          No products found
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Homepage</th>
                  <th className="px-6 py-3">Replenish</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/60 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveProductImage(product.image_url)}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{inr(product.price_inr)}</div>
                      {product.original_price_inr && (
                        <div className="text-xs text-gray-400 line-through">{inr(product.original_price_inr)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.stock <= 5 ? "text-red-500" : product.stock <= 20 ? "text-amber-500" : "text-emerald-600"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmToggle({ product, type: "active" })}
                        className="transition hover:opacity-80"
                      >
                        {product.is_active
                          ? <ToggleRight className="h-6 w-6 text-emerald-500" />
                          : <ToggleLeft className="h-6 w-6 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmToggle({ product, type: "featured" })}
                        title="Show on homepage"
                        className="transition hover:opacity-80"
                      >
                        <Star className={`h-5 w-5 ${product.is_featured ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
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
                          className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 outline-none focus:border-primary text-center"
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
                          className="rounded-lg bg-emerald-100 p-1.5 text-emerald-600 hover:bg-emerald-200 transition"
                          title="Add stock"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(product)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-primary hover:text-primary transition" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(product)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-red-300 hover:text-red-500 transition" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
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

      {formOpen && (
        <ProductForm
          product={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); refetch(); }}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary">Delete product?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Delete <span className="font-semibold text-gray-700">{confirmDelete.name}</span>? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Active / Homepage toggle confirmation */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setConfirmToggle(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary">
              {confirmToggle.type === "active"
                ? confirmToggle.product.is_active ? "Deactivate product?" : "Activate product?"
                : confirmToggle.product.is_featured ? "Remove from homepage?" : "Show on homepage?"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {confirmToggle.type === "active" ? (
                <>
                  Are you sure you want to {confirmToggle.product.is_active ? "deactivate" : "activate"}{" "}
                  <span className="font-semibold text-gray-700">{confirmToggle.product.name}</span>?
                  {confirmToggle.product.is_active && " It will no longer be visible to customers."}
                </>
              ) : (
                <>
                  Are you sure you want to {confirmToggle.product.is_featured ? "remove" : "add"}{" "}
                  <span className="font-semibold text-gray-700">{confirmToggle.product.name}</span>{" "}
                  {confirmToggle.product.is_featured ? "from" : "to"} the homepage?
                </>
              )}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmToggle(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleConfirmToggle} className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
