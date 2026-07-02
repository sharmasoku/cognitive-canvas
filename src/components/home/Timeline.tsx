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
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !lineRef.current || !dotRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Line progress animation
      gsap.fromTo(lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 0.5,
          }
        }
      );

      // Glowing dot tracer animation
      gsap.fromTo(dotRef.current,
        { y: 0, opacity: 0 },
        {
          y: () => {
            const h = containerRef.current?.getBoundingClientRect().height || 0;
            return h - 48; // offset to end of timeline path
          },
          opacity: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 0.5,
          }
        }
      );

      // Staggered card fade-up on scroll
      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            }
          }
        );
      });
    }, containerRef);

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

        <div ref={containerRef} className="relative">
          {/* Base timeline track */}
          <div className="absolute left-6 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-px" />
          
          {/* Active fill path */}
          <div ref={lineRef} className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2 md:-translate-x-px" style={{ transformOrigin: "top" }} />

          {/* Tracer dot */}
          <div
            ref={dotRef}
            className="glow-dot absolute left-6 top-0 z-20 h-3.5 w-3.5 -translate-x-1.5 rounded-full bg-primary md:left-1/2"
            style={{ transform: "translateX(-50%)" }}
          />

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
                  <div
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className={`ml-16 md:ml-0 ${right ? "md:col-start-2" : ""}`}
                  >
                    <TimelineCard index={i} title={n.title} body={n.body} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineCard({ title, body, index }: { title: string; body: string; index: number }) {
  return (
    <div className="rounded-2xl border border-border-light bg-background p-6 shadow-soft transition hover:shadow-card">
      <div className="text-xs font-mono uppercase tracking-widest text-text-muted">Step {String(index + 1).padStart(2, "0")}</div>
      <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{body}</p>
    </div>
  );
}