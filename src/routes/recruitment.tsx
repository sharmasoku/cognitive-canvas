import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Upload, X } from "lucide-react";
import { jobs } from "@/data/content";

export const Route = createFileRoute("/recruitment")({
  head: () => ({ meta: [{ title: "Careers at TeleARGlass" }] }),
  component: Recruitment,
});

function Recruitment() {
  const departments = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))], []);
  const locations = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.location)))], []);
  const [dep, setDep] = useState("All");
  const [loc, setLoc] = useState("All");
  const [open, setOpen] = useState<typeof jobs[number] | null>(null);

  const filtered = jobs.filter((j) => (dep === "All" || j.department === dep) && (loc === "All" || j.location === loc));

  return (
    <div className="section-container py-16">
      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Build the cognitive decade.</h1>
      <p className="mt-4 max-w-2xl text-lg text-text-secondary">22 open roles across firmware, optics, and research.</p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Select value={dep} onChange={setDep} options={departments} label="Department" />
        <Select value={loc} onChange={setLoc} options={locations} label="Location" />
      </div>

      <div className="mt-8 grid gap-4">
        {filtered.map((j, i) => (
          <motion.div key={j.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="flex flex-col gap-4 rounded-3xl border border-border-light bg-background p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs text-text-muted">{j.department}</div>
              <h3 className="mt-1 text-xl font-semibold">{j.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{j.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-text-muted"><MapPin className="h-3.5 w-3.5" />{j.location}</span>
                {j.tags.map((t) => <span key={t} className="rounded-full bg-surface-violet px-2 py-0.5 text-primary">{t}</span>)}
              </div>
            </div>
            <button onClick={() => setOpen(j)} className="self-start rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white magnetic">Apply</button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {open && <ApplyModal job={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="text-sm">
      <span className="mr-2 text-text-muted">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-full border border-border bg-background px-3 py-2 text-sm">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function ApplyModal({ job, onClose }: { job: typeof jobs[number]; onClose: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  const handleFile = (f: File) => {
    setFileName(f.name);
    setProgress(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { if (timer.current) clearInterval(timer.current); return 100; }
        return p + 7;
      });
    }, 80);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-background p-6 shadow-card-hover">
        <div className="flex items-start justify-between"><div><div className="text-xs text-text-muted">{job.department}</div><h3 className="text-xl font-bold">{job.title}</h3></div><button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface"><X className="h-4 w-4" /></button></div>
        {done ? (
          <div className="mt-6 rounded-2xl bg-surface-green p-5 text-accent-dark">Application received — talent team will reach out within 5 business days.</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mt-5 space-y-3">
            <input required placeholder="Full name" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <input required type="email" placeholder="Email" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <input required placeholder="LinkedIn / portfolio URL" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              className="block cursor-pointer rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-text-secondary hover:border-primary">
              <Upload className="mx-auto h-5 w-5 text-text-muted" />
              <div className="mt-2">{fileName ? fileName : "Drop your résumé (PDF) or click to upload"}</div>
              <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {fileName && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <motion.div className="h-full bg-gradient-primary" animate={{ width: `${progress}%` }} />
                </div>
              )}
            </label>
            <button disabled={!!fileName && progress < 100} className="w-full rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic disabled:opacity-50">Submit application</button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}