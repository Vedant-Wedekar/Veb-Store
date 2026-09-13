import { useState } from "react";
import { ImageOff, X } from "lucide-react";
import { Input } from "../common/FormControls";
import { isValidHttpsUrl } from "../../utils/url";

export function ImageUrlField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [broken, setBroken] = useState(false);
  const valid = !value || isValidHttpsUrl(value);

  return (
    <div className="space-y-2">
      <Input
        label={label}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setBroken(false);
        }}
        placeholder="https://res.cloudinary.com/..."
        error={value && !valid ? "Enter a valid https:// URL" : undefined}
        hint={hint}
      />
      {value && valid && (
        <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-line bg-ink/[0.02]">
          {broken ? (
            <div className="flex h-full items-center justify-center text-ink/25">
              <ImageOff size={20} />
            </div>
          ) : (
            <img src={value} alt="Preview" className="h-full w-full object-cover" onError={() => setBroken(true)} />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="absolute right-1 top-1 rounded-full bg-white/90 p-1 shadow-soft hover:bg-white"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

export function ScreenshotListField({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function add() {
    if (!draft.trim() || !isValidHttpsUrl(draft.trim())) return;
    onChange([...values, draft.trim()]);
    setDraft("");
  }

  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...values];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ink">Screenshots</label>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="https://res.cloudinary.com/screenshot.png"
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-purple/50"
        />
        <button type="button" onClick={add} className="shrink-0 rounded-xl border border-line px-4 text-sm font-semibold hover:border-ink/20">
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {values.map((url, i) => (
            <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-line">
              <img src={url} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")} />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" onClick={() => move(i, -1)} className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold">
                  ←
                </button>
                <button type="button" onClick={() => remove(i)} className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
                  ✕
                </button>
                <button type="button" onClick={() => move(i, 1)} className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold">
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-ink/40">Paste Cloudinary (or other https) image URLs. Reorder with the arrows.</p>
    </div>
  );
}
