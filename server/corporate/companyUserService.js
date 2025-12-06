const companyUsers = [];
function nowIso() {
    return new Date().toISOString();
}
function normalize(input) {
    return input.toLowerCase();
}
export class CompanyUserService {
    constructor(audit = () => { }) {
        Object.defineProperty(this, "audit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: audit
        });
    }
    async addCompanyUser(company_id, user, role, company_alias) {
        const cu = {
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
    async updateCompanyUserRole(company_id, user_id, role) {
        const cu = companyUsers.find((x) => x.company_id === company_id && x.user_id === user_id);
        if (!cu)
            return null;
        cu.role = role;
        cu.updated_at = nowIso();
        this.audit({ action: "company_user.update_role", target: cu.id, company_id, payload: { role } });
        return cu;
    }
    async removeCompanyUser(company_id, user_id) {
        const cu = companyUsers.find((x) => x.company_id === company_id && x.user_id === user_id);
        if (!cu)
            return null;
        cu.status = "removed";
        cu.updated_at = nowIso();
        this.audit({ action: "company_user.remove", target: cu.id, company_id });
        return cu;
    }
    async listCompanyUsers(company_id) {
        return companyUsers.filter((x) => x.company_id === company_id && x.status === "active");
    }
}
