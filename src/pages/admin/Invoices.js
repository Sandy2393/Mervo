import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    useEffect(() => {
        // TODO: Fetch from /api/billing/invoices
        const mockInvoices = [
            {
                id: "in_001",
                number: "INV-2024-12-001",
                status: "paid",
                amount_due: 9900,
                amount_paid: 9900,
                currency: "USD",
                created: Date.now() - 15 * 24 * 60 * 60 * 1000,
                hosted_invoice_url: "https://invoice.stripe.com/placeholder",
                invoice_pdf: "https://invoice.stripe.com/placeholder.pdf",
            },
            {
                id: "in_002",
                number: "INV-2024-11-001",
                status: "paid",
                amount_due: 9900,
                amount_paid: 9900,
                currency: "USD",
                created: Date.now() - 45 * 24 * 60 * 60 * 1000,
                hosted_invoice_url: "https://invoice.stripe.com/placeholder",
                invoice_pdf: "https://invoice.stripe.com/placeholder.pdf",
            },
            {
                id: "in_003",
                number: "INV-2024-10-001",
                status: "paid",
                amount_due: 9900,
                amount_paid: 9900,
                currency: "USD",
                created: Date.now() - 75 * 24 * 60 * 60 * 1000,
                hosted_invoice_url: "https://invoice.stripe.com/placeholder",
                invoice_pdf: "https://invoice.stripe.com/placeholder.pdf",
            },
        ];
        setInvoices(mockInvoices);
        setLoading(false);
    }, []);
    const formatMoney = (cents, currency) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
    };
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };
    const filteredInvoices = invoices.filter((inv) => filter === "all" || inv.status === filter);
    if (loading)
        return _jsx("div", { className: "p-6", children: "Loading..." });
    return (_jsxs("div", { className: "p-6 max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Invoices" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setFilter("all"), className: `px-4 py-2 rounded ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`, children: "All" }), _jsx("button", { onClick: () => setFilter("paid"), className: `px-4 py-2 rounded ${filter === "paid" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`, children: "Paid" }), _jsx("button", { onClick: () => setFilter("open"), className: `px-4 py-2 rounded ${filter === "open" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`, children: "Open" })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Invoice Number" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Amount" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredInvoices.map((invoice) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: invoice.number }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDate(invoice.created) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatMoney(invoice.amount_due, invoice.currency) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === "paid"
                                                    ? "bg-green-100 text-green-800"
                                                    : invoice.status === "open"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"}`, children: invoice.status }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm space-x-2", children: [invoice.hosted_invoice_url && (_jsx("a", { href: invoice.hosted_invoice_url, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-800", children: "View" })), invoice.invoice_pdf && (_jsx("a", { href: invoice.invoice_pdf, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-800", children: "Download PDF" }))] })] }, invoice.id))) })] }), filteredInvoices.length === 0 && (_jsx("div", { className: "text-center py-12 text-gray-500", children: "No invoices found for the selected filter." }))] })] }));
}
