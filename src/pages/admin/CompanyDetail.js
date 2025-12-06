import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Workforce from "./Workforce";
export default function CompanyDetail() {
    const [tab, setTab] = useState("overview");
    const companyId = "company_placeholder"; // replace with router param
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Company Detail" }), _jsx("a", { className: "text-blue-600 underline", href: "/admin/billing", children: "Billing" })] }), _jsx("div", { className: "flex gap-3 border-b", children: [
                    { key: "overview", label: "Overview" },
                    { key: "workforce", label: "Workforce" },
                    { key: "settings", label: "Settings" },
                ].map((t) => (_jsx("button", { className: `px-3 py-2 ${tab === t.key ? "border-b-2 border-blue-600 font-semibold" : "text-gray-600"}`, onClick: () => setTab(t.key), children: t.label }, t.key))) }), tab === "overview" && _jsx("div", { className: "text-gray-700", children: "Company overview content placeholder." }), tab === "workforce" && _jsx(Workforce, { companyId: companyId }), tab === "settings" && _jsx("div", { className: "text-gray-700", children: "Settings placeholder." })] }));
}
