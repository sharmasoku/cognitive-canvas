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

    // PayU hash formula (from PayU Integration Team):
    // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    //                                                      ─── 5 udf (empty) ───  ─5 reserved─
    // "||||||" after udf5 = 6 pipes = 5 empty reserved segments.
    // Total: 6 named + 5 udf + 5 reserved + 1 salt = 17 fields, 16 pipes.
    const hashSequence = [
      key,              // [0]  key
      data.txnid,       // [1]  txnid
      formattedAmount,  // [2]  amount
      productinfo,      // [3]  productinfo
      firstname,        // [4]  firstname
      email,            // [5]  email
      "",               // [6]  udf1
      "",               // [7]  udf2
      "",               // [8]  udf3
      "",               // [9]  udf4
      "",               // [10] udf5
      "",               // [11] reserved (pipe 1 of ||||||)
      "",               // [12] reserved (pipe 2)
      "",               // [13] reserved (pipe 3)
      "",               // [14] reserved (pipe 4)
      "",               // [15] reserved (pipe 5)
      salt,             // [16] SALT   (pipe 6 leads into SALT)
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
