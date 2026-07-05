import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Mission } from "@/components/home/Mission";
import { Policies } from "@/components/home/Policies";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { Testimonials } from "@/components/home/Testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TeleARGlass 2.0 — Cognitive Interfaces, Shipped." },
      { name: "description", content: "The flagship neural-AR system: 16-channel BCI, 2400-nit waveguide lenses, and TeleOS spatial computing." },
      { property: "og:title", content: "TeleARGlass 2.0" },
      { property: "og:description", content: "The future doesn't wait for your hands. It understands your thoughts." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Marquee />
      <Mission />
      <ProductShowcase />
      <Testimonials />
      <Policies />
    </>
  );
}
