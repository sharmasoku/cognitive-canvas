import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Loader2 } from "lucide-react";
import { submitContactMessage, fetchAllReviews, type DbReview } from "@/lib/commerce";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "TeleFeedback — Customers" }] }),
  component: Feedback,
});

function Feedback() {
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Product");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [visible, setVisible] = useState(6);

  useEffect(() => {
    let active = true;
    fetchAllReviews(48).then((r) => {
      if (active) { setReviews(r); setLoadingReviews(false); }
    });
    return () => { active = false; };
  }, []);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await submitContactMessage({
      name,
      email,
      message: `[${category} · ${rating}★] ${message}`,
    });
    setSubmitting(false);
    if (res.ok) setSent(true);
    else setError(res.error ?? "Could not send feedback. Please try again.");
  };

  return (
    <div className="relative overflow-hidden">
      {/* Orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: "#7c3aed", top: -200, left: -200, opacity: 0.12 }} />
      <div className="orb" style={{ width: 500, height: 500, background: "#10b981", bottom: -200, right: -150, opacity: 0.08 }} />

      <div className="section-container py-16 relative">
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Tele<span className="gradient-text">Feedback</span></h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">Genuine reviews from verified TeleARGlass customers.</p>

        {/* Dashboard Grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Scorecard */}
            <div className="rounded-3xl bg-gradient-primary p-8 text-white shadow-card-hover relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-15" />
              <div className="relative z-10">
                <div className="text-7xl font-bold">{avg ?? "—"}</div>
                <div className="mt-2 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-5 w-5 ${avg && i <= Math.round(Number(avg)) ? "fill-white text-white" : "text-white/40"}`} />
                  ))}
                </div>
                <p className="mt-4 text-sm opacity-90 font-medium">
                  {reviews.length > 0
                    ? `Across ${reviews.length} verified customer review${reviews.length !== 1 ? "s" : ""}`
                    : "Be the first to review TeleARGlass"}
                </p>
                <div className="mt-6 flex items-center gap-1.5 text-xs bg-white/20 rounded-full px-3 py-1.5 w-fit backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" /> Verified purchases only
                </div>
              </div>
            </div>
          </div>

          {/* Review Grid */}
          <div>
            {loadingReviews ? (
              <div className="flex items-center justify-center rounded-3xl border border-border-light bg-background py-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border-light bg-background p-16 text-center text-text-secondary">
                No reviews yet — purchase a TeleARGlass and share your experience.
              </div>
            ) : (
              <>
              <div className="grid gap-4 sm:grid-cols-2">
                {reviews.slice(0, visible).map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 6) * 0.05 }}
                    className="rounded-3xl border border-border-light bg-background p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-card group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i2) => (
                          <Star key={i2} className={`h-3.5 w-3.5 transition-colors duration-300 group-hover:scale-110 ${i2 <= f.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                        ))}
                      </div>
                      {f.verified && (
                        <span className="rounded-full bg-surface-green px-2 py-0.5 text-[10px] font-medium text-accent-dark">Verified</span>
                      )}
                    </div>
                    <p className="mt-3 text-text-secondary leading-relaxed">"{f.comment}"</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm font-bold text-foreground">{f.userName}</div>
                      <div className="text-xs text-text-muted">{shortDate(f.date)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {reviews.length > visible && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <button
                    onClick={() => setVisible((v) => v + 6)}
                    className="rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-text-secondary transition hover:border-primary hover:text-primary"
                  >
                    Show more reviews
                  </button>
                  <span className="text-xs text-text-muted">Showing {Math.min(visible, reviews.length)} of {reviews.length}</span>
                </div>
              )}
              {visible > 6 && reviews.length > 6 && (
                <div className="mt-3 text-center">
                  <button onClick={() => setVisible(6)} className="text-xs text-text-muted hover:text-primary">Show less</button>
                </div>
              )}
              </>
            )}
          </div>
        </div>

        {/* Feedback Share Form */}
        <div className="mt-14 rounded-3xl border border-border-light bg-surface p-8 lg:p-12 shadow-soft">
          <h2 className="text-3xl font-bold">Share your feedback</h2>
          {sent ? (
            <div className="mt-5 rounded-2xl bg-surface-green p-5 text-accent-dark font-medium border border-accent/20 animate-fade-in">
              Thanks for shaping TeleAR.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="md:col-span-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option>Product</option>
                <option>Service</option>
                <option>Enterprise</option>
                <option>Developer SDK</option>
              </select>
              <div className="md:col-span-2 flex items-center gap-2">
                <span className="text-sm text-text-muted">Rating:</span>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button type="button" key={i} onClick={() => setRating(i)} className="transition hover:scale-110">
                    <Star className={`h-6 w-6 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                  </button>
                ))}
              </div>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Tell us more" className="md:col-span-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
              {error && <div className="md:col-span-2 text-sm text-destructive">{error}</div>}
              <button disabled={submitting} className="md:col-span-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic shadow-soft disabled:opacity-60">{submitting ? "Sending…" : "Submit feedback"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
