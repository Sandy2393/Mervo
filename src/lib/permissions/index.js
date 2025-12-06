/**
 * hasPermission checks whether a user has at least the required permission
 * for a given company. It first looks for an in-memory companies list (UserProfile.companies).
 * If not present, callers should fetch company_users via service layer.
 */
export function hasPermission(user, companyId, required) {
    if (!user || !companyId)
        return false;
    const entry = user.companies?.find(c => c.company_id === companyId);
    if (!entry)
        return false;
    const perms = entry.permissions || {};
    const p = perms['jobs'] || 'none'; // default to 'none' for jobs
    const order = { none: 0, view: 1, edit: 2 };
    return order[p] >= order[required];
}
/**
 * canPerform checks numeric role levels for more granular gating (higher is stronger).
 * roleLevel is expected to be a number where owners have highest level.
 */
export function canPerform(user, companyId, minRoleLevel) {
    if (!user || !companyId)
        return false;
    const c = user.companies?.find(x => x.company_id === companyId);
    if (!c)
        return false;
    // role_level may be present in companies entries (kept in sync elsewhere)
    // fallback: deny if not present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rl = c.role_level;
    if (typeof rl !== 'number')
        return false;
    return rl >= minRoleLevel;
}
export class PermissionDeniedError extends Error {
    constructor(message = 'Permission denied') {
        super(message);
        this.name = 'PermissionDeniedError';
    }
}
export default { hasPermission, canPerform, PermissionDeniedError };
