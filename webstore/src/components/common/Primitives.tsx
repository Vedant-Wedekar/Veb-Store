import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Avatar({
  src,
  name,
  size = 40,
}: {
  src?: string;
  name: string;
  size?: number;
}) {
  const [broken, setBroken] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!src || broken) {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        className="flex shrink-0 items-center justify-center rounded-full bg-grad-primary font-semibold text-white"
      >
        {initials || "?"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      style={{ width: size, height: size }}
      onError={() => setBroken(true)}
      className="shrink-0 rounded-full object-cover"
    />
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "new" | "trending" | "featured" | "opensource" | "free" | "student";
}) {
  const tones: Record<string, string> = {
    default: "bg-ink/5 text-ink/70",
    new: "bg-brand-green/10 text-brand-green",
    trending: "bg-gradient-to-r from-brand-orange/15 to-brand-pink/15 text-brand-orange",
    featured: "bg-gradient-to-r from-brand-purple/15 to-brand-pink/15 text-brand-purple",
    opensource: "bg-brand-blue/10 text-brand-blue",
    free: "bg-brand-cyan/10 text-brand-cyan",
    student: "bg-brand-orange/10 text-brand-orange",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  emoji = "✨",
  title,
  subtitle,
  action,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
      <div className="mb-3 text-4xl">{emoji}</div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm text-ink/50">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong.", subtitle, action }: { title?: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-6 py-16 text-center">
      <div className="mb-3 text-4xl">⚠️</div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm text-ink/50">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white p-4">
      <div className="skeleton mb-3 h-32 w-full rounded-xl" />
      <div className="skeleton mb-2 h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-lift"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && <h3 className="text-lg font-bold text-ink">{title}</h3>}
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink focus-ring"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-line bg-ink/[0.02] px-2 py-1 text-[11px] font-medium text-ink/60">
      {label}
    </span>
  );
}
