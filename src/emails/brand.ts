// Shared branding + helpers for the transactional email templates.
// Kept framework-agnostic (no secrets) so it can be imported by templates,
// the react-email preview server, and the server send module alike.

export const brand = {
  name: "TeleARGlass",
  // Matches the storefront theme (src/styles.css).
  gradient: "linear-gradient(135deg, #1016FF 0%, #2563eb 100%)",
  gradientStart: "#1016FF",
  accent: "#10b981",
  accentDark: "#047857",
  surfaceGreen: "#ecfdf5",
  text: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

/**
 * Absolute URL for the TeleARGlass logo used in email headers.
 * Email clients cannot resolve Vite-bundled asset paths, so the logo must be
 * hosted (e.g. a public Supabase Storage bucket) and its base URL provided via
 * PUBLIC_ASSET_BASE_URL. Falls back to the deployed site origin.
 */
export function logoUrl(): string {
  const base =
    (typeof process !== "undefined" && process.env.PUBLIC_ASSET_BASE_URL) ||
    "https://telearglass.com";
  if (base.endsWith("/logo.png")) {
    return base;
  }
  return `${base.replace(/\/$/, "")}/logo.png`;
}

/** Format whole-INR amounts the same way the storefront does. */
export function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
