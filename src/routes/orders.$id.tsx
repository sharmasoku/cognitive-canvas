import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, MapPin, Package, Truck } from "lucide-react";
import { useShop, type OrderStatus } from "@/context/ShopContext";
import { inr, shortDate } from "@/lib/format";

export const Route = createFileRoute("/orders/$id")({
  head: ({ params }) => ({ meta: [{ title: `Order ${params.id} — TeleARGlass` }] }),
  component: OrderTracking,
});

const STAGES: OrderStatus[] = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

function OrderTracking() {
  const { id } = Route.useParams();
  const { getOrder } = useShop();
  const order = getOrder(id);

  if (!order) {
    return (
      <div className="section-container py-32 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-text-secondary">Order IDs are stored on this device.</p>
        <Link to="/products" className="mt-4 inline-block text-primary">Continue shopping</Link>
      </div>
    );
  }

  // Mock progress: 2 stages completed
  const currentIdx = Math.min(STAGES.indexOf(order.status) + 1, STAGES.length - 1);

  return (
    <div className="section-container py-12">
      <Link to="/products" className="text-sm text-text-secondary hover:text-primary">← Continue shopping</Link>
      <h1 className="mt-2 text-4xl font-bold">Tracking <span className="gradient-text">{order.id}</span></h1>
      <p className="mt-2 text-text-secondary">Placed {shortDate(order.createdAt)}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="relative rounded-3xl border border-border-light bg-background p-8 shadow-card overflow-hidden">
          <div className="relative pl-8">
            {/* Background line track */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
            
            {/* Active filled line track */}
            <div 
              className="absolute left-3 top-2 w-px bg-gradient-to-b from-primary to-accent transition-all duration-1000"
              style={{ height: `${(currentIdx / (STAGES.length - 1)) * 90}%` }}
            />

            {STAGES.map((s, i) => {
              const done = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative pb-8 last:pb-0">
                  <div className={`absolute -left-[22.5px] top-0 grid h-7 w-7 place-items-center rounded-full transition-transform ${
                    done ? "bg-gradient-primary text-white shadow-glow-primary scale-110" : "bg-surface text-text-muted"
                  } ${isCurrent ? "glow-dot" : ""}`}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <div className={`font-semibold ${done ? "text-foreground" : "text-text-muted"} ${isCurrent ? "text-primary" : ""}`}>{s}</div>
                  <div className="text-xs text-text-muted">{done ? (isCurrent ? "Processing" : "Completed") : "Pending"}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border-light bg-background p-6">
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-text-muted"><MapPin className="h-3.5 w-3.5" /> Ship to</div>
            <p className="mt-3 font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-text-secondary">{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
          </div>
          <div className="rounded-3xl border border-border-light bg-background p-6">
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-text-muted"><Truck className="h-3.5 w-3.5" /> Delivery</div>
            <p className="mt-3 font-semibold capitalize">{order.deliverySpeed}</p>
            <p className="text-sm text-text-secondary">{order.deliverySpeed === "priority" ? "24-hour express" : "3–5 business days"}</p>
          </div>
          <div className="rounded-3xl border border-border-light bg-background p-6">
            <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-text-muted"><Package className="h-3.5 w-3.5" /> Items</div>
            <ul className="mt-3 space-y-2 text-sm">
              {order.items.map((c) => <li key={c.product.id} className="flex justify-between"><span>{c.product.name} × {c.quantity}</span><span className="font-medium">{inr(c.product.price * c.quantity)}</span></li>)}
            </ul>
            <div className="mt-3 border-t border-border-light pt-3 flex justify-between font-bold"><span>Total</span><span>{inr(order.total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// silence unused
void notFound;