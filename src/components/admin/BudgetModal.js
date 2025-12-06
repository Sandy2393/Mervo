import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { setBudget, getBudget } from "../../services/budgetService";
export default function BudgetModal({ triggerLabel = "Set budget" }) {
    const [open, setOpen] = useState(false);
    const [companyId, setCompanyId] = useState("company-1");
    const [currency, setCurrency] = useState("USD");
    const [amount, setAmount] = useState(1000);
    const [message, setMessage] = useState("");
    const save = async () => {
        await setBudget(companyId, currency, amount);
        const budget = await getBudget(companyId);
        setMessage(`Saved budget: ${budget?.monthlyAmount || amount} ${budget?.currency || currency}`);
        setOpen(false);
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: "px-3 py-1 border rounded", onClick: () => setOpen(true), children: triggerLabel }), open && (_jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center", children: _jsxs("div", { className: "bg-white p-4 rounded shadow w-80 space-y-3", children: [_jsx("h3", { className: "font-semibold", children: "Set Monthly Budget" }), _jsxs("label", { className: "text-sm flex flex-col", children: ["Company ID", _jsx("input", { className: "border p-1", value: companyId, onChange: (e) => setCompanyId(e.target.value) })] }), _jsxs("label", { className: "text-sm flex flex-col", children: ["Currency", _jsx("input", { className: "border p-1", value: currency, onChange: (e) => setCurrency(e.target.value) })] }), _jsxs("label", { className: "text-sm flex flex-col", children: ["Amount (monthly)", _jsx("input", { type: "number", className: "border p-1", value: amount, onChange: (e) => setAmount(Number(e.target.value)) })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { className: "px-3 py-1 border rounded", onClick: () => setOpen(false), children: "Cancel" }), _jsx("button", { className: "px-3 py-1 border rounded bg-blue-600 text-white", onClick: () => void save(), children: "Save" })] }), message && _jsx("p", { className: "text-xs text-green-700", children: message })] }) }))] }));
}
