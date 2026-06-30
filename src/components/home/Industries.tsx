import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Factory, GraduationCap, HeartPulse, Network } from "lucide-react";

const TABS = [
  { id: "health", icon: HeartPulse, label: "Healthcare", problem: "Radiology fatigue", solution: "Waveguide diagnostic overlays let radiologists spend 3× longer with imaging without eye strain." },
  { id: "edu", icon: GraduationCap, label: "Education", problem: "Abstract science", solution: "3D orbital, molecular, and anatomical models students can walk around — no lab burn." },
  { id: "mfg", icon: Factory, label: "Manufacturing", problem: "Hands-busy training", solution: "Live spatial guides project SOPs onto the work surface. Operators learn 41% faster." },
  { id: "ent", icon: Network, label: "Enterprise", problem: "Display sprawl", solution: "Replace three monitors with eight spatial screens. Take your office to any chair." },
  { id: "auto", icon: Car, label: "Automotive", problem: "Distracted driving", solution: "HUD navigation and ADAS warnings land directly in the driver's field of view." },
];

export function Industries() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section className="bg-surface py-24 lg:py-32">
      <div className="section-container">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-primary">Industries</span>
          <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">Built for every domain that thinks at scale.</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActive(t.id)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${active === t.id ? "border-primary bg-background text-primary shadow-soft" : "border-border-light bg-background/60 text-text-secondary hover:border-primary/40"}`}>
                <t.icon className="h-4 w-4" />{t.label}
              </button>
            ))}
          </div>
          <motion.div key={tab.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative overflow-hidden rounded-3xl border border-border-light bg-background p-8 shadow-card md:p-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
            <div className="text-xs font-mono uppercase tracking-widest text-text-muted">Problem</div>
            <div className="mt-1 text-2xl font-semibold">{tab.problem}</div>
            <div className="mt-8 text-xs font-mono uppercase tracking-widest text-primary">TeleAR solution</div>
            <p className="mt-2 text-lg leading-relaxed text-foreground">{tab.solution}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}