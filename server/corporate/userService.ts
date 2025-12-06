export type UserStatus = "active" | "suspended" | "deleted";

export interface User {
  id: string;
  email?: string;
  master_alias: string;
  display_name?: string;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}

const users: User[] = [];

function nowIso() {
  return new Date().toISOString();
}

function normalize(input?: string) {
  return input ? input.trim().toLowerCase() : input;
}

export class UserService {
  constructor(private audit: (entry: any) => void = () => {}) {}

  async createUser(payload: { email?: string; display_name?: string; master_alias: string }): Promise<User> {
    const user: User = {
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

  async updateUser(id: string, payload: Partial<User>): Promise<User | null> {
    const u = users.find((x) => x.id === id);
    if (!u) return null;
    Object.assign(u, payload, { updated_at: nowIso() });
    this.audit({ action: "user.update", target: id, payload });
    return u;
  }

  async getUser(id: string): Promise<User | null> {
    return users.find((u) => u.id === id) || null;
  }

  async deleteUser(id: string): Promise<User | null> {
    const u = users.find((x) => x.id === id);
    if (!u) return null;
    u.status = "deleted";
    u.updated_at = nowIso();
    this.audit({ action: "user.soft_delete", target: id });
    return u;
  }

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    const needle = normalize(query) || "";
    return users
      .filter((u) =>
        (u.email || "").includes(needle) || (u.master_alias || "").includes(needle) || (u.display_name || "").toLowerCase().includes(needle)
      )
      .slice(0, limit);
  }
}
