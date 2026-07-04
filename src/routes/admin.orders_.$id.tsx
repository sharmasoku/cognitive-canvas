import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MapPin, Package, Printer, StickyNote, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  useOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderTracking,
} from "@/hooks/useOrders";
import { replenishStock } from "@/hooks/useAdminData";
import { AdminStatusBadge } from "./admin.index";
import { inr, shortDate } from "@/lib/format";

export const Route = createFileRoute("/admin/orders_/$id")({
  head: () => ({ meta: [{ title: "Order Detail — TeleARGlass Admin" }] }),
  component: AdminOrderDetail,
});

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const { order, loading, refetch } = useOrder(id);

  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setCarrier(order.carrier ?? "");
      setTrackingNumber(order.tracking_number ?? "");
    }
  }, [order]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center text-sm text-gray-500">
        Order not found.{" "}
        <Link to="/admin/orders" className="text-primary hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const addr = (typeof order.shipping_address === "object" && order.shipping_address) || null;
  const trackingDirty =
    carrier !== (order.carrier ?? "") || trackingNumber !== (order.tracking_number ?? "");

  async function handleOrderStatus(newStatus: string) {
    const prev = order!.status;
    const { ok, error } = await updateOrderStatus(order!.id, newStatus);
    if (!ok) return toast.error(error || "Failed to update status");
    toast.success("Order status updated");

    // Auto-replenish stock when an order is cancelled (mirrors storefront flow).
    if (newStatus === "cancelled" && prev !== "cancelled") {
      let restocked = 0;
      for (const it of order!.items ?? []) {
        if (it.product_id) {
          const r = await replenishStock(it.product_id, it.qty);
          if (r.ok) restocked += 1;
        }
      }
      if (restocked > 0) toast.success(`Stock replenished for ${restocked} item(s)`);
    }
    refetch();
  }

  async function handlePaymentStatus(newStatus: string) {
    const { ok, error } = await updatePaymentStatus(order!.id, newStatus);
    if (ok) { toast.success("Payment status updated"); refetch(); }
    else toast.error(error || "Failed to update payment");
  }

  async function handleSaveTracking() {
    setSaving(true);
    const { ok, error } = await updateOrderTracking(order!.id, carrier, trackingNumber);
    setSaving(false);
    if (ok) { toast.success("Tracking info saved"); refetch(); }
    else toast.error(error || "Failed to save tracking");
  }

  return (
    <>
      {/* ================= Admin view (hidden while printing) ================= */}
      <div className="max-w-5xl print:hidden">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on{" "}
              {new Date(order.created_at).toLocaleString("en-IN", {
                day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
              {order.profile && (
                <>
                  {" · "}
                  <span className="text-gray-700">{order.profile.full_name || order.profile.email}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> Print Invoice
            </button>
            <AdminStatusBadge status={order.status} />
            <AdminStatusBadge status={order.payment_status} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Items */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                <Package className="h-4 w-4" /> Items ({order.items?.length ?? 0})
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 text-center font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Price</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 font-medium text-gray-900">{item.name}</td>
                      <td className="py-2.5 text-center text-gray-600">{item.qty}</td>
                      <td className="py-2.5 text-right text-gray-600">{inr(item.unit_price)}</td>
                      <td className="py-2.5 text-right font-medium text-gray-900">{inr(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-sm">
                <SummaryRow label="Subtotal" value={inr(order.subtotal)} />
                {order.discount > 0 && (
                  <SummaryRow label="Discount" value={`-${inr(order.discount)}`} accent="text-emerald-600" />
                )}
                <SummaryRow label="Shipping" value={order.shipping === 0 ? "Free" : inr(order.shipping)} />
                <SummaryRow label="Tax" value={inr(order.tax)} />
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{inr(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            {addr && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </h2>
                <div className="space-y-0.5 text-sm text-gray-600">
                  <div className="font-medium text-gray-900">
                    {addr.name}{addr.phone ? ` · ${addr.phone}` : ""}
                  </div>
                  <div>
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                  </div>
                  <div>
                    {[addr.city, addr.state].filter(Boolean).join(", ")}
                    {addr.pincode ? ` — ${addr.pincode}` : ""}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-900">
                  <StickyNote className="h-4 w-4" /> Customer Notes
                </h2>
                <p className="whitespace-pre-wrap text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Update Status</h2>

              <label className="mb-3 block">
                <span className="text-sm font-medium text-gray-700">Order Status</span>
                <select
                  value={order.status}
                  onChange={(e) => handleOrderStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Payment Status</span>
                <select
                  value={order.payment_status}
                  onChange={(e) => handlePaymentStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </label>

              {/* Carrier & tracking */}
              <div className="my-4 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Truck className="h-4 w-4" /> Shipment
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500">Courier / Carrier</span>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. Blue Dart"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500">Tracking Number</span>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary"
                  />
                </label>
                {trackingDirty && (
                  <button
                    onClick={handleSaveTracking}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                    Save Tracking Info
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1 rounded-2xl border border-gray-100 bg-white p-5 text-xs text-gray-400 shadow-sm">
              <div>
                <span className="font-medium text-gray-600">Order ID:</span>{" "}
                <span className="font-mono">{order.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Delivery:</span>{" "}
                <span className="capitalize">{order.delivery_speed}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Payment method:</span>{" "}
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Updated:</span>{" "}
                {new Date(order.updated_at).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Printable invoice (visible only while printing) ================= */}
      <div className="mx-auto hidden max-w-4xl bg-white p-8 font-sans text-black print:block">
        <div className="flex items-start justify-between border-b border-gray-300 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">TELEARGLASS PRIVATE LIMITED</h1>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Cognitive interfaces, shipped from Bengaluru, India<br />
              Email: support@teleARglass.com | Phone: +91-80-4000-2020
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold tracking-wide text-gray-800">TAX INVOICE / PACKING SLIP</h2>
            <p className="mt-1 text-xs text-gray-500">
              Order ID: <span className="font-mono uppercase">#{order.id.slice(0, 8).toUpperCase()}</span><br />
              Date: {shortDate(order.created_at)}<br />
              Payment: <span className="capitalize">{order.payment_method}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="mb-2 border-b border-gray-200 pb-1 font-semibold text-gray-700">Ship To:</h3>
            {addr ? (
              <>
                <div className="font-bold">{addr.name}</div>
                {addr.phone && <div>Phone: {addr.phone}</div>}
                <div className="mt-1 leading-relaxed">
                  {addr.line1}{addr.line2 ? <>, {addr.line2}</> : null}<br />
                  {[addr.city, addr.state].filter(Boolean).join(", ")}
                  {addr.pincode ? ` — ${addr.pincode}` : ""}
                </div>
              </>
            ) : (
              <div className="text-gray-500">No address on file.</div>
            )}
            {order.profile && (
              <div className="mt-2 text-xs text-gray-500">
                Account: {order.profile.full_name || order.profile.email}
              </div>
            )}
          </div>
          <div>
            <h3 className="mb-2 border-b border-gray-200 pb-1 font-semibold text-gray-700">Order Summary:</h3>
            <div className="space-y-1">
              <div>Order Status: <span className="font-medium capitalize">{order.status}</span></div>
              <div>Payment Status: <span className="font-medium capitalize">{order.payment_status}</span></div>
              <div>Delivery: <span className="font-medium capitalize">{order.delivery_speed}</span></div>
              {order.carrier && <div>Courier: <span className="font-medium">{order.carrier}</span></div>}
              {order.tracking_number && (
                <div>Tracking ID: <span className="font-medium">{order.tracking_number}</span></div>
              )}
            </div>
          </div>
        </div>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left text-gray-600">
              <th className="py-2">Item Description</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 font-semibold">{item.name}</td>
                <td className="py-3 text-center">{item.qty}</td>
                <td className="py-3 text-right">{inr(item.unit_price)}</td>
                <td className="py-3 text-right font-medium">{inr(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-6 w-64 space-y-1.5 border-t border-gray-300 pt-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span><span>{inr(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Discount</span><span>-{inr(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span><span>{order.shipping === 0 ? "Free" : inr(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span><span>{inr(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-primary">
            <span>Total</span><span>{inr(order.total)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs">
            <strong className="mb-1 block text-gray-700">Customer Delivery Instructions:</strong>
            <p className="leading-relaxed text-gray-600">{order.notes}</p>
          </div>
        )}

        <div className="mt-16 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          Thank you for choosing TeleARGlass — Cognitive AR, engineered in Bengaluru.<br />
          This is a computer-generated invoice and requires no signature.
        </div>
      </div>
    </>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className={`flex justify-between ${accent ?? "text-gray-500"}`}>
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
