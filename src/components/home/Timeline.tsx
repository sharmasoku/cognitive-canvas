import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, Brain, Cpu, Eye } from "lucide-react";

const NODES = [
  { icon: Brain, title: "Human thought", body: "You imagine pressing send. Frontal motor cortex fires." },
  { icon: Activity, title: "Brain signal wave", body: "16 dry EEG sensors capture the micro-voltage in 4 ms windows." },
  { icon: Cpu, title: "TeleOS processing", body: "On-device neural decoders translate the signal into an intent token." },
  { icon: Eye, title: "AR holographic output", body: "Waveguide lens projects the result into the world around you." },
];

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current || !lineRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current,
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: "top",
          scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 30%", scrub: 1 } });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden bg-surface py-24 lg:py-32">
      <div className="orb" style={{ width: 500, height: 500, background: "#7c3aed", top: 100, left: -200, opacity: 0.2 }} />
      <div className="section-container">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-primary">Workflow</span>
          <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">Scroll through the full loop.</h2>
          <p className="mt-4 text-text-secondary">From the first spark in the cortex to the photon in front of your eye — in under 180 ms.</p>
        </div>

        <div ref={ref} className="relative">
          <div className="absolute left-6 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-px" />
          <div ref={lineRef} className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2 md:-translate-x-px" style={{ transformOrigin: "top" }} />

          <ol className="relative space-y-16">
            {NODES.map((n, i) => {
              const right = i % 2 === 1;
              return (
                <li key={n.title} className="relative md:grid md:grid-cols-2 md:gap-12">
                  <div className="absolute left-6 top-3 z-10 -translate-x-1/2 md:left-1/2">
                    <div className="grid h-12 w-12 place-items-center rounded-full border border-primary/30 bg-background shadow-glow-primary">
                      <n.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <TimelineCard className={`ml-16 md:ml-0 ${right ? "md:col-start-2" : ""}`} title={n.title} body={n.body} index={i} />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineCard({ title, body, index, className }: { title: string; body: string; index: number; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border-light bg-background p-6 shadow-soft ${className ?? ""}`}>
      <div className="text-xs font-mono uppercase tracking-widest text-text-muted">Step {String(index + 1).padStart(2, "0")}</div>
      <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{body}</p>
    </div>
  );
}