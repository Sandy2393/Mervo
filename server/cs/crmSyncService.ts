import { HubSpotAdapter } from "./hubspotAdapter";
import { ZendeskAdapter } from "./zendeskAdapter";
import { IntercomAdapter } from "./intercomAdapter";

// High-level CRM/Helpdesk sync orchestrator

type Company = { id: string; name: string; domain?: string; primary_contact_email?: string };

type SyncOpts = { dryRun?: boolean; idempotencyKey?: string };

type HealthSignal = { type: string; severity: "low" | "medium" | "high"; details?: string };

export class CrmSyncService {
  constructor(
    private hubspot = new HubSpotAdapter(),
    private zendesk = new ZendeskAdapter(),
    private intercom = new IntercomAdapter()
  ) {}

  async syncCompanyToCRM(company_id: string, opts: SyncOpts = {}) {
    const company: Company = { id: company_id, name: "Placeholder Co" };
    if (opts.dryRun) {
      return { dryRun: true, company };
    }
    const idempotencyKey = opts.idempotencyKey || `sync-${company_id}`;
    const upsert = await this.hubspot.upsertCompany(company, idempotencyKey);
    // TODO: sync users, onboarding progress, tickets
    return { company, hubspot: upsert };
  }

  async syncHealthSignal(company_id: string, signal: HealthSignal) {
    // TODO: push to CRM timeline or custom object
    return { company_id, signal, pushed: true };
  }

  async bulkSyncCompanies(list: Company[], dryRun = true) {
    const results = [] as any[];
    for (const company of list) {
      results.push(await this.syncCompanyToCRM(company.id, { dryRun }));
    }
    return { count: list.length, dryRun, results };
  }
}
