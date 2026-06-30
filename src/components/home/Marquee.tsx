const TAGS = ["Secure Shopping", "Made in India", "AI Powered", "Enterprise Ready", "Accessibility Focused", "BCI Privacy", "Open SDK", "ISO 27001"];

export function Marquee() {
  const items = [...TAGS, ...TAGS];
  return (
    <section aria-label="Trust strip" className="border-y border-border-light bg-surface py-6 overflow-hidden">
      <div className="flex w-max animate-marquee gap-12 px-6 opacity-60">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}