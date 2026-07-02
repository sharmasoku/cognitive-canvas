import logo from "@/assets/logo.png";

interface LogoProps {
  /** Tailwind height class, e.g. "h-10". Width is derived from the aspect ratio. */
  className?: string;
  alt?: string;
}

/**
 * TeleARGlass brand logo (peacock-feather mark + wordmark).
 * Use this anywhere the app logo is required.
 */
export function Logo({ className = "h-10", alt = "TeleARGlass" }: LogoProps) {
  return (
    <img
      src={logo}
      alt={alt}
      className={`${className} w-auto rounded-lg object-contain`}
      draggable={false}
    />
  );
}
