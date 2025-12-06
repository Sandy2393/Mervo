import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import FormInput from "../components/ui/FormInput";
import { initTheme } from "../styles/theme";
const jobs = [
    { id: "J-1001", title: "Warehouse inspection", location: "NYC", status: "Open" },
    { id: "J-1002", title: "Retail audit", location: "SF", status: "Assigned" },
    { id: "J-1003", title: "Maintenance", location: "Remote", status: "Open" },
];
const filters = ["All", "Open", "Assigned", "Completed"];
export default function JobsListPolished() {
    useEffect(() => {
        initTheme();
    }, []);
    const [activeFilter, setActiveFilter] = useState("All");
    const filtered = jobs.filter((j) => (activeFilter === "All" ? true : j.status === activeFilter));
    return (_jsxs("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]", children: [_jsx(Header, { title: "Jobs", companyName: "APP_TAG" }), _jsxs("main", { className: "container py-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [filters.map((f) => (_jsx(Button, { size: "sm", variant: f === activeFilter ? "primary" : "secondary", onClick: () => setActiveFilter(f), children: f }, f))), _jsx("div", { className: "flex-1 min-w-[200px]", children: _jsx(FormInput, { id: "search", label: "Search", placeholder: "Search jobs", "aria-label": "Search jobs" }) })] }), _jsx("div", { className: "card-grid", children: filtered.map((job) => (_jsxs(Card, { header: _jsxs("div", { className: "flex-between", children: [_jsx("span", { children: job.title }), _jsx("span", { className: "text-[var(--color-text-muted)]", children: job.id })] }), children: [_jsx("div", { className: "text-sm text-[var(--color-text-muted)]", children: job.location }), _jsx("div", { className: "mt-2", children: _jsx(Button, { size: "sm", children: "View" }) })] }, job.id))) })] })] }));
}
