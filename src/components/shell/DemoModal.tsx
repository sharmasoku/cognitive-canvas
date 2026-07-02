import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import demoVideo from "@/assets/demo-video.mp4";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

export function DemoModal({ open, onClose }: DemoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-black border border-[#1f2937]/50 shadow-card-hover"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close demo"
              className="absolute right-4 top-4 z-20 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white/80 transition hover:bg-black/90 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Video content */}
            <div className="relative aspect-video w-full">
              <video
                src={demoVideo}
                controls
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
