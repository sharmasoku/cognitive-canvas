import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { computeAdvanceAmount, type Product } from "@/data/products";
import { fetchProductBySlug } from "@/hooks/useProducts";
import { persistOrder } from "@/lib/commerce";
import { sendOrderEmailFn } from "@/lib/email.functions";

export interface CartItem {
  product: Product;
  quantity: number;
}
export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export type OrderStatus =
  "Placed" | "Confirmed" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered";

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  deliverySpeed: "standard" | "priority";
  status: OrderStatus;
  createdAt: string;
  paymentPlan: "full" | "partial";
  amountPaidNow: number;
  amountDueLater: number;
}

interface UIState {
  cartOpen: boolean;
  wishlistOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setWishlistOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
}

interface ShopAPI extends UIState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: Order[];
  coupon: string | null;
  discountPct: number;
  addToCart: (p: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  refreshCartProducts: () => Promise<void>;
  toggleWishlist: (p: Product) => void;
  inWishlist: (id: string) => boolean;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  placeOrder: (addr: ShippingAddress, speed: "standard" | "priority") => Promise<Order>;
  getOrder: (id: string) => Order | undefined;
  cartCount: number;
  cartSubtotal: number;
}

const ShopContext = createContext<ShopAPI | null>(null);

const LS = {
  cart: "tele_cart",
  wishlist: "tele_wishlist",
  orders: "tele_orders",
  coupon: "tele_coupon",
};

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadLS<CartItem[]>(LS.cart, []));
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() =>
    loadLS<WishlistItem[]>(LS.wishlist, []),
  );
  const [orders, setOrders] = useState<Order[]>(() => loadLS<Order[]>(LS.orders, []));
  const [coupon, setCoupon] = useState<string | null>(() => loadLS<string | null>(LS.coupon, null));

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => saveLS(LS.cart, cart), [cart]);
  useEffect(() => saveLS(LS.wishlist, wishlist), [wishlist]);
  useEffect(() => saveLS(LS.orders, orders), [orders]);
  useEffect(() => saveLS(LS.coupon, coupon), [coupon]);

  const discountPct = coupon === "FUTURE10" ? 0.1 : 0;

  const addToCart = useCallback((p: Product, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.product.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { product: p, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== id));
  }, []);

  const updateCartQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((c) => c.product.id !== id)
        : prev.map((c) => (c.product.id === id ? { ...c, quantity: qty } : c)),
    );
  }, []);

  // Cart items snapshot the product at add-to-cart time (persisted to
  // localStorage), so price/advance-payment settings changed afterwards
  // wouldn't otherwise show up until the item is removed and re-added.
  // Re-fetch each item's live product data before checkout relies on it.
  const refreshCartProducts = useCallback(async () => {
    if (cart.length === 0) return;
    const fresh = await Promise.all(
      cart.map(async (c) => {
        const latest = await fetchProductBySlug(c.product.slug);
        return latest ? { ...c, product: latest } : c;
      }),
    );
    setCart(fresh);
  }, [cart]);

  const toggleWishlist = useCallback((p: Product) => {
    setWishlist((prev) =>
      prev.some((w) => w.product.id === p.id)
        ? prev.filter((w) => w.product.id !== p.id)
        : [...prev, { product: p, addedAt: new Date().toISOString() }],
    );
  }, []);

  const inWishlist = useCallback(
    (id: string) => wishlist.some((w) => w.product.id === id),
    [wishlist],
  );

  const applyCoupon = useCallback((code: string) => {
    if (code.trim().toUpperCase() === "FUTURE10") {
      setCoupon("FUTURE10");
      return true;
    }
    setCoupon(null);
    return false;
  }, []);
  const clearCoupon = useCallback(() => setCoupon(null), []);

  const cartSubtotal = useMemo(
    () => cart.reduce((s, c) => s + c.product.price * c.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.quantity, 0), [cart]);

  const placeOrder = useCallback(
    async (addr: ShippingAddress, speed: "standard" | "priority") => {
      const subtotal = cartSubtotal;
      const shipping = speed === "priority" ? 499 : 0;
      const discount = Math.round(subtotal * discountPct);
      const tax = Math.round((subtotal - discount) * 0.18);
      const total = subtotal - discount + shipping + tax;

      const advanceFromItems = cart.reduce(
        (s, c) => s + computeAdvanceAmount(c.product, c.quantity),
        0,
      );
      const amountDueLater = subtotal - advanceFromItems;
      const amountPaidNow = advanceFromItems + shipping + tax - discount;
      const paymentPlan: "full" | "partial" = amountDueLater > 0 ? "partial" : "full";

      // Best-effort server persistence for signed-in users (atomic stock + order).
      // Guests, or an unconfigured/unseeded DB, fall back to a local order id.
      const remoteId = await persistOrder({
        items: cart,
        address: addr,
        speed,
        shipping,
        tax,
        discount,
      });
      const id = remoteId ?? `TLG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const order: Order = {
        id,
        items: cart,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        shippingAddress: addr,
        deliverySpeed: speed,
        status: "Placed",
        createdAt: new Date().toISOString(),
        paymentPlan,
        amountPaidNow,
        amountDueLater,
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      setCoupon(null);

      // Fire-and-forget order confirmation email for all orders (guests + signed-in).
      // Never block checkout or surface a failure to the shopper.
      const eta = new Date(Date.now() + (speed === "priority" ? 2 : 5) * 86_400_000);
      void sendOrderEmailFn({
        data: {
          orderId: order.id,
          items: order.items.map((c) => ({
            name: c.product.name,
            qty: c.quantity,
            unitPrice: c.product.price,
            lineTotal: c.product.price * c.quantity,
          })),
          subtotal,
          discount,
          shipping,
          tax,
          total,
          paymentPlan,
          amountPaidNow,
          amountDueLater,
          shippingAddress: addr,
          deliverySpeed: speed,
          estimatedDate: eta.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          }),
        },
      }).catch(() => {
        /* best-effort */
      });

      return order;
    },
    [cart, cartSubtotal, discountPct],
  );

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const value = useMemo<ShopAPI>(
    () => ({
      cart,
      wishlist,
      orders,
      coupon,
      discountPct,
      cartOpen,
      wishlistOpen,
      searchOpen,
      setCartOpen,
      setWishlistOpen,
      setSearchOpen,
      addToCart,
      removeFromCart,
      updateCartQty,
      refreshCartProducts,
      toggleWishlist,
      inWishlist,
      applyCoupon,
      clearCoupon,
      placeOrder,
      getOrder,
      cartCount,
      cartSubtotal,
    }),
    [
      cart,
      wishlist,
      orders,
      coupon,
      discountPct,
      cartOpen,
      wishlistOpen,
      searchOpen,
      addToCart,
      removeFromCart,
      updateCartQty,
      refreshCartProducts,
      toggleWishlist,
      inWishlist,
      applyCoupon,
      clearCoupon,
      placeOrder,
      getOrder,
      cartCount,
      cartSubtotal,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
