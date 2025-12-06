import { supabase } from '../supabase';
/**
 * Returns a tiny helper that enforces company_id filtering for simple calls.
 * This is a light-weight convenience wrapper — in production you should enforce RLS
 * in the backend and only use server functions for sensitive operations.
 */
export function getScopedClient(companyId) {
    if (!companyId)
        throw new Error('companyId is required to get scoped client');
    return {
        from: (table) => {
            // returns a supabase query with .eq('company_id', companyId) applied
            const q = supabase.from(table).select('*').eq('company_id', companyId);
            // NOTE: the caller may wish to chain further filters after calling this helper
            return q;
        }
    };
}
