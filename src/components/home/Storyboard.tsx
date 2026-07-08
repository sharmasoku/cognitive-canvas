import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Storyboard() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Decorative grid and orbs */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="orb" style={{ width: 500, height: 500, background: "#2563eb", bottom: -200, right: -100, opacity: 0.15 }} />
      <div className="orb" style={{ width: 400, height: 400, background: "#1016FF", top: -100, left: -150, opacity: 0.12 }} />

      <div className="section-container relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-xs font-mono uppercase tracking-widest text-primary">The vision</span>
            <h2 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight lg:text-7xl">
              A computer
              <span className="block">that <span className="gradient-text">disappears</span></span>
              into your day.
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className="space-y-6 text-lg text-text-secondary">
            <p>
              For 50 years we've been moving fingers, eyes, and voices to operate machines built for the previous generation. TeleARGlass moves in the opposite direction.
            </p>
            <p>
              We start with intention, decode the cortex on-device, and project the answer through waveguide glass you would happily wear to dinner.
            </p>
          </motion.div>
        </div>

        {/* Decorative flow line connecting concept */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent origin-left"
        />

        {/* Concept triplet cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { step: "01", title: "Intention", desc: "Your frontal cortex fires a micro-voltage pattern." },
            { step: "02", title: "Decoding", desc: "TeleOS translates the signal on-device in 4 ms." },
            { step: "03", title: "Projection", desc: "Waveguide lenses render it at 2,400 nits." },
          ].map((card, i) => (
            <motion.div
              key={card.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.6 }}
              className="group relative overflow-hidden rounded-2xl border border-border-light bg-background p-6 transition hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity group-hover:opacity-15" />
              <div className="font-mono text-xs uppercase tracking-widest text-text-muted">{card.step}</div>
              <h3 className="mt-2 text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{card.desc}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}