import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Check, Headphones, Layers, Wrench } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "TeleServices — Enterprise" }] }),
  component: ServicesPage,
});

const CAPS = [
  { icon: Building2, title: "Enterprise Solutions", desc: "Custom TeleOS deployments for industry verticals." },
  { icon: Wrench, title: "On-Site Calibration", desc: "Pan-India field team for setup and tuning." },
  { icon: Layers, title: "Annual Maintenance", desc: "Quarterly firmware audits and lens recalibration." },
  { icon: Headphones, title: "AI & AR Consulting", desc: "Design partners for spatial product strategy." },
];

const PLANS = [
  { name: "Starter Developer", price: "₹9,999", per: "one-time", features: ["SDK + 1 dev seat", "Community Slack", "Sandbox cloud"], accent: false },
  { name: "Pro Business", price: "₹24,999", per: "seat / yr", features: ["10 seats minimum", "SLA 99.9%", "Quarterly calibration", "Priority support"], accent: true },
  { name: "Enterprise Hub", price: "Custom", per: "contract", features: ["Unlimited seats", "Dedicated field team", "On-prem TeleOS", "Compliance pack"], accent: false },
];

function ServicesPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <section className="section-container py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">TeleServices</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">Cognitive deployments, calibrated to your enterprise.</p>
      </section>
      <section className="section-container py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAPS.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-border-light bg-background p-6 transition hover:-translate-y-2 hover:border-primary/30 hover:shadow-card-hover">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-violet text-primary"><c.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="section-container py-16">
        <h2 className="text-3xl font-bold">Pricing packages</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`relative rounded-3xl border p-6 ${p.accent ? "border-primary bg-gradient-primary text-white shadow-card-hover" : "border-border-light bg-background"}`}>
              {p.accent && <span className="absolute -top-3 left-6 rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">Most popular</span>}
              <div className="text-sm uppercase tracking-widest opacity-80">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1"><span className="text-4xl font-bold">{p.price}</span><span className="opacity-80 text-sm">/ {p.per}</span></div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4" />{f}</li>)}
              </ul>
              <button className={`mt-6 w-full rounded-full px-4 py-2.5 text-sm font-semibold ${p.accent ? "bg-background text-primary" : "bg-gradient-primary text-white"}`}>Get started</button>
            </div>
          ))}
        </div>
      </section>
      <section className="section-container pb-24">
        <div className="rounded-3xl border border-border-light bg-surface p-8 lg:p-12">
          <h2 className="text-3xl font-bold">Request a proposal</h2>
          {sent ? (
            <div className="mt-6 rounded-2xl bg-surface-green p-5 text-accent-dark">Thanks — your enterprise consultant will be in touch within 24 hours.</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required placeholder="Company" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              <input required type="email" placeholder="Work email" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              <input required placeholder="Seats needed" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              <input required placeholder="Use case" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              <textarea required placeholder="Calibration requirements" rows={4} className="md:col-span-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              <button className="md:col-span-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white magnetic">Submit proposal</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}