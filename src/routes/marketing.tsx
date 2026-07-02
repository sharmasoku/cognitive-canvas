import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { blogPosts } from "@/data/content";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/marketing")({
  head: () => ({ meta: [{ title: "Newsroom — TeleARGlass" }] }),
  component: Marketing,
});

function Marketing() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const tags = useMemo(() => ["All", ...Array.from(new Set(blogPosts.map((p) => p.tag)))], []);
  const filtered = blogPosts.filter((p) => (tag === "All" || p.tag === tag) && (q === "" || `${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="section-container py-16">
      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Tele<span className="gradient-text">Marketing</span></h1>
      <p className="mt-4 max-w-2xl text-lg text-text-secondary">Research notes, product launches and field stories from TeleAR.</p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts" className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button key={t} onClick={() => setTag(t)} className={`rounded-full border px-3 py-1.5 text-xs ${tag === t ? "border-primary bg-primary text-white" : "border-border text-text-secondary"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <motion.article key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border-light bg-background transition hover:-translate-y-2 hover:border-primary/30 hover:shadow-card-hover">
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 via-[#0a0d14] to-secondary/20 relative overflow-hidden flex items-center justify-center border-b border-border-light">
              <div className="absolute inset-0 bg-grid opacity-25" />
              {/* Glowing decorative circles */}
              <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-primary/20 blur-xl group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-accent/15 blur-xl group-hover:scale-125 transition-transform duration-500" />
              
              <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-mono uppercase tracking-widest backdrop-blur border border-border-light">{p.tag}</span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="text-xs text-text-muted">{shortDate(p.date)} · {p.readTime}</div>
              <h3 className="mt-2 text-lg font-semibold leading-tight">{p.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{p.excerpt}</p>
              <div className="mt-auto pt-5 flex items-center justify-between text-sm">
                <div><div className="font-medium">{p.author}</div><div className="text-xs text-text-muted">{p.role}</div></div>
                <button className="inline-flex items-center gap-1 text-primary group-hover:gap-2 transition-all">Read <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}