import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import Header from "../components/ui/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { initTheme } from "../styles/theme";
const gallery = ["/placeholder1.png", "/placeholder2.png"];
export default function JobDetailsPolished() {
    useEffect(() => {
        initTheme();
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]", children: [_jsx(Header, { title: "Job Details", companyName: "APP_TAG" }), _jsxs("main", { className: "container py-6 space-y-4", children: [_jsxs(Card, { header: _jsxs("div", { className: "flex-between", children: [_jsx("span", { children: "Job J-1002" }), _jsx("span", { className: "text-[var(--color-text-muted)]", children: "Retail audit" })] }), children: [_jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: "Location: NYC" }), _jsxs("div", { className: "flex items-center gap-3 mt-3", children: [_jsx(Button, { size: "sm", children: "Assign" }), _jsx(Button, { size: "sm", variant: "secondary", children: "Start" }), _jsx(Button, { size: "sm", variant: "ghost", children: "Complete" })] })] }), _jsx(Card, { header: _jsx("span", { children: "Photos" }), children: _jsx("div", { className: "grid", style: { gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }, children: gallery.map((src, idx) => (_jsx("div", { className: "rounded-md overflow-hidden bg-[var(--color-surface-muted)]", "aria-label": `Photo ${idx + 1}`, children: _jsx("div", { className: "h-24 w-full bg-[var(--color-border)]", "aria-hidden": "true" }) }, src))) }) }), _jsx(Card, { header: _jsx("span", { children: "Notes" }), children: _jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: "Audit fixtures, capture before/after." }) })] })] }));
}
