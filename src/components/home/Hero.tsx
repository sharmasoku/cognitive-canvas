import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Play, Shield, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-glasses.jpg";

export function Hero() {
  return (
    <section className="relative min-h-[100vh] overflow-hidden">
      <div className="orb" style={{ width: 700, height: 700, background: "#7c3aed", top: -200, left: -200 }} />
      <div className="orb" style={{ width: 600, height: 600, background: "#2563eb", bottom: -200, right: -200, opacity: 0.4 }} />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.08),transparent_50%)]" />
      <div className="section-container relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-violet px-4 py-1.5 text-xs font-medium text-primary-dark"
          >
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>
            AI + AR + Brain Computer Interface
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          >
            The future doesn't wait for your hands.
            <span className="block gradient-text">It understands your thoughts.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg text-text-secondary"
          >
            TeleARGlass pairs a 16-channel dry EEG headset with full-color waveguide optics, so silent drafting, hands-free CAD, and spatial dashboards happen the moment you think them.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/products" className="magnetic inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow-primary">
              Shop products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services" className="magnetic inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold hover:border-primary">
              Explore technology
            </Link>
            <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background"><Play className="h-3.5 w-3.5" /></span>
              Watch demo
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Badge icon={<Shield className="h-3.5 w-3.5" />}>Military-grade neural privacy</Badge>
            <Badge icon={<Sparkles className="h-3.5 w-3.5" />}>Patent-protected waveguide</Badge>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto aspect-square w-full max-w-[560px]"
        >
          <div className="absolute inset-0 grid place-items-center">
            <div className="absolute h-[110%] w-[110%] animate-spin-slower rounded-full border border-primary/15" />
            <div className="absolute h-[88%] w-[88%] animate-spin-slow rounded-full border border-primary/25" />
            <div className="absolute h-[66%] w-[66%] animate-pulse-ring rounded-full border border-accent/30" />
          </div>
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
          {/* Floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="absolute -left-2 top-8 animate-float"
          >
            <div className="glass rounded-2xl p-3 shadow-card">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Activity className="h-3.5 w-3.5" /> Neural typing active</div>
              <svg viewBox="0 0 120 30" className="mt-1 h-8 w-32">
                <polyline points="0,15 10,15 14,5 18,25 22,15 32,15 38,8 44,22 50,15 70,15 74,5 78,25 82,15 100,15 104,10 108,20 112,15 120,15" fill="none" stroke="url(#g)" strokeWidth="1.5" />
                <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stopColor="#7c3aed" /><stop offset="1" stopColor="#2563eb" /></linearGradient></defs>
              </svg>
              <div className="mt-1 text-[10px] text-text-muted font-mono">EEG · 256 Hz</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="absolute -right-2 bottom-8"
            style={{ animationDelay: "1s" }}
          >
            <div className="glass animate-float rounded-2xl p-3 shadow-card">
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Match</div>
              <div className="text-2xl font-bold gradient-text">98.4%</div>
              <div className="text-[10px] text-text-secondary">Intent confidence</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Badge({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-text-secondary backdrop-blur">
      <span className="text-primary">{icon}</span>{children}
    </span>
  );
}