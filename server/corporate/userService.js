const users = [];
function nowIso() {
    return new Date().toISOString();
}
function normalize(input) {
    return input ? input.trim().toLowerCase() : input;
}
export class UserService {
    constructor(audit = () => { }) {
        Object.defineProperty(this, "audit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: audit
        });
    }
    async createUser(payload) {
        const user = {
            id: crypto.randomUUID(),
            email: normalize(payload.email),
            master_alias: normalize(payload.master_alias) || crypto.randomUUID(),
            display_name: payload.display_name,
            status: "active",
            created_at: nowIso(),
            updated_at: nowIso(),
        };
        users.push(user);
        this.audit({ action: "user.create", target: user.id, payload: user });
        return user;
    }
    async updateUser(id, payload) {
        const u = users.find((x) => x.id === id);
        if (!u)
            return null;
        Object.assign(u, payload, { updated_at: nowIso() });
        this.audit({ action: "user.update", target: id, payload });
        return u;
    }
    async getUser(id) {
        return users.find((u) => u.id === id) || null;
    }
    async deleteUser(id) {
        const u = users.find((x) => x.id === id);
        if (!u)
            return null;
        u.status = "deleted";
        u.updated_at = nowIso();
        this.audit({ action: "user.soft_delete", target: id });
        return u;
    }
    async searchUsers(query, limit = 20) {
        const needle = normalize(query) || "";
        return users
            .filter((u) => (u.email || "").includes(needle) || (u.master_alias || "").includes(needle) || (u.display_name || "").toLowerCase().includes(needle))
            .slice(0, limit);
    }
}
