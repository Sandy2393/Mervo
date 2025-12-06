import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { authedFetch, setActiveCompanyId } from "../../lib/session/companyContext";
export default function LinkedCompanies() {
    const [linked, setLinked] = useState([]);
    const [companyIdInput, setCompanyIdInput] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [status, setStatus] = useState("");
    async function addLink(e) {
        e.preventDefault();
        if (!companyIdInput)
            return;
        setStatus("Linking...");
        try {
            // Using switch-company endpoint to seed a link in this demo
            const resp = await authedFetch("/api/switch-company", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_company_id: companyIdInput, verification_code: verificationCode }),
            });
            if (!resp.ok)
                throw new Error("Failed to link");
            setLinked((prev) => [...prev, { id: companyIdInput, name: `Company ${companyIdInput.slice(0, 4)}`, linked_at: new Date().toISOString() }]);
            setStatus("Linked");
            setActiveCompanyId(companyIdInput);
        }
        catch (err) {
            console.error(err);
            setStatus("Link failed (requires verification/2FA)");
        }
    }
    function removeLink(id) {
        if (!verificationCode) {
            setStatus("Enter verification code to remove");
            return;
        }
        setLinked((prev) => prev.filter((c) => c.id !== id));
        setStatus("Link removed (server enforcement TODO)");
    }
    return (_jsxs("div", { className: "max-w-2xl p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Linked Companies" }), _jsx("p", { className: "text-sm text-gray-600", children: "Master accounts can pivot between companies. Removal requires verification code and 2FA (placeholder)." }), _jsxs("form", { className: "space-y-2", onSubmit: addLink, children: [_jsx("input", { className: "border p-2 rounded w-full", placeholder: "Target company ID", value: companyIdInput, onChange: (e) => setCompanyIdInput(e.target.value) }), _jsx("input", { className: "border p-2 rounded w-full", placeholder: "Verification code", value: verificationCode, onChange: (e) => setVerificationCode(e.target.value) }), _jsx("button", { type: "submit", className: "bg-blue-600 text-white px-4 py-2 rounded", children: "Add link" })] }), _jsxs("div", { className: "border rounded", children: [_jsx("div", { className: "p-3 font-medium", children: "Existing links" }), linked.length === 0 && _jsx("div", { className: "p-3 text-sm text-gray-600", children: "None linked yet." }), linked.map((c) => (_jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-t", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: c.name }), _jsxs("div", { className: "text-xs text-gray-600", children: ["Linked ", new Date(c.linked_at).toLocaleString()] })] }), _jsx("button", { className: "text-red-600 text-sm", onClick: () => removeLink(c.id), children: "Remove" })] }, c.id)))] }), status && _jsx("div", { className: "text-sm text-gray-700", children: status })] }));
}
