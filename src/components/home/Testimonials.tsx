import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary">Loved by customers</span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              What people are <span className="gradient-text">saying</span>
            </h2>
          </div>
          <Link to="/feedback" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Read all reviews <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      <TestimonialMarquee />
    </section>
  );
}
