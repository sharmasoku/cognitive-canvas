import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { feedbackList } from "@/data/content";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "TeleFeedback" }] }),
  component: Feedback,
});

function Feedback() {
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const avg = (feedbackList.reduce((s, f) => s + f.rating, 0) / feedbackList.length).toFixed(1);

  return (
    <div className="section-container py-16">
      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">TeleFeedback</h1>
      <p className="mt-4 max-w-2xl text-lg text-text-secondary">What clinicians, pilots and creators are saying.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="rounded-3xl bg-gradient-primary p-8 text-white shadow-card-hover">
          <div className="text-7xl font-bold">{avg}</div>
          <div className="mt-2 flex gap-0.5">{[1,2,3,4,5].map((i) => <Star key={i} className="h-5 w-5 fill-white text-white" />)}</div>
          <p className="mt-3 text-sm opacity-90">Across {feedbackList.length * 184} verified customers</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {feedbackList.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-3xl border border-border-light bg-background p-6">
              <div className="flex gap-0.5">{[1,2,3,4,5].map((i2) => <Star key={i2} className={`h-3.5 w-3.5 ${i2 <= f.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />)}</div>
              <p className="mt-3 text-text-secondary">"{f.comment}"</p>
              <div className="mt-4 text-sm font-semibold">{f.userName}</div>
              <div className="text-xs text-text-muted">{f.role}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-3xl border border-border-light bg-surface p-8 lg:p-12">
        <h2 className="text-3xl font-bold">Share your feedback</h2>
        {sent ? (
          <div className="mt-5 rounded-2xl bg-surface-green p-5 text-accent-dark">Thanks for shaping TeleAR.</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-5 grid gap-4 md:grid-cols-2">
            <input required placeholder="Name" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <select className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" defaultValue="Product">
              <option>Product</option><option>Service</option><option>Enterprise</option><option>Developer SDK</option>
            </select>
            <div className="md:col-span-2 flex items-center gap-2">
              <span className="text-sm text-text-muted">Rating:</span>
              {[1,2,3,4,5].map((i) => (
                <button type="button" key={i} onClick={() => setRating(i)}>
                  <Star className={`h-6 w-6 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                </button>
              ))}
            </div>
            <textarea required rows={4} placeholder="Tell us more" className="md:col-span-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <button className="md:col-span-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">Submit feedback</button>
          </form>
        )}
      </div>
    </div>
  );
}