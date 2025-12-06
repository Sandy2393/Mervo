import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";
export default function StorageManager() {
    const [companyId, setCompanyId] = useState("demo");
    const [usage, setUsage] = useState(null);
    const [status, setStatus] = useState("");
    useEffect(() => {
        load(companyId);
    }, [companyId]);
    async function load(id) {
        const resp = await authedFetch(`/api/storage/usage?company_id=${id}`);
        if (resp.ok)
            setUsage(await resp.json());
    }
    function runPreview() {
        setStatus("Cleanup preview queued (placeholder)");
    }
    function triggerArchive() {
        setStatus("Archive scheduled (placeholder)");
    }
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Storage Manager" }), _jsx("input", { className: "border p-2 rounded", value: companyId, onChange: (e) => setCompanyId(e.target.value) })] }), usage && (_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx(Card, { title: "Total", value: `${usage.total_bytes.toLocaleString()} bytes` }), _jsx(Card, { title: "Est. monthly", value: `$${usage.estimated_monthly_cost_usd.toFixed(2)}` }), _jsx(Card, { title: "Company", value: usage.company_id })] })), _jsxs("div", { className: "border rounded", children: [_jsxs("div", { className: "p-3 font-medium flex items-center justify-between", children: [_jsx("span", { children: "Top folders" }), _jsxs("div", { className: "space-x-2 text-sm", children: [_jsx("button", { className: "text-blue-600", onClick: runPreview, children: "Run cleanup preview" }), _jsx("button", { className: "text-blue-600", onClick: triggerArchive, children: "Trigger archive" })] })] }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left border-b", children: [_jsx("th", { className: "p-2", children: "Path" }), _jsx("th", { className: "p-2", children: "Bytes" })] }) }), _jsx("tbody", { children: usage?.top_folders?.map((f) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2 font-mono text-xs", children: f.path }), _jsx("td", { className: "p-2", children: f.bytes.toLocaleString() })] }, f.path))) })] })] }), status && _jsx("div", { className: "text-sm", children: status })] }));
}
function Card({ title, value }) {
    return (_jsxs("div", { className: "border rounded p-4", children: [_jsx("div", { className: "text-xs text-gray-600", children: title }), _jsx("div", { className: "text-lg font-semibold", children: value })] }));
}
