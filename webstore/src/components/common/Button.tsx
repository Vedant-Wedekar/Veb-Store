import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<string, string> = {
  primary:
    "bg-grad-primary text-white shadow-soft hover:shadow-lift hover:brightness-105",
  secondary: "bg-ink text-white hover:bg-ink/90",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  outline: "bg-white text-ink border border-line hover:border-ink/20 hover:bg-ink/[0.02]",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
};

const sizes: Record<string, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, className = "", children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...rest}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
