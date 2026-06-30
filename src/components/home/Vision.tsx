import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { Brain, Eye, Waves } from "lucide-react";

const STEPS = [
  { icon: Brain, label: "01 · Intention", title: "Human thought", body: "You form an intention. Just like opening your hand to grab a cup." },
  { icon: Waves, label: "02 · Signal", title: "Brain signal wave", body: "Sixteen dry EEG biosensors capture the micro-voltage in 4 ms windows." },
  { icon: Eye, label: "03 · Output", title: "Spatial holographic display", body: "TeleOS renders the action through 2400-nit waveguide optics. Nothing else moves." },
];

export function Vision() {
  return (
    <section className="section-container py-24 lg:py-32">
      <motion.div
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger()}
        className="max-w-3xl"
      >
        <motion.span variants={fadeUp} className="text-xs font-mono uppercase tracking-widest text-primary">The TeleAR loop</motion.span>
        <motion.h2 variants={fadeUp} className="mt-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          Three steps between intention and outcome.
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-4 text-lg text-text-secondary">
          We collapsed the cognitive interface to its essentials. No controllers, no voice prompts, no menus to memorise.
        </motion.p>
      </motion.div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.article
            key={s.label}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-border-light bg-background p-8 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
            <s.icon className="h-9 w-9 text-primary" strokeWidth={1.5} />
            <div className="mt-6 font-mono text-xs uppercase tracking-widest text-text-muted">{s.label}</div>
            <h3 className="mt-2 text-2xl font-semibold">{s.title}</h3>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">{s.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}