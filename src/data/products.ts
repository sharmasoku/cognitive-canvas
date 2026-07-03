import smartGlass from "@/assets/tele-ar-glass-smart-glass.jpeg";
import legacy from "@/assets/tele-ar-glass-legacy.jpeg";
import homeAuto from "@/assets/tele-ar-glass-home-auto.jpeg";
import gaming from "@/assets/tele-ar-glass-gaming-and-optimization.jpeg";

export type Category = "Smart Glasses" | "Home Automation" | "Gaming" | "Enterprise";
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

// The real TeleARGlass product range. Reviews are served live from the
// database (see supabase migrations), so reviewsList is intentionally empty.
export const products: Product[] = [
  {
    id: "tag-smart",
    slug: "telesmartglass",
    name: "TeleSmartGlass",
    tagline: "The TeleARGlass base model — control your world by thought.",
    category: "Smart Glasses",
    technology: "AR",
    price: 30000,
    rating: 4.7,
    reviewCount: 3,
    inStock: true,
    image: smartGlass,
    gallery: [smartGlass],
    shortDescription:
      "Think-to-act smart glasses: music & video streaming, phone, computer, home automation and car controls via the TeleSmartGlass app.",
    specifications: {
      Control: "Think-to-act via the Telepathy app",
      Streaming: "Music & Video (TeleShaft)",
      Devices: "Phone & Computer pairing",
      "Home Automation": "Supported",
      Vehicle: "Car driving controls",
      App: "TeleSmartGlass",
    },
    warranty: "3-month hardware warranty; software issues resolved anytime.",
    technologyStory:
      "TeleSmartGlass is the entry into the TeleARGlass world. Powered by the TeleSmartGlass app, it works from thinking with the Telepathy engine — stream music and video through TeleShaft, take calls, control your phone and computer, automate your home, manage car driving controls, and even skip YouTube ads, all hands-free.",
    faqs: [
      { question: "How do I control it?", answer: "Through the TeleSmartGlass app — think a command and it acts, from music playback to home automation." },
      { question: "Does it work with my car?", answer: "Yes, it supports car driving controls and hands-free actions on the move." },
    ],
    reviewsList: [],
  },
  {
    id: "tag-legacy",
    slug: "telearglass-legacy",
    name: "TeleARGlass Legacy",
    tagline: "Immersive AR with the full suite of Tele apps.",
    category: "Smart Glasses",
    technology: "BCI + AR",
    price: 49000,
    rating: 4.8,
    reviewCount: 4,
    inStock: true,
    image: legacy,
    gallery: [legacy],
    shortDescription:
      "TeleCall, TeleYad, TravelDiaries, TeleSurf and 12+ built-in apps — works from thinking with immersive AR and speaking accessibility.",
    specifications: {
      "Built-in Apps": "TeleCall, TeleYad, TravelDiaries, TeleSurf, Tellege, TeleClick, TeleTask, TeleClock, TeleWatch",
      "More Apps": "TeleAnuVad, TeleWeather, TeleARLearning, TeleCalender, TeleShaft, TeleCalculator",
      Experience: "Immersive AR",
      Control: "Works from Thinking",
      Accessibility: "Speaking accessibility",
      Marketplace: "Third-party in-app purchases",
    },
    warranty: "3-month hardware warranty; software issues resolved anytime.",
    technologyStory:
      "TeleARGlass Legacy is the complete everyday AR companion. It bundles a full suite of Tele apps — from TeleCall and TeleSurf to TeleYad, which reinvents your memories in immersive AR — plus TeleAnuVad translation, TeleARLearning and more. Everything works from thinking, with speaking accessibility and support for third-party in-app purchases.",
    faqs: [
      { question: "What is TeleYad?", answer: "TeleYad lets you reinvent and relive your memories as an immersive AR experience." },
      { question: "Can I add more apps?", answer: "Yes — Legacy supports third-party in-app purchases so the catalogue keeps growing." },
    ],
    reviewsList: [],
  },
  {
    id: "tag-home",
    slug: "telearglass-home-auto",
    name: "TeleARGlass Home Auto",
    tagline: "Everything in Legacy, plus full home appliance control.",
    category: "Home Automation",
    technology: "BCI + AR",
    price: 59000,
    rating: 4.8,
    reviewCount: 3,
    inStock: true,
    image: homeAuto,
    gallery: [homeAuto],
    shortDescription:
      "All TeleARGlass Legacy features plus TeleARHome — control your consumer appliances with a thought.",
    specifications: {
      Includes: "All TeleARGlass Legacy features",
      "Home Control": "Consumer appliance control (TeleARHome)",
      Experience: "Immersive AR",
      Control: "Works from Thinking",
    },
    warranty: "3-month hardware warranty; software issues resolved anytime.",
    technologyStory:
      "TeleARGlass Home Auto takes everything in Legacy and adds TeleARHome — a thought-driven control layer for your consumer appliances. Dim the lights, set the AC, switch the TV and orchestrate your whole home without lifting a finger.",
    faqs: [
      { question: "What can I control at home?", answer: "TeleARHome controls your consumer appliances — lights, AC, TV and more — directly from thinking." },
      { question: "Does it keep the Legacy apps?", answer: "Yes, Home Auto includes the entire TeleARGlass Legacy app suite." },
    ],
    reviewsList: [],
  },
  {
    id: "tag-gaming",
    slug: "telearglass-gaming",
    name: "TeleARGlass Gaming",
    tagline: "Legacy power plus AR gaming — Xbox & PlayStation ready.",
    category: "Gaming",
    technology: "BCI + AR",
    price: 64000,
    rating: 4.9,
    reviewCount: 3,
    inStock: true,
    image: gaming,
    gallery: [gaming],
    shortDescription:
      "All Legacy features plus ARGaming control with TeleARGames — compatible with Xbox and SONY PlayStation series.",
    specifications: {
      Includes: "All TeleARGlass Legacy features",
      Gaming: "ARGaming control with TeleARGames",
      "Console Support": "Xbox, SONY PlayStation series",
      Experience: "Immersive AR",
      Control: "Works from Thinking",
    },
    warranty: "3-month hardware warranty; software issues resolved anytime.",
    technologyStory:
      "TeleARGlass Gaming layers a full ARGaming control system over the Legacy feature set. Play our own TeleARGames catalogue or connect to Xbox and SONY PlayStation series consoles and play with thought-speed reactions.",
    faqs: [
      { question: "Which consoles are supported?", answer: "TeleARGlass Gaming is compatible with Xbox and SONY PlayStation series consoles." },
      { question: "Are there native games?", answer: "Yes — our own TeleARGames library is built specifically for AR gaming control." },
    ],
    reviewsList: [],
  },
  {
    id: "tag-custom",
    slug: "telearglass-customization",
    name: "TeleARGlass Customization",
    tagline: "Specialized AR for enterprise, space, defence and robotics.",
    category: "Enterprise",
    technology: "BCI + AR",
    price: 159000,
    rating: 5.0,
    reviewCount: 2,
    inStock: true,
    image: gaming,
    gallery: [gaming],
    shortDescription:
      "Legacy plus specialized applications — social (Tellar/TeleImmerse), AutoEV (TeleCar), Robotics (TeleRobo), Space (TeleARSpace), Defence (TeleARMY) and full computer control (TeleComp).",
    specifications: {
      Includes: "All TeleARGlass Legacy features",
      "Social Media": "Tellar, TeleImmerse, Telepathy",
      Mobility: "AutoEV (TeleCar)",
      Robotics: "TeleRobo",
      Space: "Space Communication (TeleARSpace)",
      Defence: "Army & Defence (TeleARMY)",
      Computers: "Mac, Windows, Linux (TeleComp)",
    },
    warranty: "3-month hardware warranty with priority enterprise support; software issues resolved anytime.",
    technologyStory:
      "TeleARGlass Customization is the flagship, built for organizations. On top of Legacy it unlocks specialized applications: social presence (Tellar, TeleImmerse, Telepathy), AutoEV mobility (TeleCar), robotics (TeleRobo), space communication (TeleARSpace), army & defence (TeleARMY), and full computer systems control across Mac, Windows and Linux (TeleComp).",
    faqs: [
      { question: "Who is this for?", answer: "Enterprise, research, defence and space teams that need specialized, mission-grade AR applications." },
      { question: "Can it control computers?", answer: "Yes — TeleComp gives thought-driven control of Mac, Windows and Linux systems." },
    ],
    reviewsList: [],
  },
  {
    id: "tag-telelie",
    slug: "telelie-detector",
    name: "TeleLie Detector",
    tagline: "Truth Investigation Kit powered by Think Data — for Indian enforcement.",
    category: "Enterprise",
    technology: "BCI + AR",
    price: 1500000,
    rating: 5.0,
    reviewCount: 0,
    inStock: true,
    image: smartGlass,
    gallery: [smartGlass],
    shortDescription:
      "A Truth Investigation Kit: the SmartGlass captures precise Think Data and the TeleLie Detector mobile app reports the output — location, person or material name, date and more. Available to Indian Enforcement Organizations.",
    specifications: {
      Kit: "SmartGlass + TeleLie Detector mobile app",
      Function: "Truth investigation via Think Data capture",
      "App Output": "Location, Person / Material Name, Date & more",
      Availability: "Indian Enforcement Organizations only",
      Control: "Works from Thinking",
      "GeM Seller ID": "GX6Q260013874543",
    },
    warranty: "3-month hardware warranty; software issues resolved anytime.",
    technologyStory:
      "The TeleLie Detector is a complete Truth Investigation Kit. The SmartGlass captures precise, useful Think Data directly, while the dedicated TeleLie Detector mobile app interprets and displays the output — including location, person or material name, date and more. Sales are available exclusively to Indian Enforcement Organizations, and procurement is available through our GeM portal (Seller ID: GX6Q260013874543).",
    faqs: [
      { question: "Who can purchase the TeleLie Detector?", answer: "Sales are available exclusively to Indian Enforcement Organizations." },
      { question: "What does a TeleLie Detector Setup include?", answer: "Each setup includes the SmartGlass to capture Think Data and the TeleLie Detector mobile app that displays the output — location, person or material name, date and more." },
      { question: "How do we procure it?", answer: "It is available through our Government e-Marketplace (GeM) portal — Seller ID GX6Q260013874543." },
    ],
    reviewsList: [],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Maps the bundled product image filenames (as stored in `products.image_url`
 * for seeded rows) back to their imported asset URLs, so seeded products still
 * render an image in the admin panel.
 */
export const productImageByFile: Record<string, string> = {
  "tele-ar-glass-smart-glass.jpeg": smartGlass,
  "tele-ar-glass-legacy.jpeg": legacy,
  "tele-ar-glass-home-auto.jpeg": homeAuto,
  "tele-ar-glass-gaming-and-optimization.jpeg": gaming,
};

/** Neutral inline placeholder used when a product has no resolvable image. */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' rx='12' fill='%23ede9fe'/><path d='M24 52l12-14 9 10 6-7 9 11z' fill='%237c3aed' opacity='.5'/><circle cx='30' cy='30' r='5' fill='%237c3aed' opacity='.5'/></svg>`,
  );

/**
 * Resolve any `image_url` value to something an <img> can render safely:
 * absolute URLs / data URIs pass through, known bundled filenames map to their
 * asset, everything else falls back to a placeholder (never a broken image).
 */
export function resolveProductImage(url?: string | null): string {
  if (!url) return PLACEHOLDER_IMAGE;
  if (/^(https?:|data:|blob:|\/)/.test(url)) return url;
  return productImageByFile[url] ?? PLACEHOLDER_IMAGE;
}
