import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  User, Package, MapPin, Heart, Star, Loader2, LogOut, ChevronRight,
  Pencil, Trash2, Plus, Check, Phone, Mail, Calendar, ShieldCheck, KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserOrders, type DbOrder } from "@/hooks/useOrders";
import {
  useUserReviews, useUserAddresses,
  deleteAddress, upsertAddress,
  type UserAddress,
} from "@/hooks/useAdminData";
import { useUserSubscription } from "@/hooks/useLicense";
import { useShop } from "@/context/ShopContext";
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

      {/* Security Section */}
      <div className="rounded-2xl border border-[#e5e5df] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-[#1c1d1a] text-sm">Security</div>
            <div className="text-xs text-[#8c8c86]">Your account is protected by Supabase Auth</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ Orders Tab ═══ */
function OrdersTab({ userId }: { userId: string }) {
  const { orders: dbOrders, loading } = useUserOrders(userId);
  const { orders: localOrders } = useShop();

  if (loading) return <LoadingSpinner />;

  // Merge: DB orders first, then local-only orders
  const dbIds = new Set(dbOrders.map((o) => o.id));
  const mergedOrders = [
    ...dbOrders.map((o) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      createdAt: o.created_at,
      itemCount: o.items?.length ?? 0,
      source: "db" as const,
    })),
    ...localOrders
      .filter((lo) => !dbIds.has(lo.id))
      .map((lo) => ({
        id: lo.id,
        total: lo.total,
        status: lo.status,
        createdAt: lo.createdAt,
        itemCount: lo.items.length,
        source: "local" as const,
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
            <div
              key={order.id}
              className="flex items-center justify-between rounded-2xl border border-[#e5e5df] bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <div className="font-semibold text-[#1c1d1a] text-sm truncate font-mono">{order.id}</div>
                <div className="mt-1 text-xs text-[#8c8c86]">
                  {shortDate(order.createdAt)} · {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={order.status} />
                <div className="font-semibold text-[#1c1d1a] text-sm">{inr(order.total)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
