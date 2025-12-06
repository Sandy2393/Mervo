import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import CostChart from "../../components/admin/CostChart";
import BudgetModal from "../../components/admin/BudgetModal";
const demoSeries = [
    { date: "2025-11-28", cost: 120 },
    { date: "2025-11-29", cost: 130 },
    { date: "2025-11-30", cost: 110 },
    { date: "2025-12-01", cost: 140 },
    { date: "2025-12-02", cost: 150 },
];
const demoCompanies = [
    { company_id: "company-alpha", cost: 420, storage_bytes: 120000000000 },
    { company_id: "company-beta", cost: 310, storage_bytes: 80000000000 },
    { company_id: "company-gamma", cost: 190, storage_bytes: 55000000000 },
];
export default function CostDashboard() {
    const total30d = useMemo(() => demoSeries.reduce((sum, p) => sum + p.cost, 0), []);
    const trend7d = "+6%"; // TODO: compute from backend data
    const trend30d = "+12%"; // TODO
    return (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold", children: "Cost Dashboard" }), _jsxs("div", { className: "space-x-2", children: [_jsx("button", { className: "px-3 py-1 border rounded", children: "Run cost report" }), _jsx("button", { className: "px-3 py-1 border rounded", children: "Export CSV" }), _jsx(BudgetModal, { triggerLabel: "Set budget" })] })] }), _jsxs("section", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "border rounded p-3", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Estimated cost (last 30d)" }), _jsxs("p", { className: "text-2xl font-semibold", children: ["$", total30d.toFixed(2)] })] }), _jsxs("div", { className: "border rounded p-3", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Trend 7d" }), _jsx("p", { className: "text-xl", children: trend7d })] }), _jsxs("div", { className: "border rounded p-3", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Trend 30d" }), _jsx("p", { className: "text-xl", children: trend30d })] })] }), _jsxs("section", { className: "border rounded p-3", children: [_jsx("h2", { className: "font-semibold mb-2", children: "Cost Trend" }), _jsx(CostChart, { series: demoSeries })] }), _jsxs("section", { className: "border rounded p-3", children: [_jsx("h2", { className: "font-semibold mb-2", children: "Per-company breakdown (top 20)" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100", children: [_jsx("th", { className: "p-2 text-left", children: "Company" }), _jsx("th", { className: "p-2 text-left", children: "Cost (30d)" }), _jsx("th", { className: "p-2 text-left", children: "Storage (GB)" })] }) }), _jsxs("tbody", { children: [demoCompanies.map((c) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-2", children: c.company_id }), _jsxs("td", { className: "p-2", children: ["$", c.cost.toFixed(2)] }), _jsx("td", { className: "p-2", children: (c.storage_bytes / 1000000000).toFixed(1) })] }, c.company_id))), demoCompanies.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 3, className: "p-2 text-center text-gray-600", children: "No data available" }) }))] })] }) })] }), _jsxs("section", { className: "border rounded p-3", children: [_jsx("h2", { className: "font-semibold mb-2", children: "Top cost drivers" }), _jsxs("ul", { className: "list-disc pl-5 text-sm text-gray-700", children: [_jsx("li", { children: "Storage growth (photos)" }), _jsx("li", { children: "Egress spikes (report downloads)" }), _jsx("li", { children: "Function invocations (webhooks)" })] })] }), _jsxs("section", { className: "border rounded p-3", children: [_jsx("h2", { className: "font-semibold mb-2", children: "Storage usage heatmap (per company)" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2 text-sm", children: [demoCompanies.map((c) => (_jsxs("div", { className: "p-2 border rounded", children: [_jsx("p", { className: "font-medium", children: c.company_id }), _jsxs("p", { children: [(c.storage_bytes / 1000000000).toFixed(1), " GB"] })] }, c.company_id))), demoCompanies.length === 0 && _jsx("p", { children: "No data available" })] })] })] }));
}
