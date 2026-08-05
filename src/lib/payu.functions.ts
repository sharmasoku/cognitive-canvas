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
    const key = (process.env.PAYU_MERCHANT_KEY || "6CQ4IJ").trim();
    const salt = (process.env.PAYU_SALT || "4imomd6TLClAg7KyUS5LJ5AtIJBxThwk").trim();
    const env = (process.env.PAYU_ENV || "test").trim();

    // Sanitize fields to match standard PayU requirements
    const firstname = data.firstname.trim().replace(/[^a-zA-Z0-9 ]/g, "") || "Customer";
    const productinfo = data.productinfo.trim().replace(/[^a-zA-Z0-9 ,.-]/g, "") || "Order";
    const email = data.email.trim();
    const phone = data.phone.replace(/[^0-9]/g, "") || "9999999999";

    // Format amount to 2 decimal places for consistency
    const formattedAmount = Number(data.amount).toFixed(2);
    // Standard PayU hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
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
      "", // udf6
      "", // udf7
      "", // udf8
      "", // udf9
      "", // udf10
      salt,
    ];
    const rawString = hashSequence.join("|");
    const hash = createHash("sha512").update(rawString).digest("hex");

    console.log("[PayU Hash Debug]", {
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
