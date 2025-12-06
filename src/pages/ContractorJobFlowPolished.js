import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import { initTheme } from "../styles/theme";
const todaysJobs = [
    { id: "J-210", title: "Store check", time: "09:00", location: "Brooklyn" },
    { id: "J-211", title: "Inventory", time: "13:00", location: "Queens" },
];
export default function ContractorJobFlowPolished() {
    useEffect(() => {
        initTheme();
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-4", children: [_jsx("a", { className: "skip-link", href: "#main", children: "Skip to content" }), _jsxs("main", { id: "main", className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Today" }), _jsx("div", { className: "space-y-3", children: todaysJobs.map((job) => (_jsxs(Card, { header: _jsxs("div", { className: "flex-between", children: [_jsx("span", { children: job.title }), _jsx("span", { className: "text-[var(--color-text-muted)]", children: job.time })] }), children: [_jsx("div", { className: "text-sm text-[var(--color-text-muted)]", children: job.location }), _jsxs("div", { className: "mt-3 flex gap-3", children: [_jsx(Button, { block: true, children: "Clock in" }), _jsx(Button, { block: true, variant: "secondary", children: "Upload photo" })] })] }, job.id))) })] })] }));
}
