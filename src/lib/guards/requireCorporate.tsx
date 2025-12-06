import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireCorporate({ children }: { children: JSX.Element }) {
  const { user, loading, activeCompanyId, rolesForActiveCompany } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;

  // owner / admin can access without active company
  const isOwner = rolesForActiveCompany?.includes('owner');
  if (!isOwner && !activeCompanyId) {
    // redirect to select company if user has multiple companies
    return <Navigate to="/select-company" replace />;
  }

  // ensure not contractor-only
  const contractorOnly = rolesForActiveCompany && rolesForActiveCompany.length === 1 && rolesForActiveCompany[0] === 'contractor';
  if (contractorOnly) {
    return <Navigate to="/contractor" replace />;
  }

  return children;
}

export default RequireCorporate;
