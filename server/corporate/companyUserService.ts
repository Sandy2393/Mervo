import { User } from "./userService";

export type CompanyRole = "owner" | "admin" | "manager" | "employee" | "contractor" | "viewer";

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  company_alias: string;
  role: CompanyRole;
  status: "active" | "removed";
  created_at?: string;
  updated_at?: string;
}

const companyUsers: CompanyUser[] = [];

function nowIso() {
  return new Date().toISOString();
}

function normalize(input: string) {
  return input.toLowerCase();
}

export class CompanyUserService {
  constructor(private audit: (entry: any) => void = () => {}) {}

  async addCompanyUser(company_id: string, user: User, role: CompanyRole, company_alias: string): Promise<CompanyUser> {
    const cu: CompanyUser = {
      id: crypto.randomUUID(),
      company_id,
      user_id: user.id,
      company_alias: normalize(company_alias),
      role,
      status: "active",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    companyUsers.push(cu);
    this.audit({ action: "company_user.add", target: cu.id, company_id, payload: cu });
    return cu;
  }

  async updateCompanyUserRole(company_id: string, user_id: string, role: CompanyRole): Promise<CompanyUser | null> {
    const cu = companyUsers.find((x) => x.company_id === company_id && x.user_id === user_id);
    if (!cu) return null;
    cu.role = role;
    cu.updated_at = nowIso();
    this.audit({ action: "company_user.update_role", target: cu.id, company_id, payload: { role } });
    return cu;
  }

  async removeCompanyUser(company_id: string, user_id: string): Promise<CompanyUser | null> {
    const cu = companyUsers.find((x) => x.company_id === company_id && x.user_id === user_id);
    if (!cu) return null;
    cu.status = "removed";
    cu.updated_at = nowIso();
    this.audit({ action: "company_user.remove", target: cu.id, company_id });
    return cu;
  }

  async listCompanyUsers(company_id: string): Promise<CompanyUser[]> {
    return companyUsers.filter((x) => x.company_id === company_id && x.status === "active");
  }
}
