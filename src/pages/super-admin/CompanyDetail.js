import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { superAdminFetch } from "../../lib/session/companyContext";
export default function CompanyDetailPage() {
    const [company, setCompany] = useState(null);
    const [status, setStatus] = useState("");
    const [jobs, setJobs] = useState([]);
    const companyId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "";
    useEffect(() => {
        async function load() {
            if (!companyId)
                return;
            const resp = await superAdminFetch(`/api/super-admin/company/${companyId}`);
            if (resp.ok) {
                setCompany(await resp.json());
            }
            const jobsResp = await superAdminFetch(`/api/super-admin/company/${companyId}/jobs?limit=10`);
            if (jobsResp.ok) {
                const data = await jobsResp.json();
                setJobs(data.items || data || []);
            }
        }
        load();
    }, [companyId]);
    async function exportData() {
        setStatus("Export placeholder queued");
    }
    async function act(action) {
        if (!companyId)
            return;
        setStatus(`Running ${action}...`);
        await superAdminFetch(`/api/super-admin/company/${companyId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        });
        setStatus(`${action} requested`);
    }
    if (!company)
        return _jsx("div", { className: "p-6", children: "Loading company..." });
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: company.name }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Status: ", company.status] })] }), _jsx("a", { href: "/super-admin/audit", className: "text-blue-600", children: "Audit timeline" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Info, { label: "Owner", value: company.owner_email }), _jsx(Info, { label: "Phone", value: company.owner_phone || "masked" }), _jsx(Info, { label: "Created", value: new Date(company.created_at).toLocaleString() }), _jsx(Info, { label: "Storage", value: `${company.storage_bytes || 0} bytes` }), _jsx(Info, { label: "Workforce", value: `${company.workforce_count || 0} people` }), _jsx(Info, { label: "Retention", value: `${company.retention_media_days || 0} days media` })] }), _jsxs("div", { className: "space-x-3", children: [_jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", onClick: exportData, children: "Export data" }), _jsx("a", { className: "text-blue-600", href: "/super-admin/storage", children: "Storage manager" }), company.status === "active" ? (_jsx("button", { className: "text-red-600", onClick: () => act("suspend"), children: "Suspend" })) : (_jsx("button", { className: "text-green-600", onClick: () => act("reactivate"), children: "Reactivate" }))] }), _jsxs("div", { className: "border rounded", children: [_jsx("div", { className: "p-3 font-medium", children: "Recent jobs" }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left border-b", children: [_jsx("th", { className: "p-2", children: "ID" }), _jsx("th", { className: "p-2", children: "Title" }), _jsx("th", { className: "p-2", children: "Status" }), _jsx("th", { className: "p-2", children: "Created" })] }) }), _jsxs("tbody", { children: [jobs.map((j) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2 font-mono text-xs", children: j.id }), _jsx("td", { className: "p-2", children: j.title || "Job" }), _jsx("td", { className: "p-2", children: j.status }), _jsx("td", { className: "p-2", children: new Date(j.created_at).toLocaleString() })] }, j.id))), jobs.length === 0 && (_jsx("tr", { children: _jsx("td", { className: "p-3 text-gray-500", colSpan: 4, children: "No jobs yet" }) }))] })] })] }), status && _jsx("div", { className: "text-sm", children: status })] }));
}
function Info({ label, value }) {
    return (_jsxs("div", { className: "border rounded p-3", children: [_jsx("div", { className: "text-xs text-gray-600", children: label }), _jsx("div", { className: "text-sm", children: value })] }));
}
