import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";
export default function AuditViewer() {
    const [rows, setRows] = useState([]);
    const [filters, setFilters] = useState({ company_id: "", actor: "", action: "" });
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function load() {
        const qs = new URLSearchParams();
        if (filters.company_id)
            qs.append("company_id", filters.company_id);
        if (filters.actor)
            qs.append("actor", filters.actor);
        if (filters.action)
            qs.append("q", filters.action);
        const resp = await authedFetch(`/api/super-admin/audit/search?${qs.toString()}`);
        if (resp.ok) {
            const data = await resp.json();
            setRows(data.items || data || []);
        }
    }
    function exportCsv() {
        const header = "id,action,actor,target,created_at";
        const body = rows.map((r) => `${r.id},${r.action},${r.actor || ""},${r.target || ""},${r.created_at}`);
        const blob = new Blob([header + "\n" + body.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "audit.csv";
        a.click();
        URL.revokeObjectURL(url);
    }
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Audit Viewer" }), _jsx("button", { className: "text-blue-600 text-sm", onClick: exportCsv, disabled: !rows.length, children: "Export CSV" })] }), _jsxs("div", { className: "grid grid-cols-4 gap-3", children: [_jsx("input", { className: "border p-2 rounded", placeholder: "Company ID", value: filters.company_id, onChange: (e) => setFilters({ ...filters, company_id: e.target.value }) }), _jsx("input", { className: "border p-2 rounded", placeholder: "Actor", value: filters.actor, onChange: (e) => setFilters({ ...filters, actor: e.target.value }) }), _jsx("input", { className: "border p-2 rounded", placeholder: "Action", value: filters.action, onChange: (e) => setFilters({ ...filters, action: e.target.value }) }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", onClick: load, children: "Apply" })] }), _jsxs("div", { className: "border rounded", children: [_jsx("div", { className: "p-3 font-medium", children: "Timeline" }), _jsx("div", { className: "max-h-96 overflow-auto", children: _jsx("ul", { className: "divide-y", children: rows.map((r) => (_jsxs("li", { className: "p-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "font-mono text-xs", children: r.id }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(r.created_at).toLocaleString() })] }), _jsx("div", { className: "text-sm", children: r.action }), _jsxs("div", { className: "text-xs text-gray-600", children: ["actor: ", r.actor || "n/a", " \u2014 target: ", r.target || "n/a"] })] }, r.id))) }) })] })] }));
}
