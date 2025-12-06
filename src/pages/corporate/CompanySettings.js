import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { usersService } from '../../services/usersService';
export default function CompanySettings() {
    const { activeCompanyId, companies } = useAuth();
    const [companyId, setCompanyId] = useState(activeCompanyId || null);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [companyTag, setCompanyTag] = useState('');
    const [status, setStatus] = useState('active');
    const [message, setMessage] = useState(null);
    const [owners, setOwners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const loadOwners = async (cid) => {
        const res = await companyService.getCompanyOwners(cid);
        if (res.success && res.data)
            setOwners(res.data);
    };
    useEffect(() => {
        let mounted = true;
        const runSearch = async () => {
            if (!companyId)
                return;
            if (!searchTerm || searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            const res = await usersService.searchUsersByAlias(companyId, searchTerm);
            if (!mounted)
                return;
            if (res.success && res.data)
                setSearchResults(res.data);
            else
                setSearchResults([]);
            setSearching(false);
        };
        const t = setTimeout(runSearch, 250);
        return () => {
            mounted = false;
            clearTimeout(t);
        };
    }, [searchTerm, companyId]);
    useEffect(() => {
        if (!companyId && companies && companies.length > 0) {
            setCompanyId(companies[0].id);
        }
    }, [companyId, companies]);
    useEffect(() => {
        const load = async () => {
            if (!companyId)
                return;
            setLoading(true);
            const res = await companyService.getCompanyById(companyId);
            setLoading(false);
            if (res.success && res.data) {
                setName(res.data.name || '');
                setCompanyTag(res.data.company_tag || '');
                setStatus(res.data.status || 'active');
                // load owners
                await loadOwners(companyId);
            }
            else {
                setMessage(res.error || 'Failed to load company');
            }
        };
        load();
    }, [companyId]);
    const onSave = async () => {
        if (!companyId)
            return setMessage('No active company selected');
        setLoading(true);
        setMessage(null);
        const updates = { name };
        // company_tag is usually immutable; only allow if changed and short
        if (companyTag && companyTag.length >= 2)
            updates.company_tag = companyTag.toLowerCase();
        const res = await companyService.updateCompany(companyId, updates);
        setLoading(false);
        if (res.success) {
            setMessage('Saved successfully');
        }
        else {
            setMessage(res.error || 'Save failed');
        }
    };
    const onAddOwner = async (userId) => {
        if (!companyId)
            return setMessage('No active company');
        setLoading(true);
        const res = await companyService.addCompanyOwner(companyId, userId);
        setLoading(false);
        if (res.success && res.data) {
            setSearchTerm('');
            setSearchResults([]);
            await loadOwners(companyId);
            setMessage('Owner added');
        }
        else {
            setMessage(res.error || 'Failed to add owner');
        }
    };
    const onRemoveOwner = async (ownerId) => {
        if (!companyId)
            return setMessage('No active company');
        setLoading(true);
        const res = await companyService.removeCompanyOwner(ownerId);
        setLoading(false);
        if (res.success) {
            await loadOwners(companyId);
            setMessage('Owner removed');
        }
        else {
            setMessage(res.error || 'Failed to remove owner');
        }
    };
    if (!companyId) {
        return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Company Settings" }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "No active company. Switch to a company to edit settings." })] }));
    }
    return (_jsxs("div", { className: "p-6 max-w-3xl", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Company Settings" }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { children: _jsx(Input, { label: "Company Name", value: name, onChange: e => setName(e.target.value) }) }), _jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-lg font-medium", children: "Owners" }), _jsxs("div", { className: "mt-3 space-y-2", children: [owners.length === 0 && _jsx("p", { className: "text-sm text-gray-500", children: "No owners found." }), owners.map(o => (_jsxs("div", { className: "flex items-center justify-between bg-white p-3 rounded border", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: o.user_id }), _jsx("div", { className: "text-xs text-gray-500", children: o.is_primary ? 'Primary' : 'Owner' })] }), _jsx("div", { children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onRemoveOwner(o.id), children: "Remove" }) })] }, o.id)))] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Add Owner by Alias" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Search by alias (min 2 chars)", value: searchTerm, onChange: e => setSearchTerm(e.target.value) }), _jsx(Button, { onClick: () => { if (searchResults[0])
                                                    onAddOwner(searchResults[0].user_id); }, isLoading: loading || searching, children: "Add" })] }), searching && _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Searching..." }), searchResults.length > 0 && (_jsx("div", { className: "mt-2 space-y-2", children: searchResults.map(u => (_jsxs("div", { className: "flex items-center justify-between bg-white p-2 rounded border", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: u.company_alias || u.user_id }), _jsx("div", { className: "text-xs text-gray-500", children: u.user_id })] }), _jsx("div", { children: _jsx(Button, { size: "sm", variant: "primary", onClick: () => onAddOwner(u.user_id), disabled: loading, children: "Add" }) })] }, u.id))) }))] })] }), _jsx("div", { children: _jsx(Input, { label: "Company Tag", value: companyTag, onChange: e => setCompanyTag(e.target.value), helperText: "Short lowercase tag used in URLs. Changing this may affect links." }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { className: "w-full px-3 py-2 border rounded-lg", value: status, onChange: e => setStatus(e.target.value), children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "suspended", children: "Suspended" }), _jsx("option", { value: "pending", children: "Pending" })] })] }), message && (_jsx("div", { className: "text-sm text-gray-700", children: message })), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Button, { variant: "primary", onClick: onSave, isLoading: loading, children: "Save" }), _jsx(Button, { variant: "ghost", onClick: () => {
                                    // reload
                                    setCompanyId(prev => prev ? prev + '' : prev);
                                }, children: "Reload" }), _jsx(Button, { variant: "danger", onClick: async () => {
                                    if (!companyId)
                                        return setMessage('No active company');
                                    if (!confirm('Suspend this company? This action will disable access.'))
                                        return;
                                    setLoading(true);
                                    const res = await companyService.suspendCompany(companyId);
                                    setLoading(false);
                                    if (res.success) {
                                        setStatus('suspended');
                                        setMessage('Company suspended');
                                    }
                                    else {
                                        setMessage(res.error || 'Failed to suspend company');
                                    }
                                }, children: "Suspend Company" })] })] })] }));
}
