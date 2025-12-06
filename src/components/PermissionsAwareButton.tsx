import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission, canPerform } from '../lib/permissions';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  requiredPermission?: 'none' | 'view' | 'edit';
  minRoleLevel?: number;
  companyId?: string;
}

export const PermissionsAwareButton: React.FC<Props> = ({ requiredPermission = 'edit', minRoleLevel = 0, companyId, children, ...props }) => {
  const { user, activeCompanyId } = useAuth();
  const cid = companyId || activeCompanyId;
  if (!cid) return null;

  // guard permissions
  const okPerm = hasPermission(user as any, cid, requiredPermission);
  const okRole = minRoleLevel ? canPerform(user as any, cid, minRoleLevel) : true;

  if (!okPerm || !okRole) return null;

  return (
    <button {...props}>
      {children}
    </button>
  );
};

export default PermissionsAwareButton;
