import { supabase } from '../../lib/supabase';
import { ServiceResponse } from '../../types';

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestLink(primaryUserId: string, secondaryUserId: string): Promise<ServiceResponse<{ requestId: string }>> {
  try {
    if (!primaryUserId || !secondaryUserId) return { success: false, error: 'Missing ids', code: 'INVALID' };
    if (primaryUserId === secondaryUserId) return { success: false, error: 'Cannot link same account', code: 'INVALID' };

    const code = generate6DigitCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString(); // 15 minutes

    const { data, error } = await supabase
      .from('account_link_requests')
      .insert({ primary_user_id: primaryUserId, secondary_user_id: secondaryUserId, verification_code: code, expires_at: expiresAt })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message, code: 'INSERT_ERROR' };

    // TODO: send verification code to secondary user's email via server-side service

    return { success: true, data: { requestId: data.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown', code: 'UNKNOWN' };
  }
}

export async function confirmLink(verificationCode: string): Promise<ServiceResponse<null>> {
  try {
    if (!verificationCode) return { success: false, error: 'Missing code', code: 'INVALID' };

    const { data: req, error: fetchErr } = await supabase
      .from('account_link_requests')
      .select('*')
      .eq('verification_code', verificationCode)
      .eq('status', 'pending')
      .limit(1)
      .maybeSingle();

    if (fetchErr) return { success: false, error: fetchErr.message, code: 'FETCH_ERROR' };
    if (!req) return { success: false, error: 'Invalid or expired code', code: 'NOT_FOUND' };

    // check expiry
    if (new Date(req.expires_at) < new Date()) {
      return { success: false, error: 'Code expired', code: 'EXPIRED' };
    }

    // perform merge — we'll call mergeMasterAccounts
    const mergeResult = await mergeMasterAccounts(req.primary_user_id, req.secondary_user_id);
    if (!mergeResult.success) return mergeResult;

    // mark request as completed
    await supabase.from('account_link_requests').update({ status: 'completed' }).eq('id', req.id);

    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown', code: 'UNKNOWN' };
  }
}

export async function mergeMasterAccounts(primaryId: string, secondaryId: string): Promise<ServiceResponse<null>> {
  try {
    if (!primaryId || !secondaryId) return { success: false, error: 'Missing ids', code: 'INVALID' };

    // Move company_users rows from secondaryId to primaryId
    const { error: migrateErr } = await supabase
      .from('company_users')
      .update({ user_id: primaryId })
      .eq('user_id', secondaryId);

    if (migrateErr) return { success: false, error: migrateErr.message, code: 'MIGRATION_ERROR' };

    // TODO: update any foreign keys referencing secondaryId across the system (reports, timesheets, jobs etc.)

    // Mark secondary user as merged/deactivated
    const { error: deactivateErr } = await supabase
      .from('users')
      .update({ status: 'merged', merged_to: primaryId })
      .eq('id', secondaryId);

    if (deactivateErr) {
      // don't fully fail the operation — audit this in server logs
      console.warn('Warning: failed to mark secondary user as merged', deactivateErr);
    }

    // Create an audit log entry
    await supabase.from('audit_logs').insert({ actor_user_id: primaryId, action: 'merge_accounts', details: { primaryId, secondaryId } });

    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown', code: 'UNKNOWN' };
  }
}
