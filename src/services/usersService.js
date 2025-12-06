/**
 * Users Service — CRUD for CompanyUser and user management
 * Multi-tenant aware
 */
import { supabase } from '../lib/supabase';
class UsersService {
    /**
     * List users in a company
     */
    async listCompanyUsers(companyId) {
        try {
            const { data, error } = await supabase
                .from('company_users')
                .select('*')
                .eq('company_id', companyId)
                .eq('status', 'active')
                .order('created_at', { ascending: false });
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
     * Get company user by ID
     */
    async getCompanyUserById(companyUserId) {
        try {
            const { data, error } = await supabase
                .from('company_users')
                .select('*')
                .eq('id', companyUserId)
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'FETCH_ERROR'
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
    /**
     * Create company user (onboard contractor/employee)
     * TODO: Edge Function should:
     * 1. Validate user exists in auth
     * 2. Check for duplicate company_users entry
     * 3. Create company_users record
     * 4. Send notification/invite
     */
    async createCompanyUser(companyId, userId, companyAlias, role, permissions) {
        try {
            // Check for duplicate
            const { data: existing } = await supabase
                .from('company_users')
                .select('id')
                .eq('company_id', companyId)
                .eq('user_id', userId)
                .limit(1);
            if (existing && existing.length > 0) {
                return {
                    success: false,
                    error: 'User already in this company',
                    code: 'DUPLICATE_USER'
                };
            }
            const { data, error } = await supabase
                .from('company_users')
                .insert({
                company_id: companyId,
                user_id: userId,
                company_alias: companyAlias,
                role,
                permissions: permissions || {}
            })
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'CREATE_ERROR'
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
    /**
     * Update company user (permissions, role, status)
     */
    async updateCompanyUser(companyUserId, updates) {
        try {
            const { data, error } = await supabase
                .from('company_users')
                .update(updates)
                .eq('id', companyUserId)
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'UPDATE_ERROR'
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
    /**
     * Deactivate company user (soft delete)
     */
    async deactivateCompanyUser(companyUserId) {
        try {
            const { data, error } = await supabase
                .from('company_users')
                .update({ status: 'inactive' })
                .eq('id', companyUserId)
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'UPDATE_ERROR'
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
    /**
     * List contractors in company
     */
    async listContractors(companyId) {
        try {
            const { data, error } = await supabase
                .from('company_users')
                .select('*')
                .eq('company_id', companyId)
                .eq('role', 'contractor')
                .eq('status', 'active')
                .order('company_alias', { ascending: true });
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
     * Search users by company_alias
     */
    async searchUsersByAlias(companyId, searchTerm) {
        try {
            const { data, error } = await supabase
                .from('company_users')
                .select('*')
                .eq('company_id', companyId)
                .ilike('company_alias', `%${searchTerm}%`)
                .eq('status', 'active')
                .limit(10);
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
     * Update user permissions for specific resource
     * e.g., setPermission(userId, 'jobs', 'edit')
     */
    async setPermission(companyUserId, resource, level) {
        try {
            const { data: current } = await supabase
                .from('company_users')
                .select('permissions')
                .eq('id', companyUserId)
                .single();
            const permissions = current?.permissions || {};
            permissions[resource] = level;
            const { data, error } = await supabase
                .from('company_users')
                .update({ permissions })
                .eq('id', companyUserId)
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'UPDATE_ERROR'
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
export const usersService = new UsersService();
