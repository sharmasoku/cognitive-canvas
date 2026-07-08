import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export interface LicensePlan {
  id: string;
  name: string;
  priceInr: number;
  billingPeriod: "month" | "year";
  features: string[];
  isActive: boolean;
}

function mapPlan(row: Tables<"license_plans">): LicensePlan {
  return {
    id: row.id,
    name: row.name,
    priceInr: row.price_inr,
    billingPeriod: row.billing_period as "month" | "year",
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    isActive: row.is_active,
  };
}

/** The current active enterprise license plan, or null if none configured. */
export async function fetchActiveLicensePlan(): Promise<LicensePlan | null> {
  const { data } = await supabase
    .from("license_plans")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapPlan(data) : null;
}

export function useLicensePlan() {
  const [plan, setPlan] = useState<LicensePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchActiveLicensePlan()
      .then((p) => { if (!cancelled) setPlan(p); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { plan, loading };
}

export interface LicenseSubscription {
  id: string;
  planName: string;
  priceInr: number;
  billingPeriod: "month" | "year";
  status: "active" | "expired" | "cancelled";
  startedAt: string;
  renewsAt: string;
}

function mapSubscription(row: Tables<"license_subscriptions">): LicenseSubscription {
  return {
    id: row.id,
    planName: row.plan_name,
    priceInr: row.price_inr,
    billingPeriod: row.billing_period as "month" | "year",
    status: row.status as "active" | "expired" | "cancelled",
    startedAt: row.started_at,
    renewsAt: row.renews_at,
  };
}

/** The signed-in user's most recent license subscription, or null if they've never subscribed. */
export function useUserSubscription(userId: string | null | undefined) {
  const [subscription, setSubscription] = useState<LicenseSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("license_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSubscription(data ? mapSubscription(data) : null);
    } catch {
      /* best-effort */
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { subscription, loading, refetch: fetch };
}

/**
 * Start a subscription for the signed-in user. The server RPC re-reads the
 * active plan itself, so the price/period actually charged is never trusted
 * from the client. Returns null for guests or an unconfigured/unseeded plan.
 */
export async function subscribeToLicense(): Promise<{ id: string } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase.rpc("subscribe_to_license_tx", { p_user_id: userId });
    if (error || !data) {
      console.warn("[license] subscribe_to_license_tx failed:", error?.message);
      return null;
    }
    return { id: data };
  } catch (e) {
    console.warn("[license] subscribeToLicense exception:", (e as Error).message);
    return null;
  }
}

/** Days remaining until renewal (0 if already past due). */
export function daysRemaining(renewsAt: string): number {
  const ms = new Date(renewsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/* ─── Admin ─── */

export interface LicensePlanInput {
  id?: string;
  name: string;
  price_inr: number;
  billing_period: "month" | "year";
  features: string[];
  is_active?: boolean;
}

/** Create or update the enterprise plan. */
export async function upsertLicensePlan(input: LicensePlanInput) {
  if (input.id) {
    const { error } = await supabase
      .from("license_plans")
      .update({
        name: input.name,
        price_inr: input.price_inr,
        billing_period: input.billing_period,
        features: input.features,
        is_active: input.is_active,
        updated_at: new Date().toISOString(),
      } as unknown as TablesUpdate<"license_plans">)
      .eq("id", input.id);
    return { ok: !error, error: error?.message };
  }
  const { error } = await supabase.from("license_plans").insert({
    name: input.name,
    price_inr: input.price_inr,
    billing_period: input.billing_period,
    features: input.features,
    is_active: input.is_active ?? true,
  } as unknown as TablesInsert<"license_plans">);
  return { ok: !error, error: error?.message };
}

export function useAllLicensePlans() {
  const [plans, setPlans] = useState<LicensePlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("license_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setPlans(data.map(mapPlan));
      }
    } catch {
      // best-effort
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { plans, loading, refetch: fetch };
}

export async function deleteLicensePlan(id: string) {
  const { error } = await supabase
    .from("license_plans")
    .delete()
    .eq("id", id);
  return { ok: !error, error: error?.message };
}

export async function toggleLicensePlanActive(id: string, currentStatus: boolean) {
  const { error } = await supabase
    .from("license_plans")
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    } as unknown as TablesUpdate<"license_plans">)
    .eq("id", id);
  return { ok: !error, error: error?.message };
}

export interface AdminSubscription {
  id: string;
  userId: string;
  planId: string | null;
  planName: string;
  priceInr: number;
  billingPeriod: string;
  status: string;
  startedAt: string;
  renewsAt: string;
  createdAt: string;
  profile: { full_name: string | null; email: string | null; phone: string | null } | null;
}

/** All subscriptions, newest first, with the subscriber's profile joined in. */
export function useAllSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("license_subscriptions")
        .select("*, profiles!license_subscriptions_user_id_fkey(full_name, email, phone)")
        .order("created_at", { ascending: false });

      const mapRow = (s: any): AdminSubscription => ({
        id: s.id,
        userId: s.user_id,
        planId: s.plan_id,
        planName: s.plan_name,
        priceInr: s.price_inr,
        billingPeriod: s.billing_period,
        status: s.status,
        startedAt: s.started_at,
        renewsAt: s.renews_at,
        createdAt: s.created_at,
        profile: Array.isArray(s.profiles) ? (s.profiles[0] ?? null) : (s.profiles ?? null),
      });

      if (!error && data) {
        setSubscriptions(data.map(mapRow));
      } else if (error) {
        const { data: d2 } = await supabase
          .from("license_subscriptions")
          .select("*")
          .order("created_at", { ascending: false });
        if (d2) setSubscriptions(d2.map((s: any) => ({ ...mapRow(s), profile: null })));
      }
    } catch {
      /* best-effort */
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { subscriptions, loading, refetch: fetch };
}
