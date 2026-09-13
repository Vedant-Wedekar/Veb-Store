import { useState } from "react";
import { X } from "lucide-react";

export default function TagInput({
  label,
  values,
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter",
  max = 10,
}: {
  label?: string;
  values: string[];
  onChange: (v: string[]) => void;
  suggestions?: readonly string[];
  placeholder?: string;
  max?: number;
}) {
  const [input, setInput] = useState("");
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s) && input.length > 0
  ).slice(0, 6);

  function addValue(v: string) {
    const clean = v.trim();
    if (!clean || values.includes(clean) || values.length >= max) return;
    onChange([...values, clean]);
    setInput("");
  }

  function removeValue(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink">{label}</label>}
      <div className="relative">
        <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-2 focus-within:border-brand-purple/50">
          {values.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-lg bg-brand-purple/10 px-2 py-1 text-xs font-medium text-brand-purple">
              {v}
              <button type="button" onClick={() => removeValue(v)} aria-label={`Remove ${v}`}>
                <X size={11} />
              </button>
            </span>
          ))}
          {values.length < max && (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addValue(input);
                } else if (e.key === "Backspace" && !input && values.length > 0) {
                  removeValue(values[values.length - 1]);
                }
              }}
              placeholder={values.length === 0 ? placeholder : ""}
              className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35"
            />
          )}
        </div>
        {filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lift">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addValue(s)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-ink/5"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
