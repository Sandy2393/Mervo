import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
export function withContractorGuard(Component) {
    return function Wrapped(props) {
        const { user, loading, companies } = useAuth();
        if (loading)
            return _jsx("div", { className: "text-center py-8", children: "Loading..." });
        if (!user)
            return _jsx(Navigate, { to: "/contractor/login", replace: true });
        const roles = (companies || []).map((c) => c.role);
        const onlyContractor = roles.length === 1 && roles[0] === 'contractor';
        if (!onlyContractor) {
            return _jsx(Navigate, { to: "/login", replace: true });
        }
        return _jsx(Component, { ...props });
    };
}
export default withContractorGuard;
