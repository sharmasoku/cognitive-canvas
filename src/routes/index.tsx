import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Storyboard } from "@/components/home/Storyboard";
import { Timeline } from "@/components/home/Timeline";
import { PanOS } from "@/components/home/PanOS";
import { Industries } from "@/components/home/Industries";
import { Stats } from "@/components/home/Stats";
import { Vision } from "@/components/home/Vision";

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
      <Storyboard />
      <Vision />
      <Timeline />
      <PanOS />
      <Industries />
      <Stats />
    </>
  );
}
