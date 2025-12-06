import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const mockInvoices = [
    { id: "inv_1", number: "2024-001", status: "draft", total_cents: 120000 },
    { id: "inv_2", number: "2024-002", status: "paid", total_cents: 9900 },
];
export default function InvoicesList() {
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { children: "Invoices" }), _jsx("button", { children: "Issue Invoice" }), _jsx("button", { style: { marginLeft: 8 }, children: "Download CSV" }), _jsxs("table", { style: { marginTop: 12 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Number" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Total (cents)" })] }) }), _jsx("tbody", { children: mockInvoices.map((inv) => (_jsxs("tr", { children: [_jsx("td", { children: inv.id }), _jsx("td", { children: inv.number }), _jsx("td", { children: inv.status }), _jsx("td", { children: inv.total_cents })] }, inv.id))) })] })] }));
}
