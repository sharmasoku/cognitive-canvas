import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (!error && data) setProfile(data);
    } catch {
      /* env not configured */
    }
  }, []);

  const checkAdmin = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) {
        console.error("[AuthContext] checkAdmin error:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (err) {
      console.error("[AuthContext] checkAdmin exception:", err);
      setIsAdmin(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    let cancelled = false;

    // Check mock session
    const getMockUser = () => {
      if (typeof window === "undefined") return null;
      const mock = localStorage.getItem("tele_mock_user");
      if (mock) {
        try {
          const parsed = JSON.parse(mock);
          return {
            id: parsed.id || "mock-user-id",
            email: parsed.email || "demo@telear.com",
            user_metadata: {
              full_name: parsed.name || "TeleAR Explorer",
            },
            email_confirmed_at: null,
            phone: null,
            confirmed_at: null,
            last_sign_in_at: null,
            role: "authenticated",
            aud: "authenticated",
            app_metadata: {},
            created_at: new Date().toISOString(),
          } as any as User;
        } catch {
          return null;
        }
      }
      return null;
    };

    async function init() {
      try {
        const mockUser = getMockUser();
        if (mockUser) {
          setUser(mockUser);
          setIsAdmin(true); // Allow mock users to access admin panel
          setProfile({
            id: mockUser.id,
            full_name: mockUser.user_metadata.full_name,
            email: mockUser.email || null,
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        if (session?.user) {
          setUser(session.user);
          // Wait for both to complete before turning off loading state (so page guards don't immediately redirect)
          await Promise.all([
            fetchProfile(session.user.id),
            checkAdmin(session.user.id),
          ]);
        }
      } catch {
        /* supabase not configured */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return;
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
          checkAdmin(session.user.id);
        } else {
          // If logged out of Supabase, check if mock user is still present
          const mockUser = getMockUser();
          if (mockUser) {
            setUser(mockUser);
            setIsAdmin(true);
            setProfile({
              id: mockUser.id,
              full_name: mockUser.user_metadata.full_name,
              email: mockUser.email || null,
              phone: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else {
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
        }
      },
    );

    // Listen for storage events (mock login/logout)
    const handleStorage = () => {
      const mockUser = getMockUser();
      if (mockUser) {
        setUser(mockUser);
        setIsAdmin(true);
        setProfile({
          id: mockUser.id,
          full_name: mockUser.user_metadata.full_name,
          email: mockUser.email || null,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        // Only sign out if supabase isn't signed in either
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session?.user) {
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
        });
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchProfile, checkAdmin]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tele_mock_user");
    }
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const value: AuthState = { user, profile, isAdmin, loading, signOut, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
