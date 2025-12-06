import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function ChargeModal({ companyId, onClose, onSuccess }) {
    const [type, setType] = useState("charge");
    const [amountDollars, setAmountDollars] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const amount = parseFloat(amountDollars);
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }
        if (!reason.trim()) {
            setError("Please provide a reason");
            return;
        }
        setLoading(true);
        try {
            // TODO: POST /api/billing/adjustments
            const response = await fetch("/api/billing/adjustments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company_id: companyId,
                    adjustment_type: type,
                    amount_cents: Math.round(amount * 100),
                    currency: "USD",
                    reason,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to create adjustment");
            }
            onSuccess();
            onClose();
        }
        catch (err) {
            setError(err.message || "An error occurred");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Manual Billing Adjustment" }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700 text-2xl leading-none", children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Type" }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "type", value: "charge", checked: type === "charge", onChange: (e) => setType(e.target.value), className: "mr-2" }), _jsx("span", { children: "Charge" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "type", value: "credit", checked: type === "credit", onChange: (e) => setType(e.target.value), className: "mr-2" }), _jsx("span", { children: "Credit" })] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "amount", className: "block text-sm font-medium text-gray-700 mb-2", children: "Amount (USD)" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-2 text-gray-500", children: "$" }), _jsx("input", { id: "amount", type: "number", step: "0.01", min: "0", value: amountDollars, onChange: (e) => setAmountDollars(e.target.value), className: "w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "0.00", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "reason", className: "block text-sm font-medium text-gray-700 mb-2", children: "Reason" }), _jsx("textarea", { id: "reason", value: reason, onChange: (e) => setReason(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent", rows: 3, placeholder: "Explain the reason for this adjustment...", required: true })] }), error && (_jsx("div", { className: "p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800", children: error })), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50", disabled: loading, children: "Cancel" }), _jsx("button", { type: "submit", className: `px-4 py-2 rounded text-white ${type === "charge" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`, disabled: loading, children: loading ? "Processing..." : type === "charge" ? "Apply Charge" : "Apply Credit" })] })] })] }) }));
}
