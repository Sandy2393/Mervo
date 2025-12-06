import { sign, verify } from "../packages/connectors-sdk/src";

describe("webhook signing", () => {
  it("verifies correct signature", () => {
    const body = JSON.stringify({ a: 1 });
    const secret = "test-secret";
    const sig = sign(body, secret);
    expect(verify(body, secret, sig)).toBe(true);
  });

  it("fails on mismatch", () => {
    const body = JSON.stringify({ a: 1 });
    const sig = sign(body, "secret");
    expect(verify(body, "other", sig)).toBe(false);
  });
});
