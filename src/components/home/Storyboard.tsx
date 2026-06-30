import { motion } from "framer-motion";

export function Storyboard() {
  return (
    <section className="section-container py-24 lg:py-32">
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
    </section>
  );
}