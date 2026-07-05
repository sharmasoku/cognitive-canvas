import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { submitContactMessage } from "@/lib/commerce";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";

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

        {/* Wall of love */}
        <div className="mt-10">
          <TestimonialMarquee />
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
