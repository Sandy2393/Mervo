import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
export default function CompanySelectorPage() {
    const navigate = useNavigate();
    const { companies, switchCompany, activeCompanyId } = useAuth();
    const [selected, setSelected] = useState(activeCompanyId || null);
    useEffect(() => {
        if (!selected && companies && companies.length === 1) {
            setSelected(companies[0].id);
        }
    }, [companies, selected]);
    const handleEnter = () => {
        if (!selected)
            return;
        switchCompany(selected);
        navigate('/dashboard');
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center px-4", children: _jsx(Card, { className: "max-w-xl w-full", children: _jsxs(CardBody, { children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Select Company" }), _jsx("div", { className: "space-y-3", children: companies.map(c => (_jsxs("div", { className: `p-3 border rounded ${selected === c.id ? 'ring-2 ring-orange-300' : ''}`, onClick: () => setSelected(c.id), children: [_jsx("div", { className: "font-medium", children: c.name }), _jsx("div", { className: "text-sm text-gray-500", children: c.company_tag })] }, c.id))) }), _jsxs("div", { className: "mt-4 flex gap-2 justify-end", children: [_jsx(Button, { variant: "ghost", onClick: () => navigate('/login'), children: "Back" }), _jsx(Button, { onClick: handleEnter, children: "Enter" })] })] }) }) }));
}
