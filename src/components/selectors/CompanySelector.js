import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { setActiveCompany as persistActiveCompany } from '../../services/auth/companySwitch';
import { Button } from '../ui/Button';
export default function CompanySelector({ className }) {
    const { companies, activeCompanyId, switchCompany } = useAuth();
    const [open, setOpen] = useState(false);
    const handleChoose = (companyId) => {
        persistActiveCompany(companyId);
        switchCompany(companyId);
        setOpen(false);
    };
    return (_jsxs("div", { className: className, children: [_jsx("div", { className: "inline-block", children: _jsx(Button, { onClick: () => setOpen(!open), children: companies.find(c => c.id === activeCompanyId)?.company_tag || 'Select company' }) }), open && (_jsx("div", { className: "mt-2 w-64 bg-white border rounded shadow p-2 z-50", children: companies.map(c => (_jsxs("div", { className: "p-2 hover:bg-gray-50 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: c.company_tag || c.name }), _jsx("div", { className: "text-xs text-gray-500", children: c.name })] }), _jsx(Button, { size: "sm", onClick: () => handleChoose(c.id), children: "Switch" })] }, c.id))) }))] }));
}
