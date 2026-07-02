import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, MessageSquare,
  BookOpen, Loader2, Menu, X, ChevronLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — AJANTA'S ADUSOL." }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart, exact: false },
  { to: "/admin/blogs", label: "Blogs", icon: BookOpen, exact: false },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate({ to: "/" });
    }
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-[#121620] px-4 py-3 lg:hidden">
        <div>
          <div className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest font-mono leading-none">CARRIER</div>
          <div className="text-sm font-bold text-emerald-400 font-serif">CLASSES.</div>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-gray-400 hover:text-white transition">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          className={`fixed inset-y-0 left-0 z-30 w-[260px] bg-[#121620] border-r border-gray-800 p-5 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static shrink-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Logo */}
          <div className="mb-8 px-2 border-b border-gray-800/40 pb-5">
            <div className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">CARRIER</div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight font-serif">CLASSES.</div>
            <div className="text-[9px] text-gray-500 font-bold tracking-wider uppercase mt-1">ADMIN CONTROL PANEL</div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.to || pathname === item.to + "/"
                : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="mt-auto space-y-1 pt-4 border-t border-gray-800/40">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 transition"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Back to site
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-950/20 hover:text-red-400 transition"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </motion.aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
