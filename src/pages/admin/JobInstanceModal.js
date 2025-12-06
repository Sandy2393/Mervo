import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function JobInstanceModal({ job, onClose }) {
    const [pay, setPay] = useState(job.payment_cents || 0);
    const [assignee, setAssignee] = useState("");
    const assign = async () => {
        // TODO: call assign endpoint
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white p-6 rounded shadow max-w-lg w-full space-y-3", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Assign Job Instance" }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold", children: "Pay (cents)" }), _jsx("input", { className: "border px-3 py-2 rounded w-full", type: "number", value: pay, onChange: (e) => setPay(Number(e.target.value)) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold", children: "Assign to" }), _jsx("input", { className: "border px-3 py-2 rounded w-full", value: assignee, onChange: (e) => setAssignee(e.target.value) })] }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx("button", { className: "px-4 py-2 border rounded", onClick: onClose, children: "Cancel" }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: assign, children: "Assign" })] })] }) }));
}
