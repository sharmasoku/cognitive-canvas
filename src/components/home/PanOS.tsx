import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Briefcase, Code2, Heart, Home, PencilRuler } from "lucide-react";

const NODES = [
  { id: "home", label: "Smart Home", icon: Home, angle: -90, body: "Lights, AC, locks — by intention." },
  { id: "health", label: "Healthcare", icon: Heart, angle: -30, body: "Diagnostic maps and patient-bedside overlays." },
  { id: "work", label: "Productivity", icon: Briefcase, angle: 30, body: "Silent typing, spatial dashboards, calm focus." },
  { id: "cad", label: "CAD & Design", icon: PencilRuler, angle: 90, body: "Manipulate 3D models with neural pinch." },
  { id: "dev", label: "Developer SDK", icon: Code2, angle: 150, body: "Ship your own TeleOS apps in days." },
  { id: "edu", label: "Education", icon: Brain, angle: 210, body: "3D orbital labs, hands-on without lab burn." },
];

function pointOnCircle(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

export function PanOS() {
  const [active, setActive] = useState<string>("work");
  const activeNode = NODES.find((n) => n.id === active)!;

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="orb" style={{ width: 600, height: 600, background: "#2563eb", top: -100, right: -200, opacity: 0.18 }} />
      <div className="section-container">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary">PanOS Ecosystem</span>
            <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">One mind, every surface.</h2>
            <p className="mt-4 text-text-secondary">TeleOS connects your cortex to the devices you already use. Hover the nodes to see which surfaces light up.</p>

            {/* Active node description card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-8 rounded-2xl border border-border-light bg-background p-6 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-violet text-primary">
                    <activeNode.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{activeNode.label}</div>
                    <div className="text-sm text-text-secondary">{activeNode.body}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Node constellation */}
          <div className="relative aspect-square w-full max-w-[520px] mx-auto">
            <svg viewBox="-260 -260 520 520" className="absolute inset-0 h-full w-full">
              {/* Connection lines with animated gradient trace */}
              {NODES.map((n) => {
                const p = pointOnCircle(n.angle, 200);
                const isActive = active === n.id;
                return (
                  <g key={n.id}>
                    {/* Base line */}
                    <line
                      x1="0" y1="0" x2={p.x} y2={p.y}
                      stroke="rgba(124,58,237,0.12)"
                      strokeWidth={1}
                    />
                    {/* Active gradient overlay with transition */}
                    <motion.line
                      x1="0" y1="0" x2={p.x} y2={p.y}
                      stroke="url(#panos-linkg)"
                      strokeWidth={2}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </g>
                );
              })}
              <defs>
                <linearGradient id="panos-linkg" x1="0" x2="1"><stop offset="0" stopColor="#7c3aed" /><stop offset="1" stopColor="#10b981" /></linearGradient>
              </defs>
              <circle cx="0" cy="0" r="220" fill="none" stroke="rgba(124,58,237,0.08)" strokeDasharray="4 6" />
              <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(124,58,237,0.06)" strokeDasharray="4 6" />
            </svg>

            {/* Center brain node with pulse */}
            <motion.div
              className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-primary shadow-glow-primary"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="h-10 w-10 text-white" strokeWidth={1.5} />
            </motion.div>

            {/* Peripheral node buttons with labels */}
            {NODES.map((n) => {
              const p = pointOnCircle(n.angle, 200);
              const isActive = active === n.id;
              return (
                <div
                  key={n.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)` }}
                >
                  <button
                    onMouseEnter={() => setActive(n.id)}
                    onFocus={() => setActive(n.id)}
                    aria-label={n.label}
                    className={`grid h-14 w-14 place-items-center rounded-2xl border transition-all duration-300 ${isActive ? "border-primary bg-background shadow-card-hover scale-110" : "border-border bg-background shadow-soft hover:border-primary/40"}`}
                  >
                    <n.icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-text-secondary"}`} />
                  </button>
                  <div className={`mt-1.5 text-center text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-text-muted"}`}>
                    {n.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}