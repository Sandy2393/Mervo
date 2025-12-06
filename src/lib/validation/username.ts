/**
 * Username Validation and Normalization
 * Enforces consistent username formats across master and company accounts
 */

import { supabase } from '../supabase';

/**
 * Normalize a username:
 * - Lowercase
 * - Trim whitespace
 * - No leading/trailing special chars
 */
export function normalize(username: string): string {
  return username.toLowerCase().trim();
}

/**
 * Validate username format:
 * - Alphanumeric, dots, underscores
 * - No @ symbols (used only in account_id and company_alias)
 * - Min 3 chars, max 30 chars
 */
export function isValid(username: string): boolean {
  const normalized = normalize(username);
  
  // Check length
  if (normalized.length < 3 || normalized.length > 30) {
    return false;
  }

  // Check pattern: alphanumeric, dots, underscores only
  const pattern = /^[a-z0-9._]+$/;
  return pattern.test(normalized);
}

/**
 * Enforce unique master account alias (account_id)
 * Checks if account_id@app_tag already exists
 */
export async function enforceUniqueMasterAlias(
  account_id: string
): Promise<{ unique: boolean; error?: string }> {
  try {
    const normalized = normalize(account_id);

    if (!isValid(normalized)) {
      return {
        unique: false,
        error: 'Invalid format (alphanumeric, dots, underscores only; 3-30 chars)'
      };
    }

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('account_id', `${normalized}@app_tag`)
      .single();

    if (error && error.code === 'PGRST116') {
      // PGRST116 = no rows returned (good - unique)
      return { unique: true };
    }

    if (error) {
      return { unique: false, error: error.message };
    }

    if (data) {
      return { unique: false, error: 'This username is already taken' };
    }

    return { unique: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { unique: false, error: msg };
  }
}

/**
 * Enforce unique company alias
 * Checks if company_alias@company_tag already exists for the given company
 */
export async function enforceUniqueCompanyAlias(
  company_alias: string,
  company_id: string
): Promise<{ unique: boolean; error?: string }> {
  try {
    const normalized = normalize(company_alias);

    if (!isValid(normalized)) {
      return {
        unique: false,
        error: 'Invalid format (alphanumeric, dots, underscores only; 3-30 chars)'
      };
    }

    const { data, error } = await supabase
      .from('company_users')
      .select('id')
      .eq('company_alias', `${normalized}@company_tag`)
      .eq('company_id', company_id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows found (unique)
      return { unique: true };
    }

    if (error) {
      return { unique: false, error: error.message };
    }

    if (data) {
      return { unique: false, error: 'This alias is already in use in this company' };
    }

    return { unique: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { unique: false, error: msg };
  }
}

export const usernameUtils = {
  normalize,
  isValid,
  enforceUniqueMasterAlias,
  enforceUniqueCompanyAlias
};
