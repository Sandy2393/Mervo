import { describe, it, expect, beforeAll } from "vitest";
import { BillingService } from "../../server/billing/billingService";

class StubStripeClient {
  public calls: any[] = [];
  async recordUsage(input: any) {
    this.calls.push(input);
    return { id: `ur_${this.calls.length}` };
  }

  // placeholders to satisfy BillingService usage
  async createCustomer() { return { id: "cus_stub" }; }
  async createSubscription() { return { id: "sub_stub", status: "active" }; }
  async cancelSubscription() { return { id: "sub_stub", status: "canceled" }; }
  async listInvoices() { return []; }
  async downloadInvoice() { return { invoiceId: "in_stub", url: "https://example.com/invoice.pdf" }; }
  async createRefund() { return { id: "re_stub", amount: 100 }; }
}

const range = { start: "2020-01-01", end: "2099-01-01" };
const stripeClient = new StubStripeClient();
const billingService = new BillingService(stripeClient as any);

beforeAll(async () => {
  await billingService.recordUsage({ company_id: "company_test", usage_type: "api_calls", units: 10 });
});

describe("BillingService.exportUsageToStripe", () => {
  it("returns dry-run when confirm/live guard not met", async () => {
    const result = await billingService.exportUsageToStripe({ ...range, confirm: false, liveEnv: "false" });
    expect(result.dryRun).toBe(true);
    expect(result.count).toBeGreaterThanOrEqual(1);
    expect(stripeClient.calls.length).toBe(0);
  });

  it("exports when confirm and live are true", async () => {
    const result = await billingService.exportUsageToStripe({ ...range, confirm: true, liveEnv: "true" });
    expect((result as any).batchId).toBeTruthy();
    expect((result as any).count).toBeGreaterThanOrEqual(1);
    expect(stripeClient.calls.length).toBeGreaterThanOrEqual(1);
  });
});
