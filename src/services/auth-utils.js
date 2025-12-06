import { ENV } from '../config/env';
/**
 * SECTION 6 — BACKEND IMPLEMENTATION UTILITIES
 * Strict validation and normalization functions
 */
// 1. Normalize username to account_id format
export function normalizeUsername(input) {
    if (!input || typeof input !== 'string') {
        throw new Error('Username must be a non-empty string');
    }
    let v = input.trim().toLowerCase();
    // Validate local part (before @)
    const hasAt = v.includes('@');
    const local = hasAt ? v.split('@')[0] : v;
    // Check allowed characters: a-z, 0-9, _, .
    if (!/^[a-z0-9_.]+$/.test(local)) {
        throw new Error('Username can only contain letters, numbers, underscore, and period.');
    }
    // Reject leading/trailing . or _
    if (local.startsWith('.') || local.startsWith('_') || local.endsWith('.') || local.endsWith('_')) {
        throw new Error('Username cannot start or end with . or _');
    }
    // Append @APP_TAG if missing
    if (!hasAt) {
        v = `${local}@${ENV.APP_TAG}`;
    }
    return v;
}
export function validateLoginRole(roles) {
    if (!Array.isArray(roles) || roles.length === 0) {
        return { contractorOnly: false, corporateOnly: false, mixed: false, roles: [] };
    }
    const unique = Array.from(new Set(roles.map(r => (r || '').toLowerCase())));
    const hasContractor = unique.includes('contractor');
    const hasCorporate = unique.some(r => r && r !== 'contractor');
    return {
        contractorOnly: hasContractor && !hasCorporate,
        corporateOnly: hasCorporate && !hasContractor,
        mixed: hasContractor && hasCorporate, // invalid state
        roles: unique
    };
}
// 3. Validate company alias format
export function normalizeCompanyAlias(alias, companyTag) {
    if (!alias)
        throw new Error('Company alias cannot be empty');
    const a = alias.trim().toLowerCase();
    const t = companyTag.trim().toLowerCase();
    // Validate local part
    const parts = a.includes('@') ? a.split('@') : [a];
    const local = parts[0];
    if (!/^[a-z0-9_.]+$/.test(local)) {
        throw new Error('Company alias local part can only contain letters, numbers, underscore, and period.');
    }
    // Return as username@company_tag
    return `${local}@${t}`;
}
// 4. Validate role conflict: prevent contractor + employee/owner mix
export function validateRoleConflict(existingRoles, newRole) {
    if (!newRole)
        return false;
    const n = newRole.toLowerCase();
    const existing = existingRoles.map(r => (r || '').toLowerCase());
    const newIsContractor = n === 'contractor';
    const hasNonContractor = existing.some(r => r && r !== 'contractor');
    const hasContractor = existing.includes('contractor');
    // Rule: cannot have contractor + non-contractor in same account
    if (newIsContractor && hasNonContractor)
        return true; // conflict
    if (!newIsContractor && hasContractor)
        return true; // conflict
    return false;
}
export function isSamePerson(identity1, identity2) {
    // Basic check: both must share at least one identifier
    const shared = [];
    if (identity1.email && identity2.email && identity1.email === identity2.email) {
        shared.push('email');
    }
    if (identity1.phone && identity2.phone && identity1.phone === identity2.phone) {
        shared.push('phone');
    }
    // In production: implement more sophisticated matching (Soundex, phonetic, etc.)
    return shared.length > 0;
}
// 6. Prevent link cycles
export function checkLinkCycle(links, primaryId, toLink) {
    // Prevent cycles: toLink should not already have primaryId in its chain
    const chain = new Set();
    let current = toLink;
    let depth = 0;
    const maxDepth = 100; // prevent infinite loops
    while (current && depth < maxDepth) {
        if (chain.has(current))
            break; // cycle detected in existing chain
        chain.add(current);
        const next = links.find(l => l.primary_id === current)?.linked_id;
        if (next === primaryId)
            return true; // would create a cycle
        if (!next)
            break;
        current = next;
        depth++;
    }
    return false; // no cycle
}
/**
 * Merge metadata from old to new account
 * Prefer new account values; fall back to old if new is missing
 */
export function mergeAccountMetadata(oldMeta, newMeta) {
    return {
        email: newMeta.email || oldMeta.email,
        phone: newMeta.phone || oldMeta.phone,
        display_name: newMeta.display_name || oldMeta.display_name,
        avatar_url: newMeta.avatar_url || oldMeta.avatar_url
    };
}
