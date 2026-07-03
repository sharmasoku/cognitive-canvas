import { supabase } from "./client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

type OAuthProvider = "google" | "apple" | "microsoft";

// Native Supabase OAuth wrapper. Returns `{ redirected: true }` once the browser
// redirect is initiated, or `{ error }` on failure.
export const oauth = {
  signInWithOAuth: async (provider: OAuthProvider, opts?: SignInOptions) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider === "microsoft" ? "azure" : provider,
      options: {
        redirectTo: opts?.redirect_uri,
        queryParams: opts?.extraParams,
      },
    });

    if (error) {
      return { error };
    }

    return { redirected: true, url: data?.url };
  },
};
