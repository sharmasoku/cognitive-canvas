import visionPro from "@/assets/product-vision-pro.jpg";
import neuralBand from "@/assets/product-neural-band.jpg";
import liteAr from "@/assets/product-lite-ar.jpg";
import devKit from "@/assets/product-dev-kit.jpg";
import neuralBuds from "@/assets/product-neural-buds.jpg";
import chargingDock from "@/assets/product-charging-dock.jpg";

export type Category = "Smart Glasses" | "BCI Devices" | "Developer Tools" | "Accessories";
export type Technology = "BCI + AR" | "AR" | "BCI" | "Standard";

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpfulVotes: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: Category;
  technology: Technology;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  image: string;
  gallery: string[];
  shortDescription: string;
  specifications: Record<string, string>;
  warranty: string;
  technologyStory: string;
  faqs: { question: string; answer: string }[];
  reviewsList: Review[];
}

const baseReviews: Review[] = [
  { id: "r1", userName: "Aarav Mehta", rating: 5, comment: "The neural typing feature is unreal. Drafted my entire pitch deck without lifting a finger.", date: "2026-04-12", verified: true, helpfulVotes: 142 },
  { id: "r2", userName: "Priya Sharma", rating: 5, comment: "Lightweight, premium build, and the holographic dashboard is everything I imagined.", date: "2026-03-28", verified: true, helpfulVotes: 98 },
  { id: "r3", userName: "Kunal Verma", rating: 4, comment: "Astonishing tech. Calibration took a few sessions but worth it.", date: "2026-03-10", verified: true, helpfulVotes: 54 },
  { id: "r4", userName: "Ishita Rao", rating: 5, comment: "Battery life lasted my entire workday. The waveguide clarity is class-leading.", date: "2026-02-22", verified: true, helpfulVotes: 73 },
];

export const products: Product[] = [
  {
    id: "tlg-001",
    slug: "telear-vision-pro",
    name: "TeleAR Vision Pro",
    tagline: "The flagship neural-AR system for cognitive professionals.",
    category: "Smart Glasses",
    technology: "BCI + AR",
    price: 58999,
    originalPrice: 64999,
    rating: 4.9,
    reviewCount: 412,
    inStock: true,
    image: visionPro,
    gallery: [visionPro, liteAr, chargingDock],
    shortDescription: "Silent neural drafting, dual waveguide lenses, and spatial dashboards in a 48 g titanium frame.",
    specifications: {
      Display: "Dual full-color waveguide, 2400 nits",
      Resolution: "2560 × 2160 per eye",
      "BCI Channels": "16 dry EEG biosensors",
      Processor: "Qualcomm XR2 Gen 2 + TeleOS neural co-processor",
      "Battery Life": "8 hours active use",
      Connectivity: "Wi-Fi 7, BT 5.4, UWB",
      Weight: "48 g",
      Frame: "Aerospace titanium with sapphire coating",
    },
    warranty: "2-year limited warranty with free annual calibration.",
    technologyStory:
      "Vision Pro pairs sixteen dry EEG biosensors with our TeleOS neural decoder to translate intention into action — no controllers, no voice, no taps. The dual waveguide lens reaches 2400 nits so spatial content stays readable in direct sunlight.",
    faqs: [
      { question: "Do I need to calibrate it?", answer: "Initial calibration is a 4-minute guided session. The headset re-baselines automatically every wear." },
      { question: "Is my neural data private?", answer: "All decoding happens on-device. Nothing leaves the headset unless you explicitly share it." },
      { question: "Can I wear prescription lenses?", answer: "Yes — every Vision Pro ships with a custom Rx insert kit." },
    ],
    reviewsList: baseReviews,
  },
  {
    id: "tlg-002",
    slug: "telear-lite",
    name: "TeleAR Lite",
    tagline: "Everyday AR clarity in a brushed-aluminum silhouette.",
    category: "Smart Glasses",
    technology: "AR",
    price: 32999,
    rating: 4.7,
    reviewCount: 281,
    inStock: true,
    image: liteAr,
    gallery: [liteAr, visionPro],
    shortDescription: "Compact 32 g frame with full-color HUD and 6-hour battery — the daily driver for AR.",
    specifications: {
      Display: "Single full-color waveguide, 1800 nits",
      Resolution: "1920 × 1080 per eye",
      "BCI Channels": "—",
      Processor: "Qualcomm XR2 Gen 2",
      "Battery Life": "6 hours active use",
      Connectivity: "Wi-Fi 6E, BT 5.3",
      Weight: "32 g",
      Frame: "Brushed 6061 aluminum",
    },
    warranty: "2-year limited warranty.",
    technologyStory:
      "Lite carries the same waveguide research as Vision Pro into an everyday silhouette. Pair it with any phone and your spatial dashboards travel with you.",
    faqs: [
      { question: "Does Lite include BCI?", answer: "No — Lite is the pure AR experience. Upgrade to Vision Pro for neural input." },
      { question: "Is it good for outdoor use?", answer: "Yes, the photochromic lenses adapt to ambient light automatically." },
    ],
    reviewsList: baseReviews.slice(0, 3),
  },
  {
    id: "tlg-003",
    slug: "neural-band-x",
    name: "Neural Band X",
    tagline: "Sixteen-channel BCI headband for clinicians and researchers.",
    category: "BCI Devices",
    technology: "BCI",
    price: 24999,
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    image: neuralBand,
    gallery: [neuralBand],
    shortDescription: "Medical-grade EEG headband with TeleOS SDK support for biomedical and HCI research.",
    specifications: {
      Display: "—",
      Resolution: "—",
      "BCI Channels": "16 active dry EEG + 4 reference",
      Processor: "On-board ARM M55 with neural inference",
      "Battery Life": "12 hours streaming",
      Connectivity: "BT 5.3, USB-C",
      Weight: "210 g",
      Frame: "Carbon-fiber over hypoallergenic silicone",
    },
    warranty: "1-year limited warranty.",
    technologyStory:
      "Neural Band X opens the same biosensor array used in Vision Pro to research teams. Stream raw EEG, run inference on-device, or pair it with our SDK to build your own BCI workflows.",
    faqs: [
      { question: "Is it CE / FDA marked?", answer: "CE-marked. FDA filing in progress for clinical use." },
      { question: "What's in the SDK?", answer: "Python + TypeScript bindings, sample notebooks, and pre-trained decoders for typing, focus, and meditation." },
    ],
    reviewsList: baseReviews.slice(0, 2),
  },
  {
    id: "tlg-004",
    slug: "neural-buds",
    name: "TeleSense Neural Buds",
    tagline: "Earbud-form BCI for focus, sleep, and ambient typing.",
    category: "BCI Devices",
    technology: "BCI",
    price: 12999,
    rating: 4.6,
    reviewCount: 318,
    inStock: true,
    image: neuralBuds,
    gallery: [neuralBuds],
    shortDescription: "Four-channel in-ear EEG that turns micro-intentions into shortcuts.",
    specifications: {
      Display: "—",
      Resolution: "—",
      "BCI Channels": "4 in-ear dry electrodes",
      Processor: "Dual M55 inference cores",
      "Battery Life": "5h + 18h case",
      Connectivity: "BT 5.4",
      Weight: "5.2 g per bud",
      Frame: "Medical-grade silicone",
    },
    warranty: "1-year limited warranty.",
    technologyStory:
      "TeleSense brings BCI to a form factor you already wear. Pinch-to-focus, intent-to-skip, and a continuous focus score that nudges you back when your attention drifts.",
    faqs: [
      { question: "Can I use them as regular earbuds?", answer: "Absolutely — ANC, spatial audio, and 24-bit playback." },
    ],
    reviewsList: baseReviews.slice(1, 3),
  },
  {
    id: "tlg-005",
    slug: "telear-dev-kit",
    name: "TeleAR Dev Kit",
    tagline: "The everything-included toolkit for building on TeleOS.",
    category: "Developer Tools",
    technology: "BCI + AR",
    price: 49999,
    rating: 4.9,
    reviewCount: 84,
    inStock: true,
    image: devKit,
    gallery: [devKit],
    shortDescription: "Vision Pro reference unit, Neural Band X, edge inference puck, and full TeleOS SDK access.",
    specifications: {
      Display: "Vision Pro reference headset",
      Resolution: "2560 × 2160 per eye",
      "BCI Channels": "16 + 4 reference",
      Processor: "Edge inference puck (12 TOPS)",
      "Battery Life": "Headset 8h, puck 10h",
      Connectivity: "Wi-Fi 7, BT 5.4, UWB, USB4",
      Weight: "Kit 1.4 kg",
      Frame: "Pelican case",
    },
    warranty: "1-year hardware + 12 months SDK premium support.",
    technologyStory:
      "Everything you need to ship a TeleOS app, in one case. Includes priority support, beta features, and the Think2Speak training corpus.",
    faqs: [
      { question: "Is the SDK open source?", answer: "Core SDK is Apache-2; advanced decoders ship under a research license." },
    ],
    reviewsList: baseReviews.slice(0, 2),
  },
  {
    id: "tlg-006",
    slug: "charging-dock",
    name: "Aurora Charging Dock",
    tagline: "Magnetic stone-base dock with calibration-grade lighting.",
    category: "Accessories",
    technology: "Standard",
    price: 6999,
    rating: 4.7,
    reviewCount: 192,
    inStock: true,
    image: chargingDock,
    gallery: [chargingDock],
    shortDescription: "Cradles any TeleAR headset; charges, calibrates, and gently breathes a violet halo.",
    specifications: {
      Display: "—",
      Resolution: "—",
      "BCI Channels": "—",
      Processor: "Calibration controller",
      "Battery Life": "Mains powered",
      Connectivity: "USB-C PD 30 W",
      Weight: "640 g",
      Frame: "Volcanic basalt over aluminum",
    },
    warranty: "2-year limited warranty.",
    technologyStory:
      "The dock isn't just power — it runs a 90-second nightly waveguide calibration so your lenses stay perfectly aligned.",
    faqs: [
      { question: "Universal fit?", answer: "Yes, magnetic alignment fits Vision Pro and Lite." },
    ],
    reviewsList: baseReviews.slice(2, 4),
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}