import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ThemeToggle from "./ThemeToggle";
import Avatar from "./Avatar";
import { Button } from "./button";
export default function Header({ title = "APP_ID", companyName = "Company", onCompanyChange, onLogout }) {
    return (_jsx("header", { className: "w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]", children: _jsxs("div", { className: "container flex-between py-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-9 w-9 rounded-md bg-[var(--color-primary)] text-black font-bold flex items-center justify-center", "aria-label": "APP_ID logo", children: "A" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-[var(--color-text-muted)]", children: companyName }), _jsx("div", { className: "text-lg font-semibold", children: title })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: onCompanyChange, "aria-label": "Change company", children: "Switch" }), _jsx(ThemeToggle, {}), _jsx(Avatar, { name: "Admin User" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onLogout, "aria-label": "Log out", children: "Logout" })] })] }) }));
}
