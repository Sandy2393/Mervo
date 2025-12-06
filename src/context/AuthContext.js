import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Auth Context — Multi-tenant user state management
 * Handles login, company switching, role-based routing
 */
import { createContext, useCallback, useEffect, useState, useContext } from 'react';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { setActiveCompany as persistActiveCompany, getActiveCompany } from '../services/auth/companySwitch';
import { loginWithMasterId } from '../services/auth/login';
export const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [companyUser, setCompanyUser] = useState(null);
    const [rolesForActiveCompany, setRolesForActiveCompany] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [activeCompanyId, setActiveCompanyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                        const roles = companiesResult.data.filter((c) => c.company_id === activeId).map((c) => c.role);
                        setRolesForActiveCompany(roles);
                        // Fetch full company details
                        const companyResult = await companyService.getCompanyById(first.company_id);
                        if (companyResult.success && companyResult.data) {
                            setCompanies([companyResult.data]);
                        }
                    }
                }
            }
            catch (err) {
                console.error('Session check error:', err);
            }
            finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);
    const login = useCallback(async (master_alias, password) => {
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
            const { user: authUser, companyUsers } = result.data;
            setUser(authUser);
            if (companyUsers && companyUsers.length > 0) {
                const first = companyUsers[0];
                setCompanyUser(first);
                setActiveCompanyId(first.company_id);
                const roles = companyUsers.filter((c) => c.company_id === first.company_id).map((c) => c.role);
                setRolesForActiveCompany(roles);
                // Fetch company details
                const companyResult = await companyService.getCompanyById(first.company_id);
                if (companyResult.success && companyResult.data) {
                    setCompanies([companyResult.data]);
                }
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        }
        finally {
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
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Logout failed';
            setError(message);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const switchCompany = useCallback((companyId) => {
        const company = companies.find(c => c.id === companyId);
        if (company) {
            setActiveCompanyId(companyId);
            persistActiveCompany(companyId);
            // derive roles for this company from companyUsers
            // attempt to fetch companyUsers for user
            (async () => {
                try {
                    const cu = await authService.getUserCompanies(user.id);
                    if (cu.success && cu.data) {
                        const roles = cu.data.filter((r) => r.company_id === companyId).map((r) => r.role);
                        setRolesForActiveCompany(roles);
                    }
                }
                catch (e) {
                    // ignore
                }
            })();
        }
    }, [companies]);
    const value = {
        user,
        companyUser,
        companies,
        activeCompanyId,
        rolesForActiveCompany,
        loading,
        error,
        login,
        logout,
        switchCompany
    };
    return (_jsx(AuthContext.Provider, { value: value, children: children }));
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
