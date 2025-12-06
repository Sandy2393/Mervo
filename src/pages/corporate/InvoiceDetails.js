import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Invoice Details
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import { formatCurrency } from '../../lib/currency';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
export default function InvoiceDetails() {
    const { instanceId } = useParams();
    const { activeCompanyId } = useAuth();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!activeCompanyId || !instanceId)
            return;
        const load = async () => {
            setLoading(true);
            const res = await billingService.getInvoiceById(activeCompanyId, instanceId);
            if (res.success && res.data)
                setInvoice(res.data);
            setLoading(false);
        };
        load();
    }, [activeCompanyId, instanceId]);
    const handleDownloadCSV = () => {
        if (!invoice)
            return;
        // For now build CSV on client
        const rows = invoice.line_items.map((li) => `${li.id},${li.description},${li.qty},${li.unit_price_cents},${li.amount_cents}`);
        const csv = ['line_id,description,qty,unit_price_cents,amount_cents', ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };
    if (loading)
        return _jsx("div", { className: "p-6", children: "Loading invoice..." });
    if (!invoice)
        return _jsx("div", { className: "p-6", children: "Invoice not found" });
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold", children: ["Invoice ", invoice.invoice_number] }), _jsxs("div", { className: "text-sm text-gray-500", children: [invoice.period_start || '-', " \u2014 ", invoice.period_end || '-'] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleDownloadCSV, className: "bg-gray-600", children: "Download CSV" }), _jsx(Button, { onClick: () => alert('Export PDF - placeholder'), className: "bg-blue-600", children: "Export PDF" })] })] }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-100 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "Description" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Qty" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Unit" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Amount" })] }) }), _jsx("tbody", { children: invoice.line_items.map((li) => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2", children: li.description }), _jsx("td", { className: "px-4 py-2", children: li.qty }), _jsx("td", { className: "px-4 py-2", children: (li.unit_price_cents / 100).toFixed(2) }), _jsx("td", { className: "px-4 py-2", children: formatCurrency(li.amount_cents / 100) })] }, li.id))) })] }), _jsxs("div", { className: "mt-4 flex justify-end space-y-2 flex-col items-end", children: [_jsxs("div", { className: "text-sm", children: ["Subtotal: ", formatCurrency((invoice.subtotal_cents || 0) / 100)] }), _jsxs("div", { className: "text-sm", children: ["Tax: ", formatCurrency((invoice.tax_cents || 0) / 100)] }), _jsxs("div", { className: "text-lg font-bold", children: ["Total: ", formatCurrency((invoice.total_cents || 0) / 100)] })] })] }) }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("h3", { className: "font-bold mb-2", children: "Payment History" }), invoice.payment_history && invoice.payment_history.length > 0 ? (invoice.payment_history.map((p, idx) => (_jsxs("div", { className: "flex justify-between py-2 border-b text-sm", children: [_jsx("div", { children: p.processed_by || 'system' }), _jsx("div", { children: p.paid_at || p.timestamp || '-' })] }, idx)))) : (_jsx("div", { className: "text-sm text-gray-500", children: "No payment records" }))] }) })] }));
}
