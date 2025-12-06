/**
 * Auth Service — Handles login, logout, and session management
 * Uses master_alias (normalized) for username-based login
 * Stores user in Supabase Auth, company_user in our DB
 */
import { supabase } from '../lib/supabase';
import { normalizeUsername as normalizeUsernameUtil } from './auth-utils';
function normalizeUsername(input) {
    return normalizeUsernameUtil(input);
}
class AuthService {
    /**
     * Login using master_alias (normalized username)
     * TODO: This should eventually call an Edge Function that:
     * 1. Validates master_alias against users table
     * 2. Issues JWT token
     * 3. Returns company affiliations
     *
     * For now, assumes Supabase Auth email = master_alias
     */
    async login(master_alias, password) {
        try {
            const normalized = normalizeUsername(master_alias);
            // Sign in using email (assuming master_alias is stored as email in Supabase Auth)
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: normalized,
                password
            });
            if (authError || !authData.user) {
                return {
                    success: false,
                    error: authError?.message || 'Login failed',
                    code: 'AUTH_ERROR'
                };
            }
            const user = {
                id: authData.user.id,
                email: authData.user.email,
                display_name: authData.user.user_metadata?.display_name,
                avatar_url: authData.user.user_metadata?.avatar_url,
                created_at: authData.user.created_at || new Date().toISOString()
            };
            // Fetch company_users to get company affiliations
            const { data: companyUsers, error: companyError } = await supabase
                .from('company_users')
                .select('*')
                .eq('user_id', user.id);
            // Normalize company_user entries (lowercase aliases)
            if (companyUsers && Array.isArray(companyUsers)) {
                companyUsers.forEach((cu) => {
                    if (cu.company_alias)
                        cu.company_alias = cu.company_alias.toLowerCase();
                });
            }
            if (companyError) {
                console.error('Failed to fetch company_users:', companyError);
            }
            return {
                success: true,
                data: {
                    user,
                    companyUsers: companyUsers || []
                }
            };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Sign out current user
     */
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'LOGOUT_ERROR'
                };
            }
            return { success: true, data: null };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Create a master account on signup
     * Normalizes account_id and stores in users table
     */
    async createMasterAccount(accountId, password, metadata) {
        try {
            const normalized = normalizeUsername(accountId);
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: normalized,
                password,
                options: { data: metadata || {} }
            });
            if (authError || !authData.user) {
                return { success: false, error: authError?.message || 'Signup failed', code: 'AUTH_ERROR' };
            }
            const authUser = {
                id: authData.user.id,
                email: authData.user.email,
                display_name: metadata?.display_name,
                avatar_url: metadata?.avatar_url,
                created_at: authData.user.created_at || new Date().toISOString()
            };
            return { success: true, data: authUser };
        }
        catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'UNKNOWN' };
        }
    }
    /**
     * Get current authenticated user from Supabase session
     * If user is merged, follow the merged_to chain to primary account
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                return { success: true, data: null };
            }
            // Check if this user is merged; if so, follow the link to primary
            let userId = user.id;
            const { data: userRecord } = await supabase
                .from('users')
                .select('id, merged_to')
                .eq('id', user.id)
                .single();
            if (userRecord?.merged_to) {
                userId = userRecord.merged_to;
            }
            const authUser = {
                id: userId,
                email: user.email,
                display_name: user.user_metadata?.display_name,
                avatar_url: user.user_metadata?.avatar_url,
                created_at: user.created_at || new Date().toISOString()
            };
            return { success: true, data: authUser };
        }
        catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'UNKNOWN' };
        }
    }
    /**
     * Get user's company affiliations
     * Filtered by user_id via RLS
     */
    async getUserCompanies(userId) {
        try {
            const { data, error } = await supabase
                .from('company_users')
                .select('*')
                .eq('user_id', userId);
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'FETCH_ERROR'
                };
            }
            return { success: true, data: data || [] };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Check if user is super_admin
     * TODO: Implement via is_superadmin() Postgres function call
     */
    async isSuperAdmin(userId) {
        try {
            // Call RPC to is_superadmin function
            const { data, error } = await supabase
                .rpc('is_superadmin', { uid: userId })
                .single();
            if (error) {
                console.error('Failed to check super admin status:', error);
                return false;
            }
            return data === true;
        }
        catch (err) {
            console.error('Error checking super admin:', err);
            return false;
        }
    }
    /**
     * Verify multi-tenant context
     * Ensures user belongs to requested company
     */
    async verifyCompanyAccess(userId, companyId) {
        try {
            const { data, error } = await supabase
                .from('company_users')
                .select('*')
                .eq('user_id', userId)
                .eq('company_id', companyId)
                .single();
            if (error && error.code !== 'PGRST116') {
                return {
                    success: false,
                    error: error.message,
                    code: 'VERIFICATION_ERROR'
                };
            }
            if (!data) {
                return {
                    success: false,
                    error: 'User does not have access to this company',
                    code: 'ACCESS_DENIED'
                };
            }
            return { success: true, data };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
}
export const authService = new AuthService();
