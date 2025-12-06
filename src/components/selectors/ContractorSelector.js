import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { companyUserService } from '../../services/companyUserService';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/input';
export default function ContractorSelector({ onSelect, companyId }) {
    const { activeCompanyId } = useAuth();
    const cid = companyId || activeCompanyId;
    const [list, setList] = useState([]);
    const [query, setQuery] = useState('');
    useEffect(() => {
        if (!cid)
            return;
        (async () => {
            // fetch company_users contractors in this company via service
            try {
                const res = await companyUserService.listCompanyUsers(cid, { role: 'contractor', status: 'active' });
                if (res.success && res.data)
                    setList(res.data);
            }
            catch (e) {
                // swallow — UI shows empty list
            }
        })();
    }, [cid]);
    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return list.filter(l => (!q) || ((l.company_alias || '').toLowerCase().includes(q) || (l.display_name || '').toLowerCase().includes(q)));
    }, [list, query]);
    return (_jsxs("div", { children: [_jsx(Input, { placeholder: "Search contractors", value: query, onChange: (e) => setQuery(e.target.value) }), _jsxs("div", { className: "max-h-48 overflow-auto mt-2 border rounded p-1 bg-white", children: [filtered.map(c => (_jsxs("div", { className: "p-2 hover:bg-gray-50 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: c.company_alias }), _jsx("div", { className: "text-xs text-gray-500", children: c.display_name || 'Contractor' })] }), _jsx("button", { className: "text-sm text-blue-600", onClick: () => onSelect(c.id), children: "Select" })] }, c.id))), filtered.length === 0 && _jsx("div", { className: "text-sm text-gray-400 p-2", children: "No contractors found" })] })] }));
}
