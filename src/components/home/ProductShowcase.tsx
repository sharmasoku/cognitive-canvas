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
    // Reduced padding on mobile from py-20 to py-10 to reduce scroll depth
    <section className="relative overflow-hidden py-10 md:py-20 lg:py-28">
      <div className="orb" style={{ width: 550, height: 550, background: "#10b981", top: -180, right: -180, opacity: 0.1 }} />
      <div className="orb" style={{ width: 450, height: 450, background: "#1016FF", bottom: -160, left: -160, opacity: 0.08 }} />
      <div className="absolute inset-0 -z-10 bg-grid opacity-[0.06]" />

      {/* Reduced vertical space-y from space-y-24 to space-y-12 on mobile */}
      <div className="section-container relative z-10 space-y-12 md:space-y-24">
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
        // Increased max-w to max-w-4xl to prevent layout wrapping to multiple lines
        className="mx-auto mb-6 md:mb-12 max-w-4xl text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-surface-violet px-4 py-1.5 text-sm sm:text-base font-mono uppercase tracking-widest text-primary">
          Featured product
        </span>
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary">
          {nameLead} {nameLast}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-text-secondary">{product.tagline}</p>
      </motion.div>

      {/* Reduced grid gap from gap-10 to gap-6 on mobile */}
      <div className="mx-auto grid max-w-5xl items-start gap-6 lg:gap-10 lg:grid-cols-2">
        {/* Left — Pre-booking benefits card matching website theme */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col justify-start rounded-[32px] border border-border-light bg-gradient-to-br from-primary/[0.04] via-secondary/[0.03] to-accent/[0.04] p-6 sm:p-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1016FF] font-heading">
              Pre-booking with {advancePct}% Payment
            </h3>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent border border-accent/20">
              Limited Time
            </span>
          </div>

          <div className="mt-8 rounded-2xl bg-background p-6 border border-border-light shadow-soft">
            <h4 className="text-lg font-bold text-primary font-heading mb-3">
              Pre-booking Benefits
            </h4>
            <p className="text-sm leading-relaxed text-text-secondary">
              TeleARGlass Consumers are entitled to receive early access and exclusive benefits of TeleProducts.
            </p>
          </div>
        </motion.div>

        {/* Right — photo + details + payment */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="flex flex-col gap-5 sm:gap-6"
        >
          {/* Curved rectangle wrapping the product photo exactly */}
          <div className="relative overflow-hidden rounded-[24px] border border-border-light shadow-soft">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>

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
                  <span>
                    <span className="font-medium text-foreground">
                      {key === "when_it_will_deliver" ? "Delivery Date" : key}:
                    </span>{" "}
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Premium payment card — reduced padding from p-6 to p-4 on mobile */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-primary/50 via-secondary/40 to-accent/50 p-[1.5px] shadow-card-hover transition-transform duration-500 ease-out hover:-translate-y-1">
            <div className="relative overflow-hidden rounded-[26px] bg-background p-4 sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-[50px]" />

              <div className="relative flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Total price</span>
                <span className="text-base sm:text-lg font-bold text-foreground">{inr(product.price)}</span>
              </div>

              {isPartPayment && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.18)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Pre-Book Available
                  </span>
                </div>
              )}

              {isPartPayment ? (
                <>
                  {/* Reduced text sizes on mobile to keep card compact */}
                  <div className="relative mt-4 flex flex-wrap items-baseline gap-2">
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-accent-dark">Pre-book for</span>
                    <span className="text-3xl sm:text-5xl font-extrabold leading-none font-heading gradient-text">{inr(advanceNow)}</span>
                  </div>

                  <div className="relative mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
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
                <div className="relative mt-4 text-3xl sm:text-4xl font-extrabold font-heading gradient-text">{inr(product.price)}</div>
              )}

              {/* Reduced top border spacing to keep layout compact */}
              <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-border-light/60 pt-4">
                <TrustItem icon={ShieldCheck} label="Secure checkout" />
                <TrustItem icon={Truck} label="Pay on delivery" />
                <TrustItem icon={Lock} label="No hidden fees" />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-6 top-1/2 -z-10 h-10 -translate-y-1/2 rounded-full bg-[#1016FF]/30 blur-2xl" />
            <button
              onClick={handlePreBook}
              className="cta-button-premium group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#1016FF] px-8 py-3.5 text-base font-semibold text-white transition hover:bg-[#142252]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <ShoppingCart className="h-5 w-5" />
              {isPartPayment ? `Pre-book for ${inr(advanceNow)}` : `Buy now for ${inr(product.price)}`}
            </button>
          </div>
          {isPartPayment && (
            <p className="-mt-3.5 text-center text-[11px] text-text-muted">
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
      <span className="text-[10px] sm:text-[10.5px] leading-tight text-text-muted">{label}</span>
    </div>
  );
}
