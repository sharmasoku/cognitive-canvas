import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Eye, Hash, KeyRound, Loader2, Mail, Phone, Plus, RefreshCw, ShieldCheck, Trash2, User, X } from "lucide-react";
import { toast } from "sonner";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { useAllSubscriptions, useLicensePlan, upsertLicensePlan, daysRemaining, type AdminSubscription } from "@/hooks/useLicense";
import { inr, shortDate } from "@/lib/format";

export const Route = createFileRoute("/admin/license")({
  component: AdminLicensePage,
});

function AdminLicensePage() {
  const { plan, loading: planLoading } = useLicensePlan();
  const { subscriptions, loading: subsLoading, refetch } = useAllSubscriptions();
  const [selected, setSelected] = useState<AdminSubscription | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("year");
  const [features, setFeatures] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(String(plan.priceInr));
      setBillingPeriod(plan.billingPeriod);
      setFeatures(plan.features.length ? plan.features : [""]);
    } else if (!planLoading) {
      setFeatures([""]);
    }
  }, [plan, planLoading]);

  const handleSave = async () => {
    const priceNum = parseInt(price, 10);
    if (!name.trim()) { toast.error("Enter a plan name"); return; }
    if (Number.isNaN(priceNum) || priceNum < 0) { toast.error("Enter a valid price"); return; }

    setSaving(true);
    const { ok, error } = await upsertLicensePlan({
      id: plan?.id,
      name: name.trim(),
      price_inr: priceNum,
      billing_period: billingPeriod,
      features: features.map((f) => f.trim()).filter(Boolean),
    });
    setSaving(false);
    if (ok) toast.success("License plan saved");
    else toast.error(error || "Failed to save");
  };

  if (planLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminHeading word="License" sub="Enterprise patent licensing plan & subscribers" />
      </motion.div>

      {/* Plan editor */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-900">TeleLicence plan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrap label="Plan name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="TeleARGlass Enterprise Patent License" />
          </FieldWrap>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrap label="Price (₹)">
              <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="90000000" />
            </FieldWrap>
            <FieldWrap label="Billing period">
              <select value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value as "month" | "year")} className={inputCls}>
                <option value="year">Per year</option>
                <option value="month">Per month</option>
              </select>
            </FieldWrap>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-gray-500">Features (shown as checklist on /licence)</div>
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={f}
                  onChange={(e) => setFeatures((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
                  className={`${inputCls} flex-1`}
                  placeholder="Full patent & platform license"
                />
                <button type="button" onClick={() => setFeatures((prev) => prev.filter((_, idx) => idx !== i))} className="rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setFeatures((prev) => [...prev, ""])} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/5">
              <Plus className="h-3.5 w-3.5" /> Add feature
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save plan
          </button>
        </div>
      </div>

      {/* Subscribers */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Subscribers ({subscriptions.length})</h2>
        <button onClick={refetch} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-gray-900 transition shadow-sm">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {subsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
          No subscribers yet
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Started</th>
                  <th className="px-6 py-3">Renews</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{s.profile?.full_name || "—"}</div>
                      <div className="text-xs text-gray-400">{s.profile?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{s.planName}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{inr(s.priceInr)} / {s.billingPeriod}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        s.status === "active" ? "bg-emerald-100 text-emerald-700" : s.status === "expired" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{shortDate(s.startedAt)}</td>
                    <td className="px-6 py-4 text-gray-600">{shortDate(s.renewsAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelected(s)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-primary hover:text-primary transition" title="View full details">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">Subscription details</h3>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
              <DetailSection title="Customer">
                <DetailRow icon={User} label="Name" value={selected.profile?.full_name || "—"} />
                <DetailRow icon={Mail} label="Email" value={selected.profile?.email || "—"} />
                <DetailRow icon={Phone} label="Phone" value={selected.profile?.phone || "—"} />
                <DetailRow icon={Hash} label="User ID" value={selected.userId} mono />
              </DetailSection>

              <DetailSection title="Plan">
                <DetailRow icon={KeyRound} label="Plan name" value={selected.planName} />
                <DetailRow icon={Hash} label="Plan ID" value={selected.planId ?? "—"} mono />
                <DetailRow icon={KeyRound} label="Amount" value={`${inr(selected.priceInr)} / ${selected.billingPeriod}`} />
              </DetailSection>

              <DetailSection title="Subscription">
                <DetailRow icon={Hash} label="Subscription ID" value={selected.id} mono />
                <DetailRow icon={ShieldCheck} label="Status" value={selected.status} />
                <DetailRow icon={Calendar} label="Created" value={new Date(selected.createdAt).toLocaleString("en-IN")} />
                <DetailRow icon={Calendar} label="Started" value={new Date(selected.startedAt).toLocaleString("en-IN")} />
                <DetailRow icon={Calendar} label={selected.status === "active" ? "Renews" : "Expired"} value={new Date(selected.renewsAt).toLocaleString("en-IN")} />
                {selected.status === "active" && (
                  <DetailRow icon={ShieldCheck} label="Days remaining" value={String(daysRemaining(selected.renewsAt))} />
                )}
              </DetailSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">{title}</h4>
      <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">{children}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, mono }: { icon: typeof User; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-2 text-gray-500"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className={`text-right font-medium text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-gray-400";

function FieldWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}
