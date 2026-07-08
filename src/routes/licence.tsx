import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Glasses, Accessibility, Cpu, BrainCircuit, LayoutGrid, PackageCheck,
  Brush, Radar, Sparkles, Check, ArrowRight, Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import BorderGlow from "@/components/ui/BorderGlow";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { useAuth } from "@/context/AuthContext";
import { daysRemaining, subscribeToLicense, useLicensePlan, useUserSubscription } from "@/hooks/useLicense";
import { sendSubscriptionEmailFn } from "@/lib/email.functions";
import { inr, shortDate } from "@/lib/format";

export const Route = createFileRoute("/licence")({
  head: () => ({ meta: [{ title: "TeleLicence — Patent Licensing" }] }),
  component: Licence,
});

const GLOW_COLORS = ["#1016FF", "#2563eb", "#10b981"];

const FEATURES = [
  { icon: Glasses, title: "Thinking Immersive AR Display", desc: "Think immersive AR display UI communication and control ." },
  { icon: Accessibility, title: "Speaking Accessibility", desc: "Our TeleARProducts Think to Speak feature for speaking disable ,vision impaired and paralyzed patients ." },
  { icon: Cpu, title: "PanOS Operating System", desc: "Our TeleARGlass product are powered by ThinkUI based communication and control - PanOS Operating System" },
  { icon: BrainCircuit, title: "Think Data AI Intepretation", desc: "We apply measured Think Data including alphabets ,digits, controlled actions in our Parijat Software as a AI Database." },
  { icon: LayoutGrid, title: "30+ Product Apps", desc: "TeleARGlass products has customized Parijat apps applicable in the areas of Indian Defence and Security accessibilty ,ISRO Space ,Education, Social Media , Entertainment , Automation and more ." },
  { icon: PackageCheck, title: "Telepathy Sensor Programable Control Board", desc: "It is the board schematic design layout to transmit the Think Data wirelessly to the AR Display , Mobile , Computer or the automation control action ." },
];

const DESIGN_FEATURES = [
  { icon: Brush, title: "TeleARGlass Aesthetics and Erognomics Design with Analysis" },
  { icon: Radar, title: "Think Data Capturing Telepathy  Sensor Design." },
];

const HIGHLIGHTS = ["PanOS Operating System", "Immersive AR Display", "Speaking Accessibility", "30+ Software Apps"];

export function Licence() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading } = useLicensePlan();
  const { subscription, loading: subLoading, refetch: refetchSubscription } = useUserSubscription(user?.id);
  const [paying, setPaying] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribeClick = () => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setPaying(true);
  };

  const handlePaymentSuccess = async () => {
    setSubscribing(true);
    const result = await subscribeToLicense();
    setSubscribing(false);
    if (!result) {
      toast.error("Could not activate your subscription. Please try again or contact support.");
      return;
    }
    toast.success("Your license is active!");
    refetchSubscription();

    if (user?.email && plan) {
      const now = new Date();
      const renewal = new Date(now);
      if (plan.billingPeriod === "month") renewal.setMonth(renewal.getMonth() + 1);
      else renewal.setFullYear(renewal.getFullYear() + 1);
      void sendSubscriptionEmailFn({
        data: {
          subscriptionId: result.id,
          customerName: user.user_metadata?.full_name || user.email,
          customerEmail: user.email,
          planName: plan.name,
          priceInr: plan.priceInr,
          billingPeriod: plan.billingPeriod,
          startedDate: shortDate(now),
          renewalDate: shortDate(renewal),
        },
      }).catch(() => { /* best-effort */ });
    }
  };

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div className="orb" style={{ width: 680, height: 680, background: "#1016FF", top: -260, left: -180, opacity: 0.12 }} />
      <div className="orb" style={{ width: 560, height: 560, background: "#2563eb", top: 240, right: -220, opacity: 0.08 }} />
      <div className="orb" style={{ width: 520, height: 520, background: "#10b981", bottom: -220, left: "35%", opacity: 0.06 }} />

      {/* Reduced vertical padding on mobile from py-20 to py-10 */}
      <div className="section-container relative py-10 md:py-20 lg:py-28">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border-light bg-surface px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-text-secondary">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Make-in-India · Patented Product
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight text-primary">
            Our Innovative, Sustainable Make-in-India Patented Product
          </h1>
          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-text-secondary">
            TeleARGlass runs on our proprietary <span className="font-semibold text-foreground">PanOS Operating System</span> with a customizable
            range of <span className="font-semibold text-foreground">30+ product software apps</span> — delivering augmented reality and
            advanced speaking accessibility.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {HIGHLIGHTS.map((h) => (
              <span key={h} className="rounded-full border border-border-light bg-surface px-3 py-1 text-[11px] font-medium text-text-secondary">
                {h}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Feature bento — glowing cards (Reduced top margin on mobile from mt-20 to mt-10) */}
        <div className="mt-10 md:mt-20 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
              className="h-full"
            >
              <BorderGlow
                backgroundColor="#ffffff"
                borderRadius={24}
                glowColor="265 85 62"
                glowIntensity={1}
                glowRadius={26}
                coneSpread={22}
                colors={GLOW_COLORS}
                className="h-full"
              >
                {/* Reduced card padding from p-7 to p-5 on mobile to keep layouts compact */}
                <div className="flex h-full flex-col p-5 sm:p-7">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-violet text-primary">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-base sm:text-lg font-bold text-primary">{f.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-text-secondary">{f.desc}</p>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </div>

        {/* Design highlights */}
        <div className="mt-8 grid items-stretch gap-6 md:grid-cols-2">
          {DESIGN_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="h-full"
            >
              <BorderGlow
                backgroundColor="#ffffff"
                borderRadius={24}
                glowColor="160 84 42"
                glowIntensity={1}
                glowRadius={30}
                coneSpread={22}
                colors={GLOW_COLORS}
                className="h-full"
              >
                {/* Reduced card padding from p-8 to p-5 on mobile */}
                <div className="flex h-full items-start gap-4 sm:gap-5 p-5 sm:p-8">
                  <div className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-surface-green text-accent-dark">
                    <f.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-primary">{f.title}</h3>
                    {"desc" in f && f.desc && <p className="mt-2 text-xs sm:text-sm leading-relaxed text-text-secondary">{f.desc}</p>}
                  </div>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </div>

        {/* Pricing centerpiece / subscriber details */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <BorderGlow
            animated
            backgroundColor="#ffffff"
            borderRadius={32}
            glowColor="265 88 60"
            glowIntensity={1.2}
            glowRadius={44}
            coneSpread={26}
            colors={GLOW_COLORS}
            className="w-full max-w-2xl"
          >
            {/* Reduced card padding on mobile from px-8 py-14 to px-5 py-8 to prevent overflow scrolling */}
            <div className="px-5 py-8 text-center md:px-16 md:py-14">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border-light bg-surface px-3 py-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-text-secondary">
                Limited-Time Patent Licensing
              </div>
              <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold leading-snug text-primary md:text-[2rem]">
                {((plan?.name ?? "TeleARGlass Patent License") || "").replace(/Enterprise/i, "").replace(/\s+/g, " ").trim()}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-text-secondary">For innovative &amp; sustainable organisations only.</p>

              {planLoading ? (
                <div className="mx-auto mt-6 sm:mt-9 h-12 sm:h-16 w-36 sm:w-48 animate-pulse rounded-2xl bg-surface" />
              ) : plan ? (
                // Sized down the pricing font scale clamp on mobile to fit "/ per year" nicely and prevent overlap clipping.
                // Added client 10-year subscription commitment detail text.
                <div className="mt-6 sm:mt-9">
                  <div className="flex flex-wrap items-baseline justify-center gap-1.5 sm:gap-2">
                    <span className="text-[clamp(2rem,8.5vw,4.5rem)] font-extrabold leading-none gradient-text md:text-7xl">
                      {inr(plan.priceInr)}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-text-secondary">/ per year</span>
                  </div>
                  <div className="mt-2 text-[10px] sm:text-xs font-bold text-accent uppercase tracking-widest font-mono">
                    10-Year Subscription
                  </div>
                </div>
              ) : (
                <p className="mt-6 sm:mt-9 text-xs sm:text-sm text-text-muted">Pricing is being finalised — check back shortly.</p>
              )}

              {plan && plan.features.length > 0 && (
                <ul className="mx-auto mt-6 sm:mt-8 max-w-sm space-y-2 sm:space-y-3 text-left">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary">
                      <span className="grid h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {!authLoading && !subLoading && subscription?.status === "active" ? (
                <>
                  <div className="mt-6 sm:mt-9 inline-flex items-center gap-2 rounded-full bg-surface-green px-4 py-2 text-xs sm:text-sm font-medium text-accent-dark">
                    <Check className="h-4 w-4" /> You're subscribed — {daysRemaining(subscription.renewsAt)} days remaining
                  </div>
                  <div className="mt-3">
                    <Link to="/account" search={{ tab: "subscription" }} className="text-xs sm:text-sm font-medium text-primary hover:underline">
                      View subscription details
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSubscribeClick}
                    disabled={!plan || subscribing}
                    className="group mt-6 sm:mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-8 py-3.5 sm:px-10 sm:py-4 text-xs sm:text-sm font-semibold text-white shadow-glow-primary transition hover:translate-y-[-2px] disabled:opacity-60"
                  >
                    {subscribing ? (
                      <>Activating… <Loader2 className="h-4 w-4 animate-spin" /></>
                    ) : (
                      <>Subscribe <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                    )}
                  </button>
                  <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-text-muted">
                    {user ? "Secure payment" : "Sign in to subscribe."}
                  </p>
                </>
              )}
            </div>
          </BorderGlow>
        </div>
      </div>

      {plan && (
        <PaymentModal
          open={paying}
          amount={plan.priceInr}
          onClose={() => setPaying(false)}
          onSuccess={async () => {
            await handlePaymentSuccess();
          }}
        />
      )}
    </div>
  );
}
