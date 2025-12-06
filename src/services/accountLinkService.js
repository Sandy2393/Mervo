import { supabase } from '../lib/supabase';
import { checkLinkCycle, isSamePerson } from './auth-utils';
class AccountLinkService {
    /**
     * List linked accounts for a master account
     */
    async listLinkedAccounts(masterAccountId) {
        try {
            const { data, error } = await supabase
                .from('linked_accounts')
                .select('*')
                .eq('primary_account_id', masterAccountId)
                .order('created_at', { ascending: false });
            if (error)
                return { success: false, error: error.message };
            return { success: true, data: data || [] };
        }
        catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }
    /**
     * Link another account to the primary master account
     * Full validation and migration logic
     */
    async linkAccounts(primaryAccountId, toLinkAccountId, verifyIdentity = true) {
        try {
            if (primaryAccountId === toLinkAccountId) {
                return { success: false, error: 'Cannot link the same account', code: 'INVALID' };
            }
            // Fetch both accounts to validate
            const { data: primary } = await supabase
                .from('users')
                .select('*')
                .eq('id', primaryAccountId)
                .single();
            const { data: toLink } = await supabase
                .from('users')
                .select('*')
                .eq('id', toLinkAccountId)
                .single();
            if (!primary || !toLink) {
                return { success: false, error: 'One or both accounts not found', code: 'NOT_FOUND' };
            }
            // Verify identity if requested (in production, this should verify email/phone)
            if (verifyIdentity) {
                const p = { email: primary.email, phone: primary.phone };
                const t = { email: toLink.email, phone: toLink.phone };
                if (!isSamePerson(p, t)) {
                    return { success: false, error: 'Identity verification failed', code: 'IDENTITY_MISMATCH' };
                }
            }
            // Check for cycles
            const { data: existingLinks } = await supabase
                .from('linked_accounts')
                .select('primary_account_id, linked_account_id');
            if (existingLinks && checkLinkCycle(existingLinks.map((l) => ({ primary_id: l.primary_account_id, linked_id: l.linked_account_id })), primaryAccountId, toLinkAccountId)) {
                return { success: false, error: 'This would create a cycle in account links', code: 'CYCLE_DETECTED' };
            }
            // Check if already linked
            const { data: alreadyLinked } = await supabase
                .from('linked_accounts')
                .select('*')
                .or(`primary_account_id.eq.${toLinkAccountId},linked_account_id.eq.${toLinkAccountId}`)
                .limit(1);
            if (alreadyLinked && alreadyLinked.length > 0) {
                return { success: false, error: 'Account is already linked elsewhere', code: 'ALREADY_LINKED' };
            }
            // Migrate company_users from toLink → primary
            const { data: toMigrate, error: fetchError } = await supabase
                .from('company_users')
                .select('*')
                .eq('user_id', toLinkAccountId);
            if (fetchError) {
                return { success: false, error: `Failed to fetch company affiliations: ${fetchError.message}`, code: 'MIGRATION_FAILED' };
            }
            // Update all company_users rows from old account to primary
            if (toMigrate && toMigrate.length > 0) {
                const { error: updateError } = await supabase
                    .from('company_users')
                    .update({ user_id: primaryAccountId })
                    .eq('user_id', toLinkAccountId);
                if (updateError) {
                    return { success: false, error: `Failed to migrate company_users: ${updateError.message}`, code: 'MIGRATION_FAILED' };
                }
            }
            // Create link record
            const { error: linkError } = await supabase
                .from('linked_accounts')
                .insert({ primary_account_id: primaryAccountId, linked_account_id: toLinkAccountId });
            if (linkError) {
                return { success: false, error: `Failed to create link: ${linkError.message}`, code: 'LINK_ERROR' };
            }
            // Mark old account as deactivated/merged
            const { error: deactivateError } = await supabase
                .from('users')
                .update({ status: 'merged', merged_to: primaryAccountId })
                .eq('id', toLinkAccountId);
            if (deactivateError) {
                console.error('Warning: failed to deactivate old account:', deactivateError);
                // Don't fail the whole operation
            }
            return { success: true, data: null };
        }
        catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'UNKNOWN' };
        }
    }
    /**
     * Unlink an account (admin only)
     */
    async unlinkAccount(linkId) {
        try {
            const { error } = await supabase
                .from('linked_accounts')
                .delete()
                .eq('id', linkId);
            if (error)
                return { success: false, error: error.message };
            return { success: true, data: null };
        }
        catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }
}
export const accountLinkService = new AccountLinkService();
