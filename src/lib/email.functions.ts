// Server functions bridging the client to the server-only email/persistence
// modules. createServerFn produces an RPC bridge that IS imported by client
// code, so this file lives OUTSIDE the import-protected src/server/ directory.
// It must NOT import the Resend SDK, supabaseAdmin, or any *.server.ts module at
// top level — those are dynamic-imported inside the handlers (stripped from the
// client bundle).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { OrderEmailPayload, RecruitmentEmailPayload, SubscriptionEmailPayload } from "@/emails/types";

const orderItemSchema = z.object({
  name: z.string(),
  qty: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
});

const orderEmailSchema = z.object({
  orderId: z.string(),
  items: z.array(orderItemSchema),
  subtotal: z.number(),
  discount: z.number(),
  shipping: z.number(),
  tax: z.number(),
  total: z.number(),
  shippingAddress: z.object({
    fullName: z.string(),
    email: z.string().email(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    phone: z.string(),
  }),
  deliverySpeed: z.enum(["standard", "priority"]),
  estimatedDate: z.string(),
  paymentPlan: z.enum(["full", "partial"]).optional(),
  amountPaidNow: z.number().optional(),
  amountDueLater: z.number().optional(),
});

const subscriptionEmailSchema = z.object({
  subscriptionId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  planName: z.string(),
  priceInr: z.number(),
  billingPeriod: z.enum(["month", "year"]),
  startedDate: z.string(),
  renewalDate: z.string(),
});

const recruitmentSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  dob: z.string().default(""),
  gender: z.string().default(""),
  contact: z.string().default(""),
  aadhaar: z.string().default(""),
  address: z.string().default(""),
  message: z.string().default(""),
  resumeBase64: z.string().optional(),
  resumeName: z.string().optional(),
});

/** Send an order-confirmation email. Never throws to the client. */
export const sendOrderEmailFn = createServerFn({ method: "POST" })
  .validator((data: OrderEmailPayload) => orderEmailSchema.parse(data))
  .handler(async ({ data }) => {
    const { sendOrderConfirmation } = await import("@/server/email.server");
    return sendOrderConfirmation(data);
  });

/** Send a license subscription confirmation email. Never throws to the client. */
export const sendSubscriptionEmailFn = createServerFn({ method: "POST" })
  .validator((data: SubscriptionEmailPayload) => subscriptionEmailSchema.parse(data))
  .handler(async ({ data }) => {
    const { sendSubscriptionConfirmation } = await import("@/server/email.server");
    return sendSubscriptionConfirmation(data);
  });

/** Persist a recruitment application, then email the applicant. Never throws to the client. */
export const submitRecruitmentFn = createServerFn({ method: "POST" })
  .validator((data: RecruitmentEmailPayload) => recruitmentSchema.parse(data))
  .handler(async ({ data }) => {
    const { insertApplication } = await import("@/server/applications.server");
    const stored = await insertApplication(data);

    const { sendRecruitmentConfirmation } = await import("@/server/email.server");
    const emailed = await sendRecruitmentConfirmation(data);

    // Report stored/emailed independently; the UI treats a saved application as
    // success even if the confirmation email transiently fails.
    return { ok: stored.ok, emailed: emailed.ok, error: stored.error };
  });
