import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { superAdminFetch } from '../lib/session/companyContext';

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try localStorage first for immediate access after login
        let isSuperAdmin = false;
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('super_admin_user');
          if (raw) {
            try {
              const user = JSON.parse(raw);
              // Check role fields robustly
              const role = (user.role || user.global_role || '').toLowerCase().trim();
              if (role === 'superadmin' || user.is_super_admin === true) {
                isSuperAdmin = true;
              }
            } catch {}
          }
        }
        // If not found, fallback to API
        if (!isSuperAdmin) {
          const res = await superAdminFetch('/api/auth/me');
          if (!res.ok) throw new Error('auth failed');
          const data = await res.json();
          const role = (data.role || data.global_role || '').toLowerCase().trim();
          isSuperAdmin = role === 'superadmin' || data.is_super_admin === true;
        }
        if (mounted) setAllowed(isSuperAdmin);
      } catch (err) {
        if (mounted) setAllowed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Checking access...</div>;
  if (!allowed) return <Navigate to="/super-admin/login" replace />;
  return <>{children}</>;
}
