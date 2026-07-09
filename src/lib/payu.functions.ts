import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";

const hashInputSchema = z.object({
  txnid: z.string(),
  amount: z.number(),
  productinfo: z.string(),
  firstname: z.string(),
  email: z.string(),
  phone: z.string(),
  origin: z.string(),
});

export const generatePayuHashFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => hashInputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.PAYU_MERCHANT_KEY || "";
    const salt = process.env.PAYU_SALT || "";
    const env = process.env.PAYU_ENV || "test";

    // Format amount to 2 decimal places for consistency
    const formattedAmount = Number(data.amount).toFixed(2);
    // Standard PayU hash sequence: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
    const rawString = `${key}|${data.txnid}|${formattedAmount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${salt}`;

    const hash = createHash("sha512").update(rawString).digest("hex");

    const actionUrl = env === "test"
      ? "https://test.payu.in/_payment"
      : "https://secure.payu.in/_payment";

    return {
      key,
      txnid: data.txnid,
      amount: formattedAmount,
      productinfo: data.productinfo,
      firstname: data.firstname,
      email: data.email,
      phone: data.phone,
      surl: `${data.origin}/api/payu-callback`,
      furl: `${data.origin}/api/payu-callback`,
      hash,
      actionUrl,
    };
  });
