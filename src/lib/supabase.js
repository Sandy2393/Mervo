import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';
// Access Vite meta env with a safe 'any' cast so TypeScript doesn't complain in non-Vite contexts
const meta = (typeof import.meta !== 'undefined' ? import.meta : {});
const URL = meta?.env?.VITE_SUPABASE_URL || ENV.SUPABASE_URL || '';
const ANON = meta?.env?.VITE_SUPABASE_ANON_KEY || ENV.SUPABASE_ANON_KEY || '';
// Small debug to help during local development when variables are missing
if (!URL || !ANON) {
    // eslint-disable-next-line no-console
    console.warn('[SUPABASE] VITE env vars for Supabase not found - falling back to runtime ENV config if present.');
}
// Validate that placeholders have been replaced at runtime
if (ENV.SUPABASE_URL.includes('REPLACE_ME') || ENV.SUPABASE_ANON_KEY.includes('REPLACE_ME')) {
    console.error('[SUPABASE] Configuration incomplete. Placeholder values detected in env.ts. ' +
        'Replace ENV.SUPABASE_URL and ENV.SUPABASE_ANON_KEY before use.');
}
/**
 * Supabase client instance
 *
 * NOTE: In a real app, auth.uid() is automatically available from Supabase Auth.
 * RLS policies will filter data based on the logged-in user.
 * This client cannot be tested in AI Studio without a live Supabase project.
 */
export const supabase = createClient(URL, ANON);
