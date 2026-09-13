import { useState } from "react";
import { Star } from "lucide-react";

export function RatingStars({
  value,
  size = 16,
  showValue = false,
  count,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(value) ? "fill-brand-orange text-brand-orange" : "fill-transparent text-ink/20"}
          />
        ))}
      </div>
      {showValue && <span className="text-sm font-semibold text-ink">{value.toFixed(1)}</span>}
      {typeof count === "number" && <span className="text-xs text-ink/40">({count})</span>}
    </div>
  );
}

export function RatingPicker({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110 focus-ring rounded"
        >
          <Star
            size={size}
            className={
              i <= (hover || value) ? "fill-brand-orange text-brand-orange" : "fill-transparent text-ink/25"
            }
          />
        </button>
      ))}
    </div>
  );
}
