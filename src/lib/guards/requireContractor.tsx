import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireContractor({ children }: { children: JSX.Element }) {
  const { user, loading, rolesForActiveCompany } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;

  // If user has any corporate roles, they should not use contractor flows
  const hasCorporate = rolesForActiveCompany && rolesForActiveCompany.some(r => r && r !== 'contractor');
  if (hasCorporate) return <Navigate to="/corporate" replace />;

  // Ensure contractor accounts are allowed to proceed
  return children;
}

export default RequireContractor;
