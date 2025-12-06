// Zendesk adapter (server-side only)
// Env placeholders: ZENDESK_SUBDOMAIN, ZENDESK_API_TOKEN, ZENDESK_EMAIL
// TODO: store secrets in secret manager; add OAuth support and idempotency keys.

export class ZendeskAdapter {
  constructor(private opts: { subdomain?: string; apiToken?: string; email?: string } = {}) {}

  async createTicket(company_id: string, payload: { subject: string; message: string; requester: { email: string; name?: string }; priority?: string }) {
    this.ensureServer();
    // TODO: POST to /api/v2/tickets.json
    return { ticketId: "zd_ticket_placeholder", company_id, simulated: true };
  }

  async getTicket(ticketId: string) {
    this.ensureServer();
    // TODO: GET ticket
    return { ticketId, status: "open", simulated: true };
  }

  async closeTicket(ticketId: string, reason?: string) {
    this.ensureServer();
    // TODO: update ticket status to closed/solved
    return { ticketId, status: "closed", reason, simulated: true };
  }

  private ensureServer() {
    if (typeof window !== "undefined") {
      throw new Error("Zendesk adapter is server-side only");
    }
  }
}
