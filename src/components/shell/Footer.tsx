import { Link } from "@tanstack/react-router";
import { Linkedin, Instagram, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/shell/Logo";
import { useShop } from "@/context/ShopContext";

const WHATSAPP_ICON_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jayeshpateltelearglass/",
    icon: Linkedin,
    hover: "hover:border-[#0a66c2] hover:bg-[#0a66c2]/10 hover:text-[#0a66c2] hover:shadow-[0_0_15px_rgba(10,102,194,0.15)]",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/telearglass",
    icon: Instagram,
    hover: "hover:border-[#e1306c] hover:bg-[#e1306c]/10 hover:text-[#e1306c] hover:shadow-[0_0_15px_rgba(225,48,108,0.15)]",
  },
] as const;

const SUPPORT_EMAIL = "jayeshpatel@telearglass.com";
const SUPPORT_ADDRESS = "Rupal Vas, Anandpura, Kadi, Mehsana, GJ 382705, India.";

function FooterLink({
  to,
  hash,
  search,
  children,
}: {
  to: string;
  hash?: string;
  search?: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      hash={hash}
      search={search}
      className="group/link inline-flex items-center gap-1 text-base font-bold text-gray-600 transition-colors hover:text-[#1016FF]"
    >
      <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">{children}</span>
      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-0.5 opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100 text-[#1016FF]" />
    </Link>
  );
}

function FooterButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="group/link inline-flex items-center gap-1 text-base font-bold text-gray-600 transition-colors hover:text-[#1016FF]"
    >
      <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">{children}</span>
      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-0.5 opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100 text-[#1016FF]" />
    </button>
  );
}

export function Footer() {
  const { setCartOpen } = useShop();

  return (
    // Redesigned premium light violet gradient footer to seamlessly match the hero section
    <footer className="relative mt-32 overflow-hidden bg-gradient-to-r from-[#F4EFFF] via-[#FFFFFF] to-[#F0F7FF] text-gray-900 border-t border-gray-200/60">
      {/* Top seam — glowing hairline aligned with theme primary color */}
      <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#1016FF]/20 to-transparent" />

      {/* Ambient orbs — soft light opacity backing glow */}
      <div className="orb -z-10 animate-pulse" style={{ width: 640, height: 640, background: "#1016FF", top: -280, left: -160, opacity: 0.05 }} />
      <div className="orb -z-10 animate-pulse" style={{ width: 520, height: 520, background: "#2563eb", bottom: -240, right: -140, opacity: 0.04 }} />
      <div className="absolute inset-0 -z-10 bg-grid opacity-[0.03]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(27,45,107,0.03),transparent_60%)]" />

      {/* Ghost wordmark — Visual continuity in faint ghost violet text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 select-none overflow-hidden text-center"
      >
        <span className="block whitespace-nowrap font-heading font-extrabold uppercase leading-none tracking-[-0.03em] text-[#1016FF]/[0.2] text-[clamp(4rem,17vw,13rem)]">
          TeleARGlass
        </span>
      </div>

      <div className="section-container relative z-10 max-w-[1440px] py-24">
        <div className="grid gap-14 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-12 lg:col-span-4">
            <Link to="/" className="flex items-center gap-3">
              <Logo className="h-[3.1rem]" />
              <span className="font-sans text-lg font-bold text-[#1016FF]">TeleARGlass</span>
            </Link>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-[#1016FF]">
              <b>Serving Humanity Through Technology</b>
            </p>
            <div className="mt-7 flex gap-3">
              {SOCIALS.map(({ label, href, icon: Icon, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-gray-50 text-[#1016FF]/80 transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 ${hover}`}
                >
                  {Icon ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d={WHATSAPP_ICON_PATH} />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-12 md:gap-6 lg:col-span-8">

            {/* Customer Service */}
            <div>
              <div className="text-sm font-mono font-semibold uppercase tracking-widest text-[#1016FF]">
                Customer Service
              </div>
              <ul className="mt-5 space-y-3">
                <li><FooterLink to="/account" search={{ tab: "orders" }}>Order History</FooterLink></li>
                <li><FooterButton onClick={() => setCartOpen(true)}>Shopping Cart</FooterButton></li>
                <li><FooterLink to="/checkout">Place Order</FooterLink></li>
                <li><FooterLink to="/auth">Verify Account</FooterLink></li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-span-2 sm:col-span-1">
              <div className="text-sm font-mono font-semibold uppercase tracking-widest text-[#1016FF]">
                Support
              </div>
              <ul className="mt-5 space-y-3">
                <li><FooterLink to="/feedback">Contact Us</FooterLink></li>
                <li className="flex items-start gap-2 text-base font-bold text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span>{SUPPORT_ADDRESS}</span>
                </li>
                <li>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-2 text-base font-bold text-gray-600 transition-colors hover:text-[#1016FF]"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    {SUPPORT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative z-10 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Bottom bar */}
      <div className="section-container relative z-10 max-w-[1440px]">
        <div className="flex flex-col items-center justify-between gap-4 py-8 text-sm font-bold text-gray-500 sm:flex-row">
          <span>© 2026 TeleARGlass. All Rights Reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/" hash="policies" className="font-bold transition-colors hover:text-[#1016FF]">
              Privacy Policy
            </Link>
            <Link to="/" hash="policies" className="font-bold transition-colors hover:text-[#1016FF]">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
