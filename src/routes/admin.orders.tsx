import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, RefreshCw } from "lucide-react";
import { useAllOrders } from "@/hooks/useOrders";
import { AdminStatusBadge } from "./admin.index";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { inr, shortDate } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

type OrderStatus = "all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const TABS: { key: OrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function AdminOrdersPage() {
  const { orders, loading, refetch } = useAllOrders();
  const [filter, setFilter] = useState<OrderStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const addr = (typeof o.shipping_address === "object" && o.shipping_address) || {};
    return (
      o.id.toLowerCase().includes(term) ||
      (o.profile?.full_name?.toLowerCase().includes(term) ?? false) ||
      (o.profile?.email?.toLowerCase().includes(term) ?? false) ||
      (addr.name && String(addr.name).toLowerCase().includes(term)) ||
      (addr.phone && String(addr.phone).toLowerCase().includes(term)) ||
      (addr.city && String(addr.city).toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AdminHeading word="Orders" sub={`${orders.length} total order(s)`} />

      {/* Filters + search */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => {
            const count = t.key === "all" ? orders.length : orders.filter((o) => o.status === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  filter === t.key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by ID, name, phone, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 shadow-sm outline-none transition focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={refetch}
            className="shrink-0 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 shadow-sm transition hover:text-gray-900"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Payment</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-4 py-3">
                  <Link
                    to="/admin/orders/$id"
                    params={{ id: o.id }}
                    className="font-mono font-medium text-gray-900 transition hover:text-primary"
                  >
                    #{o.id.slice(0, 8).toUpperCase()}
                  </Link>
                  {(o.profile?.full_name || o.profile?.email) && (
                    <div className="mt-0.5 text-xs text-gray-400">
                      {o.profile?.full_name || o.profile?.email}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{shortDate(o.created_at)}</td>
                <td className="px-4 py-3">
                  <AdminStatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <AdminStatusBadge status={o.payment_status} />
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{inr(o.total)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/admin/orders/$id"
                    params={{ id: o.id }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-400">No orders matching this filter.</div>
        )}
      </div>
    </motion.div>
  );
}
