import BorderGlow from "@/components/ui/BorderGlow";

/**
 * Standard metric/stat card treatment used across the site (matches TeleLicence):
 * a white card whose brand-gradient border glows and follows the pointer near the edges.
 * Put your padded content as children.
 */
export function GlowCard({
  children,
  className = "",
  glowColor = "265 85 62",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <BorderGlow
      backgroundColor="#ffffff"
      borderRadius={24}
      glowColor={glowColor}
      glowIntensity={1}
      glowRadius={26}
      coneSpread={22}
      colors={["#1016FF", "#2563eb", "#10b981"]}
      className={className}
    >
      {children}
    </BorderGlow>
  );
}
