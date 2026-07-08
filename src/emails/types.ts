// Serializable payloads that cross the server-function boundary and feed the
// email templates. Kept plain (no class instances / Dates) so they validate
// with Zod and render identically on the server.

export interface OrderEmailItem {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderEmailAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface OrderEmailPayload {
  orderId: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: OrderEmailAddress;
  deliverySpeed: "standard" | "priority";
  /** Human-readable estimated delivery date, e.g. "Mon, 7 Jul". */
  estimatedDate: string;
  paymentPlan?: "full" | "partial";
  amountPaidNow?: number;
  amountDueLater?: number;
}

export interface SubscriptionEmailPayload {
  subscriptionId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  priceInr: number;
  billingPeriod: "month" | "year";
  /** Human-readable dates, e.g. "Mon, 7 Jul 2026". */
  startedDate: string;
  renewalDate: string;
}

export interface RecruitmentEmailPayload {
  fullName: string;
  email: string;
  dob: string;
  gender: string;
  contact: string;
  aadhaar: string;
  address: string;
  message: string;
  resumeBase64?: string;
  resumeName?: string;
}
