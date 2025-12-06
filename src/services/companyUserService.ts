import { supabase } from '../lib/supabase';
import { ServiceResponse, CompanyUser } from '../types';
import { normalizeCompanyAlias, validateRoleConflict } from './auth-utils';

class CompanyUserService {
  /**
   * Create a company alias (company_users row)
   * Enforces:
   * - Alias uniqueness per company
   * - No contractor + employee/owner mix for same account
   * - Proper role normalization
   */
  async createCompanyAlias(
    companyId: string,
    accountId: string,
    companyAlias: string,
    role: string,
    permissions: Record<string, any> = {}
  ): Promise<ServiceResponse<CompanyUser>> {
    try {
      // Normalize the alias
      const company = await supabase
        .from('companies')
        .select('company_tag')
        .eq('id', companyId)
        .single();

      if (!company?.data?.company_tag) {
        return { success: false, error: 'Company not found', code: 'NOT_FOUND' };
      }

      const aliasNorm = normalizeCompanyAlias(companyAlias, company.data.company_tag);

      // Check uniqueness per company
      const { data: existing } = await supabase
        .from('company_users')
        .select('id, role')
        .eq('company_id', companyId)
        .eq('company_alias', aliasNorm)
        .limit(1);

      if (existing && existing.length > 0) {
        return { success: false, error: 'Alias already exists for this company', code: 'DUPLICATE_ALIAS' };
      }

      // Check role conflict: cannot have contractor + employee/owner for same account
      const { data: accountRoles } = await supabase
        .from('company_users')
        .select('id, role, company_id')
        .eq('account_id', accountId);

      const existingRoles = (accountRoles || []).map((r: any) => r.role);
      const roleNorm = (role || '').toLowerCase();

      if (validateRoleConflict(existingRoles, roleNorm)) {
        return {
          success: false,
          error: 'Cannot mix contractor role with employee/owner roles in same account',
          code: 'ROLE_CONFLICT'
        };
      }

      // Contractors must be single-company only
      if (roleNorm === 'contractor' && accountRoles && accountRoles.length > 0) {
        return {
          success: false,
          error: 'Contractor accounts cannot belong to multiple companies',
          code: 'CONTRACTOR_MULTI_COMPANY'
        };
      }

      // Create the company_user record
      const { data, error } = await supabase
        .from('company_users')
        .insert({
          company_id: companyId,
          account_id: accountId,
          company_alias: aliasNorm,
          role: roleNorm,
          permissions: permissions || {},
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message, code: 'CREATE_ERROR' };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'UNKNOWN' };
    }
  }

  async listCompanyUsers(companyId: string, filters?: { role?: string; status?: string }): Promise<ServiceResponse<CompanyUser[]>> {
    try {
      let q: any = supabase.from('company_users').select('*').eq('company_id', companyId);
      if (filters?.role) q = q.eq('role', filters.role);
      if (filters?.status) q = q.eq('status', filters.status);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) return { success: false, error: error.message, code: 'DB_ERROR' };
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'EXCEPTION' };
    }
  }
}

export const companyUserService = new CompanyUserService();
