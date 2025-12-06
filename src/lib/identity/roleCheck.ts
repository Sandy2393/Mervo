// Role helpers: define corporate vs contractor role groups and ensure exclusivity

export const CORPORATE_ROLES = ['owner', 'admin', 'manager', 'staff'] as const;
export const CONTRACTOR_ROLES = ['contractor'] as const;

export type CorporateRole = typeof CORPORATE_ROLES[number];
export type ContractorRole = typeof CONTRACTOR_ROLES[number];
export type AnyRole = CorporateRole | ContractorRole | string;

export function isCorporateRole(role: AnyRole): boolean {
  return CORPORATE_ROLES.includes(role as CorporateRole);
}

export function isContractorRole(role: AnyRole): boolean {
  return CONTRACTOR_ROLES.includes(role as ContractorRole);
}

export function assertExclusiveRoles(roles: AnyRole[] = []): { ok: boolean; reason?: string } {
  const hasCorporate = roles.some(r => isCorporateRole(r));
  const hasContractor = roles.some(r => isContractorRole(r));
  if (hasCorporate && hasContractor) return { ok: false, reason: 'mixed_roles_not_allowed' };
  return { ok: true };
}
