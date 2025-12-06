import { HubSpotAdapter } from "../../server/cs/hubspotAdapter";

describe("HubSpotAdapter", () => {
  it("supports idempotency keys", async () => {
    const adapter = new HubSpotAdapter();
    const res = await adapter.createContact({ id: "c1", name: "Co" }, { email: "a@example.com" }, "key1");
    expect(res.idempotencyKey).toBe("key1");
  });
});
