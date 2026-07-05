import { motion } from "framer-motion";
import { Calendar, Mail, ShieldCheck, User } from "lucide-react";
import type { ReactNode } from "react";
import type { LicenseSubscription } from "@/hooks/useLicense";
import { daysRemaining } from "@/hooks/useLicense";
import { inr, shortDate } from "@/lib/format";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface SubscriptionDetailsCardProps {
  subscription: LicenseSubscription;
  customerName?: string | null;
  customerEmail?: string | null;
  /** Rendered at the bottom of the info card, e.g. a renew link/button for an expired plan. */
  footer?: ReactNode;
}

/**
 * Full subscription detail view: who holds it, what plan, and (while active)
 * a glassy countdown of time remaining until renewal. Shared by the account
 * page's Subscription tab and the /licence page itself, so a subscriber sees
 * the exact same picture in either place.
 */
export function SubscriptionDetailsCard({ subscription, customerName, customerEmail, footer }: SubscriptionDetailsCardProps) {
  const active = subscription.status === "active";
  const remaining = daysRemaining(subscription.renewsAt);
  const totalMs = new Date(subscription.renewsAt).getTime() - new Date(subscription.startedAt).getTime();
  const remainingMs = new Date(subscription.renewsAt).getTime() - Date.now();
  const remainingPct = totalMs > 0 ? Math.min(100, Math.max(0, (remainingMs / totalMs) * 100)) : 0;

  return (
    <div className="space-y-6 text-left">
      <div className="rounded-2xl border border-border-light bg-background p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-foreground">{subscription.planName}</div>
            <div className="mt-0.5 text-xs text-text-muted">{inr(subscription.priceInr)} / {subscription.billingPeriod}</div>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            active ? "bg-emerald-100 text-emerald-700" : subscription.status === "expired" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
          }`}>
            {subscription.status}
          </span>
        </div>

        {(customerName || customerEmail) && (
          <div className="mt-5 grid gap-4 border-t border-border-light pt-5 sm:grid-cols-2">
            {customerName && <DetailRow icon={User} label="Subscriber" value={customerName} />}
            {customerEmail && <DetailRow icon={Mail} label="Email" value={customerEmail} />}
          </div>
        )}

        <div className="mt-5 grid gap-4 border-t border-border-light pt-5 sm:grid-cols-3">
          <DetailRow icon={Calendar} label="Started" value={shortDate(subscription.startedAt)} />
          <DetailRow icon={Calendar} label={active ? "Renews on" : "Expired on"} value={shortDate(subscription.renewsAt)} />
          <DetailRow icon={ShieldCheck} label="Subscription ID" value={subscription.id.slice(0, 8).toUpperCase()} mono />
        </div>

        {footer && <div className="mt-6">{footer}</div>}
      </div>

      {active && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 text-white shadow-glow-primary sm:p-8">
          <div className="orb" style={{ width: 260, height: 260, background: "#ffffff", top: -100, right: -80, opacity: 0.15 }} />
          <div className="orb" style={{ width: 200, height: 200, background: "#10b981", bottom: -90, left: -60, opacity: 0.2 }} />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-white/70">Time remaining</div>
              <div className="mt-1 text-4xl font-extrabold font-heading">{remaining} {remaining === 1 ? "day" : "days"}</div>
            </div>
            <ShieldCheck className="h-9 w-9 text-white/50" />
          </div>

          {/* Glassy progress track */}
          <div className="relative mt-6">
            <div className="h-4 w-full overflow-hidden rounded-full border border-white/25 bg-white/15 backdrop-blur-md">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${remainingPct}%` }}
                transition={{ duration: 1, ease: EASE }}
                className="h-full rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.7)]"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-white/70">
              <span>Started {shortDate(subscription.startedAt)}</span>
              <span>Renews {shortDate(subscription.renewsAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, mono }: { icon: typeof User; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-text-muted">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</div>
        <div className={`truncate text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}
