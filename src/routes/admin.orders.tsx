import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, MapPin, Loader2, RefreshCw } from "lucide-react";
import { useAllOrders, updateOrderStatus, updatePaymentStatus } from "@/hooks/useOrders";
import { AdminStatusBadge } from "./admin.index";
import { AdminHeading } from "@/components/admin/AdminHeading";
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
        <AdminHeading word="Orders" sub={`${orders.length} total orders`} />
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary transition shadow-sm"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button onClick={refetch} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-gray-900 transition shadow-sm">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
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
                className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm"
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50/60 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div>
                      <div className="font-mono text-xs text-gray-700">{order.id.slice(0, 8)}…</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {order.profile?.full_name || order.profile?.email || "Unknown User"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-xs text-gray-400 hidden sm:block">{shortDate(order.created_at)}</div>
                    <AdminStatusBadge status={order.status} />
                    <AdminStatusBadge status={order.payment_status} />
                    <div className="font-semibold text-gray-900 text-sm">{inr(order.total)}</div>
                    {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-gray-100 px-6 py-5 space-y-5"
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
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary transition"
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
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary transition"
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Delivery</label>
                        <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 capitalize">
                          {order.delivery_speed}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Items ({order.items?.length ?? 0})</div>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-800">{item.name}</div>
                              <div className="text-xs text-gray-500">Qty: {item.qty} × {inr(item.unit_price)}</div>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">{inr(item.line_total)}</div>
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
                        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                          {typeof order.shipping_address === "object" ? (
                            <>
                              <div className="font-medium text-gray-800">{(order.shipping_address as any).name}</div>
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
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm space-y-1">
                      <Row label="Subtotal" value={inr(order.subtotal)} />
                      {order.discount > 0 && <Row label="Discount" value={`-${inr(order.discount)}`} className="text-emerald-600" />}
                      <Row label="Shipping" value={inr(order.shipping)} />
                      <Row label="Tax" value={inr(order.tax)} />
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <Row label="Total" value={inr(order.total)} className="text-gray-900 font-bold" />
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
    <div className={`flex justify-between ${className || "text-gray-500"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
