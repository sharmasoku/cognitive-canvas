import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { oauth } from "@/integrations/supabase/oauth";
import { Logo } from "@/components/shell/Logo";
import { toast } from "sonner";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Authentication — TeleARGlass" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Check if already logged in and redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/" });
      }
    });
  }, [navigate]);

  const handleOAuthLogin = async (provider: "google") => {
    setLoading(true);
    try {
      const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
      const response = await oauth.signInWithOAuth(provider, {
        redirect_uri: redirectUri,
      });

      if (response?.error) {
        // Fallback for mock if supabase keys not set
        toast.error(`OAuth configuration issue: ${response.error.message}. Simulating mock success...`);
        console.log("Mocking OAuth session start...");

        // Simulating mock success by storing a mock user token
        if (typeof window !== "undefined") {
          window.localStorage.setItem("tele_mock_user", JSON.stringify({
            email: `${provider === "google" ? "google-user" : "demo"}@telear.com`,
            name: provider === "google" ? "Google User" : "Demo Account",
            provider
          }));
          window.dispatchEvent(new Event("storage"));
        }
        toast.success("Successfully logged in (Demo Mode)");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OAuth authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
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
            navigate({ to: "/" });
          } else {
            throw error;
          }
        } else {
          if (data.session) {
            toast.success("Successfully registered!");
            navigate({ to: "/" });
          } else {
            toast.success("Check your email for the confirmation link!");
            setIsSignUp(false);
            setPassword("");
          }
        }
      } else {
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
            navigate({ to: "/" });
          } else {
            throw error;
          }
        } else if (data.session) {
          toast.success("Successfully logged in!");
          navigate({ to: "/" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-dark px-4 py-16 text-white sm:px-6 lg:px-8">
      {/* Background layers, matching the Hero's dark editorial stage */}
      <div className="orb -z-10" style={{ width: 620, height: 620, background: "#7c3aed", top: -240, left: -220, opacity: 0.32 }} />
      <div className="orb -z-10" style={{ width: 560, height: 560, background: "#2563eb", bottom: -240, right: -200, opacity: 0.28 }} />
      <div className="absolute inset-0 -z-10 bg-grid opacity-[0.08]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_38%,rgba(124,58,237,0.18),transparent_62%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="glass-dark relative z-10 w-full max-w-[440px] rounded-[2rem] p-8 shadow-card-hover sm:p-10"
      >
        {/* Top Header Logo */}
        <Link to="/" className="inline-flex items-center">
          <Logo className="h-11" />
        </Link>

        {/* Header Text */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {isSignUp ? "Create account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {isSignUp ? "Register to start managing your orders." : "Sign in to manage your orders."}
          </p>
        </div>

        {/* Continue with Google button */}
        <div className="mt-7">
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 py-3.5 px-6 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0a0d14] px-3 text-white/40">or</span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form className="space-y-4" onSubmit={handleEmailAuth}>
          {isSignUp && (
            <div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm text-white placeholder-white/35 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm text-white placeholder-white/35 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm text-white placeholder-white/35 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="magnetic mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-3.5 px-6 text-sm font-semibold text-white shadow-glow-primary transition disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 flex flex-col items-center gap-3 text-center text-sm">
          {!isSignUp && (
            <a href="#" className="font-medium text-primary-light hover:underline">
              Forgot password?
            </a>
          )}

          <div className="text-white/50">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button onClick={() => setIsSignUp(false)} className="font-medium text-primary-light hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                No account?{" "}
                <button onClick={() => setIsSignUp(true)} className="font-medium text-primary-light hover:underline">
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Compliance Footer message */}
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/10 pt-4 text-xs text-white/40">
          <svg className="h-4 w-4 shrink-0 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Your neural privacy, secured.</span>
        </div>
      </motion.div>
    </div>
  );
}
