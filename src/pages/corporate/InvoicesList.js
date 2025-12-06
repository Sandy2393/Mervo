import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Invoices List
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/currency';
import { Link } from 'react-router-dom';
export default function InvoicesList() {
    const { activeCompanyId } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    useEffect(() => {
        if (!activeCompanyId)
            return;
        const load = async () => {
            setLoading(true);
            const res = await billingService.listInvoices(activeCompanyId, statusFilter ? { status: statusFilter } : undefined);
            if (res.success && res.data)
                setInvoices(res.data);
            setLoading(false);
        };
        load();
    }, [activeCompanyId, statusFilter]);
    const handleDownloadCSV = async () => {
        if (!activeCompanyId)
            return;
        const res = await billingService.generateInvoiceCSV(activeCompanyId);
        if (res.success && res.data) {
            const blob = new Blob([res.data.csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    };
    const handleMarkPaid = async (invId) => {
        if (!activeCompanyId)
            return;
        await billingService.markInvoicePaid(activeCompanyId, invId, { processed_by: 'cli', paid_at: new Date().toISOString() });
        // Refresh
        const res = await billingService.listInvoices(activeCompanyId, statusFilter ? { status: statusFilter } : undefined);
        if (res.success && res.data)
            setInvoices(res.data);
    };
    if (loading)
        return _jsx("div", { className: "p-6", children: "Loading invoices..." });
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Invoices" }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { onClick: handleDownloadCSV, className: "bg-gray-600", children: "Export CSV" }) })] }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("div", { className: "flex gap-2 items-center mb-3", children: [_jsx("label", { className: "text-sm text-gray-600", children: "Status" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "border p-2 rounded", children: [_jsx("option", { value: "", children: "All" }), _jsx("option", { value: "issued", children: "Issued" }), _jsx("option", { value: "paid", children: "Paid" }), _jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] })] }), invoices.length === 0 ? (_jsx("div", { className: "text-sm text-gray-500", children: "No invoices found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-100 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "Invoice #" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Period" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Total" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Status" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Actions" })] }) }), _jsx("tbody", { children: invoices.map(inv => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2", children: _jsx(Link, { to: `/corporate/invoices/${inv.id}`, children: inv.invoice_number }) }), _jsxs("td", { className: "px-4 py-2", children: [inv.period_start || '-', " \u2014 ", inv.period_end || '-'] }), _jsx("td", { className: "px-4 py-2", children: formatCurrency((inv.total_cents || 0) / 100) }), _jsx("td", { className: "px-4 py-2 capitalize", children: inv.status }), _jsx("td", { className: "px-4 py-2", children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { to: `/corporate/invoices/${inv.id}`, className: "text-sm text-blue-600", children: "View" }), _jsx("button", { onClick: () => handleMarkPaid(inv.id), className: "text-sm text-green-600", children: "Mark Paid" })] }) })] }, inv.id))) })] }) }))] }) })] }));
}
