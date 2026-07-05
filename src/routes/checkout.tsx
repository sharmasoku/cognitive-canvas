import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Truck, Zap } from "lucide-react";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { useShop, type ShippingAddress } from "@/context/ShopContext";
import { computeAdvanceAmount } from "@/data/products";
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
  const { cart, cartSubtotal, discountPct, placeOrder, refreshCartProducts } = useShop();
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState<"standard" | "priority">("standard");
  const [addr, setAddr] = useState<ShippingAddress | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const form = useForm<ShippingAddress>({ resolver: zodResolver(shippingSchema), mode: "onBlur" });

  // Cart items snapshot product data at add-to-cart time, so a part-payment
  // rule (or price) changed afterwards wouldn't otherwise show up here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refreshCartProducts(); }, []);

  const shipping = speed === "priority" ? 499 : 0;
  const discount = Math.round(cartSubtotal * discountPct);
  const tax = Math.round((cartSubtotal - discount) * 0.18);
  const total = cartSubtotal - discount + shipping + tax;

  const advanceFromItems = cart.reduce((s, c) => s + computeAdvanceAmount(c.product, c.quantity), 0);
  const amountDueLater = cartSubtotal - advanceFromItems;
  const amountDueNow = advanceFromItems + shipping + tax - discount;
  const isPartialPayment = amountDueLater > 0;

  const getEstimatedDate = () => {
    const date = new Date();
    if (speed === "priority") {
      date.setDate(date.getDate() + 1);
    } else {
      date.setDate(date.getDate() + 4);
    }
    return date.toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleStepClick = (i: number) => {
    if (step === 3) return; // Prevent navigation after successful order placement
    if (i === 0) setStep(0);
    if (i === 1 && addr) setStep(1);
    if (i === 2 && addr) setStep(2);
  };

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
      {/* Interactive Step Guide */}
      <div className="mb-10 flex flex-wrap items-center gap-4">
        {STEPS.map((s, i) => {
          const isClickable = i < 3 && step < 3 && (i === 0 || !!addr);
          return (
            <div key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => isClickable && handleStepClick(i)}
                disabled={!isClickable}
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition ${
                  i <= step ? "bg-gradient-primary text-white" : "bg-surface text-text-muted"
                } ${isClickable ? "hover:scale-105 cursor-pointer" : "cursor-default"}`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              <span className={`text-sm ${i === step ? "font-semibold" : "text-text-muted"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          );
        })}
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
                {isPartialPayment && (
                  <div className="rounded-3xl border border-accent/20 bg-accent/[0.04] p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Pay now</span>
                      <span className="text-lg font-bold text-accent">{inr(amountDueNow)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Due on delivery (cash/UPI)</span>
                      <span className="font-semibold">{inr(amountDueLater)}</span>
                    </div>
                  </div>
                )}
                <button onClick={() => {
                  setPaying(true);
                }} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">
                  <CreditCard className="h-4 w-4" /> Pay {inr(amountDueNow)} with Razorpay
                </button>
                {isPartialPayment && (
                  <p className="text-center text-xs text-text-muted">
                    * The remaining {inr(amountDueLater)} is collected by our delivery agent (cash/UPI) before handover.
                  </p>
                )}
              </motion.div>
            )}
            {step === 3 && orderId && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-accent/30 bg-surface-green p-10 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-white"><Check className="h-8 w-8" /></div>
                <h2 className="mt-4 text-3xl font-bold">Order confirmed</h2>
                <p className="mt-2 text-text-secondary">Your TeleAR shipment is on its way.</p>
                <div className="mt-6 inline-block rounded-2xl bg-background px-5 py-3 font-mono text-sm">{orderId}</div>

                {isPartialPayment && (
                  <div className="mt-6 mx-auto max-w-sm rounded-2xl border border-accent/20 bg-background/50 p-4 text-left">
                    <div className="flex items-center justify-between text-sm"><span className="text-text-secondary">Paid now</span><span className="font-semibold text-accent">{inr(amountDueNow)}</span></div>
                    <div className="mt-1 flex items-center justify-between text-sm"><span className="text-text-secondary">Due on delivery (cash/UPI)</span><span className="font-semibold">{inr(amountDueLater)}</span></div>
                  </div>
                )}

                {/* Estimated Delivery Date Panel */}
                <div className="mt-6 rounded-2xl border border-accent/20 bg-background/50 p-4 max-w-sm mx-auto">
                  <div className="text-xs font-mono uppercase tracking-widest text-text-muted">Estimated Delivery</div>
                  <div className="mt-1 font-semibold text-accent-dark">{getEstimatedDate()}</div>
                </div>

                <div className="mt-8 flex justify-center gap-3">
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
            {isPartialPayment && (
              <>
                <div className="my-2 h-px bg-border-light" />
                <Row label="Pay now" value={inr(amountDueNow)} positive />
                <Row label="Due on delivery" value={inr(amountDueLater)} />
              </>
            )}
          </div>
        </aside>
      </div>

      <PaymentModal
        open={paying}
        amount={amountDueNow}
        onClose={() => setPaying(false)}
        onSuccess={async () => {
          if (addr) {
            const o = await placeOrder(addr, speed);
            setOrderId(o.id);
            setStep(3);
          }
        }}
      />
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
      <input {...rest} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 animate-all" />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
  return C;
})();