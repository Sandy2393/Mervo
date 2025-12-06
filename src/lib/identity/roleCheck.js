// Role helpers: define corporate vs contractor role groups and ensure exclusivity
export const CORPORATE_ROLES = ['owner', 'admin', 'manager', 'staff'];
export const CONTRACTOR_ROLES = ['contractor'];
export function isCorporateRole(role) {
    return CORPORATE_ROLES.includes(role);
}
export function isContractorRole(role) {
    return CONTRACTOR_ROLES.includes(role);
}
export function assertExclusiveRoles(roles = []) {
    const hasCorporate = roles.some(r => isCorporateRole(r));
    const hasContractor = roles.some(r => isContractorRole(r));
    if (hasCorporate && hasContractor)
        return { ok: false, reason: 'mixed_roles_not_allowed' };
    return { ok: true };
}
