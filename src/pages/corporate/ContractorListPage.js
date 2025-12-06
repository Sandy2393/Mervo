import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Contractor List Page — Manage company contractors
 * TODO: Implement contractor creation, editing, deactivation
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usersService } from '../../services/usersService';
export default function ContractorListPage() {
    const { activeCompanyId } = useAuth();
    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!activeCompanyId)
            return;
        const fetchContractors = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await usersService.listContractors(activeCompanyId);
                if (result.success) {
                    setContractors(result.data || []);
                }
                else {
                    setError(result.error || 'Failed to load contractors');
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
            finally {
                setLoading(false);
            }
        };
        fetchContractors();
    }, [activeCompanyId]);
    const filteredContractors = contractors.filter(c => c.company_alias.toLowerCase().includes(searchTerm.toLowerCase()));
    if (loading) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-600", children: "Loading contractors..." }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Contractors" }), _jsxs("p", { className: "text-gray-600 mt-2", children: [contractors.length, " active contractors"] })] }), _jsx(Button, { children: "Add Contractor" })] }), _jsx(Input, { placeholder: "Search contractors...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), _jsx(Card, { children: _jsx(CardBody, { children: filteredContractors.length === 0 ? (_jsx("p", { className: "text-gray-500 py-8", children: "No contractors found." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left py-3 px-4 font-semibold", children: "Name" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold", children: "Role" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold", children: "Status" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold", children: "Actions" })] }) }), _jsx("tbody", { children: filteredContractors.map(contractor => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "py-3 px-4 font-medium", children: contractor.company_alias }), _jsx("td", { className: "py-3 px-4 capitalize text-gray-600", children: contractor.role }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `
                          px-3 py-1 rounded-full text-sm font-medium
                          ${contractor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `, children: contractor.status }) }), _jsxs("td", { className: "py-3 px-4 space-x-2", children: [_jsx("button", { className: "text-blue-500 hover:underline text-sm", children: "Edit" }), _jsx("button", { className: "text-red-500 hover:underline text-sm", children: "Deactivate" })] })] }, contractor.id))) })] }) })) }) }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: error }))] }));
}
