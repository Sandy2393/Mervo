import { backoff } from "../server/integrations/webhookWorker";

describe("webhook retry backoff", () => {
  it("caps backoff", () => {
    expect(backoff(1)).toBeGreaterThan(0);
    expect(backoff(10)).toBeLessThanOrEqual(60000);
  });
});
