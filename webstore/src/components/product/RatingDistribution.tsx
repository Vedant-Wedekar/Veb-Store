import type { Product } from "../../types";

export default function RatingDistribution({ product }: { product: Product }) {
  const dist = product.ratingDistribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  const total = product.ratingCount || 1;

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = dist[String(star) as "1" | "2" | "3" | "4" | "5"] || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={star} className="flex items-center gap-2 text-xs text-ink/50">
            <span className="w-8 shrink-0">{star} ★</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/5">
              <div className="h-full rounded-full bg-brand-orange transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-9 shrink-0 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
