import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGroup, motion } from "framer-motion";
import { Brain, Heart, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "TeleProducts" },
  { to: "/services", label: "TeleServices" },
  { to: "/recruitment", label: "TeleRecruitment" },
  { to: "/feedback", label: "TeleFeedback" },
  { to: "/marketing", label: "TeleMarketing" },
  { to: "/licence", label: "TeleLicence" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setCartOpen, setWishlistOpen, setSearchOpen, cartCount, wishlist, compare } = useShop();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSearchOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? "glass border-b border-primary/10" : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between gap-4 py-3">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow-primary">
            <Brain className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-base font-bold">TeleARGlass</span>
          <span className="hidden text-[10px] font-mono uppercase tracking-widest text-primary sm:inline-block">2.0</span>
        </Link>

        <LayoutGroup>
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="relative rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-surface-violet"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </LayoutGroup>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          {compare.length > 0 && (
            <Link
              to="/compare"
              aria-label="Compare"
              className="relative grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
            >
              <Sparkles className="h-4.5 w-4.5" />
              <Badge>{compare.length}</Badge>
            </Link>
          )}
          <button
            onClick={() => setWishlistOpen(true)}
            aria-label="Wishlist"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
          >
            <Heart className="h-4.5 w-4.5" />
            {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
          </button>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {cartCount > 0 && <Badge>{cartCount}</Badge>}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="ml-1 grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border-light bg-background/95 backdrop-blur lg:hidden"
        >
          <nav className="section-container flex flex-col py-2">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-lg px-3 py-3 text-sm font-medium text-text-secondary transition hover:bg-surface-violet hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white shadow-glow-primary">
      {children}
    </span>
  );
}