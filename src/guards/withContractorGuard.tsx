import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function withContractorGuard(Component: React.ComponentType<any>) {
  return function Wrapped(props: any) {
    const { user, loading, companies } = useAuth();

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (!user) return <Navigate to="/contractor/login" replace />;

    const roles = (companies || []).map((c: any) => c.role);
    const onlyContractor = roles.length === 1 && roles[0] === 'contractor';

    if (!onlyContractor) {
      return <Navigate to="/login" replace />;
    }

    return <Component {...props} />;
  };
}

export default withContractorGuard;
