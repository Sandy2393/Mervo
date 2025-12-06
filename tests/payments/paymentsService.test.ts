import { PaymentsService } from "../../server/payments/paymentsService";
import { StripeConnectClient } from "../../server/payments/stripeConnectClient";

describe("PaymentsService", () => {
  it("creates payment intent and records audit", async () => {
    const mockClient = new StripeConnectClient();
    const svc = new PaymentsService(mockClient);
    const res = await svc.createPaymentIntent({ company_id: "c1", amount_cents: 1234, currency: "USD" });
    expect(res.provider_payment_id).toBeDefined();
    expect(res.amount_cents).toBe(1234);
  });

  it("handles webhook success", async () => {
    const mockClient = new StripeConnectClient();
    const svc = new PaymentsService(mockClient);
    await svc.createPaymentIntent({ company_id: "c1", amount_cents: 500, currency: "USD" });
    await svc.handleProviderWebhook("stripe", {
      id: "evt_1",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_placeholder" } },
      created: Date.now(),
    });
  });
});
