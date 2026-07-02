import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Volume2, ShieldCheck } from "lucide-react";
import { feedbackList } from "@/data/content";
import { submitContactMessage } from "@/lib/commerce";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "TeleFeedback — Customers" }] }),
  component: Feedback,
});

const VIDEO_SNIPPETS = [
  { id: "v1", name: "Dr. Anjali Kapoor", role: "Neurologist, AIIMS", excerpt: "Analyzing scans in real-time holographic space is a paradigm shift.", duration: "0:45" },
  { id: "v2", name: "Rajiv Khanna", role: "SpaceCAD Founder", excerpt: "Retiring the mouse was easy. Neural tracking is incredibly precise.", duration: "1:12" },
];

function Feedback() {
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
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
  
  const avg = (feedbackList.reduce((s, f) => s + f.rating, 0) / feedbackList.length).toFixed(1);

  return (
    <div className="relative overflow-hidden">
      {/* Orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: "#7c3aed", top: -200, left: -200, opacity: 0.12 }} />
      <div className="orb" style={{ width: 500, height: 500, background: "#10b981", bottom: -200, right: -150, opacity: 0.08 }} />

      <div className="section-container py-16 relative">
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Tele<span className="gradient-text">Feedback</span></h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">What clinicians, pilots and creators are saying.</p>

        {/* Dashboard Grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-6">
            {/* Scorecard */}
            <div className="rounded-3xl bg-gradient-primary p-8 text-white shadow-card-hover relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-15" />
              <div className="relative z-10">
                <div className="text-7xl font-bold">{avg}</div>
                <div className="mt-2 flex gap-0.5">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="h-5 w-5 fill-white text-white" />)}
                </div>
                <p className="mt-4 text-sm opacity-90 font-medium">Across {feedbackList.length * 184} verified customer reviews</p>
                <div className="mt-6 flex items-center gap-1.5 text-xs bg-white/20 rounded-full px-3 py-1.5 w-fit backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" /> CDSCO Audited feedback
                </div>
              </div>
            </div>

            {/* Interactive Video Snippets Testimonial Widget */}
            <div className="rounded-3xl border border-border-light bg-background p-6 shadow-soft relative overflow-hidden group">
              <div className="text-xs font-mono uppercase tracking-widest text-text-muted mb-3">Live Video Testimonials</div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVideo}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="relative aspect-video rounded-2xl bg-gradient-dark overflow-hidden flex items-center justify-center border border-white/10">
                    <div className="absolute inset-0 bg-grid opacity-25" />
                    
                    {playingVideo === VIDEO_SNIPPETS[activeVideo].id ? (
                      <div className="absolute inset-0 bg-[#0a0d14] flex flex-col items-center justify-center p-4">
                        <Volume2 className="h-8 w-8 text-accent animate-bounce" />
                        <span className="mt-2 text-xs font-mono text-white/70">Audio review playing...</span>
                        <div className="mt-3 flex gap-1 items-center justify-center">
                          {[1,2,3,4,5,6,7].map((bar) => (
                            <span 
                              key={bar} 
                              className="w-1 bg-primary rounded-full animate-pulse-ring" 
                              style={{ 
                                height: `${Math.random() * 24 + 8}px`,
                                animationDelay: `${bar * 0.1}s`,
                                animationDuration: "1s"
                              }} 
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setPlayingVideo(VIDEO_SNIPPETS[activeVideo].id)}
                        className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-white shadow-glow-primary hover:scale-110 transition duration-300"
                      >
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </button>
                    )}

                    <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white">{VIDEO_SNIPPETS[activeVideo].duration}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{VIDEO_SNIPPETS[activeVideo].name}</h4>
                    <p className="text-[10px] text-text-muted">{VIDEO_SNIPPETS[activeVideo].role}</p>
                    <p className="mt-2 text-xs text-text-secondary italic">"{VIDEO_SNIPPETS[activeVideo].excerpt}"</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Snippet Navigation dots */}
              <div className="mt-4 flex gap-1.5 justify-center">
                {VIDEO_SNIPPETS.map((s, i) => (
                  <button 
                    key={s.id} 
                    onClick={() => { setActiveVideo(i); setPlayingVideo(null); }} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeVideo === i ? "w-4 bg-primary" : "w-1.5 bg-border"}`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Review Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {feedbackList.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-3xl border border-border-light bg-background p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-card group"
              >
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((i2) => (
                    <Star key={i2} className={`h-3.5 w-3.5 transition-colors duration-300 group-hover:scale-110 ${i2 <= f.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                  ))}
                </div>
                <p className="mt-3 text-text-secondary leading-relaxed">"{f.comment}"</p>
                <div className="mt-4 text-sm font-bold text-foreground">{f.userName}</div>
                <div className="text-xs text-text-muted">{f.role}</div>
              </motion.div>
            ))}
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
                {[1,2,3,4,5].map((i) => (
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