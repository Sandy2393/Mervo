import { describe, it, expect } from "vitest";
import { ReportService } from "../../server/jobs/reportService";

describe("ReportService", () => {
  it("submits and approves report", async () => {
    const audit: any[] = [];
    const svc = new ReportService((e) => audit.push(e));
    const report = await svc.submitReport("instance1", "user1", "done", [], {}, {});
    expect(report.status).toBe("submitted");
    const approved = await svc.reviewReport(report.id, "admin1", "approved", "ok");
    expect(approved.status).toBe("approved");
    expect(audit.length).toBeGreaterThan(0);
  });
});
