import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UsernameField from '../components/form/UsernameField';
import PasswordField from '../components/form/PasswordField';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { authService } from '../services/authService';
export default function CorporateLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!username || !password)
            return setError('Please fill in both fields');
        try {
            setLoading(true);
            await login(username, password);
            // After login, fetch current user id and company affiliations directly
            const me = await authService.getCurrentUser();
            if (!me.success || !me.data) {
                setError('Failed to determine user after login');
                await authService.logout();
                return;
            }
            const companies = await authService.getUserCompanies(me.data.id);
            const roles = (companies.data || []).map((c) => c.role);
            const nonContractor = roles.some((r) => r && r !== 'contractor');
            const onlyContractor = roles.length === 1 && roles[0] === 'contractor';
            if (onlyContractor) {
                setError('This account is contractor-only. Use the contractor login.');
                await authService.logout();
                return;
            }
            if (!nonContractor) {
                setError('No corporate roles found for this account');
                await authService.logout();
                return;
            }
            navigate('/select-company');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-4", children: _jsx(Card, { className: "max-w-md w-full", children: _jsxs(CardBody, { children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Corporate Login" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(UsernameField, { value: username, onChange: (e) => setUsername(e.target.value) }), _jsx(PasswordField, { value: password, onChange: (e) => setPassword(e.target.value) }), error && _jsx("div", { className: "text-red-600 text-sm", children: error }), _jsx(Button, { type: "submit", isLoading: loading, className: "w-full", children: "Sign In" })] })] }) }) }));
}
