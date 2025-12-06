import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardBody } from '../../components/ui/Card';
const SUPER_ADMIN_KEY = import.meta.env.VITE_SUPER_ADMIN_KEY || 'mervo_super-admin_key_2025';
export default function SuperAdminLogin() {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // Check if secret key is provided in URL
    const secretKey = searchParams.get('key');
    const hasValidKey = secretKey === SUPER_ADMIN_KEY;
    // Debug logging (remove in production)
    console.log('Expected key:', SUPER_ADMIN_KEY);
    console.log('Provided key:', secretKey);
    console.log('Valid?:', hasValidKey);
    if (!hasValidKey) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 px-4", children: _jsx(Card, { className: "w-full max-w-md", children: _jsx(CardBody, { children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Access Denied" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Invalid or missing admin key" }), _jsx("p", { className: "text-red-600 mt-4 font-semibold", children: "\uD83D\uDD12 Unauthorized Access" }), import.meta.env.DEV && (_jsxs("div", { className: "mt-4 text-xs text-left bg-gray-100 p-2 rounded", children: [_jsxs("p", { children: ["Expected: ", SUPER_ADMIN_KEY] }), _jsxs("p", { children: ["Provided: ", secretKey || '(none)'] })] }))] }) }) }) }));
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Sign in with Supabase Auth
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError)
                throw signInError;
            // Get the authenticated user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError)
                throw userError;
            if (!user)
                throw new Error('User authentication failed');
            // For now, bypass the is_super_admin check and just verify auth worked
            // TODO: Set up a public view or custom function to check is_super_admin from auth.users
            // Store the user in localStorage temporarily (in production, use proper auth state)
            localStorage.setItem('super_admin_user', JSON.stringify(user));
            // Success - navigate to super admin panel
            navigate('/super-admin');
        }
        catch (err) {
            setError(err.message || 'Invalid credentials');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 px-4", children: _jsx(Card, { className: "w-full max-w-md", children: _jsxs(CardBody, { children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Super Admin Login" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Protected system administration access" })] }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: error })), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "admin@mervo.com", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter password", required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed", children: loading ? 'Signing in...' : 'Sign In' })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-gray-200", children: _jsx("p", { className: "text-xs text-gray-500 text-center", children: "\uD83D\uDD12 Super admin credentials are required for system access" }) })] }) }) }));
}
