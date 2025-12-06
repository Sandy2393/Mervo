// Intercom-like adapter stub (server-side only)
// Env placeholders: INTERCOM_ACCESS_TOKEN
// TODO: implement API calls with rate limiting, retries, idempotency keys.

type UserPayload = { user_id: string; email?: string; name?: string };

export class IntercomAdapter {
  constructor(private opts: { accessToken?: string } = {}) {}

  async registerUser(user: UserPayload) {
    this.ensureServer();
    return { user, simulated: true };
  }

  async sendMessage(user: UserPayload, message: { body: string }) {
    this.ensureServer();
    return { to: user.user_id, body: message.body, simulated: true };
  }

  async openConversation(user: UserPayload) {
    this.ensureServer();
    return { conversationId: "ic_conv_placeholder", user: user.user_id, simulated: true };
  }

  private ensureServer() {
    if (typeof window !== "undefined") {
      throw new Error("Intercom adapter is server-side only");
    }
  }
}
