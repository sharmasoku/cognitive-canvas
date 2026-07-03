import { createFileRoute } from "@tanstack/react-router";
import DomeGallery from "@/components/marketing/DomeGallery";
import img1 from "@/assets/tele-marketing-1.jpeg";
import img2 from "@/assets/tele-marketing-2.jpeg";
import img3 from "@/assets/tele-marketing-3.jpeg";
import img4 from "@/assets/tele-marketing-4.jpeg";
import img5 from "@/assets/tele-marketing-5.jpeg";
import img6 from "@/assets/tele-marketing-6.jpeg";

export const Route = createFileRoute("/marketing")({
  head: () => ({ meta: [{ title: "TeleMarketing — TeleARGlass" }] }),
  component: Marketing,
});

const MARKETING_IMAGES = [
  { src: img1, alt: "TeleARGlass marketing 1" },
  { src: img2, alt: "TeleARGlass marketing 2" },
  { src: img3, alt: "TeleARGlass marketing 3" },
  { src: img4, alt: "TeleARGlass marketing 4" },
  { src: img5, alt: "TeleARGlass marketing 5" },
  { src: img6, alt: "TeleARGlass marketing 6" },
];

function Marketing() {
  return (
    <div className="h-[calc(100vh-72px)] w-full bg-background">
      <DomeGallery
        images={MARKETING_IMAGES}
        grayscale={false}
        overlayBlurColor="#ffffff"
        fit={0.6}
        imageBorderRadius="24px"
        openedImageBorderRadius="24px"
        openedImageWidth="min(80vw, 640px)"
        openedImageHeight="min(80vh, 640px)"
      />
    </div>
  );
}
