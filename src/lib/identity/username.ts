// Small utility helpers for building and validating master account ids and company aliases
// master account: username@app_tag
// company alias: username@company_tag (unique per company)

export const USERNAME_REGEX = /^[a-z0-9._]+$/i;

export function validateUsername(username: string): { valid: boolean; reason?: string } {
  if (!username || typeof username !== 'string') return { valid: false, reason: 'username_missing' };
  if (username.includes('@')) return { valid: false, reason: "username_must_not_contain_at_sign" };
  if (!USERNAME_REGEX.test(username)) return { valid: false, reason: 'username_invalid_chars' };
  // enforce at least 2 characters
  if (username.length < 2) return { valid: false, reason: 'username_too_short' };
  return { valid: true };
}

export function normalizeUsername(username: string): string {
  if (!username) return '';
  return username.trim().toLowerCase();
}

export function buildMasterId(username: string, appTag: string): string {
  const clean = normalizeUsername(username);
  const tag = (appTag || '').trim().toLowerCase();
  if (!tag) throw new Error('appTag is required to build master id');
  return `${clean}@${tag}`;
}

export function buildCompanyAlias(username: string, companyTag: string): string {
  const clean = normalizeUsername(username);
  const tag = (companyTag || '').trim().toLowerCase();
  if (!tag) throw new Error('companyTag is required to build company alias');
  return `${clean}@${tag}`;
}

// Export a helper that normalizes whether a provided value is bare username or masterId
export function ensureMasterId(candidate: string, appTag: string): string {
  if (!candidate) return '';
  const parts = candidate.trim().toLowerCase();
  if (parts.includes('@')) {
    // accept both username@app_tag or username@company_tag
    return parts;
  }
  return buildMasterId(parts, appTag);
}
