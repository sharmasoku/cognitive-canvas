import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/shell/Logo";
import { toast } from "sonner";
import { z } from "zod";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const authSearchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "TeleARGlass" }] }),
  validateSearch: (search) => authSearchSchema.parse(search),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, mode: queryMode } = Route.useSearch();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot" | "reset">(
    queryMode === "reset" ? "reset" : "signin"
  );
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Sync recovery mode cleanly on client mount or URL change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isReset =
        queryMode === "reset" ||
        window.location.search.includes("mode=reset") ||
        window.location.hash.includes("type=recovery") ||
        window.location.hash.includes("access_token");
      if (isReset) {
        setAuthMode("reset");
      }
    }
  }, [queryMode]);

  // Check if already logged in and redirect (ONLY if NOT resetting password)
  useEffect(() => {
    if (authMode === "reset") return;

    if (typeof window !== "undefined") {
      const isReset =
        window.location.search.includes("mode=reset") ||
        window.location.hash.includes("type=recovery");
      if (isReset) {
        setAuthMode("reset");
        return;
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: redirect || "/" });
      }
    });
  }, [navigate, redirect, authMode]);

  // Listen for Supabase PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("reset");
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });

        if (error) {
          if (error.message.includes("environment variables")) {
            toast.success("Password reset instructions sent to your email (Demo Mode).");
            setAuthMode("signin");
          } else {
            throw error;
          }
        } else {
          toast.success("Password reset link has been sent to your email!");
          setAuthMode("signin");
        }
      } else if (authMode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          if (error.message.includes("environment variables")) {
            toast.success("Password updated successfully (Demo Mode)!");
            setAuthMode("signin");
          } else {
            throw error;
          }
        } else {
          toast.success("Your password has been reset successfully! Please sign in with your new password.");
          setAuthMode("signin");
        }
      } else if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("environment variables")) {
            // Environment variables fallback / Mock SignUp
            if (typeof window !== "undefined") {
              window.localStorage.setItem("tele_mock_user", JSON.stringify({ email, name: fullName }));
              window.dispatchEvent(new Event("storage"));
            }
            toast.success("Account created successfully (Demo Mode)");
            navigate({ to: redirect || "/" });
          } else {
            throw error;
          }
        } else {
          if (data.session) {
            toast.success("Account created & logged in successfully!");
            navigate({ to: redirect || "/" });
          } else {
            // Attempt immediate sign in with credentials
            const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (!loginErr && loginData.session) {
              toast.success("Account created & logged in successfully!");
              navigate({ to: redirect || "/" });
            } else {
              toast.success("Account created! You can now sign in with your credentials.");
              setAuthMode("signin");
            }
          }
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("environment variables")) {
            // Environment variables fallback / Mock Login
            if (typeof window !== "undefined") {
              window.localStorage.setItem("tele_mock_user", JSON.stringify({ email, name: email.split("@")[0] }));
              window.dispatchEvent(new Event("storage"));
            }
            toast.success("Logged in successfully (Demo Mode)");
            navigate({ to: redirect || "/" });
          } else {
            throw error;
          }
        } else if (data.session) {
          toast.success("Successfully logged in!");
          navigate({ to: redirect || "/" });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Check your credentials.";
      if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("rate_limit")) {
        toast.error("Email rate limit exceeded. Supabase restricts confirmation emails per hour. Please wait a few minutes or switch to Custom SMTP in Supabase.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case "signup": return "Create account";
      case "forgot": return "Reset Password";
      case "reset": return "Set New Password";
      default: return "Welcome back";
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case "signup": return "Register to start managing your orders.";
      case "forgot": return "Enter your email to receive a password reset link.";
      case "reset": return "Enter your new password below.";
      default: return "Sign in to manage your orders.";
    }
  };

  return (
    <div className="relative isolate flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-r from-[#F4EFFF] via-[#FFFFFF] to-[#F0F7FF] px-4 py-16 text-[#1016FF] sm:px-6 lg:px-8">
      {/* Background layers, matching the Hero's light editorial stage */}
      <div className="orb -z-10 animate-pulse" style={{ width: 620, height: 620, background: "#1016FF", top: -240, left: -220, opacity: 0.1 }} />
      <div className="orb -z-10 animate-pulse" style={{ width: 560, height: 560, background: "#2563eb", bottom: -240, right: -200, opacity: 0.08 }} />
      <div className="absolute inset-0 -z-10 bg-grid opacity-[0.03]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_38%,rgba(27,45,107,0.04),transparent_62%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="glass relative z-10 w-full max-w-[440px] rounded-[2rem] p-8 shadow-card-hover border border-[#1016FF]/15 sm:p-10"
      >
        {/* Top Header Logo */}
        <Link to="/" className="inline-flex items-center">
          <Logo className="h-11" />
        </Link>

        {/* Header Text */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold tracking-tight text-[#1016FF]">
            {getTitle()}
          </h2>
          <p className="mt-2 text-sm text-[#1016FF]/70">
            {getSubtitle()}
          </p>
        </div>

        {/* Email & Password Form */}
        <form className="mt-8 space-y-4" onSubmit={handleAuthSubmit}>
          {authMode === "signup" && (
            <div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl border border-border bg-white/50 backdrop-blur-sm py-3.5 px-4 text-sm text-[#1016FF] placeholder-[#1016FF]/40 outline-none transition focus:border-[#1016FF] focus:ring-2 focus:ring-[#1016FF]/20"
              />
            </div>
          )}

          {authMode !== "reset" && (
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-border bg-white/50 backdrop-blur-sm py-3.5 px-4 text-sm text-[#1016FF] placeholder-[#1016FF]/40 outline-none transition focus:border-[#1016FF] focus:ring-2 focus:ring-[#1016FF]/20"
              />
            </div>
          )}

          {authMode !== "forgot" && (
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authMode === "reset" ? "New password" : "Password"}
                className="w-full rounded-2xl border border-border bg-white/50 backdrop-blur-sm py-3.5 px-4 text-sm text-[#1016FF] placeholder-[#1016FF]/40 outline-none transition focus:border-[#1016FF] focus:ring-2 focus:ring-[#1016FF]/20"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="magnetic mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1016FF] py-3.5 px-6 text-sm font-semibold text-white shadow-glow-primary transition hover:bg-[#142252] disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {authMode === "signup" && "Sign Up"}
            {authMode === "signin" && "Sign In"}
            {authMode === "forgot" && "Send Reset Link"}
            {authMode === "reset" && "Update Password"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 flex flex-col items-center gap-3 text-center text-sm">
          {authMode === "signin" && (
            <button
              type="button"
              onClick={() => setAuthMode("forgot")}
              className="font-medium text-[#1016FF] hover:underline hover:text-[#142252]"
            >
              Forgot password?
            </button>
          )}

          <div className="text-[#1016FF]/70">
            {authMode === "signup" && (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setAuthMode("signin")} className="font-semibold text-[#1016FF] hover:underline">
                  Sign in
                </button>
              </>
            )}
            {authMode === "signin" && (
              <>
                No account?{" "}
                <button type="button" onClick={() => setAuthMode("signup")} className="font-semibold text-[#1016FF] hover:underline">
                  Sign up
                </button>
              </>
            )}
            {(authMode === "forgot" || authMode === "reset") && (
              <button type="button" onClick={() => setAuthMode("signin")} className="font-semibold text-[#1016FF] hover:underline">
                Back to Sign In
              </button>
            )}
          </div>
        </div>

        {/* Compliance Footer message */}
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-[#1016FF]/10 pt-4 text-xs text-[#1016FF]/60">
          <svg className="h-4 w-4 shrink-0 text-[#1016FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Your neural privacy, secured.</span>
        </div>
      </motion.div>
    </div>
  );
}
