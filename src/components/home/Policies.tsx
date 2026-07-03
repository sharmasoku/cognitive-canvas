import { motion } from "framer-motion";
import { Ban, ShieldCheck, ScrollText } from "lucide-react";

const POLICIES = [
  {
    icon: Ban,
    title: "Return & Refund Policy",
    points: [
      "There is no return or refund on sales of TeleARGlass products.",
      "Customers are encouraged to take a physical trial of TeleProducts at the TeleARGlass Store before purchase.",
      'An online digital "TeleOrientation" is also available to take advantage of, for your location convenience.',
    ],
  },
  {
    icon: ShieldCheck,
    title: "Security & Privacy Policy",
    points: [
      "All TeleARGlass communications & controls are end-to-end encrypted.",
      "TeleARGlass reads your Think Data only from the targeted head skin, purely to operate the device.",
      "We strongly recommend a 15-minute break for every 1 hour of continuous use.",
    ],
  },
  {
    icon: ScrollText,
    title: "Terms & Conditions",
    points: [
      "Every purchase includes a 3-month warranty for any hardware issues. Software issues will be resolved at any time.",
      "Because TeleARGlass works from the user's thoughts, customers should be aware of the specific function they intend to operate — for example, opening a specific TeleARGlass app, or writing and sending a message to a recipient.",
    ],
  },
];

export function Policies() {
  return (
    <section className="py-24 lg:py-32">
      <div className="section-container">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-primary">Policies</span>
          <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">Clear commitments, before and after purchase.</h2>
          <p className="mt-4 text-text-secondary">Everything you should know about buying, using and protecting your TeleARGlass.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {POLICIES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border-light bg-background p-8 shadow-card"
            >
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-violet text-primary">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
                <ul className="mt-4 space-y-3">
                  {p.points.map((pt, j) => (
                    <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-text-secondary">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
