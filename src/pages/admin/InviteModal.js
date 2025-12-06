import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { RoleSelector } from "../../components/workforce/RoleSelector";
export default function InviteModal({ onClose, onSubmit }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("employee");
    const [expires, setExpires] = useState("2030-01-01");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const submit = async () => {
        setError("");
        setLoading(true);
        try {
            await onSubmit({ email, role, expires_at: expires });
            onClose();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white p-6 rounded shadow-lg max-w-lg w-full space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Send Invite" }), _jsx("button", { onClick: onClose, children: "\u00D7" })] }), _jsx("input", { className: "border px-3 py-2 rounded w-full", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value) }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold", children: "Expires At" }), _jsx("input", { type: "date", className: "border px-3 py-2 rounded w-full", value: expires, onChange: (e) => setExpires(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold mb-1 block", children: "Role" }), _jsx(RoleSelector, { value: role, onChange: setRole })] }), error && _jsx("div", { className: "text-red-600 text-sm", children: error }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { className: "px-4 py-2 border rounded", onClick: onClose, disabled: loading, children: "Cancel" }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: submit, disabled: loading, children: "Send Invite" })] })] }) }));
}
