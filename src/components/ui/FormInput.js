import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from "clsx";
export default function FormInput({ id, label, helperText, error, className, ...rest }) {
    return (_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: id, className: "block text-sm font-medium text-[var(--color-text)] mb-1", children: label }), _jsx("input", { id: id, className: clsx("w-full rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)]", error && "border-[var(--color-danger)]", className), "aria-invalid": Boolean(error), "aria-describedby": helperText ? `${id}-helper` : undefined, ...rest }), helperText && !error && (_jsx("p", { id: `${id}-helper`, className: "text-xs text-[var(--color-text-muted)] mt-1", children: helperText })), error && (_jsx("p", { className: "text-xs text-[var(--color-danger)] mt-1", role: "alert", children: error }))] }));
}
