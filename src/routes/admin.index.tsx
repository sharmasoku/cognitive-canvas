import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  DollarSign, ShoppingCart, Clock, Loader2, Package, Activity, AlertTriangle,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useAdminData";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { GlowCard } from "@/components/ui/GlowCard";
import { inr, shortDate } from "@/lib/format";
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const PIE_COLORS = ["#10b981", "#f59e0b", "#7c3aed", "#3b82f6", "#ef4444"];

function AdminDashboard() {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: "Total Revenue", value: inr(stats.totalRevenue), icon: DollarSign, color: "text-emerald-600 bg-emerald-100" },
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "text-blue-600 bg-blue-100" },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: Clock, color: "text-amber-600 bg-amber-100" },
    {
      label: "Average Order Value",
      value: inr(stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0),
      icon: Activity,
      color: "text-indigo-600 bg-indigo-100",
    },
    { label: "Active Products", value: `${stats.activeProducts}/${stats.totalProducts}`, icon: Package, color: "text-violet-600 bg-violet-100" },
  ];

  const hasSales = stats.salesByDay.some((d) => d.total > 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <AdminHeading word="Dashboard" sub="Overview of your store performance." />
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlowCard className="h-full">
                <div className="flex items-center gap-3 p-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">{card.label}</div>
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:h-[400px]">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col h-full"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Sales Analytics (7 Days)</h2>
          </div>
          <div className="flex-1 min-h-[200px]">
            {hasSales ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesByDay} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
                  <RechartsTooltip
                    formatter={(v: number) => [inr(v), "Sales"]}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">No sales in the last 7 days</div>
            )}
          </div>
        </motion.div>

        {/* Pie Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col h-full"
        >
          <div className="mb-4">
            <h2 className="font-bold text-gray-900">Order Status Breakdown</h2>
          </div>
          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            {stats.statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.statusBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" nameKey="name">
                    {stats.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm">No orders yet</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Low stock alert */}
      {stats.lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
            <AlertTriangle className="h-4 w-4" /> Low stock — needs restocking
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStock.map((p) => (
              <span key={p.id} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700 shadow-sm">
                {p.name} · <span className="font-bold">{p.stock}</span> left
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm mt-6"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">View all &rarr;</Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-left text-xs font-semibold text-gray-500">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-500">{shortDate(order.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{inr(order.total)}</td>
                    <td className="px-6 py-4"><AdminStatusBadge status={order.status} /></td>
                    <td className="px-6 py-4"><AdminStatusBadge status={order.payment_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function AdminStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-600",
    confirmed: "bg-blue-100 text-blue-600",
    shipped: "bg-purple-100 text-purple-600",
    delivered: "bg-emerald-100 text-emerald-600",
    cancelled: "bg-red-100 text-red-600",
    paid: "bg-emerald-100 text-emerald-600",
    failed: "bg-red-100 text-red-600",
    refunded: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
