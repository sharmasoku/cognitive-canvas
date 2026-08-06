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

/** Strip leading/trailing double-quotes that some .env editors inject. */
const stripQuotes = (v: string) => v.replace(/^"|"$/g, "");

export const generatePayuHashFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => hashInputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = stripQuotes((process.env.PAYU_MERCHANT_KEY || "").trim());
    const salt = stripQuotes((process.env.PAYU_SALT || "").trim());
    const env = stripQuotes((process.env.PAYU_ENV || "test").trim());

    // Sanitize fields to match standard PayU requirements
    const firstname = data.firstname.trim().replace(/[^a-zA-Z0-9 ]/g, "") || "Customer";
    const productinfo = data.productinfo.trim().replace(/[^a-zA-Z0-9 ,.-]/g, "") || "Order";
    const email = data.email.trim();
    const phone = data.phone.replace(/[^0-9]/g, "") || "9999999999";

    // Format amount to 2 decimal places for consistency
    const formattedAmount = Number(data.amount).toFixed(2);

    // PayU hash formula (official):
    // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    // 5 empty udf fields + 6 reserved empty fields = 11 empty segments between email and SALT.
    // Total: 18 pipe-separated fields.
    const hashSequence = [
      key,
      data.txnid,
      formattedAmount,
      productinfo,
      firstname,
      email,
      "", // udf1
      "", // udf2
      "", // udf3
      "", // udf4
      "", // udf5
      "", // reserved
      "", // reserved
      "", // reserved
      "", // reserved
      "", // reserved
      "", // reserved
      salt,
    ];
    const rawString = hashSequence.join("|");

    const hash = createHash("sha512").update(rawString).digest("hex");

    console.log("[PayU Hash Debug]", {
      rawString,
      key,
      txnid: data.txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      email,
      hash,
    });

    const actionUrl = env === "test"
      ? "https://test.payu.in/_payment"
      : "https://secure.payu.in/_payment";

    return {
      key,
      txnid: data.txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${data.origin}/api/payu-callback`,
      furl: `${data.origin}/api/payu-callback`,
      hash,
      actionUrl,
    };
  });
