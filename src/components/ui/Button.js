import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import clsx from "clsx";
export const Button = React.forwardRef(({ variant = "primary", size = "md", isLoading = false, children, disabled, block, className, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
    const variants = {
        primary: "bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-strong)] focus-visible:outline-[var(--color-primary)]",
        secondary: "bg-[var(--color-surface-muted)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)]",
        danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
        ghost: "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
    };
    const sizes = { sm: "px-3 py-1 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-3 text-base" };
    return (_jsx("button", { ref: ref, className: clsx(base, variants[variant], sizes[size], block && "w-full", (disabled || isLoading) && "opacity-60 cursor-not-allowed", className), disabled: disabled || isLoading, ...props, children: isLoading ? "…" : children }));
});
Button.displayName = "Button";
export default Button;
