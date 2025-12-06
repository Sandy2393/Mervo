import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { superAdminFetch } from "../../lib/session/companyContext";
export default function SuperAdminDashboard() {
    const [companies, setCompanies] = useState([]);
    const [status, setStatus] = useState("");
    useEffect(() => {
        load();
    }, []);
    async function load() {
        const resp = await superAdminFetch("/api/super-admin/companies");
        if (resp.ok) {
            const data = await resp.json();
            setCompanies(data.items || data || []);
        }
    }
    async function act(companyId, action) {
        setStatus(`Running ${action}...`);
        const resp = await superAdminFetch(`/api/super-admin/company/${companyId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        });
        setStatus(resp.ok ? `${action} done` : "Action failed");
        load();
    }
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Super Admin" }), _jsx("a", { href: "/super-admin/prelaunch", className: "text-blue-600 text-sm", children: "Pre-launch readiness" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx(StatCard, { label: "Companies", value: companies.length }), _jsx(StatCard, { label: "Active", value: companies.filter((c) => c.status === "active").length }), _jsx(StatCard, { label: "Suspended", value: companies.filter((c) => c.status === "suspended").length })] }), _jsxs("div", { className: "border rounded", children: [_jsxs("div", { className: "p-3 font-medium flex items-center justify-between", children: [_jsx("span", { children: "Companies" }), _jsxs("div", { className: "space-x-3 text-sm", children: [_jsx("a", { href: "/super-admin/audit", className: "text-blue-600", children: "Audit viewer" }), _jsx("a", { href: "/super-admin/storage", className: "text-blue-600", children: "Storage manager" }), _jsx("a", { href: "/super-admin/offline", className: "text-blue-600", children: "Offline center" })] })] }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left border-b", children: [_jsx("th", { className: "p-2", children: "Name" }), _jsx("th", { className: "p-2", children: "Owner" }), _jsx("th", { className: "p-2", children: "Status" }), _jsx("th", { className: "p-2", children: "Created" }), _jsx("th", { className: "p-2", children: "Actions" })] }) }), _jsx("tbody", { children: companies.map((c) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: _jsx("a", { className: "text-blue-600", href: `/super-admin/company/${c.id}`, children: c.name }) }), _jsx("td", { className: "p-2", children: c.owner_email }), _jsx("td", { className: "p-2", children: c.status }), _jsx("td", { className: "p-2", children: new Date(c.created_at).toLocaleString() }), _jsxs("td", { className: "p-2 space-x-2", children: [c.status === "active" ? (_jsx("button", { className: "text-red-600", onClick: () => act(c.id, "suspend"), children: "Suspend" })) : (_jsx("button", { className: "text-green-600", onClick: () => act(c.id, "reactivate"), children: "Reactivate" })), _jsx("button", { className: "text-sm", onClick: () => act(c.id, "temp_password"), children: "Temp password" })] })] }, c.id))) })] })] }), status && _jsx("div", { className: "text-sm text-gray-700", children: status })] }));
}
function StatCard({ label, value }) {
    return (_jsxs("div", { className: "border rounded p-4", children: [_jsx("div", { className: "text-sm text-gray-600", children: label }), _jsx("div", { className: "text-2xl font-semibold", children: value })] }));
}
