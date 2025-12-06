import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { frontPaymentsService } from "../../services/frontPaymentsService";
const formatMoney = (cents, currency) => `${currency} ${(cents / 100).toFixed(2)}`;
export default function PaymentsDashboard() {
    const [payments, setPayments] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [balanceCents, setBalanceCents] = useState(0);
    useEffect(() => {
        // TODO: company context
        frontPaymentsService.listPayments("company-placeholder").then((res) => {
            setPayments(res.payments || []);
            setPayouts(res.payouts || []);
            setDisputes(res.disputes || []);
            const paid = (res.payments || []).reduce((sum, p) => sum + p.amount_cents, 0);
            const owed = (res.payouts || []).reduce((sum, p) => sum + p.amount_cents, 0);
            setBalanceCents(paid - owed);
        });
    }, []);
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { children: "Payments & Payouts" }), _jsxs("div", { children: ["Current balance: ", formatMoney(balanceCents, "USD")] }), _jsxs("div", { style: { marginTop: 16 }, children: [_jsx("button", { children: "Create Payout Batch" }), _jsx("button", { style: { marginLeft: 8 }, children: "Run Reconciliation" }), _jsx("button", { style: { marginLeft: 8 }, children: "Export CSV" })] }), _jsxs("section", { style: { marginTop: 24 }, children: [_jsx("h2", { children: "Recent Payments" }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: payments.map((p) => (_jsxs("tr", { children: [_jsx("td", { children: p.id }), _jsx("td", { children: formatMoney(p.amount_cents, p.currency) }), _jsx("td", { children: p.status })] }, p.id))) })] })] }), _jsxs("section", { style: { marginTop: 24 }, children: [_jsx("h2", { children: "Pending Payouts" }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: payouts.map((p) => (_jsxs("tr", { children: [_jsx("td", { children: p.id }), _jsx("td", { children: formatMoney(p.amount_cents, p.currency) }), _jsx("td", { children: p.status })] }, p.id))) })] })] }), _jsxs("section", { style: { marginTop: 24 }, children: [_jsx("h2", { children: "Disputes" }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: disputes.map((d) => (_jsxs("tr", { children: [_jsx("td", { children: d.id }), _jsx("td", { children: formatMoney(d.amount_cents, "USD") }), _jsx("td", { children: d.status })] }, d.id))) })] })] })] }));
}
