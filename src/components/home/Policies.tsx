import { motion } from "framer-motion";
import { Ban, ShieldCheck, ScrollText } from "lucide-react";
import { GlowCard } from "@/components/ui/GlowCard";

const GLOW_COLORS_BY_TITLE: Record<string, string> = {
  "Return & Refund Policy": "265 85 62",
  "Security & Privacy Policy": "221 83 53",
  "Terms & Conditions": "160 84 42",
};

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
      "The age between 5 to 18 Years of TeleARGlass Users require Own & their Parents ThinkID & FaceID.",
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
    // Reduced padding from py-24 to py-12 on mobile to minimize scroll length
    <section id="policies" className="scroll-mt-28 py-12 md:py-24 lg:py-32">
      <div className="section-container">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-primary">Policies</span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-primary">TeleARGlass Policies</h2>
          <p className="mt-4 text-sm sm:text-base text-text-secondary">Everything you should know about buying, using and protecting your TeleARGlass.</p>
        </div>

        {/* Reduced top margin on mobile from mt-12 to mt-6 */}
        <div className="mt-6 md:mt-12 grid gap-6 md:grid-cols-3">
          {POLICIES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <GlowCard glowColor={GLOW_COLORS_BY_TITLE[p.title]} className="h-full">
                {/* Reduced card padding from p-8 to p-5 on mobile to keep layouts compact */}
                <div className="relative overflow-hidden p-5 sm:p-8">
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-violet text-primary">
                        <p.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-primary leading-tight">{p.title}</h3>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {p.points.map((pt, j) => (
                        <li key={j} className="flex gap-2.5 text-sm sm:text-base font-bold leading-relaxed text-text-secondary">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
