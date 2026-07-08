import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Eye, EyeOff, Hash, KeyRound, Loader2, Mail, Phone, Plus, RefreshCw, ShieldCheck, Trash2, User, X, Edit, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { useAllSubscriptions, useAllLicensePlans, upsertLicensePlan, deleteLicensePlan, toggleLicensePlanActive, daysRemaining, type AdminSubscription, type LicensePlan } from "@/hooks/useLicense";
import { inr, shortDate } from "@/lib/format";

export const Route = createFileRoute("/admin/license")({
  component: AdminLicensePage,
});

function AdminLicensePage() {
  const { plans, loading: plansLoading, refetch: refetchPlans } = useAllLicensePlans();
  const { subscriptions, loading: subsLoading, refetch: refetchSubs } = useAllSubscriptions();
  const [selected, setSelected] = useState<AdminSubscription | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form / Modal State
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LicensePlan | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState<LicensePlan | null>(null);
  const [confirmToggleActive, setConfirmToggleActive] = useState<LicensePlan | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("year");
  const [features, setFeatures] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const filteredSubscriptions = subscriptions.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (s.profile?.full_name || "").toLowerCase().includes(term) ||
      (s.profile?.email || "").toLowerCase().includes(term) ||
      s.planName.toLowerCase().includes(term) ||
      s.userId.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" || s.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const openAddForm = () => {
    setEditingPlan(null);
    setIsAddMode(true);
    setName("");
    setPrice("");
    setBillingPeriod("year");
    setFeatures([""]);
    setIsActive(true);
    setShowForm(true);
  };

  const openEditForm = (p: LicensePlan) => {
    setEditingPlan(p);
    setIsAddMode(false);
    setName(p.name);
    setPrice(String(p.priceInr));
    setBillingPeriod(p.billingPeriod);
    setFeatures(p.features.length ? p.features : [""]);
    setIsActive(p.isActive);
    setShowForm(true);
  };

  const handleSave = async () => {
    const priceNum = parseInt(price, 10);
    if (!name.trim()) { toast.error("Enter a plan name"); return; }
    if (Number.isNaN(priceNum) || priceNum < 0) { toast.error("Enter a valid price"); return; }

    setSaving(true);
    const { ok, error } = await upsertLicensePlan({
      id: editingPlan?.id,
      name: name.trim(),
      price_inr: priceNum,
      billing_period: billingPeriod,
      features: features.map((f) => f.trim()).filter(Boolean),
      is_active: isActive,
    });
    setSaving(false);
    if (ok) {
      toast.success(isAddMode ? "License plan created" : "License plan updated");
      setShowForm(false);
      refetchPlans();
    } else {
      toast.error(error || "Failed to save");
    }
  };

  const handleDelete = async (p: LicensePlan) => {
    const { ok, error } = await deleteLicensePlan(p.id);
    if (ok) {
      toast.success("License plan deleted");
      setConfirmDeletePlan(null);
      refetchPlans();
    } else {
      toast.error(error || "Failed to delete plan");
    }
  };

  const handleToggleActive = async (p: LicensePlan) => {
    const { ok, error } = await toggleLicensePlanActive(p.id, p.isActive);

    if (ok) {
      toast.success(p.isActive ? "License plan hidden" : "License plan is now active/visible");
      setConfirmToggleActive(null);
      refetchPlans();
    } else {
      toast.error(error || "Failed to update plan status");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminHeading word="License" sub="Enterprise patent licensing plans & subscribers" />
        <button onClick={openAddForm} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition">
          <Plus className="h-4 w-4" /> Add license plan
        </button>
      </motion.div>

      {/* Licenses list */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-primary">Manage TeleLicence Plans</h2>
          <button onClick={refetchPlans} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-gray-900 transition" title="Refetch plans">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {plansLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl">
            No license plans configured. Create one to display it on the site.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <div key={p.id} className={`flex flex-col justify-between rounded-xl border p-5 transition shadow-sm ${p.isActive ? "border-primary/10 bg-white" : "border-gray-100 bg-gray-50/50 opacity-80"}`}>
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-primary leading-tight">{p.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                      {p.isActive ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-2xl font-extrabold text-gray-900">{inr(p.priceInr)}</span>
                    <span className="text-xs text-gray-500 mb-1">/ {p.billingPeriod}</span>
                  </div>
                  {p.features.length > 0 && (
                    <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
                      {p.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {p.features.length > 3 && (
                        <li className="text-[10px] text-gray-400 font-medium pl-5">+{p.features.length - 3} more features</li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-150 flex items-center justify-between gap-2">
                  <button onClick={() => openEditForm(p)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmToggleActive(p)}
                      className={`p-1.5 rounded-lg border transition ${p.isActive ? "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900" : "border-primary/20 text-primary hover:bg-primary/5"}`}
                      title={p.isActive ? "Hide plan from website" : "Unhide plan (make active)"}
                    >
                      {p.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => setConfirmDeletePlan(p)} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition" title="Delete plan">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-primary">{isAddMode ? "Create New License" : "Edit License Plan"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
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

              <div className="flex items-center justify-between py-3 border-y border-gray-100">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Active status (Visibility)</div>
                  <div className="text-xs text-gray-500">Unhide to show on public licensing page</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Features</div>
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

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeletePlan && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setConfirmDeletePlan(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary">Delete license plan?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{confirmDeletePlan.name}</span>? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDeletePlan(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(confirmDeletePlan)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Hide/Unhide confirmation */}
      {confirmToggleActive && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setConfirmToggleActive(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary">
              {confirmToggleActive.isActive ? "Hide license plan?" : "Unhide license plan?"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to {confirmToggleActive.isActive ? "hide" : "unhide"}{" "}
              <span className="font-semibold text-gray-700">{confirmToggleActive.name}</span>?{" "}
              {confirmToggleActive.isActive
                ? "It will no longer be visible to customers on the website."
                : "It will become visible to customers on the website."}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmToggleActive(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleToggleActive(confirmToggleActive)} className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribers */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-primary">Subscribers ({filteredSubscriptions.length})</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-gray-400 w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button onClick={refetchSubs} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-gray-900 transition shadow-sm" title="Refresh subscribers">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {subsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
          No matching subscribers found
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
                {filteredSubscriptions.map((s) => (
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
              <h3 className="text-lg font-bold text-primary">Subscription details</h3>
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
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">{title}</h4>
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
