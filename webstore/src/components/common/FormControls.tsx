import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 transition-colors focus-ring focus:border-brand-purple/50";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FieldWrapper({ label, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-ink">
          {label} {required && <span className="text-brand-pink">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink/45">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className = "", ...rest }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        aria-label={label}
        className={`${fieldBase} ${error ? "border-red-400" : ""} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, maxLength, value, className = "", ...rest }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        aria-label={label}
        value={value}
        maxLength={maxLength}
        className={`${fieldBase} min-h-[100px] resize-y ${error ? "border-red-400" : ""} ${className}`}
        {...rest}
      />
      {maxLength && typeof value === "string" && (
        <p className="text-right text-[11px] text-ink/35">
          {value.length}/{maxLength}
        </p>
      )}
    </FieldWrapper>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, className = "", children, ...rest }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        aria-label={label}
        className={`${fieldBase} ${error ? "border-red-400" : ""} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  )
);
Select.displayName = "Select";
