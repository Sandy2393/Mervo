import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
export function RequireCorporate({ children }) {
    const { user, loading, activeCompanyId, rolesForActiveCompany } = useAuth();
    const loc = useLocation();
    if (loading)
        return _jsx("div", { className: "text-center py-8", children: "Loading..." });
    if (!user)
        return _jsx(Navigate, { to: "/login", state: { from: loc }, replace: true });
    // owner / admin can access without active company
    const isOwner = rolesForActiveCompany?.includes('owner');
    if (!isOwner && !activeCompanyId) {
        // redirect to select company if user has multiple companies
        return _jsx(Navigate, { to: "/select-company", replace: true });
    }
    // ensure not contractor-only
    const contractorOnly = rolesForActiveCompany && rolesForActiveCompany.length === 1 && rolesForActiveCompany[0] === 'contractor';
    if (contractorOnly) {
        return _jsx(Navigate, { to: "/contractor", replace: true });
    }
    return children;
}
export default RequireCorporate;
