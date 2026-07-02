import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, Sparkles, X, User, LogOut } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Logo } from "@/components/shell/Logo";
import { supabase } from "@/integrations/supabase/client";

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
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setCartOpen, setWishlistOpen, setSearchOpen, cartCount, wishlist, compare } = useShop();

  useEffect(() => {
    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    // Check mock session
    const checkMockSession = () => {
      const mock = localStorage.getItem("tele_mock_user");
      if (mock) {
        setUser(JSON.parse(mock));
      } else {
        // Only reset if we don't have a supabase session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session?.user) setUser(null);
        });
      }
    };
    checkMockSession();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (!localStorage.getItem("tele_mock_user")) {
        setUser(null);
      }
    });

    // Also listen to storage events for mock logins
    window.addEventListener("storage", checkMockSession);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", checkMockSession);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("tele_mock_user");
    setUser(null);
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
          <Logo className="h-14" />
        </Link>

        <LayoutGroup>
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="relative px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary to-secondary"
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
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <kbd className="hidden rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted sm:inline-block">
              ⌘K
            </kbd>
          </button>
          {compare.length > 0 && (
            <Link
              to="/compare"
              aria-label="Compare"
              className="relative grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
            >
              <Sparkles className="h-4.5 w-4.5" />
              <CountBadge>{compare.length}</CountBadge>
            </Link>
          )}
          <button
            onClick={() => setWishlistOpen(true)}
            aria-label="Wishlist"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
          >
            <Heart className="h-4.5 w-4.5" />
            {wishlist.length > 0 && <CountBadge>{wishlist.length}</CountBadge>}
          </button>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {cartCount > 0 && <CountBadge>{cartCount}</CountBadge>}
          </button>
          {/* Profile Menu Trigger */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
                aria-label="User profile"
              >
                <User className="h-4.5 w-4.5" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="grid h-9 w-9 place-items-center rounded-lg text-text-secondary transition hover:bg-surface-violet hover:text-foreground"
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
                    <div className="border-b border-border-light pb-2 mb-2">
                      <div className="text-xs font-mono text-text-muted">Logged in as</div>
                      <div className="font-semibold text-sm truncate text-foreground">{user.user_metadata?.full_name || user.name || "TeleAR Explorer"}</div>
                      <div className="text-[10px] text-text-muted truncate font-mono">{user.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
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
            {LINKS.map((l) => {
              const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-lg px-3 py-3 text-sm font-medium transition hover:bg-surface-violet ${
                    active ? "text-primary font-semibold" : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}

function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white shadow-glow-primary">
      {children}
    </span>
  );
}