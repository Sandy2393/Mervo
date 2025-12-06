import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { superAdminFetch } from '../lib/session/companyContext';
export function RequireSuperAdmin({ children }) {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await superAdminFetch('/api/auth/me');
                if (!res.ok)
                    throw new Error('auth failed');
                const data = await res.json();
                if (mounted)
                    setAllowed(Boolean(data?.is_super_admin));
            }
            catch (err) {
                if (mounted)
                    setAllowed(false);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);
    if (loading)
        return _jsx("div", { className: "p-6", children: "Checking access..." });
    if (!allowed)
        return _jsx(Navigate, { to: "/super-admin/login", replace: true });
    return _jsx(_Fragment, { children: children });
}
