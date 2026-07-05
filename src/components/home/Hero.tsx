import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Play, Instagram, Linkedin } from "lucide-react";
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
  WebkitMaskImage: "radial-gradient(ellipse 68% 82% at 50% 46%, #000 54%, transparent 84%)",
  maskImage: "radial-gradient(ellipse 68% 82% at 50% 46%, #000 54%, transparent 84%)",
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
  const productX = useTransform(px, [-0.5, 0.5], [-8, 8]);
  const productMouseY = useTransform(py, [-0.5, 0.5], [-5, 5]);
  const wordmarkX = useTransform(px, [-0.5, 0.5], [5, -5]);

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
          <div
            className="orb -z-20"
            style={{
              width: 640,
              height: 640,
              background: "#7c3aed",
              top: -240,
              left: -200,
              opacity: 0.32,
            }}
          />
          <div
            className="orb -z-20"
            style={{
              width: 600,
              height: 600,
              background: "#2563eb",
              bottom: -260,
              right: -200,
              opacity: 0.28,
            }}
          />
          <div className="absolute inset-0 -z-20 bg-grid opacity-[0.10]" />
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_38%,rgba(124,58,237,0.20),transparent_62%)]" />
          {/* Bottom legibility gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 -z-20 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

          {/* Slight blur behind the background wordmark */}
          <div className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[2px]" />

          {/* One cohesive composition: visual zone (flex-1) + copy/CTA (auto).
              Height fills the viewport minus the announcement bar + navbar so the
              whole hero — including the buttons — is visible without scrolling. */}
          <div className="relative mx-auto flex min-h-[calc(100svh_-_7.5rem)] w-full max-w-[1500px] flex-col px-5 pt-6 pb-8 sm:px-8 sm:pt-8 lg:px-12">
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
                    {/* Soft radial glow behind the glasses */}
                    <div className="pointer-events-none absolute left-1/2 top-[45%] -z-10 h-[65%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.38)_0%,rgba(37,99,235,0.18)_50%,transparent_100%)] blur-[40px]" />

                    <img
                      src={heroProduct}
                      alt="TeleARGlass — next-generation AR eyewear"
                      width={760}
                      height={760}
                      style={FEATHER}
                      className="block max-h-[46vh] w-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.65)] lg:max-h-[56vh]"
                    />

                    {/* Visor pulsing glow highlight */}
                    <div className="pointer-events-none absolute left-1/2 top-[35%] h-[12%] w-[48%] rounded-full bg-primary/25 opacity-70 shadow-[0_0_30px_10px_rgba(124,58,237,0.35),0_0_50px_20px_rgba(37,99,235,0.2)] blur-md mix-blend-screen animate-pulse-glow" />

                    {/* Soft visor light sweep, clipped + feathered to the product */}
                    <div
                      style={FEATHER}
                      className="pointer-events-none absolute inset-0 overflow-hidden"
                    >
                      <div className="animate-visor-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    </div>
                  </div>

                  {/* Soft floor shadow under the model */}
                  <div className="pointer-events-none absolute -bottom-8 left-1/2 h-5 w-[65%] rounded-full bg-black/60 blur-xl animate-shadow" />
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
                We are functioning sustainable innovation by building the user-friendly TeleARGlass
                Minimum Viable Products.
              </p>
              <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                <Link
                  to="/products"
                  className="cta-button-premium inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-7 py-3 text-sm font-semibold text-white sm:w-auto"
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

              {/* Social Links */}
              <div
                className="mt-4 flex items-center justify-center gap-4 animate-fade-in"
                style={{ animationDelay: "1.1s" }}
              >
                <a
                  href="https://www.linkedin.com/in/jayeshpateltelearglass/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:scale-110 hover:border-[#0a66c2] hover:bg-[#0a66c2]/10 hover:text-[#0a66c2] hover:shadow-[0_0_15px_rgba(10,102,194,0.4)]"
                >
                  <Linkedin className="h-4.5 w-4.5" />
                </a>
                <a
                  href="https://wa.me/917862939627"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:scale-110 hover:border-[#25d366] hover:bg-[#25d366]/10 hover:text-[#25d366] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)]"
                >
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/telearglass"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:scale-110 hover:border-[#e1306c] hover:bg-[#e1306c]/10 hover:text-[#e1306c] hover:shadow-[0_0_15px_rgba(225,48,108,0.4)]"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
