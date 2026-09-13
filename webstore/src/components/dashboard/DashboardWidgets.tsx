import type { ReactNode } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Product } from "../../types";
import { formatNumber } from "../../utils/format";

export function StatCard({ label, value, icon, gradient }: { label: string; value: string | number; icon: ReactNode; gradient: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-ink">{typeof value === "number" ? formatNumber(value) : value}</p>
      <p className="mt-0.5 text-xs text-ink/45">{label}</p>
    </div>
  );
}

export function TopProductsChart({ products }: { products: Product[] }) {
  const data = [...products]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((p) => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name, views: p.views, clicks: p.clicks }));

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-ink/40">Publish a product to see analytics here.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECECF3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#0B0B14aa" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#0B0B14aa" }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "rgba(139,92,246,0.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #ECECF3", fontSize: 12 }} />
        <Bar dataKey="views" fill="#3B6DF6" radius={[6, 6, 0, 0]} />
        <Bar dataKey="clicks" fill="#EC4899" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
