import { useEffect, useRef, useState } from "react";
import { GlowCard } from "@/components/ui/GlowCard";

const STATS = [
  { value: 50000, suffix: "+", label: "Units shipped" },
  { value: 24, suffix: "M+", label: "TeleOS app runs" },
  { value: 120, suffix: "+", label: "Enterprise clients" },
  { value: 85, suffix: "+", label: "Patents granted" },
];

function useCountUp(target: number, active: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (n: number) => {
      const p = Math.min(1, (n - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return v;
}

function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toLocaleString("en-IN")}`;
  return v.toLocaleString("en-IN");
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setActive(true), { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-container py-24 lg:py-32">
      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCard key={i} target={s.value} active={active} suffix={s.suffix} label={s.label} />
        ))}
      </div>
    </section>
  );
}

function StatCard({ target, active, suffix, label }: { target: number; active: boolean; suffix: string; label: string }) {
  const v = useCountUp(target, active);
  return (
    <GlowCard className="h-full">
      <div className="p-8">
        <div className="text-5xl font-bold gradient-text">{formatNumber(v)}{suffix}</div>
        <div className="mt-2 text-sm text-text-secondary">{label}</div>
      </div>
    </GlowCard>
  );
}