import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Loader2, Truck, Zap } from "lucide-react";
import { useShop, type ShippingAddress } from "@/context/ShopContext";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — TeleARGlass" }] }),
  component: Checkout,
});

const shippingSchema = z.object({
  fullName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  address: z.string().min(6, "Address too short"),
  city: z.string().min(2, "Required"),
  postalCode: z.string().regex(/^\d{6}$/, "6-digit PIN"),
  phone: z.string().regex(/^\d{10}$/, "10-digit mobile"),
});

const STEPS = ["Shipping", "Delivery", "Review", "Success"] as const;

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, discountPct, placeOrder } = useShop();
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState<"standard" | "priority">("standard");
  const [addr, setAddr] = useState<ShippingAddress | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const form = useForm<ShippingAddress>({ resolver: zodResolver(shippingSchema), mode: "onBlur" });

  const shipping = speed === "priority" ? 499 : 0;
  const discount = Math.round(cartSubtotal * discountPct);
  const tax = Math.round((cartSubtotal - discount) * 0.18);
  const total = cartSubtotal - discount + shipping + tax;

  if (cart.length === 0 && step < 3) {
    return (
      <div className="section-container py-32 text-center">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <Link to="/products" className="mt-4 inline-block rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="section-container py-12">
      <div className="mb-10 flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${i <= step ? "bg-gradient-primary text-white" : "bg-surface text-text-muted"}`}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</div>
            <span className={`text-sm ${i === step ? "font-semibold" : "text-text-muted"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.form key="ship" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                onSubmit={form.handleSubmit((data) => { setAddr(data); setStep(1); })}
                className="grid gap-4 rounded-3xl border border-border-light bg-background p-6 sm:grid-cols-2 shadow-card">
                <Field label="Full name" error={form.formState.errors.fullName?.message} {...form.register("fullName")} />
                <Field label="Email" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
                <div className="sm:col-span-2"><Field label="Street address" error={form.formState.errors.address?.message} {...form.register("address")} /></div>
                <Field label="City" error={form.formState.errors.city?.message} {...form.register("city")} />
                <Field label="6-digit PIN" error={form.formState.errors.postalCode?.message} {...form.register("postalCode")} />
                <div className="sm:col-span-2"><Field label="10-digit mobile" error={form.formState.errors.phone?.message} {...form.register("phone")} /></div>
                <button type="submit" className="sm:col-span-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">Continue to delivery</button>
              </motion.form>
            )}
            {step === 1 && (
              <motion.div key="del" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {[
                  { id: "standard" as const, icon: Truck, title: "Standard", price: 0, sub: "3–5 business days · India-wide" },
                  { id: "priority" as const, icon: Zap, title: "Priority Express", price: 499, sub: "24-hour courier in metros" },
                ].map((o) => (
                  <button key={o.id} onClick={() => setSpeed(o.id)} className={`flex w-full items-center justify-between rounded-3xl border bg-background p-5 text-left transition ${speed === o.id ? "border-primary shadow-card-hover" : "border-border-light hover:border-primary/30"}`}>
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-violet text-primary"><o.icon className="h-5 w-5" /></div>
                      <div><div className="font-semibold">{o.title}</div><div className="text-sm text-text-muted">{o.sub}</div></div>
                    </div>
                    <div className="font-semibold">{o.price === 0 ? "Free" : inr(o.price)}</div>
                  </button>
                ))}
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="rounded-full border border-border px-6 py-3 text-sm font-semibold">Back</button>
                  <button onClick={() => setStep(2)} className="flex-1 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">Review order</button>
                </div>
              </motion.div>
            )}
            {step === 2 && addr && (
              <motion.div key="rev" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="rounded-3xl border border-border-light bg-background p-6">
                  <h2 className="text-sm font-mono uppercase tracking-widest text-text-muted">Ship to</h2>
                  <p className="mt-2 font-semibold">{addr.fullName}</p>
                  <p className="text-sm text-text-secondary">{addr.address}, {addr.city} {addr.postalCode} · {addr.phone}</p>
                </div>
                <div className="rounded-3xl border border-border-light bg-background p-6">
                  <h2 className="text-sm font-mono uppercase tracking-widest text-text-muted">Items</h2>
                  <ul className="mt-3 divide-y divide-border-light">
                    {cart.map((c) => (
                      <li key={c.product.id} className="flex items-center gap-3 py-3">
                        <img src={c.product.image} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1"><div className="font-medium">{c.product.name}</div><div className="text-xs text-text-muted">Qty {c.quantity}</div></div>
                        <div className="font-semibold">{inr(c.product.price * c.quantity)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => {
                  setPaying(true);
                  setTimeout(() => {
                    const o = placeOrder(addr, speed);
                    setOrderId(o.id);
                    setPaying(false);
                    setStep(3);
                  }, 1800);
                }} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">
                  <CreditCard className="h-4 w-4" /> Pay {inr(total)} with Razorpay
                </button>
              </motion.div>
            )}
            {step === 3 && orderId && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-accent/30 bg-surface-green p-10 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-white"><Check className="h-8 w-8" /></div>
                <h2 className="mt-4 text-3xl font-bold">Order confirmed</h2>
                <p className="mt-2 text-text-secondary">Your TeleAR shipment is on its way.</p>
                <div className="mt-6 inline-block rounded-2xl bg-background px-5 py-3 font-mono text-sm">{orderId}</div>
                <div className="mt-6 flex justify-center gap-3">
                  <Link to="/orders/$id" params={{ id: orderId }} className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">Track order</Link>
                  <button onClick={() => navigate({ to: "/products" })} className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold">Keep shopping</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="h-fit rounded-3xl border border-border-light bg-background p-6 shadow-card lg:sticky lg:top-28">
          <h2 className="text-sm font-mono uppercase tracking-widest text-text-muted">Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={inr(cartSubtotal)} />
            {discount > 0 && <Row label="Discount" value={`-${inr(discount)}`} positive />}
            <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
            <Row label="Tax (18% GST)" value={inr(tax)} />
            <div className="my-2 h-px bg-border-light" />
            <Row label="Total" value={inr(total)} bold />
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {paying && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-3xl bg-background p-8 text-center shadow-card-hover">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Connecting to Razorpay…</h3>
              <p className="mt-1 text-sm text-text-muted">Encrypting neural payment vector</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, bold, positive }: { label: string; value: string; bold?: boolean; positive?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold" : ""}`}>
      <span className="text-text-secondary">{label}</span>
      <span className={positive ? "text-accent" : ""}>{value}</span>
    </div>
  );
}

const Field = (() => {
  // eslint-disable-next-line react/display-name
  const C = ({ label, error, ...rest }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-widest text-text-muted">{label}</span>
      <input {...rest} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
  return C;
})();