import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { RecurringSchedulerEditor } from "../../components/jobs/RecurringSchedulerEditor";
export default function JobEdit() {
    const jobId = "job_placeholder"; // replace with router param
    const [form, setForm] = useState(null);
    const [message, setMessage] = useState("");
    useEffect(() => {
        fetch(`/api/jobs/${jobId}`)
            .then((r) => r.json())
            .then(setForm);
    }, [jobId]);
    if (!form)
        return _jsx("div", { className: "p-6", children: "Loading..." });
    const submit = async () => {
        const res = await fetch(`/api/jobs/${jobId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setMessage(res.ok ? "Saved" : "Failed");
    };
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Edit Job" }), _jsx("input", { className: "border px-3 py-2 rounded w-full", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }), _jsx("textarea", { className: "border px-3 py-2 rounded w-full", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: form.is_recurring, onChange: (e) => setForm({ ...form, is_recurring: e.target.checked }) }), _jsx("span", { children: "Recurring" })] }), form.is_recurring && (_jsx(RecurringSchedulerEditor, { value: form.recurrence, onChange: (v) => setForm({ ...form, recurrence: v }) })), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: submit, children: "Save" }), message && _jsx("div", { children: message })] }));
}
