import { supabase } from '../../lib/supabase';
import { ensureMasterId } from '../../lib/identity/username';
import { assertExclusiveRoles, isCorporateRole, isContractorRole } from '../../lib/identity/roleCheck';
import { ENV } from '../../config/env';
/**
 * Login using masterId or bare username (username → username@APP_TAG)
 * Returns user, companies (company_users rows) and primaryRole
 */
export async function loginWithMasterId(masterIdOrBareUsername, password) {
    try {
        if (!masterIdOrBareUsername || !password)
            return { success: false, error: 'Missing credentials', code: 'INVALID' };
        // Normalize: accept bare username (no @) or full id
        const normalizedMasterId = ensureMasterId(masterIdOrBareUsername, ENV.APP_TAG);
        // Sign in using Supabase (we assume the masterId is stored as the email/login)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedMasterId,
            password
        });
        if (authError || !authData.user) {
            return { success: false, error: authError?.message || 'Auth failed', code: 'AUTH_ERROR' };
        }
        // load local application users table entry for this account
        // we expect a users table with account_id = masterId
        const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('id, account_id, email, display_name, status')
            .eq('account_id', normalizedMasterId)
            .maybeSingle();
        if (userError) {
            return { success: false, error: userError.message, code: 'FETCH_ERROR' };
        }
        if (!userRecord) {
            return { success: false, error: 'Account not found (users table)', code: 'NOT_FOUND' };
        }
        // enforce locked / suspended status
        if (userRecord.status && ['locked', 'suspended', 'deleted'].includes(userRecord.status)) {
            return { success: false, error: `Account ${userRecord.status}`, code: 'ACCOUNT_LOCKED' };
        }
        // fetch company affiliations
        const { data: companies, error: companiesErr } = await supabase
            .from('company_users')
            .select('*')
            .eq('user_id', userRecord.id);
        if (companiesErr) {
            return { success: false, error: companiesErr.message, code: 'FETCH_ERROR' };
        }
        const companyRows = (companies || []).map((c) => ({ ...c, company_alias: (c.company_alias || '').toLowerCase() }));
        // determine primary role for redirect and enforcement
        const roles = companyRows.map(r => r.role);
        const exclusivity = assertExclusiveRoles(roles);
        if (!exclusivity.ok) {
            return { success: false, error: 'User has mixed roles across companies', code: 'MIXED_ROLE' };
        }
        let primaryRole = null;
        if (roles.length === 0)
            primaryRole = null;
        else if (roles.every(isContractorRole))
            primaryRole = 'contractor';
        else if (roles.some(isCorporateRole))
            primaryRole = 'corporate';
        const resultUser = {
            id: userRecord.id,
            email: userRecord.email,
            display_name: userRecord.display_name,
            created_at: new Date().toISOString(),
        };
        return { success: true, data: { user: resultUser, companies: companyRows, primaryRole } };
    }
    catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'UNKNOWN' };
    }
}
