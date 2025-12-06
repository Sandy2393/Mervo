/**
 * Audit Service
 * Tracks company activity for compliance and monitoring
 */

import { supabase } from '../lib/supabase';
import { ServiceResponse, AuditLog } from '../types';

/**
 * List recent audit logs
 */
export async function listRecent(
  company_id: string,
  limit: number = 50
): Promise<ServiceResponse<AuditLog[]>> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

/**
 * Record an audit event
 * 
 * TODO: This should ideally be called server-side via RPC or Edge Function
 * to prevent client-side manipulation of audit logs. For now, it uses
 * standard Supabase insert with RLS enforcement.
 */
export async function record(
  company_id: string,
  action: string,
  target: string,
  details?: Record<string, unknown>
): Promise<ServiceResponse<AuditLog>> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        company_id,
        action,
        target,
        details: details || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, code: 'DB_ERROR' };
    }

    return { success: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg, code: 'EXCEPTION' };
  }
}

export const auditService = {
  listRecent,
  record
};
