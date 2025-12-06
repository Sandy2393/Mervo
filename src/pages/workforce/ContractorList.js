import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Contractor List
 * Display company contractors with search and filtering
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
export default function ContractorList() {
    const { activeCompanyId } = useAuth();
    const [contractors, setContractors] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        if (!activeCompanyId)
            return;
        const load = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('company_users')
                    .select('*, user:users(*)')
                    .eq('company_id', activeCompanyId)
                    .eq('role', 'contractor');
                if (error) {
                    console.error('Failed to load contractors:', error);
                    return;
                }
                const list = (data || []).map((cu) => ({
                    ...cu,
                    full_name: cu.user?.full_name,
                    phone: cu.user?.phone
                }));
                setContractors(list);
                setFiltered(list);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [activeCompanyId]);
    useEffect(() => {
        const q = searchQuery.toLowerCase();
        setFiltered(contractors.filter(c => c.full_name?.toLowerCase().includes(q) || c.company_alias?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)));
    }, [searchQuery, contractors]);
    if (loading)
        return _jsx("div", { className: "text-gray-500", children: "Loading contractors..." });
    return (_jsx(Card, { children: _jsxs(CardBody, { className: "space-y-4", children: [_jsx(Input, { type: "text", placeholder: "Search by name, alias, or phone...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }), filtered.length === 0 ? (_jsx("div", { className: "text-gray-500 py-8 text-center", children: "No contractors found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-100 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Name" }), _jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Alias" }), _jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Phone" }), _jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Status" })] }) }), _jsx("tbody", { children: filtered.map(c => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2", children: c.full_name || '—' }), _jsx("td", { className: "px-4 py-2 text-blue-600", children: c.company_alias }), _jsx("td", { className: "px-4 py-2", children: c.phone || '—' }), _jsx("td", { className: "px-4 py-2", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: c.status === 'active' ? 'Active' : 'Inactive' }) })] }, c.id))) })] }) }))] }) }));
}
