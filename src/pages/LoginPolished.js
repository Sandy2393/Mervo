import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import FormInput from "../components/ui/FormInput";
import ThemeToggle from "../components/ui/ThemeToggle";
import { initTheme } from "../styles/theme";
export default function LoginPolished() {
    useEffect(() => {
        initTheme();
    }, []);
    return (_jsxs("div", { className: "min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] p-6", children: [_jsx("a", { className: "skip-link", href: "#main", children: "Skip to content" }), _jsx("div", { className: "absolute top-4 right-4", children: _jsx(ThemeToggle, {}) }), _jsx(Card, { className: "w-full max-w-md shadow-lg", header: _jsx("div", { className: "text-xl font-semibold", children: "Welcome back" }), children: _jsxs("main", { id: "main", children: [_jsx("p", { className: "text-[var(--color-text-muted)] mb-4", children: "Sign in to continue to APP_ID" }), _jsxs("form", { className: "space-y-3", children: [_jsx(FormInput, { id: "email", name: "email", label: "Email", type: "email", autoComplete: "email", required: true }), _jsx(FormInput, { id: "password", name: "password", label: "Password", type: "password", autoComplete: "current-password", required: true }), _jsx(Button, { type: "submit", block: true, children: "Log in" })] }), _jsx("div", { className: "mt-4 text-sm text-[var(--color-text-muted)]", children: "Forgot password? Contact support." })] }) })] }));
}
