import { HealthEngine } from "../../server/cs/healthEngine";

describe("HealthEngine", () => {
  it("reduces score on rule violations", () => {
    const engine = new HealthEngine();
    const score = engine.computeHealthScore("c1", {
      company_id: "c1",
      jobs_per_week: 0,
      overdue_approvals: 5,
      storage_growth_pct: 10,
    });
    expect(score).toBeLessThan(100);
  });
});
