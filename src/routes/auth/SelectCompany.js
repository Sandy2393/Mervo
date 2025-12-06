import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setActiveCompany } from '../../services/auth/companySwitch';
import { authService } from '../../services/authService';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
export default function SelectCompany() {
    const { companies, user, switchCompany } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [affiliations, setAffiliations] = useState([]);
    useEffect(() => {
        if (!user)
            navigate('/login');
        // load company_user affiliations so we can present company_alias + role
        (async () => {
            if (!user)
                return;
            const result = await authService.getUserCompanies(user.id);
            if (result.success && result.data)
                setAffiliations(result.data.map((r) => ({ company_id: r.company_id, company_alias: r.company_alias, role: r.role })));
        })();
    }, [user]);
    const choose = async (companyId) => {
        setLoading(true);
        try {
            setActiveCompany(companyId);
            switchCompany(companyId);
            navigate('/corporate');
        }
        finally {
            setLoading(false);
        }
    };
    if ((!companies || companies.length === 0) && affiliations.length === 0) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4", children: _jsx(Card, { children: _jsx(CardBody, { children: _jsx("p", { children: "No companies associated with this account." }) }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gray-50", children: _jsx(Card, { className: "max-w-2xl w-full", children: _jsxs(CardBody, { children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Select a company" }), _jsx("div", { className: "space-y-3", children: affiliations.map((c) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: c.company_alias || c.company_id }), _jsx("div", { className: "text-sm text-gray-500", children: c.role })] }), _jsx(Button, { onClick: () => choose(c.company_id), isLoading: loading, children: "Enter" })] }, c.company_id))) })] }) }) }));
}
