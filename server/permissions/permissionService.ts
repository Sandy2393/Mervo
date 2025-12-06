export type PermissionName =
  | "job.add"
  | "job.assign"
  | "job.approve"
  | "workforce.manage"
  | "finance.view"
  | "settings.edit"
  | "settings.view"
  | "retention.preview"
  | "retention.execute"
  | "switch.company";

export type RoleName = "owner" | "admin" | "manager" | "worker" | "viewer";

interface CompanyUser {
  user_id: string;
  company_id: string;
  role: RoleName;
}

const defaultRolePermissions: Record<RoleName, PermissionName[]> = {
  owner: [
    "job.add",
    "job.assign",
    "job.approve",
    "workforce.manage",
    "finance.view",
    "settings.edit",
    "settings.view",
    "retention.preview",
    "retention.execute",
    "switch.company",
  ],
  admin: [
    "job.add",
    "job.assign",
    "job.approve",
    "workforce.manage",
    "finance.view",
    "settings.edit",
    "settings.view",
    "retention.preview",
    "retention.execute",
    "switch.company",
  ],
  manager: [
    "job.add",
    "job.assign",
    "job.approve",
    "workforce.manage",
    "settings.view",
    "retention.preview",
  ],
  worker: ["job.approve"],
  viewer: ["settings.view", "finance.view"],
};

const companyUsers: CompanyUser[] = [];
const rolePermissions: Record<RoleName, Set<PermissionName>> = Object.fromEntries(
  Object.entries(defaultRolePermissions).map(([role, perms]) => [role as RoleName, new Set(perms as PermissionName[])])
) as Record<RoleName, Set<PermissionName>>;

export class PermissionService {
  addCompanyUser(user_id: string, company_id: string, role: RoleName) {
    const existing = companyUsers.find((cu) => cu.user_id === user_id && cu.company_id === company_id);
    if (!existing) companyUsers.push({ user_id, company_id, role });
    else existing.role = role;
  }

  grantPermission(role: RoleName, permission: PermissionName) {
    if (!rolePermissions[role]) rolePermissions[role] = new Set();
    rolePermissions[role].add(permission);
  }

  revokePermission(role: RoleName, permission: PermissionName) {
    rolePermissions[role]?.delete(permission);
  }

  canPerform(userId: string, companyId: string, permissionName: PermissionName): boolean {
    const membership = companyUsers.find((cu) => cu.user_id === userId && cu.company_id === companyId);
    if (!membership) {
      throw Object.assign(new Error("User not in company"), { status: 403 });
    }
    const allowed = rolePermissions[membership.role] || new Set<PermissionName>();
    if (!allowed.has(permissionName)) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
    return true;
  }

  listRolePermissions(role: RoleName): PermissionName[] {
    return Array.from(rolePermissions[role] || []);
  }
}

export const permissionService = new PermissionService();
