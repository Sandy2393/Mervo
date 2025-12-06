// HubSpot adapter (server-side only). Do not expose keys client-side.
// Env placeholders: HUBSPOT_API_KEY, HUBSPOT_OAUTH_TOKEN
// TODO: store secrets in secret manager; add retries, rate limiting, and idempotency keys.

type CompanyPayload = { id: string; name: string; domain?: string; primary_contact_email?: string };
type ContactPayload = { email: string; firstName?: string; lastName?: string; companyId?: string };
type EventPayload = { type: string; properties: Record<string, any> };

export class HubSpotAdapter {
  constructor(private opts: { apiKey?: string; oauthToken?: string } = {}) {}

  async createContact(company: CompanyPayload, contact: ContactPayload, idempotencyKey?: string) {
    this.ensureServer();
    // TODO: call HubSpot contacts API with idempotency header
    return {
      contactId: `hs_contact_${contact.email}`,
      companyId: company.id,
      idempotencyKey,
      simulated: true,
    };
  }

  async upsertCompany(company: CompanyPayload, idempotencyKey?: string) {
    this.ensureServer();
    // TODO: call HubSpot companies API
    return { companyId: company.id, idempotencyKey, simulated: true };
  }

  async addEngagementEvent(contactId: string, event: EventPayload, idempotencyKey?: string) {
    this.ensureServer();
    // TODO: call HubSpot engagements/timeline API
    return { contactId, eventType: event.type, idempotencyKey, simulated: true };
  }

  private ensureServer() {
    if (typeof window !== "undefined") {
      throw new Error("HubSpot adapter is server-side only");
    }
  }
}
