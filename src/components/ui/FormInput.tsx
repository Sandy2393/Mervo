import React from "react";
import clsx from "clsx";

type Props = {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function FormInput({ id, label, helperText, error, className, ...rest }: Props) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)] mb-1">
        {label}
      </label>
      <input
        id={id}
        className={clsx(
          "w-full rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)]",
          error && "border-[var(--color-danger)]",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={helperText ? `${id}-helper` : undefined}
        {...rest}
      />
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-[var(--color-text-muted)] mt-1">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs text-[var(--color-danger)] mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
