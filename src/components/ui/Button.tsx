import React from "react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  block?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading = false, children, disabled, block, className, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
    const variants = {
      primary: "bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-strong)] focus-visible:outline-[var(--color-primary)]",
      secondary: "bg-[var(--color-surface-muted)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)]",
      danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
      ghost: "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
    };
    const sizes = { sm: "px-3 py-1 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-3 text-base" };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], block && "w-full", (disabled || isLoading) && "opacity-60 cursor-not-allowed", className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? "…" : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
