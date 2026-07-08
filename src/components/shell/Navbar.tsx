import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, X, User, LogOut } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Logo } from "@/components/shell/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

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
  const { user, isAdmin, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setCartOpen, setWishlistOpen, setSearchOpen, cartCount, wishlist } = useShop();

  const handleLogout = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const iconBtnClass = "text-[#1016FF]/85 hover:bg-[#1016FF]/10 hover:text-[#1016FF]";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        // Always the violet-dark stage — mirrors Hero/Footer instead of falling back to a white/transparent/grey bar.
        // Opacity is kept high (85-95%) so the tint reads as violet on its own, regardless of what's behind it.
        className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${scrolled
          ? "border-gray-200/80 bg-gradient-to-r from-[#F4EFFF]/95 via-[#FFFFFF]/95 to-[#F0F7FF]/95 shadow-[0_8px_30px_-10px_rgba(27,45,107,0.12)] backdrop-blur-xl"
          : "border-gray-100 bg-gradient-to-r from-[#F4EFFF]/90 via-[#FFFFFF]/90 to-[#F0F7FF]/90 backdrop-blur-md"
          }`}
      >
        <div className="section-container flex items-center justify-between gap-4 py-3 md:py-4 h-20">
          <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <Logo className="h-11 md:h-[4.2rem]" />
          </Link>

          <LayoutGroup>
            <nav className="hidden items-center gap-1 lg:flex">
              {LINKS.map((l) => {
                const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="relative px-3 py-2 text-sm font-semibold text-[#1016FF]/80 transition-colors hover:text-[#1016FF]"
                  >
                    {l.label}
                    {active && (
                      <motion.span
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#1016FF]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={`relative grid h-9 w-9 place-items-center rounded-lg transition ${iconBtnClass}`}
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setWishlistOpen(true)}
              aria-label="Wishlist"
              className={`relative grid h-9 w-9 place-items-center rounded-lg transition ${iconBtnClass}`}
            >
              <Heart className="h-4.5 w-4.5" />
              {wishlist.length > 0 && <CountBadge>{wishlist.length}</CountBadge>}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              className={`relative grid h-9 w-9 place-items-center rounded-lg transition ${iconBtnClass}`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && <CountBadge>{cartCount}</CountBadge>}
            </button>
            {/* Profile Menu Trigger */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`grid h-9 w-9 place-items-center rounded-lg transition ${iconBtnClass}`}
                  aria-label="User profile"
                >
                  <User className="h-4.5 w-4.5" />
                </button>
              ) : (
                <Link
                  to="/auth"
                  className={`grid h-9 w-9 place-items-center rounded-lg transition ${iconBtnClass}`}
                  aria-label="Sign in"
                >
                  <User className="h-4.5 w-4.5" />
                </Link>
              )}

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && user && (
                  <>
                    {/* Backdrop overlay to close dropdown */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-border-light bg-background p-4 shadow-card"
                    >
                      <div className="border-b border-border-light pb-2 mb-1">
                        <div className="text-xs font-mono text-text-muted">Logged in as</div>
                        <div className="font-semibold text-sm truncate text-foreground">
                          {user.user_metadata?.full_name || (user as any).name || "TeleAR Explorer"}
                        </div>
                        <div className="text-[10px] text-text-muted truncate font-mono">
                          {user.email}
                        </div>
                      </div>
                      <div className="py-1 space-y-0.5">
                        <Link
                          to="/account"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-violet hover:text-foreground transition"
                        >
                          <User className="h-3.5 w-3.5" /> My Account
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition border-t border-border-light pt-2 mt-1"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className={`ml-1 grid h-9 w-9 place-items-center rounded-lg transition lg:hidden ${iconBtnClass}`}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 top-20 z-40 bg-gradient-to-br from-[#F4EFFF] via-[#FFFFFF] to-[#F0F7FF] border-t border-gray-100/60 lg:hidden overflow-y-auto"
          >
            <nav className="section-container flex flex-col py-6 gap-2">
              {LINKS.map((l) => {
                const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`rounded-xl px-5 py-4 text-xl font-bold tracking-tight transition-all duration-200 ${active
                      ? "bg-[#1016FF]/10 text-[#1016FF]"
                      : "text-[#1016FF]/80 hover:bg-[#1016FF]/5 hover:text-[#1016FF]"
                      }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#1016FF] px-1 text-[10px] font-semibold text-white shadow-md">
      {children}
    </span>
  );
}
