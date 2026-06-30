import { Zap } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="relative z-40 overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent text-white">
      <div className="section-container flex items-center justify-center gap-2 py-2 text-xs sm:text-sm">
        <Zap className="h-3.5 w-3.5" />
        <span>Standard shipping free across India. Apply code <span className="font-semibold">FUTURE10</span> for 10% off Pro systems.</span>
      </div>
    </div>
  );
}