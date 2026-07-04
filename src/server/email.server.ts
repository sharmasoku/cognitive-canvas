// Server-only email module. Touches the RESEND_API_KEY and supabaseAdmin, so it
// must NEVER be imported from client code or *.functions.ts at module scope —
// server functions dynamic-import it inside their handler (see email.functions.ts).
import { render } from "@react-email/render";
import { Resend } from "resend";
import { OrderConfirmation } from "@/emails/OrderConfirmation";
import { RecruitmentConfirmation } from "@/emails/RecruitmentConfirmation";
import { brand } from "@/emails/brand";
import type { OrderEmailPayload, RecruitmentEmailPayload } from "@/emails/types";

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

let _resend: Resend | undefined;
function resend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || `${brand.name} <onboarding@resend.dev>`;
}

/** Order confirmation to the customer's shipping email. Best-effort. */
export async function sendOrderConfirmation(order: OrderEmailPayload): Promise<SendResult> {
  try {
    const html = await render(OrderConfirmation(order));
    const { data, error } = await resend().emails.send({
      from: fromAddress(),
      to: order.shippingAddress.email,
      subject: `Your ${brand.name} order ${order.orderId} is confirmed`,
      html,
    });
    if (error) {
      console.warn("[email] order confirmation failed:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    const msg = (e as Error).message;
    console.warn("[email] order confirmation threw:", msg);
    return { ok: false, error: msg };
  }
}

/** Applicant confirmation, with an optional admin notification bcc. Best-effort. */
export async function sendRecruitmentConfirmation(
  app: RecruitmentEmailPayload,
): Promise<SendResult> {
  try {
    const html = await render(RecruitmentConfirmation(app));
    const notify = process.env.RECRUITMENT_NOTIFY_TO;
    const { data, error } = await resend().emails.send({
      from: fromAddress(),
      to: app.email,
      bcc: notify ? [notify] : undefined,
      subject: `We've received your ${brand.name} application`,
      html,
    });
    if (error) {
      console.warn("[email] recruitment confirmation failed:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    const msg = (e as Error).message;
    console.warn("[email] recruitment confirmation threw:", msg);
    return { ok: false, error: msg };
  }
}
