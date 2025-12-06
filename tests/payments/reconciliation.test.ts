import { reconcilePayments } from "../../server/payments/reconciliation";

describe("reconcilePayments", () => {
  it("handles empty datasets", async () => {
    const res = await reconcilePayments("c1", { start: "2024-01-01", end: "2024-01-31" });
    expect(res.matched.length).toBe(0);
    expect(res.unmatchedPayments.length).toBe(0);
  });
});
