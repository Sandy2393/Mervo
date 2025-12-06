import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Corporate Accounts Page
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { financeService } from '../../services/financeService';
import { billingService } from '../../services/billingService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency, centsToDecimal } from '../../lib/currency';
import { Link } from 'react-router-dom';
export default function Accounts() {
    const { activeCompanyId } = useAuth();
    const [company, setCompany] = useState(null);
    const [balanceCents, setBalanceCents] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [range, setRange] = useState('month');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!activeCompanyId)
            return;
        const load = async () => {
            setLoading(true);
            try {
                const comp = await companyService.getCompanyById(activeCompanyId);
                if (comp.success)
                    setCompany(comp.data);
                const rev = await financeService.getRevenue(activeCompanyId, range);
                if (rev.success && rev.data)
                    setRevenue(rev.data);
                const pending = await financeService.getPendingPayments(activeCompanyId);
                if (pending.success && pending.data)
                    setPendingPayments(pending.data || []);
                const invoices = await billingService.listInvoices(activeCompanyId);
                if (invoices.success && invoices.data)
                    setRecentInvoices(invoices.data.slice(0, 10));
                // Balance = total revenue - pending payouts total (cents)
                const totalRevenue = rev.success && rev.data ? rev.data.total_revenue_cents : 0;
                const totalPending = (pending.success && pending.data ? pending.data.reduce((s, p) => s + (p.amount_cents || 0), 0) : 0);
                setBalanceCents((totalRevenue || 0) - (totalPending || 0));
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [activeCompanyId, range]);
    const handleRunPayroll = async () => {
        // Placeholder; should trigger server-side payout batch
        alert('Run Payroll is a placeholder — implement server-side payout via payments provider');
    };
    const handleExportCSV = async () => {
        if (!activeCompanyId)
            return;
        const res = await billingService.generateInvoiceCSV(activeCompanyId);
        if (res.success && res.data) {
            // For now show CSV in new tab
            const blob = new Blob([res.data.csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }
    };
    const handleGenerateMonthlyInvoices = async () => {
        // TODO: Implement server-side invoicing generation (createInvoice for each contractor/company)
        alert('Generate Monthly Invoices is a placeholder — implement server-side');
    };
    if (loading)
        return _jsx("div", { className: "p-6", children: "Loading accounts..." });
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Accounts" }), _jsxs("div", { className: "text-sm text-gray-500", children: [company?.name, " \u2014 ", company?.company_tag] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleRunPayroll, className: "bg-blue-600", children: "Run Payroll" }), _jsx(Button, { onClick: handleExportCSV, className: "bg-gray-600", children: "Export CSV" }), _jsx(Button, { onClick: handleGenerateMonthlyInvoices, className: "bg-green-600", children: "Generate Monthly Invoices" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Current Balance" }), _jsx("div", { className: "text-3xl font-bold mt-2", children: formatCurrency(centsToDecimal(balanceCents || 0)) })] }) }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Total Revenue (", range, ")"] }), _jsx("div", { className: "text-2xl font-bold mt-1", children: revenue ? formatCurrency(revenue.total_revenue_cents / 100) : '-' })] }), _jsx("div", { children: _jsxs("select", { value: range, onChange: (e) => setRange(e.target.value), className: "border rounded p-2 text-sm", children: [_jsx("option", { value: "week", children: "Week" }), _jsx("option", { value: "month", children: "Month" }), _jsx("option", { value: "quarter", children: "Quarter" }), _jsx("option", { value: "year", children: "Year" })] }) })] }) }) }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Pending Contractor Payouts" }), _jsx("div", { className: "mt-2", children: pendingPayments.length === 0 ? (_jsx("div", { className: "text-sm text-gray-500", children: "No pending payouts" })) : (pendingPayments.map(p => (_jsxs("div", { className: "flex justify-between text-sm py-2 border-b", children: [_jsx("div", { children: p.contractor_alias }), _jsx("div", { className: "font-semibold", children: formatCurrency((p.amount_cents || 0) / 100) })] }, p.contractor_alias)))) })] }) })] }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("div", { className: "font-bold", children: "Recent Invoices" }), _jsx(Link, { to: "/corporate/invoices", className: "text-sm text-blue-600", children: "View all" })] }), recentInvoices.length === 0 ? (_jsx("div", { className: "text-sm text-gray-500", children: "No invoices yet" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-100 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "Invoice #" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Period" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Total" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Status" })] }) }), _jsx("tbody", { children: recentInvoices.map((inv) => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2 text-blue-600", children: _jsx(Link, { to: `/corporate/invoices/${inv.id}`, children: inv.invoice_number }) }), _jsxs("td", { className: "px-4 py-2", children: [inv.period_start || '-', " \u2014 ", inv.period_end || '-'] }), _jsx("td", { className: "px-4 py-2", children: formatCurrency((inv.total_cents || 0) / 100) }), _jsx("td", { className: "px-4 py-2 capitalize", children: inv.status })] }, inv.id))) })] }) }))] }) })] }));
}
