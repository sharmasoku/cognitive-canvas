import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Home, ShoppingBag, Truck, Zap, Star, X, MapPin } from "lucide-react";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { useShop, type ShippingAddress } from "@/context/ShopContext";
import { computeAdvanceAmount } from "@/data/products";
import { inr } from "@/lib/format";
import { submitReview } from "@/lib/commerce";

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
  phone: z.string().regex(/^\d{10}$/, "Enter a valid contact number"),
});

const STEPS = ["Shipping", "Review", "Success"] as const;

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, placeOrder, refreshCartProducts, getOrder, orders } = useShop();
  const [step, setStep] = useState(0);
  const speed = "standard";
  const [addr, setAddr] = useState<ShippingAddress | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>(() => {
    const extracted: ShippingAddress[] = [];
    const seen = new Set<string>();
    orders.forEach((o) => {
      if (o.shippingAddress) {
        const key = `${o.shippingAddress.fullName}-${o.shippingAddress.address}-${o.shippingAddress.postalCode}`;
        if (!seen.has(key)) {
          seen.add(key);
          extracted.push(o.shippingAddress);
        }
      }
    });
    if (extracted.length === 0) {
      return [
        {
          fullName: "Sorav Sharma",
          phone: "6353086637",
          address: "Gujarat, India, Gandhinagar-382721, Gujarat, India, Ahmedabad, GUJARAT",
          city: "Ahmedabad",
          postalCode: "382721",
          email: "sorav@telearglass.com",
        },
      ];
    }
    return extracted;
  });
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const form = useForm<ShippingAddress>({ resolver: zodResolver(shippingSchema), mode: "onBlur" });

  // Cart items snapshot product data at add-to-cart time, so a part-payment
  // rule (or price) changed afterwards wouldn't otherwise show up here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refreshCartProducts(); }, []);

  const shipping = speed === "priority" ? 499 : 0;
  const total = cartSubtotal + shipping;

  const advanceFromItems = cart.reduce((s, c) => s + computeAdvanceAmount(c.product, c.quantity), 0);
  const amountDueLater = cartSubtotal - advanceFromItems;
  const amountDueNow = advanceFromItems + shipping;
  const isPartialPayment = amountDueLater > 0;

  const order = orderId ? getOrder(orderId) : undefined;

  const getEstimatedDate = (deliverySpeed: "standard" | "priority") => {
    if (order && order.items && order.items.length > 0) {
      const estimates = order.items
        .map((c) => {
          const custom = c.product.whenItWillDeliver;
          return custom ? `${c.product.name}: ${custom}` : null;
        })
        .filter(Boolean);
      if (estimates.length > 0) {
        return estimates.join(", ");
      }
    }
    const date = new Date();
    date.setDate(date.getDate() + (deliverySpeed === "priority" ? 1 : 4));
    return date.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const handleStepClick = (i: number) => {
    if (step === 2) return; // Prevent navigation after successful order placement
    if (i === 0) setStep(0);
    if (i === 1 && addr) setStep(1);
  };

  if (cart.length === 0 && step < 2) {
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
          const isClickable = i < 2 && step < 2 && (i === 0 || !!addr);
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

      <div className={step === 2 ? "" : "grid gap-10 lg:grid-cols-[1fr_360px]"}>
        <div>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="ship" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {!showAddressForm ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#1016FF]" />
                      <h2 className="text-xl font-bold tracking-tight text-foreground">Shipping Address</h2>
                    </div>

                    {/* Saved Addresses List */}
                    <div className="grid gap-4">
                      {savedAddresses.map((address, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedAddressIndex(idx)}
                          className={`relative flex items-start gap-4 rounded-3xl p-5 border-2 cursor-pointer transition-all duration-200 ${
                            selectedAddressIndex === idx
                              ? "border-[#1016FF] bg-[#1016FF]/[0.02]"
                              : "border-border bg-background hover:border-text-secondary/40"
                          }`}
                        >
                          <div className="mt-1 flex h-5 items-center">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={selectedAddressIndex === idx}
                              onChange={() => setSelectedAddressIndex(idx)}
                              className="h-4 w-4 accent-[#1016FF] cursor-pointer"
                            />
                          </div>
                          <div className="flex-1 text-sm text-left">
                            <div className="font-bold text-foreground">
                              {address.fullName} <span className="mx-2 text-text-muted font-normal">·</span> <span className="font-mono font-medium text-text-secondary">{address.phone}</span>
                            </div>
                            <div className="mt-1.5 text-text-secondary leading-relaxed">
                              {address.address}, {address.city} - {address.postalCode}
                            </div>
                            <div className="mt-1 text-xs text-text-muted">{address.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-8 flex items-center gap-6">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="text-sm font-bold text-[#1016FF] hover:underline flex items-center gap-1.5"
                      >
                        + Add another address
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const selected = savedAddresses[selectedAddressIndex];
                          if (selected) {
                            setAddr(selected);
                            setStep(1);
                          }
                        }}
                        className="rounded-full bg-[#1016FF] hover:bg-[#142252] px-8 py-3 text-sm font-semibold text-white transition shadow-soft"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={form.handleSubmit((data) => {
                      setSavedAddresses((prev) => [...prev, data]);
                      setSelectedAddressIndex(savedAddresses.length);
                      setAddr(data);
                      setStep(1);
                    })}
                    className="space-y-4 sm:space-y-6 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#1016FF]" />
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Add New Address</h2>
                      </div>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="text-xs font-semibold text-[#1016FF] hover:underline"
                        >
                          Show saved addresses
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 rounded-3xl border border-border-light bg-background p-4.5 sm:p-6 shadow-card">
                      <div className="col-span-2 sm:col-span-1">
                        <Field label="Full name" error={form.formState.errors.fullName?.message} {...form.register("fullName")} />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <Field label="Email" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
                      </div>
                      <div className="col-span-2">
                        <Field label="Street address" error={form.formState.errors.address?.message} {...form.register("address")} />
                      </div>
                      <div className="col-span-1">
                        <Field label="City" error={form.formState.errors.city?.message} {...form.register("city")} />
                      </div>
                      <div className="col-span-1">
                        <Field label="6-digit PIN" error={form.formState.errors.postalCode?.message} {...form.register("postalCode")} />
                      </div>
                      <div className="col-span-2">
                        <Field label="Contact Number" placeholder="Contact Number" error={form.formState.errors.phone?.message} {...form.register("phone")} />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button type="submit" className="flex-1 rounded-full bg-[#1016FF] hover:bg-[#142252] px-6 py-3 text-sm font-semibold text-white transition shadow-soft">
                        Continue to review
                      </button>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-secondary hover:bg-background transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </motion.div>
            )}
            {step === 1 && addr && (
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
            {step === 2 && order && (
              <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
                <div className="rounded-[2rem] border border-accent/30 bg-surface-green p-8 text-center sm:p-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="relative mx-auto grid h-20 w-20 place-items-center"
                  >
                    <span className="glow-dot absolute inset-0 rounded-full bg-accent/20" />
                    <span className="relative grid h-16 w-16 place-items-center rounded-full bg-accent text-white shadow-glow-primary">
                      <Check className="h-8 w-8" />
                    </span>
                  </motion.div>
                  <h2 className="mt-6 text-3xl font-bold sm:text-4xl">Order confirmed</h2>
                  <p className="mt-2 text-text-secondary">Your TeleAR shipment is on its way.</p>
                  <div className="mt-6 inline-block rounded-2xl bg-background px-5 py-3 font-mono text-sm">{order.id}</div>

                  <div className="mt-6 rounded-2xl border border-accent/20 bg-background/60 p-4 max-w-sm mx-auto">
                    <div className="text-xs font-mono uppercase tracking-widest text-text-muted">Estimated Delivery</div>
                    <div className="mt-1 font-semibold text-accent-dark">{getEstimatedDate(order.deliverySpeed)}</div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-border-light bg-background p-6 text-left shadow-card">
                  <h3 className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-text-muted">
                    <ShoppingBag className="h-3.5 w-3.5" /> Order summary
                  </h3>
                  <ul className="mt-3 divide-y divide-border-light">
                    {order.items.map((c) => (
                      <li key={c.product.id} className="flex items-center gap-3 py-3">
                        <img src={c.product.image} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1"><div className="font-medium">{c.product.name}</div><div className="text-xs text-text-muted">Qty {c.quantity}</div></div>
                        <div className="font-semibold">{inr(c.product.price * c.quantity)}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 space-y-1.5 border-t border-border-light pt-3 text-sm">
                    <Row label="Subtotal" value={inr(order.subtotal)} />
                    <Row label="Shipping" value={order.shipping === 0 ? "Free" : inr(order.shipping)} />
                    <Row label="Total" value={inr(order.total)} bold />
                    {order.paymentPlan === "partial" && (
                      <>
                        <div className="my-1 h-px bg-border-light" />
                        <Row label="Paid now" value={inr(order.amountPaidNow)} positive />
                        <Row label="Due on delivery" value={inr(order.amountDueLater)} />
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button onClick={() => navigate({ to: "/products" })} className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">Continue Shopping</button>
                  <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
                    <Home className="h-4 w-4" /> Back to Home
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 2 && (
          <aside className="h-fit rounded-3xl border border-border-light bg-background p-6 shadow-card lg:sticky lg:top-28">
            <h2 className="text-sm font-mono uppercase tracking-widest text-text-muted">Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={inr(cartSubtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
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
        )}
      </div>

      <PaymentModal
        open={paying}
        amount={amountDueNow}
        onClose={() => setPaying(false)}
        onSuccess={async () => {
          if (addr) {
            const o = await placeOrder(addr, speed);
            setOrderId(o.id);
            setStep(2);
            setShowRatingModal(true);
          }
        }}
      />

      <OrderRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        order={order}
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

function OrderRatingModal({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: any }) {
  const [ratingStep, setRatingStep] = useState<"stars" | "comment" | "success">("stars");
  const [rating, setRating] = useState(5);
  const [name, setName] = useState(order?.shippingAddress?.fullName || "");
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order?.shippingAddress?.fullName) {
      setName(order.shippingAddress.fullName);
    }
  }, [order]);

  if (!isOpen || !order || !order.items || order.items.length === 0) return null;

  const product = order.items[0].product;

  const handleStarClick = (val: number) => {
    setRating(val);
    setRatingStep("comment");
  };

  const handleSkipReview = async () => {
    setSubmitting(true);
    await submitReview(product.slug, rating, "Verified Purchase Rating", name || "Verified Buyer");
    setSubmitting(false);
    setRatingStep("success");
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitReview(product.slug, rating, comment.trim() || "Excellent product!", name.trim() || "Verified Buyer");
    setSubmitting(false);
    setRatingStep("success");
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border-light bg-surface p-8 shadow-2xl"
        >
          {/* Close button (top right) */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-background/80 hover:text-foreground transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {ratingStep === "stars" && (
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#1016FF]">How is your experience?</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Thank you for your order! Please rate the <strong>{product.name}</strong>.
              </p>
              
              <div className="mt-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleStarClick(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition duration-150 hover:scale-125"
                  >
                    <Star
                      className={`h-9 w-9 transition-colors ${
                        i <= (hoverRating ?? rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="rounded-full border border-border px-6 py-2.5 text-xs font-semibold text-text-secondary hover:bg-background transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {ratingStep === "comment" && (
            <form onSubmit={handleSubmitReview}>
              <h3 className="text-xl font-bold text-[#1016FF] text-center">Share details</h3>
              <p className="mt-1 text-xs text-text-muted text-center">
                You rated it {rating} star{rating > 1 ? "s" : ""}. Help others by sharing your experience!
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Review</label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How do you plan to use it? What features do you like?"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#1016FF]"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSkipReview}
                  disabled={submitting}
                  className="rounded-full px-5 py-2.5 text-xs font-semibold text-text-secondary hover:text-foreground transition"
                >
                  Skip review
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#1016FF] hover:bg-[#142252] px-6 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}

          {ratingStep === "success" && (
            <div className="text-center py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#1016FF]">Review submitted!</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Thank you for helping us verify genuine reviews!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
