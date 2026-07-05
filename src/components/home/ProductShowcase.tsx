import { motion } from "framer-motion";
import { Lock, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import type { ComponentType } from "react";
import { useShop } from "@/context/ShopContext";
import { computeAdvanceAmount, type Product } from "@/data/products";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { inr } from "@/lib/format";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function ProductShowcase() {
  const { products, loading } = useFeaturedProducts();

  if (!loading && products.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="orb" style={{ width: 550, height: 550, background: "#10b981", top: -180, right: -180, opacity: 0.1 }} />
      <div className="orb" style={{ width: 450, height: 450, background: "#7c3aed", bottom: -160, left: -160, opacity: 0.08 }} />
      <div className="absolute inset-0 -z-10 bg-grid opacity-[0.06]" />

      <div className="section-container relative z-10 space-y-24">
        {loading ? (
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-[32px] bg-surface" />
            <div className="h-80 animate-pulse rounded-[32px] bg-surface" />
          </div>
        ) : (
          products.map((product) => <ShowcaseCard key={product.id} product={product} />)
        )}
      </div>
    </section>
  );
}

function ShowcaseCard({ product }: { product: Product }) {
  const { addToCart, setCartOpen } = useShop();

  const advanceNow = computeAdvanceAmount(product, 1);
  const dueLater = product.price - advanceNow;
  const isPartPayment = dueLater > 0;
  const advancePct = product.price > 0 ? Math.round((advanceNow / product.price) * 100) : 0;
  const advanceLabel = product.advanceType === "percent" ? `${product.advanceValue}%` : null;

  const allSpecs = Object.entries(product.specifications);
  const shortSpecs = allSpecs.filter(([, v]) => v.length <= 40);
  const highlights = (shortSpecs.length >= 3 ? shortSpecs : allSpecs).slice(0, 4);

  const nameParts = product.name.split(" ");
  const nameLead = nameParts.slice(0, -1).join(" ");
  const nameLast = nameParts.at(-1);

  const handlePreBook = () => {
    addToCart(product, 1);
    setCartOpen(true);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto mb-12 max-w-lg text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-surface-violet px-3 py-1 text-xs font-mono uppercase tracking-widest text-primary">
          Featured product
        </span>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {nameLead} <span className="gradient-text">{nameLast}</span>
        </h2>
        <p className="mt-3 text-base text-text-secondary">{product.tagline}</p>
      </motion.div>

      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-2">
        {/* Left — product visual */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-border-light bg-gradient-to-br from-primary/[0.06] via-secondary/[0.05] to-accent/[0.06] p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-[60px]" />
            <div className="pointer-events-none absolute -left-14 -bottom-14 h-44 w-44 rounded-full bg-accent/10 blur-[50px]" />
            <img
              src={product.image}
              alt={product.name}
              className="animate-float relative z-10 mx-auto w-full max-w-sm object-contain drop-shadow-[0_30px_50px_rgba(20,20,30,0.18)]"
            />
          </div>
        </motion.div>

        {/* Right — details + payment */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
              ))}
              <span className="text-xs text-text-muted">
                {product.reviewCount > 0 ? `${product.rating} (${product.reviewCount} reviews)` : "No reviews yet"}
              </span>
            </div>
          </div>

          {highlights.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {highlights.map(([key, value]) => (
                <li key={key} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span><span className="font-medium text-foreground">{key}:</span> {value}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Premium payment card */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-primary/50 via-secondary/40 to-accent/50 p-[1.5px] shadow-card-hover transition-transform duration-500 ease-out hover:-translate-y-1">
            <div className="relative overflow-hidden rounded-[26px] bg-background p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-[50px]" />

              <div className="relative flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Total price</span>
                <span className="text-lg font-bold text-foreground">{inr(product.price)}</span>
              </div>

              {isPartPayment ? (
                <>
                  <div className="relative mt-4">
                    <div className="text-xs font-mono uppercase tracking-widest text-accent-dark">Pay today</div>
                    <div className="mt-1 text-5xl font-extrabold leading-none font-heading gradient-text">{inr(advanceNow)}</div>
                  </div>

                  <div className="relative mt-5">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${advancePct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-accent to-secondary"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                      <span>{advanceLabel ?? `${advancePct}%`} today</span>
                      <span>{inr(dueLater)} on delivery</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative mt-4 text-4xl font-extrabold font-heading gradient-text">{inr(product.price)}</div>
              )}

              <div className="relative mt-6 grid grid-cols-3 gap-2 border-t border-border-light pt-5">
                <TrustItem icon={ShieldCheck} label="Secure checkout" />
                <TrustItem icon={Truck} label="Pay rest on delivery" />
                <TrustItem icon={Lock} label="No hidden charges" />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-6 top-1/2 -z-10 h-10 -translate-y-1/2 rounded-full bg-accent/30 blur-2xl" />
            <button
              onClick={handlePreBook}
              className="cta-button-premium group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-accent via-accent to-secondary px-8 py-4 text-base font-semibold text-white"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <ShoppingCart className="h-5 w-5" />
              {isPartPayment ? `Pre-book for ${inr(advanceNow)}` : `Buy now for ${inr(product.price)}`}
            </button>
          </div>
          {isPartPayment && (
            <p className="-mt-3 text-center text-xs text-text-muted">
              * Pay {inr(advanceNow)} now, remaining {inr(dueLater)} before delivery.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function TrustItem({ icon: Icon, label }: { icon: ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Icon className="h-4 w-4 text-accent" />
      <span className="text-[10.5px] leading-tight text-text-muted">{label}</span>
    </div>
  );
}
