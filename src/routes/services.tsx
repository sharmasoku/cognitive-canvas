import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code2, Compass, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "TeleServices" }] }),
  component: ServicesPage,
});

interface Service {
  n: number;
  title: string;
  accent: string;
  icon: LucideIcon;
  tags?: string[];
  desc?: string;
}

const SERVICES: Service[] = [
  {
    n: 1,
    title: "TeleOrientation",
    accent: "#2563eb",
    icon: Compass,
    tags: ["TeleWatch", "TeleBook Live in Store"],
  },
  {
    n: 2,
    title: "Parijat Services",
    accent: "#7c3aed",
    icon: Code2,
    desc: "Solutions for any software issues in your TeleARGlass.",
  },
  {
    n: 3,
    title: "TeleMaintenance",
    accent: "#10b981",
    icon: Wrench,
    desc: "Repairs and servicing for your TeleARGlass once the warranty expires.",
  },
  {
    n: 4,
    title: "TeleSecurity",
    accent: "#ef4444",
    icon: ShieldCheck,
    desc: "Highly expert TeleARGlass cyber officials protect your device and neural data if a security threat is ever detected.",
  },
];

function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !lineRef.current || !dotRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Fill line grows as you scroll through the timeline
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 0.5,
          },
        },
      );

      // Glowing tracer dot travels down the line
      gsap.fromTo(
        dotRef.current,
        { y: 0, opacity: 0 },
        {
          y: () => (containerRef.current?.getBoundingClientRect().height || 0) - 48,
          opacity: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 0.5,
          },
        },
      );

      // Staggered card fade-up + badge pop as each node enters
      cardRefs.current.forEach((card, idx) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" },
            },
          );
        }
        const badge = badgeRefs.current[idx];
        if (badge) {
          gsap.fromTo(
            badge,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(1.8)",
              scrollTrigger: { trigger: badge, start: "top 88%", toggleActions: "play none none none" },
            },
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="orb" style={{ width: 600, height: 600, background: "#7c3aed", top: -150, left: -200, opacity: 0.12 }} />
      <div className="orb" style={{ width: 500, height: 500, background: "#10b981", bottom: -200, right: -150, opacity: 0.08 }} />

      {/* Hero */}
      <section className="section-container relative py-16 lg:py-20">
        <h1 className="text-5xl font-bold tracking-tight text-primary md:text-6xl">
          All Services
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Comprehensive TeleARGlass services for all your needs.
        </p>
      </section>

      {/* Services timeline */}
      <section className="section-container relative pb-24 lg:pb-32">
        <div ref={containerRef} className="relative mx-auto max-w-4xl">
          {/* Base track */}
          <div className="absolute left-6 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-px" />
          {/* Active gradient fill */}
          <div
            ref={lineRef}
            className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2 md:-translate-x-px"
            style={{ transformOrigin: "top" }}
          />
          {/* Tracer dot */}
          <div
            ref={dotRef}
            className="glow-dot absolute left-6 top-0 z-20 h-3.5 w-3.5 rounded-full bg-primary md:left-1/2"
            style={{ transform: "translateX(-50%)" }}
          />

          <ol className="relative space-y-12 lg:space-y-16">
            {SERVICES.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <li key={s.title} className="relative md:grid md:grid-cols-2 md:gap-12">
                  {/* Numbered node badge */}
                  <div className="absolute left-6 top-4 z-10 -translate-x-1/2 md:left-1/2">
                    <div
                      ref={(el) => { badgeRefs.current[i] = el; }}
                      className="grid h-12 w-12 place-items-center rounded-full text-lg font-bold text-white ring-4 ring-background"
                      style={{ backgroundColor: s.accent, boxShadow: `0 0 24px ${s.accent}66` }}
                    >
                      {s.n}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className={`ml-16 md:ml-0 ${right ? "md:col-start-2" : ""}`}
                  >
                    <ServiceCard service={s} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const { icon: Icon, title, tags, desc, accent } = service;
  return (
    <div
      className="group rounded-2xl border border-border-light bg-background p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>

      {tags && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${accent}12`, color: accent, borderColor: `${accent}33` }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {desc && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{desc}</p>}
    </div>
  );
}
