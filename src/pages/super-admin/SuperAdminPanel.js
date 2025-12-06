import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Super Admin Panel — Stub for super admin features
 * TODO: Implement with proper RLS and audit logging
 */
import { Card, CardBody } from '../../components/ui/Card';
import { useEffect, useState } from 'react';
import { superAdminFetch } from '../../lib/session/companyContext';
export default function SuperAdminPanel() {
    const [summary, setSummary] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                const [billingRes, companiesRes] = await Promise.all([
                    superAdminFetch('/api/super-admin/billing/dashboard'),
                    superAdminFetch('/api/super-admin/companies?limit=5'),
                ]);
                const billing = billingRes.ok ? await billingRes.json() : null;
                const companies = companiesRes.ok ? await companiesRes.json() : { items: [] };
                setSummary({
                    totalCompanies: companies.items?.length || 0,
                    activeCompanies: (companies.items || []).filter((c) => c.status === 'active').length,
                    overdueInvoices: billing?.summary?.overdueInvoices || 0,
                    mrr: billing?.summary?.totalMRR || 0,
                });
            }
            catch (err) {
                // ignore
            }
        })();
    }, []);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Super Admin Panel" }), _jsx("p", { className: "text-gray-600 mt-2", children: "System administration and company management" })] }), _jsx("div", { className: "text-sm text-gray-600", children: summary ? `${summary.totalCompanies} companies` : 'Loading...' })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold mb-1", children: "Companies" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Active: ", summary?.activeCompanies ?? '—'] })] }), _jsx("a", { className: "text-blue-600 text-sm", href: "/super-admin/companies", children: "Open" })] }), _jsx("div", { className: "text-sm text-gray-700 mt-3", children: "List, suspend, activate companies" })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold mb-1", children: "Billing" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["MRR: ", summary ? `$${summary.mrr}` : '—'] })] }), _jsx("a", { className: "text-blue-600 text-sm", href: "/super-admin/billing", children: "Open" })] }), _jsx("div", { className: "text-sm text-gray-700 mt-3", children: "Invoices, MRR, coupons" })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold mb-1", children: "Audit Logs" }), _jsx("p", { className: "text-sm text-gray-600", children: "Search and export" })] }), _jsx("a", { className: "text-blue-600 text-sm", href: "/super-admin/audit", children: "Open" })] }), _jsx("div", { className: "text-sm text-gray-700 mt-3", children: "View system audit trail" })] }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold mb-1", children: "Storage & Offline" }), _jsx("p", { className: "text-sm text-gray-600", children: "Health & retries" })] }), _jsxs("div", { className: "space-x-3 text-sm", children: [_jsx("a", { className: "text-blue-600", href: "/super-admin/storage", children: "Storage" }), _jsx("a", { className: "text-blue-600", href: "/super-admin/offline", children: "Offline" })] })] }), _jsx("div", { className: "text-sm text-gray-700 mt-3", children: "Manage storage and sync retries" })] }) })] })] }));
}
