import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  User, Package, MapPin, Heart, Star, Loader2, LogOut, ChevronRight,
  Pencil, Trash2, Plus, Check, Phone, Mail, Calendar, ShieldCheck, KeyRound,
  X, Truck, CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserOrders, type DbOrder } from "@/hooks/useOrders";
import { resolveProductImage } from "@/data/products";
import {
  useUserReviews, useUserAddresses,
  deleteAddress, upsertAddress,
  type UserAddress,
} from "@/hooks/useAdminData";
import { useUserSubscription } from "@/hooks/useLicense";
import { useShop, type Order as LocalOrder } from "@/context/ShopContext";
import { GlowCard } from "@/components/ui/GlowCard";
import { SubscriptionDetailsCard } from "@/components/shared/SubscriptionDetailsCard";
import { supabase } from "@/integrations/supabase/client";
import { inr, shortDate } from "@/lib/format";
import { toast } from "sonner";

type Tab = "profile" | "orders" | "addresses" | "wishlist" | "reviews" | "subscription";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "subscription", label: "Subscription", icon: KeyRound },
];

const accountSearchSchema = z.object({
  tab: z.enum(["profile", "orders", "addresses", "wishlist", "reviews", "subscription"]).optional(),
});

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — TeleARGlass" }] }),
  validateSearch: accountSearchSchema,
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const { tab } = Route.useSearch();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(tab ?? "profile");

  // Overview stats (best-effort; hooks guard on a missing user id).
  const { orders: dbOrders } = useUserOrders(user?.id);
  const { reviews: myReviews } = useUserReviews(user?.id);
  const { wishlist, orders: localOrders } = useShop();
  const dbOrderIds = new Set(dbOrders.map((o) => o.id));
  const orderCount = dbOrders.length + localOrders.filter((o) => !dbOrderIds.has(o.id)).length;
  const { subscription } = useUserSubscription(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f7f7f3]">
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary lg:text-4xl">
            My Account
          </h1>
          <p className="mt-1 text-sm text-[#5c5c56]">
            Welcome back, {(profile?.full_name || user.user_metadata?.full_name || "Explorer").split(" ")[0]}. Manage your profile, orders, and preferences.
          </p>

          {/* Overview stats */}
          <div className="mt-6 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-5">
            <StatCard icon={Package} label="Orders" value={orderCount} onClick={() => setActiveTab("orders")} />
            <StatCard icon={Heart} label="Wishlist" value={wishlist.length} onClick={() => setActiveTab("wishlist")} />
            <StatCard icon={Star} label="Reviews" value={myReviews.length} onClick={() => setActiveTab("reviews")} />
            <StatCard icon={KeyRound} label="License" value={subscription?.status === "active" ? "Active" : "None"} onClick={() => setActiveTab("subscription")} />
            <StatCard icon={Calendar} label="Member since" value={profile?.created_at ? shortDate(profile.created_at) : "—"} />
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            {/* User Card */}
            <div className="rounded-2xl border border-[#e5e5df] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg">
                  {(profile?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[#1c1d1a] truncate">
                    {profile?.full_name || user.user_metadata?.full_name || "Explorer"}
                  </div>
                  <div className="text-xs text-[#8c8c86] truncate font-mono">
                    {profile?.email || user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="rounded-2xl border border-[#e5e5df] bg-white p-2 shadow-sm">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-[#5c5c56] hover:bg-[#f0f0ec] hover:text-[#1c1d1a]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                    {active && <ChevronRight className="ml-auto h-4 w-4" />}
                  </button>
                );
              })}
              <hr className="my-2 border-[#e5e5df]" />
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="min-w-0"
          >
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <TabPanel key="profile">
                  <ProfileTab user={user} profile={profile} refreshProfile={refreshProfile} />
                </TabPanel>
              )}
              {activeTab === "orders" && (
                <TabPanel key="orders">
                  <OrdersTab userId={user.id} />
                </TabPanel>
              )}
              {activeTab === "addresses" && (
                <TabPanel key="addresses">
                  <AddressesTab userId={user.id} />
                </TabPanel>
              )}
              {activeTab === "wishlist" && (
                <TabPanel key="wishlist">
                  <WishlistTab />
                </TabPanel>
              )}
              {activeTab === "reviews" && (
                <TabPanel key="reviews">
                  <ReviewsTab userId={user.id} />
                </TabPanel>
              )}
              {activeTab === "subscription" && (
                <TabPanel key="subscription">
                  <SubscriptionTab
                    userId={user.id}
                    customerName={profile?.full_name || user.user_metadata?.full_name}
                    customerEmail={profile?.email || user.email}
                  />
                </TabPanel>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function TabPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════ Profile Tab ═══ */
function ProfileTab({
  user,
  profile,
  refreshProfile,
}: {
  user: any;
  profile: any;
  refreshProfile: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated!");
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Profile" subtitle="Your personal information" />
      <div className="rounded-2xl border border-[#e5e5df] bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <InfoRow icon={Mail} label="Email" value={profile?.email || user.email} />
          {editing ? (
            <>
              <div>
                <label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#e5e5df] bg-[#fafaf8] px-4 py-3 text-sm text-[#1c1d1a] outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 ..."
                  className="mt-1 w-full rounded-xl border border-[#e5e5df] bg-[#fafaf8] px-4 py-3 text-sm text-[#1c1d1a] outline-none focus:border-primary transition"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition disabled:opacity-50 flex items-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="rounded-full border border-[#e5e5df] px-6 py-2.5 text-sm font-medium text-[#5c5c56] hover:bg-[#f0f0ec] transition">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <InfoRow icon={User} label="Full Name" value={profile?.full_name || "Not set"} />
              <InfoRow icon={Phone} label="Phone" value={profile?.phone || "Not set"} />
              <InfoRow icon={Calendar} label="Member Since" value={profile?.created_at ? shortDate(profile.created_at) : "—"} />
              <button onClick={() => setEditing(true)} className="mt-2 flex items-center gap-2 rounded-full border border-[#e5e5df] px-5 py-2.5 text-sm font-medium text-[#5c5c56] hover:bg-[#f0f0ec] transition">
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

type MergedOrderRow = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { key: string; name: string; qty: number; image: string; slug: string | null; productId: string | null }[];
} & ({ source: "db"; raw: DbOrder } | { source: "local"; raw: LocalOrder });

/* ═══════════════════════════════════════════════ Orders Tab ═══ */
function OrdersTab({ userId }: { userId: string }) {
  const { orders: dbOrders, loading } = useUserOrders(userId);
  const { orders: localOrders } = useShop();
  const [selectedOrder, setSelectedOrder] = useState<MergedOrderRow | null>(null);

  if (loading) return <LoadingSpinner />;

  // Merge: DB orders first, then local-only orders
  const dbIds = new Set(dbOrders.map((o) => o.id));
  const mergedOrders: MergedOrderRow[] = [
    ...dbOrders.map((o) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      createdAt: o.created_at,
      items: (o.items ?? []).map((it) => ({
        key: it.id,
        name: it.name,
        qty: it.qty,
        image: resolveProductImage(it.product?.image_url ?? null),
        slug: it.product?.slug ?? null,
        productId: it.product?.id ?? null,
      })),
      source: "db" as const,
      raw: o,
    })),
    ...localOrders
      .filter((lo) => !dbIds.has(lo.id))
      .map((lo) => ({
        id: lo.id,
        total: lo.total,
        status: lo.status,
        createdAt: lo.createdAt,
        items: lo.items.map((ci, idx) => ({
          key: `${lo.id}-${idx}`,
          name: ci.product.name,
          qty: ci.quantity,
          image: resolveProductImage(ci.product.image),
          slug: ci.product.slug || null,
          productId: ci.product.id || null,
        })),
        source: "local" as const,
        raw: lo,
      })),
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Order History" subtitle={`${mergedOrders.length} order${mergedOrders.length !== 1 ? "s" : ""}`} />

      {mergedOrders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" subtitle="Your orders will appear here after checkout." />
      ) : (
        <div className="space-y-3">
          {mergedOrders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="w-full rounded-2xl border border-[#e5e5df] bg-white p-5 text-left shadow-sm transition hover:border-[#d4d4cd] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {order.items.length > 0 ? (
                  <div className="relative shrink-0">
                    <img
                      src={order.items[0].image}
                      alt={order.items[0].name}
                      className="h-16 w-16 rounded-xl border border-[#e5e5df] object-cover"
                    />
                    {order.items.length > 1 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1c1d1a] px-1 text-[10px] font-semibold text-white">
                        +{order.items.length - 1}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-xl border border-[#e5e5df] bg-[#f5f5f3] flex items-center justify-center">
                    <Package className="h-6 w-6 text-[#8c8c86]" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#1c1d1a] text-sm truncate">
                    {order.items.length > 0 ? order.items[0].name : "Order"}
                    {order.items.length > 1 && ` and ${order.items.length - 1} other item${order.items.length - 1 !== 1 ? "s" : ""}`}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-[#8c8c86] truncate">
                    Order ID: {order.id}
                  </div>
                  <div className="mt-1.5 text-[11px] text-[#8c8c86]">
                    {shortDate(order.createdAt)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StatusBadge status={order.status} />
                  <div className="font-bold text-[#1c1d1a] text-sm">{inr(order.total)}</div>
                  <ChevronRight className="h-4 w-4 text-[#a3a39e]" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════ Order Detail Modal ═══ */
function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#8c8c86]">{label}</span>
      <span className={accent ?? "text-[#1c1d1a]"}>{value}</span>
    </div>
  );
}

function ProductReviewForm({
  productSlug,
  productName,
  reviewerName,
  existingReview,
}: {
  productSlug: string;
  productName: string;
  reviewerName: string;
  existingReview?: { rating: number; comment: string } | null;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const { submitReview } = await import("@/lib/commerce");
      const res = await submitReview(
        productSlug,
        rating,
        comment,
        reviewerName || "Verified Buyer"
      );
      if (res.ok) {
        toast.success(`Thank you for reviewing ${productName}!`);
        setSubmitted(true);
      } else {
        toast.error(res.error || "Failed to submit review.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
    setSubmitting(false);
  };

  const hasReview = submitted || !!existingReview;
  const finalRating = rating || existingReview?.rating || 0;
  const finalComment = comment || existingReview?.comment || "";

  if (hasReview) {
    return (
      <div className="mt-3 border-t border-[#e5e5df] pt-3">
        <div className="text-[11px] font-semibold text-[#1c1d1a] mb-1">
          Your Review & Feedback
        </div>
        <div className="flex items-center gap-1 mb-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4.5 w-4.5 ${
                finalRating >= star ? "fill-amber-400 text-amber-400" : "text-[#d4d4cd]"
              }`}
            />
          ))}
        </div>
        {finalComment && (
          <p className="text-xs text-[#5c5c56] italic bg-[#fafaf8] rounded-xl px-3 py-2 border border-[#e5e5df]">
            "{finalComment}"
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 border-t border-[#e5e5df] pt-3">
      <div className="text-[11px] font-semibold text-[#1c1d1a] mb-1.5">
        Leave a Review & Feedback
      </div>
      
      {/* Star Rating Select */}
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isLit = (hoverRating || rating) >= star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-4.5 w-4.5 ${
                  isLit ? "fill-amber-400 text-amber-400" : "text-[#d4d4cd]"
                }`}
              />
            </button>
          );
        })}
        {rating > 0 && (
          <span className="text-[11px] text-[#8c8c86] ml-1.5 font-medium">
            {rating} / 5
          </span>
        )}
      </div>

      {/* Comment Input */}
      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Write your feedback for ${productName}...`}
          className="w-full rounded-xl border border-[#e5e5df] bg-[#fafaf8] px-3 py-2 text-xs text-[#1c1d1a] outline-none focus:border-primary transition min-h-[50px] resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1.5 rounded-full bg-[#1c1d1a] px-3.5 py-1 text-[11px] font-semibold text-white hover:bg-[#2c2d2a] transition disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

function OrderDetailModal({ order, onClose }: { order: MergedOrderRow | null; onClose: () => void }) {
  const vm = order && buildOrderDetailVM(order);
  const { profile, user } = useAuth();
  const { reviews: myReviews } = useUserReviews(user?.id);

  return (
    <AnimatePresence>
      {vm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/60 p-4 pt-10 backdrop-blur-sm sm:place-items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e5e5df] bg-white shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#e5e5df] p-6">
              <div>
                <div className="font-mono text-sm font-semibold text-[#1c1d1a]">{vm.id}</div>
                <div className="mt-1 text-xs text-[#8c8c86]">Placed on {shortDate(vm.createdAt)}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={vm.status} />
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-full text-[#8c8c86] hover:bg-[#f0f0ec]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
              {/* Items */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8c8c86]">Items</h3>
                <div className="space-y-3">
                  {vm.items.map((item) => {
                    const existingReview = myReviews.find((r) => r.product_id === item.productId);
                    return (
                      <div key={item.key} className="rounded-2xl border border-[#e5e5df] p-4 bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          {item.slug ? (
                            <Link
                              to="/products/$slug"
                              params={{ slug: item.slug }}
                              onClick={onClose}
                              className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition group"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 shrink-0 rounded-xl border border-[#e5e5df] object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-[#1c1d1a] group-hover:text-primary transition-colors">
                                  {item.name}
                                </div>
                                <div className="mt-0.5 text-xs text-[#8c8c86]">
                                  Qty {item.qty} · {inr(item.unitPrice)} each
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 shrink-0 rounded-xl border border-[#e5e5df] object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-[#1c1d1a]">
                                  {item.name}
                                </div>
                                <div className="mt-0.5 text-xs text-[#8c8c86]">
                                  Qty {item.qty} · {inr(item.unitPrice)} each
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="shrink-0 text-sm font-bold text-[#1c1d1a]">{inr(item.lineTotal)}</div>
                        </div>

                        {/* Review Section */}
                        {item.slug && (
                          <ProductReviewForm
                            productSlug={item.slug}
                            productName={item.name}
                            reviewerName={profile?.full_name || ""}
                            existingReview={existingReview}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-[#e5e5df] p-4 text-sm">
                <SummaryRow label="Subtotal" value={inr(vm.subtotal)} />
                {vm.discount > 0 && <SummaryRow label="Discount" value={`-${inr(vm.discount)}`} accent="text-emerald-600" />}
                <SummaryRow label="Shipping" value={vm.shipping === 0 ? "Free" : inr(vm.shipping)} />
                <SummaryRow label="Tax" value={inr(vm.tax)} />
                <div className="mt-2 flex justify-between border-t border-[#e5e5df] pt-2 text-base font-bold text-[#1c1d1a]">
                  <span>Total</span>
                  <span>{inr(vm.total)}</span>
                </div>
                {vm.paymentPlan === "partial" && (
                  <div className="mt-2 space-y-1 border-t border-[#e5e5df] pt-2">
                    <SummaryRow label="Paid so far" value={inr(vm.amountPaid)} accent="text-emerald-600" />
                    <SummaryRow label="Balance due" value={inr(vm.amountDue)} accent="text-amber-600" />
                  </div>
                )}
              </div>

              {/* Shipping address */}
              {vm.address && (
                <div className="rounded-2xl border border-[#e5e5df] p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8c8c86]">
                    <MapPin className="h-3.5 w-3.5" /> Shipping Address
                  </h3>
                  <div className="space-y-0.5 text-sm text-[#1c1d1a]">
                    <div className="font-medium">
                      {vm.address.name}{vm.address.phone ? ` · ${vm.address.phone}` : ""}
                    </div>
                    <div className="text-[#5c5c56]">
                      {[vm.address.line1, vm.address.line2].filter(Boolean).join(", ")}
                    </div>
                    <div className="text-[#5c5c56]">
                      {[vm.address.city, vm.address.state].filter(Boolean).join(", ")}
                      {vm.address.pincode ? ` — ${vm.address.pincode}` : ""}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery / tracking */}
              <div className="rounded-2xl border border-[#e5e5df] p-4">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8c8c86]">
                  <Truck className="h-3.5 w-3.5" /> Delivery
                </h3>
                <div className="space-y-1 text-sm text-[#1c1d1a]">
                  <SummaryRow label="Speed" value={vm.deliverySpeed} />
                  {vm.carrier && <SummaryRow label="Carrier" value={vm.carrier} />}
                  {vm.trackingNumber && <SummaryRow label="Tracking #" value={vm.trackingNumber} />}
                </div>
              </div>

              {vm.paymentMethod && (
                <div className="rounded-2xl border border-[#e5e5df] p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8c8c86]">
                    <CreditCard className="h-3.5 w-3.5" /> Payment
                  </h3>
                  <SummaryRow label="Method" value={vm.paymentMethod} />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface OrderDetailVM {
  id: string;
  createdAt: string;
  status: string;
  items: { key: string; name: string; qty: number; unitPrice: number; lineTotal: number; image: string; slug: string | null; productId: string | null }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentPlan: string;
  amountPaid: number;
  amountDue: number;
  paymentMethod: string | null;
  deliverySpeed: string;
  carrier: string | null;
  trackingNumber: string | null;
  address: { name: string; phone?: string; line1: string; line2?: string; city?: string; state?: string; pincode?: string } | null;
}

function buildOrderDetailVM(order: MergedOrderRow): OrderDetailVM {
  if (order.source === "db") {
    const o = order.raw;
    const addr = typeof o.shipping_address === "object" && o.shipping_address ? o.shipping_address : null;
    return {
      id: o.id,
      createdAt: o.created_at,
      status: o.status,
      items: (o.items ?? []).map((it) => ({
        key: it.id,
        name: it.name,
        qty: it.qty,
        unitPrice: it.unit_price,
        lineTotal: it.line_total,
        image: resolveProductImage(it.product?.image_url ?? null),
        slug: it.product?.slug ?? null,
        productId: it.product?.id ?? null,
      })),
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      tax: o.tax,
      total: o.total,
      paymentPlan: o.payment_plan,
      amountPaid: o.amount_paid_inr,
      amountDue: o.amount_due_inr,
      paymentMethod: o.payment_method || null,
      deliverySpeed: o.delivery_speed,
      carrier: o.carrier,
      trackingNumber: o.tracking_number,
      address: addr
        ? {
            name: addr.name,
            phone: addr.phone,
            line1: addr.line1,
            line2: addr.line2,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
          }
        : null,
    };
  }

  const lo = order.raw;
  return {
    id: lo.id,
    createdAt: lo.createdAt,
    status: lo.status,
    items: lo.items.map((ci, idx) => ({
      key: `${lo.id}-${idx}`,
      name: ci.product.name,
      qty: ci.quantity,
      unitPrice: ci.product.price,
      lineTotal: ci.product.price * ci.quantity,
      image: resolveProductImage(ci.product.image),
      slug: ci.product.slug || null,
      productId: ci.product.id || null,
    })),
    subtotal: lo.subtotal,
    discount: lo.discount,
    shipping: lo.shipping,
    tax: lo.tax,
    total: lo.total,
    paymentPlan: lo.paymentPlan,
    amountPaid: lo.amountPaidNow,
    amountDue: lo.amountDueLater,
    paymentMethod: null,
    deliverySpeed: lo.deliverySpeed,
    carrier: null,
    trackingNumber: null,
    address: {
      name: lo.shippingAddress.fullName,
      phone: lo.shippingAddress.phone,
      line1: lo.shippingAddress.address,
      city: lo.shippingAddress.city,
      pincode: lo.shippingAddress.postalCode,
    },
  };
}

/* ═══════════════════════════════════════════════ Addresses Tab ═══ */
function AddressesTab({ userId }: { userId: string }) {
  const { addresses, loading, refetch } = useUserAddresses(userId);
  const [showForm, setShowForm] = useState(false);
  const [editAddr, setEditAddr] = useState<UserAddress | null>(null);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Addresses" subtitle="Manage your saved addresses" />
        <button
          onClick={() => { setEditAddr(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition"
        >
          <Plus className="h-4 w-4" /> Add Address
        </button>
      </div>

      {showForm && (
        <AddressForm
          userId={userId}
          address={editAddr}
          onDone={() => { setShowForm(false); setEditAddr(null); refetch(); }}
          onCancel={() => { setShowForm(false); setEditAddr(null); }}
        />
      )}

      {addresses.length === 0 && !showForm ? (
        <EmptyState icon={MapPin} title="No saved addresses" subtitle="Add an address for faster checkout." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl border border-[#e5e5df] bg-white p-5 shadow-sm relative">
              {addr.is_default && (
                <span className="absolute top-3 right-3 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">Default</span>
              )}
              <div className="font-semibold text-[#1c1d1a] text-sm">{addr.name}</div>
              <div className="mt-1 text-xs text-[#5c5c56] leading-relaxed">
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                {addr.city}, {addr.state} — {addr.pincode}<br />
                📞 {addr.phone}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { setEditAddr(addr); setShowForm(true); }}
                  className="rounded-lg border border-[#e5e5df] px-3 py-1.5 text-xs font-medium text-[#5c5c56] hover:bg-[#f0f0ec] transition"
                >
                  <Pencil className="h-3 w-3 inline mr-1" /> Edit
                </button>
                <button
                  onClick={async () => {
                    const { ok } = await deleteAddress(addr.id);
                    if (ok) { toast.success("Address deleted"); refetch(); }
                    else toast.error("Failed to delete");
                  }}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="h-3 w-3 inline mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressForm({
  userId,
  address,
  onDone,
  onCancel,
}: {
  userId: string;
  address: UserAddress | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(address?.name ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [line1, setLine1] = useState(address?.line1 ?? "");
  const [line2, setLine2] = useState(address?.line2 ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [state, setState] = useState(address?.state ?? "");
  const [pincode, setPincode] = useState(address?.pincode ?? "");
  const [isDefault, setIsDefault] = useState(address?.is_default ?? false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { ok, error } = await upsertAddress({
      ...(address?.id ? { id: address.id } : {}),
      user_id: userId,
      name, phone, line1, line2: line2 || null, city, state, pincode, is_default: isDefault,
    });
    if (ok) {
      toast.success(address ? "Address updated!" : "Address added!");
      onDone();
    } else {
      toast.error(error || "Failed to save");
    }
    setSaving(false);
  };

  const inputCls = "w-full rounded-xl border border-[#e5e5df] bg-[#fafaf8] px-4 py-3 text-sm text-[#1c1d1a] outline-none focus:border-primary transition";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e5e5df] bg-white p-6 shadow-sm space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">Name</label><input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
        <div><label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">Phone</label><input required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></div>
      </div>
      <div><label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">Address Line 1</label><input required value={line1} onChange={(e) => setLine1(e.target.value)} className={inputCls} /></div>
      <div><label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">Address Line 2</label><input value={line2} onChange={(e) => setLine2(e.target.value)} className={inputCls} /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">City</label><input required value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} /></div>
        <div><label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">State</label><input required value={state} onChange={(e) => setState(e.target.value)} className={inputCls} /></div>
        <div><label className="text-xs font-medium text-[#8c8c86] uppercase tracking-wider">Pincode</label><input required value={pincode} onChange={(e) => setPincode(e.target.value)} className={inputCls} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm text-[#5c5c56] cursor-pointer">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" />
        Set as default address
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {address ? "Update" : "Add"} Address
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-[#e5e5df] px-6 py-2.5 text-sm font-medium text-[#5c5c56] hover:bg-[#f0f0ec] transition">Cancel</button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════ Wishlist Tab ═══ */
function WishlistTab() {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  return (
    <div className="space-y-6">
      <SectionHeader title="Wishlist" subtitle={`${wishlist.length} item${wishlist.length !== 1 ? "s" : ""}`} />

      {wishlist.length === 0 ? (
        <EmptyState icon={Heart} title="Wishlist is empty" subtitle="Save products you love for later." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {wishlist.map((w) => (
            <div key={w.product.id} className="flex gap-4 rounded-2xl border border-[#e5e5df] bg-white p-4 shadow-sm">
              <img src={w.product.image} alt={w.product.name} className="h-20 w-20 rounded-xl object-cover bg-[#f0f0ec]" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#1c1d1a] text-sm truncate">{w.product.name}</div>
                <div className="text-xs text-[#8c8c86] mt-0.5">{w.product.category}</div>
                <div className="font-bold text-[#1c1d1a] text-sm mt-1">{inr(w.product.price)}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => { addToCart(w.product); toast.success("Added to cart"); }}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(w.product)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════ Reviews Tab ═══ */
function ReviewsTab({ userId }: { userId: string }) {
  const { reviews, loading } = useUserReviews(userId);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <SectionHeader title="My Reviews" subtitle={`${reviews.length} review${reviews.length !== 1 ? "s" : ""}`} />

      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" subtitle="Share your experience with TeleAR products!" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[#e5e5df] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#1c1d1a] text-sm">{r.product_name || "Product"}</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-[#e5e5df]"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-[#5c5c56] leading-relaxed">{r.comment}</p>
              <div className="mt-2 text-xs text-[#8c8c86]">{shortDate(r.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════ Subscription Tab ═══ */
function SubscriptionTab({ userId, customerName, customerEmail }: { userId: string; customerName?: string | null; customerEmail?: string | null }) {
  const { subscription, loading } = useUserSubscription(userId);

  if (loading) return <LoadingSpinner />;

  if (!subscription) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Subscription" subtitle="Your TeleLicence enterprise plan" />
        <EmptyState icon={KeyRound} title="No active subscription" subtitle="Subscribe to the TeleARGlass enterprise patent license to see it here." />
        <Link to="/licence" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition">
          View TeleLicence <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const active = subscription.status === "active";

  return (
    <div className="space-y-6">
      <SectionHeader title="Subscription" subtitle="Your TeleLicence enterprise plan" />
      <SubscriptionDetailsCard
        subscription={subscription}
        customerName={customerName}
        customerEmail={customerEmail}
        footer={!active && (
          <Link to="/licence" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition">
            Renew license <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════ Shared Components ═══ */
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1c1d1a]">{title}</h2>
      <p className="text-xs text-[#8c8c86] mt-0.5">{subtitle}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, onClick }: { icon: typeof User; label: string; value: string | number; onClick?: () => void }) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className="h-full w-full text-left">
      <GlowCard className="h-full">
        <div className="flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#8c8c86]">{label}</div>
            <div className="truncate text-lg font-bold text-[#1c1d1a]">{value}</div>
          </div>
        </div>
      </GlowCard>
    </Comp>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f0f0ec] text-[#8c8c86] shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-[#8c8c86] uppercase tracking-wider font-medium">{label}</div>
        <div className="text-sm text-[#1c1d1a] font-medium">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    Placed: "bg-amber-100 text-amber-800",
    Confirmed: "bg-blue-100 text-blue-800",
    Shipped: "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800",
    active: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: typeof User; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e5e5df] bg-white/50 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f0f0ec] text-[#a3a39e] mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-[#1c1d1a]">{title}</h3>
      <p className="mt-1 text-sm text-[#8c8c86]">{subtitle}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
