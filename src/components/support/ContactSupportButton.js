import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export const ContactSupportButton = () => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ subject: "", message: "", urgency: "medium", attachment: null });
    const [ticketId, setTicketId] = useState(null);
    const submit = async () => {
        const body = new FormData();
        body.append("subject", form.subject);
        body.append("message", form.message);
        body.append("urgency", form.urgency);
        if (form.attachment)
            body.append("attachment", form.attachment);
        const res = await fetch("/api/support/create-ticket", { method: "POST", body });
        const json = await res.json();
        setTicketId(json.ticketId);
        setOpen(false);
    };
    return (_jsxs("div", { children: [_jsx("button", { onClick: () => setOpen(true), children: "Contact Support" }), open && (_jsxs("div", { role: "dialog", "aria-modal": "true", style: { border: "1px solid #ccc", padding: 12, marginTop: 8 }, children: [_jsx("h3", { children: "Contact Support" }), _jsxs("label", { children: ["Subject", _jsx("input", { value: form.subject, onChange: (e) => setForm({ ...form, subject: e.target.value }) })] }), _jsxs("label", { children: ["Message", _jsx("textarea", { value: form.message, onChange: (e) => setForm({ ...form, message: e.target.value }) })] }), _jsxs("label", { children: ["Urgency", _jsxs("select", { value: form.urgency, onChange: (e) => setForm({ ...form, urgency: e.target.value }), children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsxs("label", { children: ["Attachment", _jsx("input", { type: "file", onChange: (e) => setForm({ ...form, attachment: e.target.files?.[0] || null }) })] }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsx("button", { onClick: submit, children: "Submit" }), _jsx("button", { onClick: () => setOpen(false), style: { marginLeft: 8 }, children: "Cancel" })] })] })), ticketId && _jsxs("div", { children: ["Ticket created: ", ticketId] })] }));
};
