import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import logoUrl from "../assets/logo.png";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ShopProvider, useShop } from "../context/ShopContext";
import { LenisProvider } from "../components/shell/LenisProvider";
import { Preloader } from "../components/shell/Preloader";
import { AnnouncementBar } from "../components/shell/AnnouncementBar";
import { Navbar } from "../components/shell/Navbar";
import { Footer } from "../components/shell/Footer";
import { CartDrawer } from "../components/shell/CartDrawer";
import { WishlistDrawer } from "../components/shell/WishlistDrawer";
import { SearchModal } from "../components/shell/SearchModal";
import { CompareBar } from "../components/shell/CompareBar";
import { ParticleField } from "../components/home/ParticleField";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TeleARGlass 2.0 — Cognitive Interfaces, Shipped." },
      { name: "description", content: "AI + AR + Brain Computer Interface — neural-AR smart glasses, dry EEG bands, and TeleOS for builders, clinicians, and enterprises." },
      { name: "author", content: "TeleARGlass" },
      { property: "og:title", content: "TeleARGlass 2.0" },
      { property: "og:description", content: "The future doesn't wait for your hands. It understands your thoughts." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: logoUrl },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@TeleARGlass" },
      { name: "twitter:image", content: logoUrl },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: logoUrl },
      { rel: "apple-touch-icon", href: logoUrl },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ShopProvider>
        <Shell />
      </ShopProvider>
    </QueryClientProvider>
  );
}

function Shell() {
  const { cartOpen, wishlistOpen, searchOpen } = useShop();
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem("tele_preloader_completed");
    if (!seen) setShowPreloader(true);
  }, []);

  const drawerOpen = cartOpen || wishlistOpen || searchOpen || showPreloader;

  return (
    <>
      <ParticleField />
      <LenisProvider disabled={drawerOpen} />
      {showPreloader && (
        <Preloader onDone={() => {
          if (typeof window !== "undefined") window.sessionStorage.setItem("tele_preloader_completed", "1");
          setShowPreloader(false);
        }} />
      )}
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <CompareBar />
    </>
  );
}
