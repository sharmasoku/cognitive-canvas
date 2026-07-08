import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/theme")({
  component: AdminThemePage,
});

const COLOR_GROUPS: { title: string; colors: { name: string; hex: string }[] }[] = [
  {
    title: "Primary (Navy)",
    colors: [
      { name: "primary", hex: "#1016FF" },
      { name: "primary-hover", hex: "#142252" },
      { name: "primary-light", hex: "#4a5f9e" },
      { name: "primary-dark", hex: "#0f1a3d" },
    ],
  },
  {
    title: "Accent (Emerald)",
    colors: [
      { name: "accent", hex: "#10b981" },
      { name: "accent-hover", hex: "#059669" },
      { name: "accent-light", hex: "#34d399" },
      { name: "accent-dark", hex: "#047857" },
    ],
  },
  {
    title: "Neutrals",
    colors: [
      { name: "background", hex: "#ffffff" },
      { name: "foreground", hex: "#111827" },
      { name: "surface", hex: "#f8f9fc" },
      { name: "dark", hex: "#0a0d14" },
    ],
  },
];

const GRADIENTS: { name: string; css: string }[] = [
  { name: "gradient-primary", css: "linear-gradient(135deg, #1016FF 0%, #2563eb 100%)" },
  { name: "gradient-accent", css: "linear-gradient(135deg, #10b981 0%, #2563eb 100%)" },
  { name: "gradient-text", css: "linear-gradient(135deg, #1016FF 0%, #2563eb 50%, #10b981 100%)" },
  { name: "gradient-dark", css: "linear-gradient(135deg, #0a0d14 0%, #0f1a3d 60%, #0a0d14 100%)" },
];

function copy(value: string) {
  navigator.clipboard?.writeText(value).then(
    () => toast.success(`Copied ${value}`),
    () => toast.error("Copy failed"),
  );
}

function AdminThemePage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminHeading word="Theme" sub="The TeleARGlass design system — colors, gradients and typography used across the store." />
      </motion.div>

      {/* Colors */}
      <section className="space-y-6">
        {COLOR_GROUPS.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.05 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-bold text-primary">{group.title}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {group.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => copy(c.hex)}
                  className="group text-left"
                >
                  <div
                    className="h-20 w-full rounded-xl border border-gray-100 shadow-inner"
                    style={{ background: c.hex }}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{c.name}</div>
                      <div className="font-mono text-[11px] uppercase text-gray-400">{c.hex}</div>
                    </div>
                    <Copy className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Gradients */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-sm font-bold text-primary">Gradients</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GRADIENTS.map((g) => (
            <button key={g.name} onClick={() => copy(g.css)} className="group text-left">
              <div className="h-20 w-full rounded-xl border border-gray-100" style={{ background: g.css }} />
              <div className="mt-2 flex items-center justify-between">
                <div className="font-mono text-[11px] text-gray-500">{g.name}</div>
                <Copy className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary" />
              </div>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Typography & components */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6"
      >
        <h2 className="text-sm font-bold text-primary">Typography & Components</h2>

        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Wordmark heading</div>
          <h3 className="mt-1 text-4xl font-bold tracking-tight text-primary">
            Tele<span className="gradient-text">ARGlass</span>
          </h3>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Body</div>
          <p className="max-w-2xl text-gray-600">
            The quick neural interface drafts your thoughts. Body copy uses the Inter variable font at a comfortable
            reading size with muted foreground tones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-sm">Primary button</button>
          <button className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800">Secondary</button>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600">Accent badge</span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-600">Primary badge</span>
        </div>
      </motion.section>
    </div>
  );
}
