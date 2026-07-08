import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code2, Compass, ShieldCheck, Wrench, X, type LucideIcon } from "lucide-react";
import demoVideo from "@/assets/demo-video.mp4";

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
    accent: "#1016FF",
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
    desc: "Highly expert TeleARGlass cyber officials protect your device and check given site if a security threat is ever detected.",
  },
];

/* ---------- Leaf SVG shape clip paths ---------- */
// A realistic botanical leaf shape as an SVG path (tip on right, petiole on left)
const LEAF_PATH_RIGHT = "M 0 50 C 5 20, 30 0, 60 0 C 80 0, 95 15, 100 50 C 95 85, 80 100, 60 100 C 30 100, 5 80, 0 50 Z";
const LEAF_PATH_LEFT = "M 100 50 C 95 20, 70 0, 40 0 C 20 0, 5 15, 0 50 C 5 85, 20 100, 40 100 C 70 100, 95 80, 100 50 Z";

// Vein paths for right-pointing leaf
const VEINS_RIGHT = [
  "M 8 50 C 30 50, 60 50, 95 50",               // midrib
  "M 25 50 C 35 35, 50 25, 68 20",               // upper secondary 1
  "M 45 50 C 55 38, 65 30, 80 26",               // upper secondary 2
  "M 65 50 C 72 40, 80 35, 90 34",               // upper secondary 3
  "M 25 50 C 35 65, 50 75, 68 80",               // lower secondary 1
  "M 45 50 C 55 62, 65 70, 80 74",               // lower secondary 2
  "M 65 50 C 72 60, 80 65, 90 66",               // lower secondary 3
];

// Vein paths for left-pointing leaf (mirrored)
const VEINS_LEFT = [
  "M 92 50 C 70 50, 40 50, 5 50",
  "M 75 50 C 65 35, 50 25, 32 20",
  "M 55 50 C 45 38, 35 30, 20 26",
  "M 35 50 C 28 40, 20 35, 10 34",
  "M 75 50 C 65 65, 50 75, 32 80",
  "M 55 50 C 45 62, 35 70, 20 74",
  "M 35 50 C 28 60, 20 65, 10 66",
];

function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Separated desktop and mobile ref tracking to prevent collision/cleanup overrides
  const desktopCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Leaf sprouting entrance (Desktop)
      desktopCardRefs.current.forEach((card) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, scale: 0.7, y: 40 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 1,
              ease: "back.out(1.4)",
              scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" },
            },
          );
        }
      });

      // Leaf sprouting entrance (Mobile)
      mobileCardRefs.current.forEach((card) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, scale: 0.7, y: 40 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 1,
              ease: "back.out(1.4)",
              scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" },
            },
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative overflow-hidden bg-background min-h-screen pb-24">
      {/* CSS floating animations */}
      <style>{`
        :root {
          --item-height: 190px;
        }
        @media (min-width: 640px) {
          :root {
            --item-height: 230px;
          }
        }
        @media (min-width: 768px) {
          :root {
            --item-height: 280px;
          }
        }
        @keyframes float-leaf-1 {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(6deg) scale(1.04); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-leaf-2 {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-22px) rotate(-8deg) scale(0.96); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float-1 { animation: float-leaf-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-leaf-2 11s ease-in-out infinite; }
      `}</style>

      {/* Floating background leaves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg className="absolute top-24 left-10 w-14 h-14 text-primary/8 animate-float-1" viewBox="0 0 100 100" fill="currentColor">
          <path d={LEAF_PATH_RIGHT} />
        </svg>
        <svg className="absolute top-1/3 right-12 w-18 h-18 text-[#10b981]/10 animate-float-2" viewBox="0 0 100 100" fill="currentColor">
          <path d={LEAF_PATH_LEFT} />
        </svg>
        <svg className="absolute top-2/3 left-16 w-20 h-20 text-[#1016FF]/8 animate-float-1" viewBox="0 0 100 100" fill="currentColor">
          <path d={LEAF_PATH_RIGHT} />
        </svg>
        <svg className="absolute bottom-20 right-20 w-14 h-14 text-[#ef4444]/8 animate-float-2" viewBox="0 0 100 100" fill="currentColor">
          <path d={LEAF_PATH_LEFT} />
        </svg>
      </div>

      {/* Ambient orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: "#1016FF", top: -150, left: -200, opacity: 0.08 }} />
      <div className="orb" style={{ width: 500, height: 500, background: "#10b981", bottom: -200, right: -150, opacity: 0.05 }} />

      {/* Hero Header */}
      <section className="section-container relative py-16 lg:py-20 text-center z-10">
        <h1 className="text-5xl font-bold tracking-tight text-primary md:text-6xl">
          All Services
        </h1>
        <p className="mt-4 mx-auto max-w-2xl text-lg text-text-secondary">
          Comprehensive TeleARGlass services for all your needs.
        </p>
      </section>

      {/* Services timeline */}
      <section className="section-container relative z-10">
        <div
          ref={containerRef}
          className="relative mx-auto max-w-5xl"
          style={{ height: "calc(var(--item-height) * 4 + 40px)" }}
        >

          {/* Main tree trunk - thicker with bark texture - centered on all screen sizes */}
          <div className="absolute left-1/2 -translate-x-[4px] top-0 bottom-[40px] w-[8px] rounded-full overflow-hidden">
            {/* Bark base */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, #5c3d2e 0%, #8B6914 25%, #6B4226 50%, #8B6914 75%, #5c3d2e 100%)",
              }}
            />
            {/* Bark texture grain overlay */}
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  180deg,
                  transparent 0px,
                  rgba(0,0,0,0.08) 2px,
                  transparent 4px,
                  rgba(255,255,255,0.05) 6px,
                  transparent 8px
                )`,
              }}
            />
          </div>

          <ol className="relative m-0 p-0 list-none h-full animate-sprout">
            {SERVICES.map((s, i) => {
              const isLeft = i % 2 === 0;

              return (
                <li
                  key={s.title}
                  className="absolute w-full left-0 md:h-[280px]"
                  style={{ top: `calc(var(--item-height) * ${i})`, height: "var(--item-height)" }}
                >
                  {/* Left Leaf Card & Branch */}
                  {isLeft && (
                    <>
                      {/* Left Leaf Card */}
                      <div
                        ref={(el) => { desktopCardRefs.current[i] = el; }}
                        className="absolute right-[calc(50%+12px)] sm:right-[calc(50%+25px)] md:right-[calc(50%+40px)] bottom-[40px] w-[160px] sm:w-[220px] md:w-[440px] h-[150px] sm:h-[190px] md:h-[260px]"
                      >
                        <LeafCard service={s} side="left" cardId="main" onWatchDemo={() => setShowVideoModal(true)} />
                      </div>

                      {/* Left Branch */}
                      <svg
                        className="absolute right-1/2 bottom-[40px] w-[12px] sm:w-[25px] md:w-[40px] h-[85px] sm:h-[105px] md:h-[140px] overflow-visible pointer-events-none"
                        viewBox="0 0 40 140"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        {/* Branch with bark-like fill */}
                        <path d="M 40 110 C 35 70, 20 25, 0 10" stroke="url(#branchGrad)" strokeWidth="5" strokeLinecap="round" />
                        <path d="M 40 110 C 35 70, 20 25, 0 10" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="branchGrad" x1="40" y1="110" x2="0" y2="10">
                            <stop offset="0%" stopColor="#6B4226" />
                            <stop offset="100%" stopColor="#4a7c59" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </>
                  )}

                  {/* Stem node bud */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[40px] z-10">
                    <div
                      className="h-5 w-5 rounded-full border-[3px]"
                      style={{
                        borderColor: "#5c3d2e",
                        background: `radial-gradient(circle at 40% 40%, #a3e635, #4ade80, #16a34a)`,
                        boxShadow: "0 0 8px rgba(74,222,128,0.4)",
                      }}
                    />
                  </div>

                  {/* Right Leaf Card & Branch */}
                  {!isLeft && (
                    <>
                      {/* Right Leaf Card */}
                      <div
                        ref={(el) => { desktopCardRefs.current[i] = el; }}
                        className="absolute left-[calc(50%+12px)] sm:left-[calc(50%+25px)] md:left-[calc(50%+40px)] bottom-[40px] w-[160px] sm:w-[220px] md:w-[440px] h-[150px] sm:h-[190px] md:h-[260px]"
                      >
                        <LeafCard service={s} side="right" cardId="main" onWatchDemo={() => setShowVideoModal(true)} />
                      </div>

                      {/* Right Branch */}
                      <svg
                        className="absolute left-1/2 bottom-[40px] w-[12px] sm:w-[25px] md:w-[40px] h-[85px] sm:h-[105px] md:h-[140px] overflow-visible pointer-events-none"
                        viewBox="0 0 40 140"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <path d="M 0 110 C 5 70, 20 25, 40 10" stroke="url(#branchGradR)" strokeWidth="5" strokeLinecap="round" />
                        <path d="M 0 110 C 5 70, 20 25, 40 10" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="branchGradR" x1="0" y1="110" x2="40" y2="10">
                            <stop offset="0%" stopColor="#6B4226" />
                            <stop offset="100%" stopColor="#4a7c59" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Video Modal Popup */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            setShowVideoModal(false);
          }}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="absolute right-4 top-4 z-50 rounded-full p-2.5 bg-black/60 text-white/90 hover:bg-black/90 hover:scale-110 transition cursor-pointer"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video Element */}
            <video
              src={demoVideo}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Premium Botanical Leaf Card
   ================================================================ */
function LeafCard({ 
  service, 
  side, 
  cardId, 
  onWatchDemo 
}: { 
  service: Service; 
  side: "left" | "right"; 
  cardId: string; 
  onWatchDemo?: () => void; 
}) {
  const { icon: Icon, title, tags, desc } = service;

  const leafPath = side === "left" ? LEAF_PATH_LEFT : LEAF_PATH_RIGHT;
  const veins = side === "left" ? VEINS_LEFT : VEINS_RIGHT;
  const clipId = `leaf-clip-${side}-${title.replace(/\s/g, "")}-${cardId}`;

  // Gradient IDs made 100% unique per card type (desktop/mobile)
  const gradId = `leaf-grad-${side}-${title.replace(/\s/g, "")}-${cardId}`;
  const highlightId = `leaf-highlight-${side}-${title.replace(/\s/g, "")}-${cardId}`;

  return (
    <div className="relative w-full h-full group cursor-default">
      <svg
        className="absolute inset-0 w-full h-full drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-xl"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Clip path from leaf shape */}
          <clipPath id={clipId}>
            <path d={leafPath} />
          </clipPath>

          {/* Main gradient fill */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="25%" stopColor="#bbf7d0" />
            <stop offset="50%" stopColor="#86efac" />
            <stop offset="75%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          {/* Specular highlight */}
          <radialGradient id={highlightId} cx={side === "left" ? "65%" : "35%"} cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Leaf base fill */}
        <path d={leafPath} fill={`url(#${gradId})`} />

        {/* Highlight overlay for depth */}
        <path d={leafPath} fill={`url(#${highlightId})`} />

        {/* Leaf edge outline for crispness */}
        <path
          d={leafPath}
          fill="none"
          stroke="#16a34a"
          strokeWidth="0.6"
          opacity="0.5"
        />

        {/* Botanical veins */}
        <g clipPath={`url(#${clipId})`} opacity="0.22">
          {veins.map((d, vi) => (
            <path
              key={vi}
              d={d}
              fill="none"
              stroke="#15803d"
              strokeWidth={vi === 0 ? "0.8" : "0.45"}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Soft inner shadow along edges */}
        <path
          d={leafPath}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="2"
          clipPath={`url(#${clipId})`}
        />
      </svg>

      {/* Content layer - centered inside leaf */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center z-10"
        style={{
          padding: side === "left"
            ? "8px 14% 8px 10%"
            : "8px 10% 8px 14%",
        }}
      >
        {/* Icon */}
        <div
          className="grid h-8 w-8 sm:h-11 sm:w-11 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 shrink-0"
          style={{
            backgroundColor: "rgba(255,255,255,0.7)",
            color: "#1016FF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Icon className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
        </div>

        {/* Title */}
        <h3
          className="mt-1 sm:mt-2 text-xs sm:text-base md:text-xl font-extrabold font-heading leading-tight"
          style={{ color: "#1016FF" }}
        >
          {title}
        </h3>

        {/* Description */}
        {desc && (
          <p
            className="mt-1 text-[9px] sm:text-xs md:text-sm leading-snug max-w-[90%] font-semibold"
            style={{ color: "#1016FF" }}
          >
            {desc}
          </p>
        )}

        {/* Tags */}
        {tags && (
          <div className="mt-1.5 sm:mt-2.5 flex flex-wrap justify-center gap-1.5 z-20">
            {tags.map((t) => {
              if (t === "TeleWatch") {
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onWatchDemo) onWatchDemo();
                    }}
                    className="rounded-full px-2 py-0.5 text-[8px] sm:text-[10px] md:text-xs font-bold transition hover:scale-105 hover:bg-white active:scale-95 cursor-pointer"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.75)",
                      color: "#1016FF",
                      border: "1px solid rgba(27,45,107,0.2)",
                      backdropFilter: "blur(4px)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    {t}
                  </button>
                );
              }
              if (t === "TeleBook Live in Store") {
                return (
                  <Link
                    key={t}
                    to="/products"
                    className="rounded-full px-2 py-0.5 text-[8px] sm:text-[10px] md:text-xs font-bold transition hover:scale-105 hover:bg-white active:scale-95 cursor-pointer no-underline"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.75)",
                      color: "#1016FF",
                      border: "1px solid rgba(27,45,107,0.2)",
                      backdropFilter: "blur(4px)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    {t}
                  </Link>
                );
              }
              return (
                <span
                  key={t}
                  className="rounded-full px-2 py-0.5 text-[8px] sm:text-[10px] md:text-xs font-bold"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.75)",
                    color: "#1016FF",
                    border: "1px solid rgba(27,45,107,0.2)",
                    backdropFilter: "blur(4px)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
