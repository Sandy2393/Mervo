/**
 * Auth Context — Multi-tenant user state management
 * Handles login, company switching, role-based routing
 */

import { createContext, useCallback, useEffect, useState, useContext, ReactNode } from 'react';
import { AuthUser, AuthContextType, CompanyUser, Company } from '../types';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { setActiveCompany as persistActiveCompany, getActiveCompany } from '../services/auth/companySwitch';
import { loginWithMasterId } from '../services/auth/login';

const DEV_BYPASS_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS === 'true';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [rolesForActiveCompany, setRolesForActiveCompany] = useState<string[] | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const result = await authService.getCurrentUser();

        if (result.success && result.data) {
          setUser(result.data);

          // Fetch company affiliations
          const companiesResult = await authService.getUserCompanies(result.data.id);
          if (companiesResult.success && companiesResult.data && companiesResult.data.length > 0) {
            const first = companiesResult.data[0];
            setCompanyUser(first);
            // try to restore persisted active company if present
            const persisted = getActiveCompany();
            const activeId = persisted || first.company_id;
            setActiveCompanyId(activeId);

            // set roles for active company
            const roles = companiesResult.data.filter((c: any) => c.company_id === activeId).map((c: any) => c.role);
            setRolesForActiveCompany(roles);

            // Fetch full company details
            const companyResult = await companyService.getCompanyById(first.company_id);
            if (companyResult.success && companyResult.data) {
              setCompanies([companyResult.data]);
            }
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(async (master_alias: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // use the new login flow which returns primary role and company rows
      const direct = await loginWithMasterId(master_alias, password);
      if (!direct.success) {
        setError(direct.error || 'Login failed');
        throw new Error(direct.error || 'Login failed');
      }

      const result = await authService.login(master_alias, password);

      if (!result.success) {
        setError(result.error || 'Login failed');
        throw new Error(result.error);
      }

      const { user: authUser, companyUsers } = result.data!;
      setUser(authUser);

      if (companyUsers && companyUsers.length > 0) {
        const first = companyUsers[0];
        setCompanyUser(first);
        setActiveCompanyId(first.company_id);

        const roles = companyUsers.filter((c:any) => c.company_id === first.company_id).map((c:any) => c.role);
        setRolesForActiveCompany(roles);

        // Fetch company details
        const companyResult = await companyService.getCompanyById(first.company_id);
        if (companyResult.success && companyResult.data) {
          setCompanies([companyResult.data]);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setCompanyUser(null);
      setCompanies([]);
      setActiveCompanyId(null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const devBypassLogin = useCallback(async (role: 'contractor' | 'corporate') => {
    if (!DEV_BYPASS_ENABLED) {
      throw new Error('Dev bypass is disabled');
    }

    try {
      setLoading(true);
      setError(null);

      const now = new Date().toISOString();
      const roleName = role === 'corporate' ? 'admin' : 'contractor';
      const companyId = role === 'corporate' ? 'dev-corp-co' : 'dev-field-co';
      const userId = role === 'corporate' ? 'dev-corp-user' : 'dev-contractor-user';

      const devUser: AuthUser = {
        id: userId,
        email: `${role}@mervo.dev`,
        display_name: role === 'corporate' ? 'Dev Corporate' : 'Dev Contractor',
        role: roleName,
        created_at: now
      };

      const devCompany: Company = {
        id: companyId,
        name: role === 'corporate' ? 'DevCorp Demo' : 'DevField Demo',
        company_tag: role === 'corporate' ? 'DEVCO' : 'DEVFIELD',
        settings: {},
        status: 'active',
        created_at: now
      };

      const devCompanyUser: CompanyUser = {
        id: `${companyId}-cu`,
        company_id: companyId,
        user_id: userId,
        company_alias: devCompany.company_tag.toLowerCase(),
        role: roleName,
        role_level: role === 'corporate' ? 5 : 1,
        permissions: {},
        status: 'active',
        created_at: now
      };

      setUser(devUser);
      setCompanyUser(devCompanyUser);
      setCompanies([devCompany]);
      setActiveCompanyId(companyId);
      setRolesForActiveCompany([roleName]);
      persistActiveCompany(companyId);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchCompany = useCallback((companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setActiveCompanyId(companyId);
      persistActiveCompany(companyId);
      // derive roles for this company from companyUsers
      // attempt to fetch companyUsers for user
      (async () => {
        try {
          const cu = await authService.getUserCompanies(user!.id);
          if (cu.success && cu.data) {
            const roles = cu.data.filter((r:any) => r.company_id === companyId).map((r:any) => r.role);
            setRolesForActiveCompany(roles);
          }
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [companies, user]);

  const value: AuthContextType = {
    user,
    companyUser,
    companies,
    activeCompanyId,
    rolesForActiveCompany,
    loading,
    error,
    login,
    devBypassLogin: DEV_BYPASS_ENABLED ? devBypassLogin : undefined,
    logout,
    switchCompany
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
