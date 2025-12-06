import { computeStats } from "../server/experiments/processStats";

describe("processStats", () => {
  it("computes rates and uplift", () => {
    const events = [
      { user_id: "u1", flagKey: "pricing", variant: "control", eventName: "assignment", timestamp: "" },
      { user_id: "u2", flagKey: "pricing", variant: "variant_a", eventName: "assignment", timestamp: "" },
      { user_id: "u1", flagKey: "pricing", variant: "control", eventName: "conversion", timestamp: "" },
      { user_id: "u2", flagKey: "pricing", variant: "variant_a", eventName: "conversion", timestamp: "" },
      { user_id: "u3", flagKey: "pricing", variant: "control", eventName: "assignment", timestamp: "" }
    ];
    const res = computeStats(events as any, "pricing");
    expect(res.variants.control.rate).toBeCloseTo(0.5);
    expect(res.variants.variant_a.rate).toBeCloseTo(1);
    expect(res.uplift).toBeCloseTo(res.variants.variant_a.rate - res.variants.control.rate);
  });
});
