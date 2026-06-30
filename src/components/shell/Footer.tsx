import { Link } from "@tanstack/react-router";
import { Brain, Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border-light bg-surface text-foreground">
      <div className="orb" style={{ width: 500, height: 500, background: "#7c3aed", top: -200, left: -100, opacity: 0.15 }} />
      <div className="orb" style={{ width: 400, height: 400, background: "#10b981", bottom: -200, right: -100, opacity: 0.1 }} />
      <div className="section-container relative grid gap-12 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow-primary">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold">TeleARGlass 2.0</div>
              <div className="text-xs text-text-muted">Cognitive interfaces, shipped from Bengaluru.</div>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm text-text-secondary">
            We design and manufacture neural-AR systems for builders, clinicians, and enterprises who want a frictionless interface to the digital world.
          </p>
          <div className="mt-6 flex gap-2">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-text-secondary transition hover:border-primary hover:text-primary">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <FooterColumn title="Product" links={[
          { to: "/products", label: "Catalogue" },
          { to: "/compare", label: "Compare" },
          { to: "/licence", label: "Licensing" },
        ]} />
        <FooterColumn title="Company" links={[
          { to: "/services", label: "Services" },
          { to: "/recruitment", label: "Careers" },
          { to: "/marketing", label: "Newsroom" },
        ]} />
        <FooterColumn title="Support" links={[
          { to: "/feedback", label: "Feedback" },
          { to: "/auth", label: "Sign in" },
        ]} />
      </div>
      <div className="border-t border-border-light">
        <div className="section-container flex flex-col items-center justify-between gap-3 py-6 text-xs text-text-muted md:flex-row">
          <span>© 2026 TeleARGlass Pvt. Ltd. — All rights reserved.</span>
          <span className="font-mono">Made in Bengaluru, India</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-text-secondary transition hover:text-primary">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}