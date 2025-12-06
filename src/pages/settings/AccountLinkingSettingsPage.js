import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { accountLinkService } from '../../services/accountLinkService';
// companyService import not needed here yet
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
export default function AccountLinkingSettingsPage() {
    const { user } = useAuth();
    const [linked, setLinked] = useState([]);
    const [newAccountId, setNewAccountId] = useState('');
    const [message, setMessage] = useState(null);
    useEffect(() => {
        const load = async () => {
            if (!user)
                return;
            const res = await accountLinkService.listLinkedAccounts(user.id);
            if (res.success && res.data)
                setLinked(res.data);
        };
        load();
    }, [user]);
    const onAdd = async () => {
        if (!user)
            return;
        setMessage(null);
        const res = await accountLinkService.linkAccounts(user.id, newAccountId);
        if (res.success) {
            setMessage('Linked');
            const updated = await accountLinkService.listLinkedAccounts(user.id);
            if (updated.success && updated.data)
                setLinked(updated.data);
            setNewAccountId('');
        }
        else {
            setMessage(res.error || 'Failed');
        }
    };
    const onUnlink = async (id) => {
        const res = await accountLinkService.unlinkAccount(id);
        if (res.success) {
            setLinked(linked.filter(l => l.id !== id));
        }
        else {
            setMessage(res.error || 'Failed to unlink');
        }
    };
    return (_jsxs("div", { className: "p-6 max-w-3xl", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Account Linking" }), _jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Master account" }), _jsx("div", { className: "font-medium", children: user?.email || user?.id })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Linked Accounts" }), linked.length === 0 && _jsx("div", { className: "text-sm text-gray-500", children: "No linked accounts" }), _jsx("div", { className: "space-y-2", children: linked.map(l => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: l.linked_account_id }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(l.created_at).toLocaleString() })] }), _jsx("div", { children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onUnlink(l.id), children: "Unlink" }) })] }, l.id))) }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx(Input, { placeholder: "other-account@domain", value: newAccountId, onChange: e => setNewAccountId(e.target.value) }), _jsx(Button, { onClick: onAdd, children: "Link" })] }), message && _jsx("div", { className: "text-sm text-gray-700 mt-2", children: message })] })] }) }), _jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-lg font-medium", children: "Company Identities" }), _jsx("div", { className: "text-sm text-gray-600 mt-2", children: "TODO: list company_user aliases for this master account" })] })] }));
}
