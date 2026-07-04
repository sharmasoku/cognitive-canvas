// Server-only persistence for recruitment applications. Uses the service-role
// admin client (bypasses RLS), so it must only be dynamic-imported from a
// server-function handler — never from client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { RecruitmentEmailPayload } from "@/emails/types";

interface JobApplicationInsert {
  full_name: string;
  email: string;
  dob: string | null;
  gender: string | null;
  contact: string | null;
  aadhaar: string | null;
  address: string | null;
  message: string | null;
}

// job_applications isn't in the generated Database types yet; narrow the
// admin client to just the insert shape we need instead of casting to `any`.
type ApplicationsWriter = {
  from: (table: string) => {
    insert: (value: JobApplicationInsert) => PromiseLike<{ error: { message: string } | null }>;
  };
};

/** Insert one application row. Returns ok=false on failure (caller stays best-effort). */
export async function insertApplication(
  app: RecruitmentEmailPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const writer = supabaseAdmin as unknown as ApplicationsWriter;
    const { error } = await writer.from("job_applications").insert({
      full_name: app.fullName,
      email: app.email,
      dob: app.dob || null,
      gender: app.gender || null,
      contact: app.contact || null,
      aadhaar: app.aadhaar || null,
      address: app.address || null,
      message: app.message || null,
    });
    if (error) {
      console.warn("[applications] insert failed:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    const msg = (e as Error).message;
    console.warn("[applications] insert threw:", msg);
    return { ok: false, error: msg };
  }
}
