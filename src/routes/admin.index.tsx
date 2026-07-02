import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  DollarSign, ShoppingCart, Users, Clock, TrendingUp,
  ArrowUpRight, Loader2, Package, Activity
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useAdminData";
import { inr, shortDate } from "@/lib/format";
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

function AdminDashboard() {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  const cards = [
    {
      label: "Total Revenue",
      value: inr(stats.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Average Order Value",
      value: inr(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0),
      icon: Activity,
      color: "text-indigo-600 bg-indigo-100",
    },
    {
      label: "Active Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  // Dummy chart data from recent orders or just dummy data
  const chartData = [
    { name: "Mon", total: 0 },
    { name: "Tue", total: 105 },
    { name: "Wed", total: 0 },
    { name: "Thu", total: 0 },
    { name: "Fri", total: 0 },
    { name: "Sat", total: 0 },
    { name: "Sun", total: 0 },
  ];

  const pieData = [
    { name: "Completed", value: stats.totalOrders - stats.pendingOrders },
    { name: "Pending", value: stats.pendingOrders },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight lg:text-3xl font-serif">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your store performance.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative min-w-[200px] flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">{card.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                </div>
              </div>
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
            <h2 className="font-bold text-gray-900 font-serif">Sales Analytics (7 Days)</h2>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
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
            <h2 className="font-bold text-gray-900 font-serif">Order Fulfillment Status</h2>
          </div>
          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            {stats.totalOrders > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
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

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm mt-6"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900 font-serif">Recent Orders</h2>
          <span className="text-sm text-emerald-600 font-medium hover:underline cursor-pointer">View all &rarr;</span>
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
