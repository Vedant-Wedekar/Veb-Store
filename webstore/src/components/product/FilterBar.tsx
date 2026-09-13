import { SlidersHorizontal } from "lucide-react";
import { CATEGORIES, PRICING_TYPES, SORT_OPTIONS } from "../../constants";
import { Select } from "../common/FormControls";

export interface Filters {
  category: string;
  pricing: string;
  sort: string;
}

export default function FilterBar({
  filters,
  onChange,
  resultCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount?: number;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-ink/50">
        <SlidersHorizontal size={15} />
        {typeof resultCount === "number" && <span>{resultCount} results</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="!w-auto"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={filters.pricing} onChange={(e) => onChange({ ...filters, pricing: e.target.value })} className="!w-auto">
          <option value="">All Pricing</option>
          {PRICING_TYPES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select value={filters.sort} onChange={(e) => onChange({ ...filters, sort: e.target.value })} className="!w-auto">
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
