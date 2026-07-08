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

/** Helper to decode base64 resume and upload to Supabase storage */
async function uploadResumeServer(base64Data: string, filename: string, email: string): Promise<string | null> {
  try {
    const base64Content = base64Data.split(";base64,").pop();
    if (!base64Content) return null;
    const buffer = Buffer.from(base64Content, "base64");
    const ext = (filename.split(".").pop() || "pdf").toLowerCase();
    const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    const path = `resumes/${cleanEmail}_${Date.now()}_resume.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from("admin-assets")
      .upload(path, buffer, {
        upsert: true,
        contentType: ext === "pdf" ? "application/pdf" : ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/octet-stream"
      });

    if (error) {
      console.warn("[applications] storage upload failed:", error.message);
      return null;
    }
    const { data } = supabaseAdmin.storage.from("admin-assets").getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.warn("[applications] storage upload exception:", (e as Error).message);
    return null;
  }
}

/** Insert one application row. Returns ok=false on failure (caller stays best-effort). */
export async function insertApplication(
  app: RecruitmentEmailPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    let finalMessage = app.message || "";
    if (app.resumeBase64 && app.resumeName) {
      const resumeUrl = await uploadResumeServer(app.resumeBase64, app.resumeName, app.email);
      if (resumeUrl) {
        finalMessage = `[RESUME:${resumeUrl}|NAME:${app.resumeName}]${finalMessage}`;
      }
    }

    const writer = supabaseAdmin as unknown as ApplicationsWriter;
    const { error } = await writer.from("job_applications").insert({
      full_name: app.fullName,
      email: app.email,
      dob: app.dob || null,
      gender: app.gender || null,
      contact: app.contact || null,
      aadhaar: app.aadhaar || null,
      address: app.address || null,
      message: finalMessage,
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
