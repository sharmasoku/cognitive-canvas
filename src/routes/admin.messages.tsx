import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { useContactMessages, deleteContactMessage } from "@/hooks/useAdminData";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { shortDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesPage,
});

function AdminMessagesPage() {
  const { messages, loading, refetch } = useContactMessages();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <AdminHeading word="Messages" sub={`${messages.length} customer messages`} />
        <button onClick={refetch} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-gray-900 transition shadow-sm">
          <RefreshCw className="h-4 w-4" />
        </button>
      </motion.div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
          No feedback or contact messages found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{msg.name}</h3>
                  <div className="mt-1.5 space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${msg.email}`} className="hover:text-primary transition">{msg.email}</a>
                    </div>
                    {msg.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${msg.phone}`} className="hover:text-primary transition">{msg.phone}</a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>{shortDate(msg.created_at)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const { ok, error } = await deleteContactMessage(msg.id);
                    if (ok) { toast.success("Message deleted"); refetch(); }
                    else toast.error(error || "Failed");
                  }}
                  className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 transition"
                  title="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex-1 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
