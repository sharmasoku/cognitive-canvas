const TAGS = ["Secure Shopping", "Made in India", "AI Powered", "Enterprise Ready", "Accessibility Focused", "BCI Privacy", "Open SDK", "ISO 27001"];

export function Marquee() {
  const items = [...TAGS, ...TAGS];
  return (
    <section
      aria-label="Trust strip"
      className="relative border-y border-border-light bg-surface py-10 overflow-hidden sm:py-12"
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        maskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <div className="flex w-max animate-marquee gap-16 px-6">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-3.5 text-base font-mono uppercase tracking-[0.15em] text-text-secondary sm:text-lg">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary shadow-glow-primary" />
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}