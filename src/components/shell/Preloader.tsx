import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain } from "lucide-react";

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
          <div className="absolute inset-0 pointer-events-none">
            <div className="orb" style={{ width: 600, height: 600, background: "#7c3aed", top: "20%", left: "30%" }} />
            <div className="orb" style={{ width: 500, height: 500, background: "#2563eb", bottom: "10%", right: "20%", opacity: 0.3 }} />
          </div>
          <div className="relative">
            <motion.div className="absolute inset-0 rounded-full border border-primary-light/40 animate-spin-slow" style={{ width: 280, height: 280, left: -140, top: -140 }} />
            <motion.div className="absolute inset-0 rounded-full border border-secondary-light/30 animate-spin-slower" style={{ width: 360, height: 360, left: -180, top: -180 }} />
            <motion.div
              className="grid h-28 w-28 place-items-center rounded-full bg-gradient-primary shadow-glow-primary"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="h-12 w-12 text-white" strokeWidth={1.5} />
            </motion.div>
          </div>
          <div className="relative mt-20 w-72">
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