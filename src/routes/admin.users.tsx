import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Search, Shield, User } from "lucide-react";
import { useAllUsers } from "@/hooks/useAdminData";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { shortDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { users, loading, refetch } = useAllUsers();
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    return (
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      u.id.includes(search)
    );
  });

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    try {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
      if (error) throw error;
      toast.success(`User role updated to ${newRole}`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to update role");
    }
  };

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
        <AdminHeading word="Users" sub={`${users.length} registered profiles`} />
        <button onClick={refetch} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-gray-900 transition shadow-sm">
          <RefreshCw className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or ID..."
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary transition placeholder:text-gray-400 shadow-sm"
        />
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
          No users found
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((userObj, i) => (
                  <motion.tr
                    key={userObj.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/60 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{userObj.full_name || "TeleAR Explorer"}</div>
                          <div className="text-xs text-gray-400 font-mono">{userObj.email || "No email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{userObj.phone || "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{shortDate(userObj.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        userObj.role === "admin"
                          ? "bg-violet-100 text-violet-600 border border-violet-200"
                          : "bg-blue-100 text-blue-600 border border-blue-200"
                      }`}>
                        {userObj.role === "admin" && <Shield className="h-2.5 w-2.5" />}
                        {userObj.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRole(userObj.id, userObj.role)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
                      >
                        Toggle Admin Role
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
