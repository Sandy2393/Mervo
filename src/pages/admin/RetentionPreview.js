import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { authedFetch, getActiveCompanyId } from "../../lib/session/companyContext";
export default function RetentionPreview() {
    const companyId = getActiveCompanyId();
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState("");
    useEffect(() => {
        async function load() {
            if (!companyId)
                return;
            const resp = await authedFetch(`/api/retention/preview?company_id=${companyId}`);
            if (resp.ok) {
                const data = await resp.json();
                setPreview(data);
            }
        }
        load();
    }, [companyId]);
    function exportCsv() {
        if (!preview)
            return;
        const header = "id,type,created_at,category";
        const rows = preview.samples.map((s) => `${s.id},${s.type},${s.created_at},${s.category}`);
        const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `retention_preview_${companyId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    async function runSoftMark() {
        if (!companyId)
            return;
        if (!window.confirm("Soft-mark items for deletion?"))
            return;
        const resp = await authedFetch(`/api/retention/run-soft-sweep?company_id=${companyId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirm: true }),
        });
        const data = await resp.json();
        setStatus(resp.ok ? data.message || "Soft sweep queued" : data.error || "Failed");
    }
    async function runHardDelete() {
        if (!companyId)
            return;
        if (!window.confirm("Export backups before deleting?"))
            return;
        if (!window.confirm("This will permanently delete items. Type OK to proceed."))
            return;
        const resp = await authedFetch(`/api/retention/run-hard-delete?company_id=${companyId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirm: true }),
        });
        const data = await resp.json();
        setStatus(resp.ok ? data.message || "Hard delete simulated" : data.error || "Failed");
    }
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Retention Preview" }), _jsx("button", { className: "text-blue-600 text-sm", onClick: exportCsv, disabled: !preview, children: "Export CSV" })] }), preview ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "border rounded p-3", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Media to delete" }), _jsx("div", { className: "text-2xl font-bold", children: preview.counts.media }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Cutoff: ", preview.cutoff_media || "n/a"] })] }), _jsxs("div", { className: "border rounded p-3", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Metadata to delete" }), _jsx("div", { className: "text-2xl font-bold", children: preview.counts.metadata }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Cutoff: ", preview.cutoff_meta || "n/a"] })] })] }), _jsxs("div", { className: "border rounded", children: [_jsx("div", { className: "p-3 font-medium", children: "Sample items (first 50 metadata-only rows)" }), _jsx("div", { className: "max-h-72 overflow-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left border-b", children: [_jsx("th", { className: "p-2", children: "ID" }), _jsx("th", { className: "p-2", children: "Type" }), _jsx("th", { className: "p-2", children: "Created" }), _jsx("th", { className: "p-2", children: "Category" })] }) }), _jsx("tbody", { children: preview.samples.map((s) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2 font-mono text-xs", children: s.id }), _jsx("td", { className: "p-2", children: s.type }), _jsx("td", { className: "p-2", children: new Date(s.created_at).toLocaleString() }), _jsx("td", { className: "p-2", children: s.category })] }, s.id))) })] }) })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { className: "bg-yellow-600 text-white px-4 py-2 rounded", onClick: runSoftMark, children: "Soft-mark" }), _jsx("button", { className: "bg-red-600 text-white px-4 py-2 rounded", onClick: runHardDelete, children: "Execute hard delete" }), status && _jsx("span", { className: "text-sm", children: status })] })] })) : (_jsx("div", { className: "text-sm text-gray-600", children: "No preview available." }))] }));
}
