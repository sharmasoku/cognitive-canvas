import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, FileText, Loader2 } from "lucide-react";
import { compliancePdfs, licences } from "@/data/content";

export const Route = createFileRoute("/licence")({
  head: () => ({ meta: [{ title: "TeleLicence — Compliance" }] }),
  component: Licence,
});

function Licence() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);

  const startDownload = (id: string, name: string) => {
    if (progress[id] !== undefined && progress[id] < 100) return;
    setProgress((p) => ({ ...p, [id]: 0 }));
    const t = window.setInterval(() => {
      setProgress((prev) => {
        const cur = prev[id] ?? 0;
        if (cur >= 100) { clearInterval(t); setToast(`${name} downloaded`); window.setTimeout(() => setToast(null), 2500); return prev; }
        return { ...prev, [id]: Math.min(100, cur + 9) };
      });
    }, 90);
  };

  return (
    <div className="section-container py-16">
      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">TeleLicence</h1>
      <p className="mt-4 max-w-2xl text-lg text-text-secondary">Regulatory charter, developer tokens and enterprise contracts — all in one place.</p>

      <h2 className="mt-12 text-2xl font-bold">Registries</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {licences.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="rounded-3xl border border-border-light bg-background p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover">
            <div className="text-xs uppercase tracking-widest text-primary font-mono">{l.scope}</div>
            <h3 className="mt-2 text-xl font-semibold">{l.name}</h3>
            <p className="mt-2 text-sm text-text-secondary">{l.description}</p>
            <div className="mt-5 flex items-center justify-between"><span className="font-bold">{l.price}</span><button className="rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-white magnetic">Request token</button></div>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold">Compliance downloads</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {compliancePdfs.map((p) => {
          const pct = progress[p.id];
          return (
            <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border-light bg-background p-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-surface-violet text-primary"><FileText className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-text-muted">PDF · {p.size}</div>
                {pct !== undefined && pct < 100 && <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border"><motion.div className="h-full bg-gradient-primary" animate={{ width: `${pct}%` }} /></div>}
              </div>
              <button onClick={() => startDownload(p.id, p.name)} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-primary hover:text-primary">
                {pct === undefined || pct >= 100 ? <Download className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background shadow-card-hover inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}