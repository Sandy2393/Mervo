import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import Header from "../components/ui/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { initTheme } from "../styles/theme";
const kpis = [
    { label: "Active jobs", value: 24, trend: "+8%" },
    { label: "On-time", value: "96%", trend: "+2%" },
    { label: "Pending approvals", value: 7, trend: "-1" },
    { label: "Avg rating", value: 4.7, trend: "+0.1" },
];
export default function DashboardPolished() {
    useEffect(() => {
        initTheme();
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]", children: [_jsx("a", { className: "skip-link", href: "#main", children: "Skip to content" }), _jsx(Header, { title: "Operations", companyName: "APP_TAG" }), _jsxs("main", { id: "main", className: "container py-6 space-y-6", children: [_jsx("div", { className: "grid card-grid", children: kpis.map((kpi) => (_jsxs(Card, { header: _jsx("div", { className: "text-sm text-[var(--color-text-muted)]", children: kpi.label }), children: [_jsx("div", { className: "text-3xl font-bold", children: kpi.value }), _jsx("div", { className: "text-sm text-[var(--color-success)]", children: kpi.trend })] }, kpi.label))) }), _jsxs("div", { className: "grid grid-2", children: [_jsx(Card, { header: _jsxs("div", { className: "flex-between", children: [_jsx("span", { children: "Recent jobs" }), _jsx(Button, { size: "sm", variant: "secondary", children: "View all" })] }), children: _jsx("ul", { className: "m-0 p-0", "aria-label": "Recent jobs list", children: [
                                        { id: "J-102", title: "Site audit", status: "In progress" },
                                        { id: "J-103", title: "HVAC check", status: "Pending" },
                                        { id: "J-104", title: "Lighting", status: "Completed" },
                                    ].map((job) => (_jsxs("li", { className: "py-2 flex-between border-b border-[var(--color-border)] last:border-b-0", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: job.title }), _jsx("div", { className: "text-sm text-[var(--color-text-muted)]", children: job.id })] }), _jsx("span", { className: "text-sm text-[var(--color-success)]", children: job.status })] }, job.id))) }) }), _jsx(Card, { header: _jsxs("div", { className: "flex-between", children: [_jsx("span", { children: "Notifications" }), _jsx(Button, { size: "sm", variant: "secondary", children: "Settings" })] }), children: _jsx("ul", { className: "m-0 p-0 space-y-2", children: ["Payment approved", "Job assigned", "Document signed"].map((msg) => (_jsxs("li", { className: "text-sm text-[var(--color-text-muted)]", children: ["\u2022 ", msg] }, msg))) }) })] })] })] }));
}
