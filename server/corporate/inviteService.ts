import { CompanyRole } from "./companyUserService";
import { UserService } from "./userService";

export interface Invite {
  id: string;
  company_id: string;
  email: string;
  role: CompanyRole;
  expires_at: string;
  status: "pending" | "accepted" | "expired";
  token: string;
  created_by?: string;
}

const invites: Invite[] = [];

function generateToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export class InviteService {
  constructor(private userService = new UserService(), private audit: (entry: any) => void = () => {}) {}

  async createInvite(company_id: string, email: string, role: CompanyRole, expiresAt: string, created_by?: string): Promise<Invite> {
    const invite: Invite = {
      id: crypto.randomUUID(),
      company_id,
      email: email.toLowerCase(),
      role,
      expires_at: expiresAt,
      status: "pending",
      token: generateToken(),
      created_by,
    };
    invites.push(invite);
    this.audit({ action: "invite.create", target: invite.id, company_id, payload: { role, email } });
    // Placeholder for notification
    // notificationService.sendNotification({ templateId: "invite", to: email, data: { token: invite.token, company_id } });
    return invite;
  }

  async validateInvite(token: string): Promise<Invite | null> {
    const inv = invites.find((i) => i.token === token);
    if (!inv) return null;
    if (new Date(inv.expires_at).getTime() < Date.now()) {
      inv.status = "expired";
      return null;
    }
    return inv;
  }

  async acceptInvite(token: string, password: string, displayName?: string) {
    const inv = await this.validateInvite(token);
    if (!inv) throw new Error("invalid or expired token");

    const user = await this.userService.createUser({ email: inv.email, display_name: displayName, master_alias: inv.email });
    inv.status = "accepted";
    this.audit({ action: "invite.accept", target: inv.id, company_id: inv.company_id, actor: user.id });
    // TODO: link user to company via CompanyUserService in outer workflow
    return { invite: inv, user, passwordSet: Boolean(password) };
  }
}
