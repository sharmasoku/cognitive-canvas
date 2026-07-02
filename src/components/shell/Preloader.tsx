import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/shell/Logo";

const STAGES = [
  { until: 30, msg: "Syncing dry EEG biosensors..." },
  { until: 65, msg: "Calibrating Qualcomm XR2 neural blocks..." },
  { until: 85, msg: "Loading TeleOS spatial dashboard widgets..." },
  { until: 100, msg: "Booting brain-computer interfaces..." },
];

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / 2000) * 100);
      setProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => { setShow(false); onDone(); }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const msg = STAGES.find((s) => progress <= s.until)?.msg ?? STAGES[0].msg;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0a0d14" }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          {/* Radial glow center */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.25)_0%,transparent_70%)]" />
          </div>

          {/* Concentric rotating orbits — properly centered */}
          <div className="relative flex items-center justify-center" style={{ width: 360, height: 360 }}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[360px] w-[360px] animate-spin-slower rounded-full border border-secondary-light/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[280px] w-[280px] animate-spin-slow rounded-full border border-primary-light/30" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] animate-pulse-ring rounded-full border border-accent-light/25" />

            {/* Small orbiting dots */}
            <motion.div
              className="absolute left-1/2 top-1/2"
              style={{ width: 360, height: 360, x: -180, y: -180 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-secondary-light/60" />
            </motion.div>
            <motion.div
              className="absolute left-1/2 top-1/2"
              style={{ width: 280, height: 280, x: -140, y: -140 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary-light/60" />
            </motion.div>

            {/* Pulsing brand logo */}
            <motion.div
              className="relative z-10 grid place-items-center rounded-2xl shadow-glow-primary"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Logo className="h-20 rounded-2xl" />
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="relative mt-16 w-72">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/60">
              <span className="font-mono">TeleOS</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Stage message */}
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-sm text-white/70"
          >
            {msg}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}