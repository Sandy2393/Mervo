import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { authedFetch, getActiveCompanyId, setActiveCompanyId } from "../../lib/session/companyContext";
export function CompanySwitcher({ companies: initialCompanies = [] }) {
    const [companies, setCompanies] = useState(initialCompanies);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState("");
    const activeCompanyId = getActiveCompanyId();
    useEffect(() => {
        // Placeholder: fetch linked companies if API exists; otherwise use provided list
        async function load() {
            if (initialCompanies.length)
                return;
            // In a real app call /api/linked-companies for master user
            setCompanies([
                { id: activeCompanyId || "demo", name: "Demo Company", tag: "Primary" },
            ]);
        }
        load();
    }, [activeCompanyId, initialCompanies.length]);
    async function handleSwitch(companyId) {
        setStatus("Switching...");
        try {
            setActiveCompanyId(companyId);
            await authedFetch("/api/switch-company", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_company_id: companyId }),
            });
            setStatus("Switched");
            setOpen(false);
        }
        catch (err) {
            console.error(err);
            setStatus("Failed to switch");
        }
    }
    return (_jsxs("div", { className: "relative inline-block", children: [_jsxs("button", { className: "border px-3 py-2 rounded flex items-center space-x-2", onClick: () => setOpen((o) => !o), children: [_jsx("span", { children: companies.find((c) => c.id === activeCompanyId)?.name || "Select company" }), _jsx("span", { className: "text-xs text-gray-600", children: "\u25BC" })] }), open && (_jsxs("div", { className: "absolute mt-2 bg-white border rounded shadow-md w-64 z-10", children: [_jsx("div", { className: "p-2 text-xs text-gray-600", children: "Linked companies" }), _jsx("ul", { children: companies.map((c) => (_jsxs("li", { className: "flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [c.logoUrl ? _jsx("img", { src: c.logoUrl, alt: c.name, className: "w-6 h-6 rounded" }) : _jsx("div", { className: "w-6 h-6 bg-gray-200 rounded" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm", children: c.name }), c.tag && _jsx("div", { className: "text-xs text-gray-500", children: c.tag })] })] }), _jsx("button", { className: "text-blue-600 text-sm", onClick: (e) => {
                                        e.stopPropagation();
                                        handleSwitch(c.id);
                                    }, children: "Switch" })] }, c.id))) }), _jsx("div", { className: "border-t p-2 text-sm", children: _jsx("a", { href: "/profile/linked-companies", className: "text-blue-600", children: "Manage links" }) }), status && _jsx("div", { className: "p-2 text-xs text-gray-600", children: status })] }))] }));
}
export default CompanySwitcher;
