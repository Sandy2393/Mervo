import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";
export default function OfflineCenter() {
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("");
    useEffect(() => {
        load();
    }, []);
    async function load() {
        const resp = await authedFetch("/api/offline/pending");
        if (resp.ok) {
            const data = await resp.json();
            setItems(data.pending || []);
            setStatus(`Success rate ${(data.metrics?.success_rate ?? 1) * 100}%`);
        }
    }
    async function reprocess(id) {
        setStatus("Reprocessing...");
        const resp = await authedFetch("/api/offline/pending", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reprocess", item_id: id }),
        });
        setStatus(resp.ok ? "Reprocessed" : "Failed");
        load();
    }
    async function resolve(id) {
        setStatus("Resolving...");
        const resp = await authedFetch("/api/offline/pending", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "resolve", item_id: id }),
        });
        setStatus(resp.ok ? "Resolved" : "Failed");
        load();
    }
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Offline Resilience Center" }), _jsx("span", { className: "text-sm text-gray-600", children: status })] }), _jsxs("div", { className: "border rounded", children: [_jsx("div", { className: "p-3 font-medium", children: "Pending sync items" }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left border-b", children: [_jsx("th", { className: "p-2", children: "ID" }), _jsx("th", { className: "p-2", children: "Company" }), _jsx("th", { className: "p-2", children: "Type" }), _jsx("th", { className: "p-2", children: "Attempts" }), _jsx("th", { className: "p-2", children: "Updated" }), _jsx("th", { className: "p-2", children: "Actions" })] }) }), _jsx("tbody", { children: items.map((i) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2 font-mono text-xs", children: i.id }), _jsx("td", { className: "p-2", children: i.company_id }), _jsx("td", { className: "p-2", children: i.type }), _jsx("td", { className: "p-2", children: i.attempts }), _jsx("td", { className: "p-2", children: new Date(i.updated_at).toLocaleString() }), _jsxs("td", { className: "p-2 space-x-2", children: [_jsx("button", { className: "text-blue-600", onClick: () => reprocess(i.id), children: "Retry" }), _jsx("button", { className: "text-green-600", onClick: () => resolve(i.id), children: "Resolve" })] })] }, i.id))) })] })] })] }));
}
