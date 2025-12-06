import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
const Input = React.forwardRef(({ className, type, label, helperText, ...props }, ref) => {
    const input = (_jsx("input", { type: type, className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className), ref: ref, ...props }));
    if (label) {
        return (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: label }), input, helperText && _jsx("p", { className: "text-sm text-muted-foreground", children: helperText })] }));
    }
    return input;
});
Input.displayName = "Input";
export { Input };
