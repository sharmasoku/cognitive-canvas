import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Factory, GraduationCap, HeartPulse, Network } from "lucide-react";

interface TabItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  problem: string;
  solution: string;
  renderGraphic: () => React.ReactNode;
}

const TABS: TabItem[] = [
  {
    id: "health",
    icon: HeartPulse,
    label: "Healthcare",
    problem: "Radiology fatigue",
    solution: "Waveguide diagnostic overlays let radiologists spend 3× longer with imaging without eye strain.",
    renderGraphic: () => (
      <svg viewBox="0 0 200 200" className="h-full w-full stroke-primary/30" fill="none">
        <path d="M10,100 L40,100 L55,30 L70,170 L85,90 L95,110 L105,100 L190,100" strokeWidth="2" className="stroke-primary" />
        <circle cx="70" cy="170" r="6" fill="#7c3aed" className="animate-ping" />
        <circle cx="70" cy="170" r="3" fill="#7c3aed" />
        <rect x="110" y="30" width="70" height="50" rx="6" strokeDasharray="3 3" />
        <line x1="105" y1="100" x2="110" y2="55" strokeWidth="1" strokeDasharray="2 2" />
        <text x="120" y="60" fontSize="10" fill="currentColor" stroke="none" className="font-mono text-text-muted">98B-SCAN</text>
        <path d="M120,70 L170,70" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "edu",
    icon: GraduationCap,
    label: "Education",
    problem: "Abstract science",
    solution: "3D orbital, molecular, and anatomical models students can walk around — no lab burn.",
    renderGraphic: () => (
      <svg viewBox="0 0 200 200" className="h-full w-full stroke-secondary/35" fill="none">
        <circle cx="100" cy="100" r="60" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="35" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="12" fill="#2563eb" className="animate-pulse" stroke="none" />
        <motion.circle cx="100" cy="40" r="6" fill="#2563eb" stroke="none" animate={{ rotate: 360 }} style={{ originX: "100px", originY: "100px" }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
        <motion.circle cx="135" cy="100" r="4.5" fill="#10b981" stroke="none" animate={{ rotate: -360 }} style={{ originX: "100px", originY: "100px" }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
        <line x1="100" y1="100" x2="160" y2="100" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "mfg",
    icon: Factory,
    label: "Manufacturing",
    problem: "Hands-busy training",
    solution: "Live spatial guides project SOPs onto the work surface. Operators learn 41% faster.",
    renderGraphic: () => (
      <svg viewBox="0 0 200 200" className="h-full w-full stroke-primary/30" fill="none" strokeWidth="1.5">
        <path d="M40,50 L160,50 L130,150 L70,150 Z" strokeDasharray="3 3" />
        <path d="M60,75 L140,75 L120,135 L80,135 Z" className="stroke-accent" />
        <circle cx="100" cy="105" r="16" />
        <line x1="100" y1="50" x2="100" y2="150" strokeDasharray="2 2" />
        <line x1="40" y1="100" x2="160" y2="100" strokeDasharray="2 2" />
        <path d="M30,30 L50,30 M30,30 L30,50" />
        <path d="M170,170 L150,170 M170,170 L170,150" />
      </svg>
    ),
  },
  {
    id: "ent",
    icon: Network,
    label: "Enterprise",
    problem: "Display sprawl",
    solution: "Replace three monitors with eight spatial screens. Take your office to any chair.",
    renderGraphic: () => (
      <svg viewBox="0 0 200 200" className="h-full w-full stroke-primary/25" fill="none" strokeWidth="1.5">
        <rect x="20" y="55" width="55" height="40" rx="3" className="stroke-primary" />
        <rect x="85" y="45" width="70" height="50" rx="4" className="stroke-secondary" />
        <rect x="135" y="105" width="45" height="35" rx="3" className="stroke-accent" strokeWidth="1" />
        <rect x="40" y="115" width="60" height="40" rx="3" strokeDasharray="4 4" />
        <path d="M100,95 L135,120 M75,75 L85,70 M100,155 L135,122" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: "auto",
    icon: Car,
    label: "Automotive",
    problem: "Distracted driving",
    solution: "HUD navigation and ADAS warnings land directly in the driver's field of view.",
    renderGraphic: () => (
      <svg viewBox="0 0 200 200" className="h-full w-full stroke-accent/40" fill="none" strokeWidth="1.5">
        <path d="M30,160 L90,95 L110,95 L170,160" />
        <path d="M100,95 L100,160" strokeDasharray="5 5" />
        <path d="M60,130 L140,130" strokeDasharray="3 3" />
        <circle cx="100" cy="70" r="10" className="stroke-primary" />
        <polygon points="100,65 105,73 95,73" fill="#7c3aed" stroke="none" />
        <text x="118" y="74" fontSize="10" fill="currentColor" stroke="none" className="font-mono text-accent">50 m</text>
        <path d="M60,110 L80,105 L75,118 Z" className="stroke-primary" />
      </svg>
    ),
  },
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
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex items-center gap-3 shrink-0 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  active === t.id
                    ? "border-primary bg-background text-primary shadow-soft"
                    : "border-border-light bg-background/60 text-text-secondary hover:border-primary/40"
                }`}
              >
                <t.icon className="h-4 w-4" />{t.label}
              </button>
            ))}
          </div>

          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-border-light bg-background p-8 shadow-card md:p-12"
          >
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
            
            <div className="grid gap-8 md:grid-cols-[1fr_200px]">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-text-muted">Problem</div>
                <div className="mt-1 text-2xl font-semibold">{tab.problem}</div>
                <div className="mt-8 text-xs font-mono uppercase tracking-widest text-primary">TeleAR solution</div>
                <p className="mt-2 text-lg leading-relaxed text-foreground">{tab.solution}</p>
              </div>

              <div className="flex h-40 items-center justify-center rounded-2xl border border-border-light/40 bg-surface/30 p-4 md:h-full">
                {tab.renderGraphic()}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}