import { AnimatePresence, motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { inr } from "@/lib/format";

interface PaymentModalProps {
  open: boolean;
  amount: number;
  onClose: () => void;
  /** Called after the simulated authorisation delay. Do the real order/subscription work here. */
  onSuccess: () => void | Promise<void>;
  merchantName?: string;
}

/**
 * Simulated PayU checkout — no real gateway is wired in yet. Shared by product
 * checkout and license subscription so both call sites stay in lockstep until
 * a real gateway replaces this.
 */
export function PaymentModal({ open, amount, onClose, onSuccess, merchantName = "TeleARGlass Pvt. Ltd." }: PaymentModalProps) {
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const handlePay = () => {
    onClose();
    const container = document.createElement("div");
    container.id = "tele-paying-overlay";
    container.className = "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm";
    container.innerHTML = `
      <div class="w-full max-w-sm rounded-3xl bg-background p-8 text-center shadow-card-hover border border-border">
        <svg class="mx-auto h-10 w-10 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 class="mt-4 text-lg font-semibold">Authorising Neural Payment Vector…</h3>
        <p class="mt-1 text-sm text-text-muted">Verifying secure signature with PayU gateway</p>
      </div>
    `;
    document.body.appendChild(container);
    setTimeout(async () => {
      document.getElementById("tele-paying-overlay")?.remove();
      await onSuccess();
    }, 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md overflow-hidden rounded-3xl bg-background shadow-card-hover border border-border">
            {/* Header */}
            <div className="bg-[#0b1426] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#81bc00] flex items-center justify-center font-bold text-lg text-white">P</div>
                <div>
                  <h3 className="font-semibold text-sm">PayU Checkout</h3>
                  <p className="text-[10px] text-white/60">{merchantName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/60">Amount</div>
                <div className="font-mono text-sm font-bold text-accent">{inr(amount)}</div>
              </div>
            </div>

            {/* Payment Methods Simulation */}
            <div className="p-6 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-text-muted">Cards, UPI & Netbanking</div>

              <div className="space-y-3">
                {/* Card Fields */}
                <div className="rounded-xl border border-border p-4 bg-surface/50 space-y-3">
                  <div className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" /> Card Details
                  </div>

                  <input
                    type="text"
                    placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                    value={cardNum}
                    onChange={(e) => setCardNum(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Expiry (MM/YY)"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* UPI Selector */}
                <div className="flex gap-2">
                  <button type="button" className="flex-1 py-2.5 px-3 border border-border rounded-xl text-xs font-medium hover:border-primary flex items-center justify-center gap-1.5 bg-surface/20">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> Google Pay
                  </button>
                  <button type="button" className="flex-1 py-2.5 px-3 border border-border rounded-xl text-xs font-medium hover:border-primary flex items-center justify-center gap-1.5 bg-surface/20">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> PhonePe / UPI
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-text-muted">
                <span>🔒 Secured by 256-bit AES Encryption</span>
                <span className="cursor-pointer hover:underline" onClick={onClose}>Cancel</span>
              </div>

              {/* Submit Action */}
              <button
                onClick={handlePay}
                className="w-full py-3 bg-[#81bc00] hover:bg-[#6fa000] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-soft"
              >
                <CreditCard className="h-4 w-4" /> Pay {inr(amount)} Securely
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
