import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '../context/AuthContext';
import { hasPermission, canPerform } from '../lib/permissions';
export const PermissionsAwareButton = ({ requiredPermission = 'edit', minRoleLevel = 0, companyId, children, ...props }) => {
    const { user, activeCompanyId } = useAuth();
    const cid = companyId || activeCompanyId;
    if (!cid)
        return null;
    // guard permissions
    const okPerm = hasPermission(user, cid, requiredPermission);
    const okRole = minRoleLevel ? canPerform(user, cid, minRoleLevel) : true;
    if (!okPerm || !okRole)
        return null;
    return (_jsx("button", { ...props, children: children }));
};
export default PermissionsAwareButton;
