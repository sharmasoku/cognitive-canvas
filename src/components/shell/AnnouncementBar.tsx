import { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent text-white text-center text-xs sm:text-sm font-medium py-2.5 px-4">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <p className="relative">
        ⚡ Standard shipping free across India. Apply code{" "}
        <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 font-mono font-bold backdrop-blur-sm">
          FUTURE10
        </span>{" "}
        for 10% off Pro systems.
      </p>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}