import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useRef, useState } from "react";
import heroImage from "@/assets/hero-glasses.png";
import { DemoModal } from "@/components/shell/DemoModal";
import TextType from "@/components/ui/TextType";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const visorScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);

  return (
    <>
      <section ref={sectionRef} className="relative overflow-hidden">
        <div className="orb" style={{ width: 700, height: 700, background: "#7c3aed", top: -200, left: -200 }} />
        <div className="orb" style={{ width: 600, height: 600, background: "#2563eb", bottom: -200, right: -200, opacity: 0.4 }} />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.08),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />

        <div className="section-container relative grid items-center gap-12 pt-6 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-10 lg:pb-24">
          {/* Left column — text */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              TELEARGLASS — Serving
              <span className="mt-1 block">
                <TextType
                  as="span"
                  text="humanity through technology."
                  className="gradient-text"
                  typingSpeed={60}
                  initialDelay={500}
                  variableSpeed={{ min: 45, max: 90 }}
                  loop={false}
                  cursorCharacter="▊"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 max-w-xl text-lg text-text-secondary"
            >
              We are functioning sustainable innovation by building the user-friendly TeleARGlass Minimum Viable Products.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/products" className="magnetic inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow-primary">
                Telepurchase now <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background transition-shadow hover:shadow-glow-primary"><Play className="h-3.5 w-3.5" /></span>
                Watch demo
              </button>
            </motion.div>
          </div>

          {/* Right column — visor visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ scale: visorScale }}
            className="relative mx-auto aspect-square w-full max-w-[560px]"
          >
            {/* Concentric rings */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="absolute h-[110%] w-[110%] animate-spin-slower rounded-full border border-primary/15" />
              <div className="absolute h-[88%] w-[88%] animate-spin-slow rounded-full border border-primary/25" />
              <div className="absolute h-[66%] w-[66%] animate-pulse-ring rounded-full border border-accent/30" />
            </div>

            {/* Visor image */}
            <div className="relative grid h-full place-items-center">
              <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-dark shadow-glow-primary">
                <img
                  src={heroImage}
                  alt="Person wearing TeleAR Vision Pro with glowing holographic UI"
                  width={560}
                  height={560}
                  className="block aspect-square h-auto w-full max-w-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}