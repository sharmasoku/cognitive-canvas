
# TeleARGlass 2.0 — Build Plan

A flagship-quality, heavily animated storefront for an AI + AR + BCI product line. Built on the project's existing TanStack Start foundation (not React Router v7) with Lovable Cloud powering auth and persistent orders.

## Stack adjustments from the spec

- **Routing:** TanStack Start file-based routing under `src/routes/` (not `createBrowserRouter`). Same UX — file-based code splitting is built in.
- **Backend:** Lovable Cloud (Supabase) for auth + orders + wishlist persistence. Cart stays in `localStorage` for guests; syncs to DB when signed in.
- **All other libs match spec:** Tailwind v4, Framer Motion, GSAP + ScrollTrigger, Lenis, React Hook Form + Zod, Lucide.

## Design system (`src/styles.css`)

Port every token from the spec verbatim into `@theme inline` + `:root`:
- Violet/blue/emerald palette, surface tints, text hierarchy
- Satoshi (heading) + Inter (body) via `@fontsource` packages, loaded in `__root.tsx`
- Custom radius scale, layered shadows, glow tokens
- Utilities: `.glass`, `.section-container`, `.magnetic-hover`, gradient-orb backgrounds
- Framer Motion presets in `src/lib/motion.ts` (fadeUp, stagger, pageTransition)

## Global shell

```
src/routes/__root.tsx        Lenis provider, Preloader, AnnouncementBar, Navbar, Outlet, Footer, global drawers
src/components/shell/
  Preloader.tsx              2s neural-calibration intro, sessionStorage gate
  AnnouncementBar.tsx
  Navbar.tsx                 transparent→glass on scroll, layoutId active indicator, Cmd+K
  Footer.tsx
  SearchModal.tsx            Cmd+K full-screen catalogue filter
  CartDrawer.tsx             slide-in right + coupon FUTURE10
  WishlistDrawer.tsx
  CompareBar.tsx             bottom drawer when items selected
```

## State (`src/context/ShopContext.tsx`)

Implements every method in the spec: `addToCart / removeFromCart / updateCartQty / toggleWishlist / addToCompare (cap 3) / removeFromCompare / applyCoupon('FUTURE10' = 10%) / placeOrder`. `localStorage` for guests; mirrors to `cart_items`, `wishlist_items`, `orders` tables when authed.

## Routes (TanStack file-based)

```
src/routes/
  index.tsx                  HomePage (7 sections per spec)
  products.tsx               ProductListPage — filters, sort, comparison drawer
  products.$slug.tsx         ProductDetailPage — gallery + 360° simulator + tabs
  compare.tsx                ComparePage — 3-column matrix
  _authenticated/
    checkout.tsx             4-step checkout + mock Razorpay
    orders.$id.tsx           OrderTrackingPage
  services.tsx
  recruitment.tsx
  feedback.tsx
  marketing.tsx
  licence.tsx
  auth.tsx                   Email + Google sign-in
  api/public/                (reserved for future webhooks)
```

Each route gets its own `head()` metadata (title, description, OG tags). Home includes og:image.

## HomePage sections

1. **Hero** — 100vh split, pulsing badge, gradient headline, magnetic CTAs, rotating concentric rings + SVG visor, parallax floating EEG/status cards
2. **Trust marquee** — infinite low-opacity tag strip
3. **Vision storyboard** — large-type 3-step concept grid
4. **Scroll timeline** — GSAP ScrollTrigger vertical tracer fills with primary, alternating cards
5. **PanOS node dashboard** — interactive SVG web with hover-traced gradient links
6. **Industry integration tabs** — Healthcare / Education / Manufacturing / Enterprise / Automotive
7. **Stats grid** — count-up on scroll

## Catalogue + detail

- Generate ~12 product images (smart glasses, BCI headbands, dev kits, accessories) with `imagegen` — premium product photography style on dark backgrounds
- Seed `DetailedProduct[]` in `src/data/products.ts` with full specs, FAQs, reviews
- Filter sidebar with category/tech/price slider/rating/in-stock; sort dropdown; staggered card grid
- Detail page: gallery + 360° simulator (rotating SVG visor on drag), spec/tech/warranty/FAQ/reviews tabs, helpful-vote increments

## Checkout flow

4-step wizard with progress track, React Hook Form + Zod validation, Razorpay-style mock modal (spinner → success), order ID `TLG-XXXXXX`, persists to DB if signed-in else localStorage, redirects to `/orders/$id`.

## Order tracking

Vertical timeline with glowing indicator at current status; address + courier recap on right.

## Other pages

Services, Recruitment (with drag-drop resume + simulated upload), Feedback (star inputs + review feed), Marketing (blog grid), Licence (download progress overlay). All driven by seed data in `src/data/`.

## Lovable Cloud schema (one migration)

```sql
-- profiles (auto-created on signup via trigger)
-- orders, order_items, wishlist_items, cart_items
-- All with GRANTs to authenticated + service_role
-- RLS: user_id = auth.uid() on every row
```

Auth: email/password + Google via `lovable.auth.signInWithOAuth`.

## Technical details

- Lenis wrapped in a provider; disabled when any drawer/modal/preloader is active
- Framer Motion `LayoutGroup` for nav indicator
- All images `loading="lazy"` with width/height
- All routes set `errorComponent` + `notFoundComponent`
- Semantic HTML, ARIA labels on icon buttons, visible focus rings
- Code splitting automatic via TanStack route files

## Build order

1. Enable Lovable Cloud + install deps (framer-motion, gsap, lenis, react-hook-form, zod, @fontsource/inter, satoshi fallback)
2. Design tokens + global utilities + motion presets
3. DB migration + auth page
4. Shell (preloader, lenis, navbar, drawers, footer)
5. ShopContext + seed data + generate product imagery
6. HomePage (all 7 sections)
7. Catalogue + detail + compare
8. Checkout + order tracking
9. Services, Recruitment, Feedback, Marketing, Licence
10. Polish pass: animation timing, focus states, mobile breakpoints

## Out of scope (flagged for follow-up)

- Real payment processing (Razorpay is mocked per spec)
- Real resume upload to storage (simulated per spec)
- Admin/CMS for products (seed file)
- Email notifications on order placement
