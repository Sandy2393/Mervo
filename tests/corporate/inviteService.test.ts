import { describe, it, expect } from "vitest";
import { InviteService } from "../../server/corporate/inviteService";

describe("InviteService", () => {
  it("creates and validates invite", async () => {
    const svc = new InviteService();
    const invite = await svc.createInvite("company1", "user@example.com", "employee", new Date(Date.now() + 86400000).toISOString());
    expect(invite.token).toBeTruthy();
    const validated = await svc.validateInvite(invite.token);
    expect(validated?.email).toBe("user@example.com");
  });

  it("accepts invite", async () => {
    const svc = new InviteService();
    const invite = await svc.createInvite("company1", "user2@example.com", "employee", new Date(Date.now() + 86400000).toISOString());
    const result = await svc.acceptInvite(invite.token, "password123", "User Two");
    expect(result.user.email).toBe("user2@example.com");
    expect(result.invite.status).toBe("accepted");
  });
});
