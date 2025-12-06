import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { RecurringSchedulerEditor } from "../../components/jobs/RecurringSchedulerEditor";
export default function JobCreate() {
    const [form, setForm] = useState({ name: "", description: "", payment_cents: 0, is_recurring: false, recurrence: {} });
    const [message, setMessage] = useState("");
    const submit = async () => {
        const res = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setMessage(res.ok ? "Created" : "Failed");
    };
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Create Job" }), _jsx("input", { className: "border px-3 py-2 rounded w-full", placeholder: "Job name", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }), _jsx("textarea", { className: "border px-3 py-2 rounded w-full", placeholder: "Description", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: form.is_recurring, onChange: (e) => setForm({ ...form, is_recurring: e.target.checked }) }), _jsx("span", { children: "Recurring" })] }), form.is_recurring && (_jsx(RecurringSchedulerEditor, { value: form.recurrence, onChange: (v) => setForm({ ...form, recurrence: v }) })), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold", children: "Payment (cents)" }), _jsx("input", { type: "number", className: "border px-3 py-2 rounded w-full", value: form.payment_cents, onChange: (e) => setForm({ ...form, payment_cents: Number(e.target.value) }) })] }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: submit, children: "Create" }), message && _jsx("div", { children: message })] }));
}
