import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
// TODO: replace hero-glasses.png with a transparent-background cutout PNG of the
// product for the truest match to the reference (drop-in: overwrite this file or
// repoint this single import).
import heroProduct from "@/assets/hero-glasses.png";
import { DemoModal } from "@/components/shell/DemoModal";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Radial feather so the rectangular product photo melts into the dark stage.
// Biased upward (40%) with a tight vertical ellipse to spotlight the glasses
// and let the lower face fade out — no visible rectangle, no cropping.
const FEATHER = {
  WebkitMaskImage:
    "radial-gradient(ellipse 68% 82% at 50% 46%, #000 54%, transparent 84%)",
  maskImage:
    "radial-gradient(ellipse 68% 82% at 50% 46%, #000 54%, transparent 84%)",
} as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  // Scroll parallax: product drifts up, wordmark drifts down — subtle depth.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const productScrollY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const wordmarkScrollY = useTransform(scrollYProgress, [0, 1], [0, 28]);

  // Very small mouse parallax (desktop pointer only).
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const px = useSpring(mvX, { stiffness: 70, damping: 22 });
  const py = useSpring(mvY, { stiffness: 70, damping: 22 });
  const productX = useTransform(px, [-0.5, 0.5], [-14, 14]);
  const productMouseY = useTransform(py, [-0.5, 0.5], [-10, 10]);
  const wordmarkX = useTransform(px, [-0.5, 0.5], [10, -10]);

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mvX.set((e.clientX - r.left) / r.width - 0.5);
    mvY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  return (
    <>
      <section
        ref={sectionRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="w-full"
      >
        {/* Always-dark editorial stage (independent of site light/dark theme) */}
        <div className="relative isolate w-full overflow-hidden bg-gradient-dark text-white">
          {/* --- Background layers --- */}
          <div className="orb" style={{ width: 640, height: 640, background: "#7c3aed", top: -240, left: -200, opacity: 0.32 }} />
          <div className="orb" style={{ width: 600, height: 600, background: "#2563eb", bottom: -260, right: -200, opacity: 0.28 }} />
          <div className="absolute inset-0 -z-0 bg-grid opacity-[0.10]" />
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_50%_38%,rgba(124,58,237,0.20),transparent_62%)]" />
          {/* Bottom legibility gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

          {/* One cohesive composition: visual zone (flex-1) + copy/CTA (auto).
              Height fills the viewport minus the announcement bar + navbar so the
              whole hero — including the buttons — is visible without scrolling. */}
          <div className="relative mx-auto flex min-h-[calc(100svh_-_9rem)] w-full max-w-[1500px] flex-col px-5 pt-6 pb-8 sm:px-8 sm:pt-8 lg:px-12">
            {/* ---------- VISUAL ZONE ---------- */}
            <div className="relative flex flex-1 flex-col items-center justify-center">
              {/* Ghost wordmark — largest surface, faintest ink, sits behind all */}
              <motion.h1
                aria-label="TeleARGlass"
                style={{ y: wordmarkScrollY, x: wordmarkX }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
                className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 select-none text-center font-heading font-extrabold uppercase leading-[0.78] tracking-[-0.03em] text-white/[0.12]"
              >
                <span className="block text-[clamp(3.5rem,23vw,19rem)]">TeleAR</span>
                <span className="block text-[clamp(3.5rem,23vw,19rem)]">Glass</span>
              </motion.h1>

              {/* Desktop script accents — flank the product (lg+ only) */}
              <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
                <motion.span
                  initial={{ opacity: 0, x: -24, rotate: -6 }}
                  animate={{ opacity: 1, x: 0, rotate: -6 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
                  className="absolute left-[3%] top-[30%] font-script text-7xl font-bold text-[#a78bfa] drop-shadow-[0_2px_16px_rgba(124,58,237,0.45)] xl:text-8xl"
                >
                  Serving
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: 24, rotate: 4 }}
                  animate={{ opacity: 1, x: 0, rotate: 4 }}
                  transition={{ delay: 0.62, duration: 0.7, ease: EASE }}
                  className="absolute right-[3%] top-[30%] font-script text-7xl font-bold text-[#a78bfa] drop-shadow-[0_2px_16px_rgba(124,58,237,0.45)] xl:text-8xl"
                >
                  Humanity
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.78, duration: 0.7, ease: EASE }}
                  className="absolute bottom-[14%] left-[7%] font-script text-4xl font-medium text-white/90 xl:text-5xl"
                >
                  Through
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.86, duration: 0.7, ease: EASE }}
                  className="absolute bottom-[14%] right-[7%] text-right font-script text-4xl font-medium text-white/90 xl:text-5xl"
                >
                  Technology.
                </motion.span>
              </div>

              {/* Mobile / tablet script — stacked above the product (below lg) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7, ease: EASE }}
                className="relative z-10 mb-1 text-center lg:hidden"
              >
                <div className="font-script text-[clamp(2.75rem,13vw,5rem)] font-bold leading-[0.9] text-[#a78bfa] drop-shadow-[0_2px_14px_rgba(124,58,237,0.4)]">
                  Serving Humanity
                </div>
              </motion.div>

              {/* Floating product — front, centre, the clear focal point */}
              <motion.div
                style={{ y: productScrollY }}
                className="relative z-20 flex items-center justify-center"
              >
                <motion.div
                  style={{ x: productX, y: productMouseY }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 1, ease: EASE }}
                  className="relative w-[min(84vw,760px)]"
                >
                  <div className="animate-float relative">
                    <img
                      src={heroProduct}
                      alt="TeleARGlass — next-generation AR eyewear"
                      width={760}
                      height={760}
                      style={FEATHER}
                      className="block max-h-[46vh] w-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.65)] lg:max-h-[56vh]"
                    />
                    {/* Soft visor light sweep, clipped + feathered to the product */}
                    <div
                      style={FEATHER}
                      className="pointer-events-none absolute inset-0 overflow-hidden"
                    >
                      <div className="animate-visor-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Mobile / tablet script — stacked below the product (below lg) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
                className="relative z-20 mt-1 text-center lg:hidden"
              >
                <div className="font-script text-[clamp(1.75rem,7vw,2.75rem)] font-medium text-white/90">
                  Through Technology.
                </div>
              </motion.div>
            </div>

            {/* ---------- COPY + CTA (always in view) ---------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.6, ease: EASE }}
              className="relative z-20 mt-4 flex flex-col items-center gap-4 text-center sm:mt-6"
            >
              <p className="max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
                We are functioning sustainable innovation by building the user-friendly TeleARGlass Minimum Viable Products.
              </p>
              <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                <Link
                  to="/products"
                  className="magnetic inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-7 py-3 text-sm font-semibold text-white shadow-glow-primary sm:w-auto"
                >
                  Telepurchase now <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 transition-shadow hover:shadow-glow-primary">
                    <Play className="h-3.5 w-3.5" />
                  </span>
                  Watch demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
