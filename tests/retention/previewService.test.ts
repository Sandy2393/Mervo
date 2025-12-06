import { describe, it, expect } from "vitest";
import { computeCountsForRetention } from "../../server/retention/previewService";

describe("retention preview", () => {
  it("computes counts and samples", async () => {
    const result = await computeCountsForRetention("demo", { retention_media_days: 30, retention_meta_days: 30 });
    expect(result.counts.media).toBeGreaterThan(0);
    expect(result.counts.metadata).toBeGreaterThan(0);
    expect(result.samples.length).toBeGreaterThan(0);
  });
});
