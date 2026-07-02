import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, RefreshCw, Search, Shield, User } from "lucide-react";
import { useAllUsers } from "@/hooks/useAdminData";
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
      // Delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      // Insert new role
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: newRole,
      });

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
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Users
          </h1>
          <p className="mt-1 text-sm text-gray-500">{users.length} registered profiles</p>
        </div>
        <button onClick={refetch} className="rounded-xl border border-white/10 bg-[#111420] p-2.5 text-gray-400 hover:text-white transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or ID..."
          className="w-full rounded-xl border border-white/10 bg-[#111420] pl-10 pr-4 py-2.5 text-sm text-gray-300 outline-none focus:border-primary transition placeholder:text-gray-600"
        />
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111420] py-16 text-center text-sm text-gray-500">
          No users found
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#111420] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((userObj, i) => (
                  <motion.tr
                    key={userObj.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-gray-400">
                          <User className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-200">{userObj.full_name || "TeleAR Explorer"}</div>
                          <div className="text-xs text-gray-500 font-mono">{userObj.email || "No email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {userObj.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {shortDate(userObj.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        userObj.role === "admin"
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      }`}>
                        {userObj.role === "admin" && <Shield className="h-2.5 w-2.5" />}
                        {userObj.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRole(userObj.id, userObj.role)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-450 hover:bg-white/5 hover:text-white transition"
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
