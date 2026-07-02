import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, ChevronDown, ChevronUp, MapPin, Loader2, RefreshCw } from "lucide-react";
import { useAllOrders, updateOrderStatus, updatePaymentStatus } from "@/hooks/useOrders";
import { AdminStatusBadge } from "./admin.index";
import { inr, shortDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

function AdminOrdersPage() {
  const { orders, loading, refetch } = useAllOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

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
            <ShoppingCart className="h-6 w-6 text-primary" /> Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#111420] px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-primary transition"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button onClick={refetch} className="rounded-xl border border-white/10 bg-[#111420] p-2.5 text-gray-400 hover:text-white transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111420] py-16 text-center text-sm text-gray-500">
          No orders found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const expanded = expandedId === order.id;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-white/10 bg-[#111420] overflow-hidden"
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div>
                      <div className="font-mono text-xs text-gray-300">{order.id.slice(0, 8)}…</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {order.profile?.full_name || order.profile?.email || "Unknown User"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-xs text-gray-500 hidden sm:block">{shortDate(order.created_at)}</div>
                    <AdminStatusBadge status={order.status} />
                    <AdminStatusBadge status={order.payment_status} />
                    <div className="font-semibold text-white text-sm">{inr(order.total)}</div>
                    {expanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-white/5 px-6 py-5 space-y-5"
                  >
                    {/* Controls */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Order Status</label>
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            const { ok, error } = await updateOrderStatus(order.id, e.target.value);
                            if (ok) { toast.success("Status updated"); refetch(); }
                            else toast.error(error || "Failed");
                          }}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-primary transition"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Payment Status</label>
                        <select
                          value={order.payment_status}
                          onChange={async (e) => {
                            const { ok, error } = await updatePaymentStatus(order.id, e.target.value);
                            if (ok) { toast.success("Payment status updated"); refetch(); }
                            else toast.error(error || "Failed");
                          }}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-primary transition"
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Delivery</label>
                        <div className="mt-1 rounded-xl border border-white/10 bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-400 capitalize">
                          {order.delivery_speed}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Items ({order.items?.length ?? 0})</div>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#0a0d14] px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-300">{item.name}</div>
                              <div className="text-xs text-gray-500">Qty: {item.qty} × {inr(item.unit_price)}</div>
                            </div>
                            <div className="font-semibold text-white text-sm">{inr(item.line_total)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                          <MapPin className="h-3 w-3" /> Shipping Address
                        </div>
                        <div className="rounded-xl bg-[#0a0d14] px-4 py-3 text-sm text-gray-400">
                          {typeof order.shipping_address === "object" ? (
                            <>
                              <div className="font-medium text-gray-300">{(order.shipping_address as any).name}</div>
                              <div>{(order.shipping_address as any).line1}, {(order.shipping_address as any).city} — {(order.shipping_address as any).pincode}</div>
                              {(order.shipping_address as any).phone && <div>📞 {(order.shipping_address as any).phone}</div>}
                            </>
                          ) : (
                            <span>{String(order.shipping_address)}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="rounded-xl bg-[#0a0d14] px-4 py-3 text-sm space-y-1">
                      <Row label="Subtotal" value={inr(order.subtotal)} />
                      {order.discount > 0 && <Row label="Discount" value={`-${inr(order.discount)}`} className="text-emerald-400" />}
                      <Row label="Shipping" value={inr(order.shipping)} />
                      <Row label="Tax" value={inr(order.tax)} />
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <Row label="Total" value={inr(order.total)} className="text-white font-bold" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex justify-between ${className || "text-gray-400"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
