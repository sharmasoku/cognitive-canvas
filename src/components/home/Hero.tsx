import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import heroPersonCutout from "@/assets/hero-person-cutout.png";
import { DemoModal } from "@/components/shell/DemoModal";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  // Very small mouse parallax (desktop pointer only).
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const px = useSpring(mvX, { stiffness: 70, damping: 22 });
  const py = useSpring(mvY, { stiffness: 70, damping: 22 });
  const productX = useTransform(px, [-0.5, 0.5], [-8, 8]);
  const productMouseY = useTransform(py, [-0.5, 0.5], [-5, 5]);

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
        {/* Cohesive background layout matches the screenshot:
            Left: soft violet glow, Center: clean white, Right: soft cyan-blue glow.
            Added pt-12 (on mobile) to prevent collision with the navbar. */}
        <div className="relative isolate w-full overflow-hidden bg-gradient-to-r from-[#F4EFFF] via-[#FFFFFF] to-[#F0F7FF] text-gray-900 pt-12 pb-16 md:pt-14 md:pb-24 lg:pt-16 lg:pb-28 min-h-[calc(100vh-80px)] flex items-center">
          {/* --- Background Ambient Glow Orbs --- */}
          <div
            className="orb -z-20 animate-pulse"
            style={{
              width: 580,
              height: 580,
              background: "#1016FF",
              top: "10%",
              left: "-15%",
              opacity: 0.15,
            }}
          />
          <div
            className="orb -z-20 animate-pulse"
            style={{
              width: 540,
              height: 540,
              background: "#0ea5e9",
              bottom: "10%",
              right: "-15%",
              opacity: 0.12,
            }}
          />
          <div className="absolute inset-0 -z-20 bg-grid opacity-[0.03]" />
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_38%,rgba(27,45,107,0.04),transparent_62%)]" />

          {/* Main Layout Container */}
          <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
            {/* Horizontal column gap optimized at gap-10 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

              {/* Left Column (70% split on 12-column grid: col-span-8) - Styled with flex-col items-center */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="col-span-1 lg:col-span-8 flex flex-col items-center text-center z-10 w-full overflow-visible"
              >
                {/* Main Heading "TELEARGLASS" - sized appropriately to avoid overlap clipping and shifted upward.
                    Changed negative margin to -mt-2 on mobile and -mt-12 on desktop to prevent navbar collision.
                    Set responsive clamp text size to fit cleanly on phone screens with enhanced visibility. */}
                <h1 className="font-display font-bold uppercase tracking-tight text-[clamp(3rem,11.5vw,7.2rem)] leading-[1.1] py-2 mb-3 bg-gradient-to-r from-[#1016FF] via-[#2a4090] to-[#1016FF] bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(27,45,107,0.22)] -mt-2 lg:-mt-12 w-full text-center overflow-visible select-none">
                  TELEARGLASS
                </h1>

                {/* Subtitle in Title Case (center aligned) - responsive text sizes to fit mobile */}
                <h2 className="font-sans font-bold tracking-tight text-[#1016FF] text-[clamp(1.2rem,4vw,1.65rem)] leading-tight mb-4 w-full text-center max-w-3xl">
                  Serving Humanity Through Technology
                </h2>

                {/* Description (center aligned) - text-sm on mobile, text-lg on desktop */}
                <p className="max-w-3xl text-sm sm:text-lg text-gray-600 leading-relaxed font-normal mb-6 text-center mx-auto">
                  We are functioning sustainable innovation by building the user-friendly TeleARGlass
                  Minimum Viable Products.
                </p>

                {/* CTAs (center aligned) - equalized widths for perfect visual balance */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mx-auto">
                  <Link
                    to="/products"
                    className="cta-button-premium inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#1016FF] via-[#2a4090] to-[#1016FF] py-5 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#1016FF]/25 w-full sm:w-[230px]"
                  >
                    Telepurchase now <ArrowRight className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => setDemoOpen(true)}
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-[#1016FF]/15 bg-[#1016FF]/5 py-5 text-base font-semibold text-[#1016FF] transition-all duration-300 hover:scale-[1.03] hover:bg-[#1016FF]/10 hover:border-[#1016FF]/35 hover:shadow-lg hover:shadow-[#1016FF]/5 group w-full sm:w-[230px]"
                  >
                    <Play className="h-5 w-5 text-[#1016FF] fill-[#1016FF]/10 transition-transform duration-300 group-hover:scale-110" />
                    Watch demo
                  </button>
                </div>
              </motion.div>

              {/* Right Column (30% split on 12-column grid: col-span-4) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="col-span-1 lg:col-span-4 flex justify-center z-10 w-full relative"
              >
                {/* Responsive top margin to offset spacing on mobile (mt-4 lg:-mt-8) */}
                <div className="relative w-full max-w-[380px] aspect-[4/5] flex items-center justify-center mt-4 lg:-mt-8">

                  {/* Premium visual tech rings in the background */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="absolute w-[95%] h-[95%] rounded-full border border-[#1016FF]/15 -z-10"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
                    className="absolute w-[85%] h-[85%] rounded-full border border-indigo-500/5 border-dashed -z-10"
                  />

                  {/* Solid glowing background orb to highlight the person */}
                  <div className="absolute w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#1016FF]/15 to-[#2563eb]/15 blur-3xl -z-10 animate-pulse" />

                  {/* Cutout image container with high-fidelity drop-shadow */}
                  <motion.div
                    style={{ x: productX, y: productMouseY }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={heroPersonCutout}
                      alt="TeleARGlass Prototype View"
                      className="max-h-[52vh] object-contain drop-shadow-[0_25px_60px_rgba(27,45,107,0.38)] select-none filter contrast-[1.03]"
                    />

                    {/* Visor pulsing glow highlight matching the blue glasses */}
                    <div className="pointer-events-none absolute left-[48%] top-[39%] h-[4%] w-[25%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/30 opacity-70 shadow-[0_0_20px_5px_rgba(34,211,238,0.4),0_0_40px_10px_rgba(99,102,241,0.3)] blur-sm mix-blend-screen animate-pulse" />
                  </motion.div>

                  {/* Soft depth shadow under the portrait cutout */}
                  <div className="absolute bottom-4 w-[75%] h-6 bg-black/5 blur-xl rounded-full -z-10" />
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </section>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
