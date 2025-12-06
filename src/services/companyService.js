/**
 * Company Service — CRUD operations for companies
 * Multi-tenant aware: enforces company_id context on all operations
 */
import { supabase } from '../lib/supabase';
class CompanyService {
    /**
     * Fetch single company by ID
     * User must be owner or super_admin (RLS enforced)
     */
    async getCompanyById(companyId) {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('id', companyId)
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
     * List companies accessible to current user
     * RLS filters to companies where user is owner
     */
    async listUserCompanies() {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
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
     * Create new company
     * TODO: Edge Function should:
     * 1. Create company
     * 2. Create company_owners entry (is_primary=true)
     * 3. Audit log
     *
     * For now, assumes owner is authenticated via Supabase Auth
     */
    async createCompany(name, company_tag, ownerId) {
        try {
            // Validate company_tag uniqueness
            const { data: existing } = await supabase
                .from('companies')
                .select('id')
                .eq('company_tag', company_tag.toLowerCase())
                .limit(1);
            if (existing && existing.length > 0) {
                return {
                    success: false,
                    error: 'Company tag already exists',
                    code: 'DUPLICATE_TAG'
                };
            }
            const { data: newCompany, error: createError } = await supabase
                .from('companies')
                .insert({
                name,
                company_tag: company_tag.toLowerCase(),
                status: 'active'
            })
                .select()
                .single();
            if (createError) {
                return {
                    success: false,
                    error: createError.message,
                    code: 'CREATE_ERROR'
                };
            }
            // Create company_owners entry
            const { error: ownerError } = await supabase
                .from('company_owners')
                .insert({
                company_id: newCompany.id,
                user_id: ownerId,
                is_primary: true
            });
            if (ownerError) {
                console.error('Failed to create company_owner:', ownerError);
                // Continue anyway—owner relationship may need manual fix
            }
            return { success: true, data: newCompany };
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
     * Update company settings
     * RLS: only primary owner can update
     */
    async updateCompany(companyId, updates) {
        try {
            const { data, error } = await supabase
                .from('companies')
                .update(updates)
                .eq('id', companyId)
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
     * Get company owners
     */
    async getCompanyOwners(companyId) {
        try {
            const { data, error } = await supabase
                .from('company_owners')
                .select('*')
                .eq('company_id', companyId);
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
     * Add a company owner
     * Only existing users should be added — Edge Function recommended for validation
     */
    async addCompanyOwner(companyId, userId, isPrimary = false) {
        try {
            const { data, error } = await supabase
                .from('company_owners')
                .insert({ company_id: companyId, user_id: userId, is_primary: isPrimary })
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
     * Remove a company owner by owner record id
     */
    async removeCompanyOwner(ownerId) {
        try {
            const { data, error } = await supabase
                .from('company_owners')
                .delete()
                .eq('id', ownerId)
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'DELETE_ERROR'
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
     * Suspend company (soft delete)
     * Only super_admin
     * TODO: Edge Function should enforce super_admin via RPC
     */
    async suspendCompany(companyId) {
        try {
            const { data, error } = await supabase
                .from('companies')
                .update({ status: 'suspended' })
                .eq('id', companyId)
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
export const companyService = new CompanyService();
