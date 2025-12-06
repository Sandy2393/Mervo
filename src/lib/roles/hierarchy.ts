/**
 * Role Hierarchy
 * Numeric levels for role-based access control (RBAC)
 */

export const ROLE_LEVELS = {
  OWNER_PRIMARY: 100,
  OWNER_SECONDARY: 90,
  EXECUTIVE: 80,
  GM: 70,
  DEPT_HEAD: 60,
  MANAGER: 50,
  SUPERVISOR: 40,
  STAFF: 20,
  CONTRACTOR: 10
} as const;

export type RoleLevel = keyof typeof ROLE_LEVELS;

/**
 * Get numeric level for a role string
 */
export function getLevel(role: string): number {
  const key = role.toUpperCase().replace(/-/g, '_') as RoleLevel;
  return ROLE_LEVELS[key] ?? 0;
}

/**
 * Check if roleA can modify roleB
 * Returns true if level(A) > level(B)
 */
export function canModify(roleA: string, roleB: string): boolean {
  return getLevel(roleA) > getLevel(roleB);
}

/**
 * Check if user can view confidential role info
 * Returns true if level >= requested access level
 */
export function hasAccessLevel(userRole: string, requiredLevel: number): boolean {
  return getLevel(userRole) >= requiredLevel;
}

/**
 * Get all roles below a certain level (for filtering dropdown options)
 */
export function getRolesBelowLevel(maxLevel: number): string[] {
  return Object.entries(ROLE_LEVELS)
    .filter(([, level]) => level < maxLevel)
    .map(([role]) => role)
    .reverse();
}

export const roleHierarchy = {
  ROLE_LEVELS,
  getLevel,
  canModify,
  hasAccessLevel,
  getRolesBelowLevel
};
