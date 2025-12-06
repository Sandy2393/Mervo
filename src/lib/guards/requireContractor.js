import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
export function RequireContractor({ children }) {
    const { user, loading, rolesForActiveCompany } = useAuth();
    const loc = useLocation();
    if (loading)
        return _jsx("div", { className: "text-center py-8", children: "Loading..." });
    if (!user)
        return _jsx(Navigate, { to: "/login", state: { from: loc }, replace: true });
    // If user has any corporate roles, they should not use contractor flows
    const hasCorporate = rolesForActiveCompany && rolesForActiveCompany.some(r => r && r !== 'contractor');
    if (hasCorporate)
        return _jsx(Navigate, { to: "/corporate", replace: true });
    // Ensure contractor accounts are allowed to proceed
    return children;
}
export default RequireContractor;
