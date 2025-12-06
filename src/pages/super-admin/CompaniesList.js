import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { superAdminFetch } from '../../lib/session/companyContext';
export default function CompaniesList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        load();
    }, []);
    async function load() {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (q)
                params.append('q', q);
            if (status)
                params.append('status', status);
            const res = await superAdminFetch(`/api/super-admin/companies?${params.toString()}`);
            if (!res.ok)
                throw new Error('Failed to load');
            const data = await res.json();
            setRows(data.items || []);
        }
        catch (err) {
            setError(err.message || 'Failed to load');
        }
        finally {
            setLoading(false);
        }
    }
    async function act(companyId, action) {
        await superAdminFetch(`/api/super-admin/company/${companyId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        load();
    }
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Companies" }), _jsx("p", { className: "text-gray-600", children: "Search and manage all companies" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "border p-2 rounded", placeholder: "Search", value: q, onChange: (e) => setQ(e.target.value) }), _jsxs("select", { className: "border p-2 rounded", value: status, onChange: (e) => setStatus(e.target.value), children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "suspended", children: "Suspended" })] }), _jsx("button", { className: "bg-blue-600 text-white px-3 py-2 rounded", onClick: load, children: "Apply" })] })] }), loading && _jsx("div", { children: "Loading companies..." }), error && _jsx("div", { className: "text-red-600 text-sm", children: error }), !loading && rows.length === 0 && _jsx("div", { className: "text-gray-500", children: "No companies found" }), rows.length > 0 && (_jsx("div", { className: "border rounded overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b text-left", children: [_jsx("th", { className: "p-2", children: "Name" }), _jsx("th", { className: "p-2", children: "Owner" }), _jsx("th", { className: "p-2", children: "Status" }), _jsx("th", { className: "p-2", children: "Created" }), _jsx("th", { className: "p-2", children: "Actions" })] }) }), _jsx("tbody", { children: rows.map((c) => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "p-2 font-medium", children: _jsx("a", { className: "text-blue-600", href: `/super-admin/company/${c.id}`, children: c.name }) }), _jsx("td", { className: "p-2", children: c.owner_email || 'masked' }), _jsx("td", { className: "p-2", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`, children: c.status }) }), _jsx("td", { className: "p-2", children: c.created_at ? new Date(c.created_at).toLocaleString() : '—' }), _jsxs("td", { className: "p-2 space-x-2", children: [c.status === 'active' ? (_jsx("button", { className: "text-red-600", onClick: () => act(c.id, 'suspend'), children: "Suspend" })) : (_jsx("button", { className: "text-green-600", onClick: () => act(c.id, 'reactivate'), children: "Reactivate" })), _jsx("a", { className: "text-blue-600", href: `/super-admin/company/${c.id}`, children: "View" })] })] }, c.id))) })] }) }))] }));
}
