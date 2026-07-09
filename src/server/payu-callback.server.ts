import { createHash } from "crypto";

/**
 * Handles the PayU callback POST request.
 * Called from server.ts when the URL matches /api/payu-callback.
 *
 * PayU posts form data with the transaction result (success/failure).
 * We verify the hash, update the order in Supabase, then redirect
 * the browser to /checkout?status=success|failed.
 */
export async function handlePayuCallback(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    const {
      status,
      txnid,
      amount,
      key,
      hash,
      email,
      firstname,
      productinfo,
      mihpayid,
      bank_ref_num,
    } = body;

    const salt = process.env.PAYU_SALT || "";

    // Reverse hash formula:
    // sha512(salt|status|udf10|udf9|...|udf1|email|firstname|productinfo|amount|txnid|key)
    const rawString = `${salt}|${status}|||||||||||${email || ""}|${firstname || ""}|${productinfo || ""}|${amount || ""}|${txnid || ""}|${key || ""}`;
    const calculatedHash = createHash("sha512")
      .update(rawString)
      .digest("hex");

    const isHashValid =
      calculatedHash.toLowerCase() === (hash || "").toLowerCase();
    if (!isHashValid) {
      console.error(
        "[PayU Callback] Hash mismatch! Calculated:",
        calculatedHash,
        "Received:",
        hash,
      );
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/checkout?status=failed&orderId=${txnid || ""}&reason=hash_mismatch`,
        },
      });
    }

    // ------ Update the order in Supabase ------
    let supabaseAdmin: any;
    try {
      const mod = await import("@/integrations/supabase/client.server");
      supabaseAdmin = mod.supabaseAdmin;
    } catch {
      console.warn(
        "[PayU Callback] Supabase admin client unavailable. DB update skipped.",
      );
      const redirectUrl =
        status === "success"
          ? `/checkout?status=success&orderId=${txnid}&db_sync=skipped`
          : `/checkout?status=failed&orderId=${txnid}&db_sync=skipped`;
      return new Response(null, {
        status: 303,
        headers: { Location: redirectUrl },
      });
    }

    if (status === "success") {
      const parsedAmount = Math.round(parseFloat(amount));

      // 1. Fetch current order state
      const { data: order, error: fetchError } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", txnid)
        .maybeSingle();

      if (order && !fetchError) {
        const newPaid = order.amount_paid_inr + parsedAmount;
        const newDue = Math.max(0, order.total - newPaid);

        // 2. Update order
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            amount_paid_inr: newPaid,
            amount_due_inr: newDue,
            payment_method: "payu",
            updated_at: new Date().toISOString(),
          })
          .eq("id", txnid);

        // 3. Update pending payment records
        await supabaseAdmin
          .from("order_payments")
          .update({
            status: "paid",
            method: "payu",
            gateway: "payu",
            gateway_ref: mihpayid || bank_ref_num || null,
            paid_at: new Date().toISOString(),
          })
          .eq("order_id", txnid)
          .eq("status", "pending")
          .limit(1);

        // 4. Send Confirmation Email (best-effort)
        try {
          const { sendOrderConfirmation } = await import(
            "@/server/email.server"
          );

          const emailData = {
            orderId: order.id,
            items: (order.order_items || []).map((i: any) => ({
              name: i.name,
              qty: i.qty,
              unitPrice: i.unit_price,
              lineTotal: i.line_total,
            })),
            subtotal: order.subtotal,
            discount: order.discount,
            shipping: order.shipping,
            tax: order.tax,
            total: order.total,
            shippingAddress: {
              fullName: order.shipping_address?.name,
              email: order.shipping_address?.email,
              address: order.shipping_address?.line1,
              city: order.shipping_address?.city,
              postalCode: order.shipping_address?.pincode,
              phone: order.shipping_address?.phone,
            },
            deliverySpeed: order.delivery_speed,
            estimatedDate: new Date(
              Date.now() +
                (order.delivery_speed === "priority" ? 2 : 5) * 86_400_000,
            ).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            }),
            paymentPlan: order.payment_plan,
            amountPaidNow: newPaid,
            amountDueLater: newDue,
          };

          await sendOrderConfirmation(emailData as any);
        } catch (emailErr) {
          console.error(
            "[PayU Callback] Failed to send order confirmation email:",
            emailErr,
          );
        }
      }

      return new Response(null, {
        status: 303,
        headers: { Location: `/checkout?status=success&orderId=${txnid}` },
      });
    } else {
      // Payment failed or cancelled
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", txnid);

      await supabaseAdmin
        .from("order_payments")
        .update({
          status: "failed",
          method: "payu",
          gateway: "payu",
          gateway_ref: mihpayid || null,
        })
        .eq("order_id", txnid)
        .eq("status", "pending")
        .limit(1);

      return new Response(null, {
        status: 303,
        headers: { Location: `/checkout?status=failed&orderId=${txnid}` },
      });
    }
  } catch (err: any) {
    console.error("[PayU Callback] Error handling callback POST:", err);
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/checkout?status=failed&reason=callback_error`,
      },
    });
  }
}
