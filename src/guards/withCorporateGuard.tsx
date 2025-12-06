import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function withCorporateGuard(Component: React.ComponentType<any>) {
  return function Wrapped(props: any) {
    const { user, loading, companies } = useAuth();

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    const roles = (companies || []).map((c: any) => c.role);
    const hasCorporate = roles.some((r: any) => r && r !== 'contractor');
    const onlyContractor = roles.length === 1 && roles[0] === 'contractor';

    if (onlyContractor || !hasCorporate) {
      return <Navigate to="/contractor/login" replace />;
    }

    return <Component {...props} />;
  };
}

export default withCorporateGuard;
