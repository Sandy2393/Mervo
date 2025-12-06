import { describe, it, expect } from "vitest";
import { superAdminService } from "../../server/superadmin/superAdminService";
import { JobService } from "../../server/jobs/jobService";
import { ReportService } from "../../server/jobs/reportService";
import { PdfService } from "../../server/jobs/pdfService";
import { queueInspector } from "../../server/offline/queueInspector";

const audit = (entry: any) => console.log("[audit]", entry);

describe("E2E integration happy path", () => {
  it("creates company, completes job offline, syncs, and audits", async () => {
    const company = superAdminService.createCompany("E2E Co", "owner@e2e.test");

    const jobService = new JobService(audit);
    const reportService = new ReportService(audit);
    const pdfService = new PdfService();

    const job = await jobService.createJob({ name: "Test job", company_id: company.id });
    await jobService.generateInstancesForRange(job.id, new Date().toISOString(), new Date().toISOString());

    // Seed offline queue item
    const pending = queueInspector.addItem({ id: "offline-1", company_id: company.id, type: "job_completion", payload: { job_id: job.id } });
    expect(queueInspector.listPendingSyncs(company.id).length).toBeGreaterThan(0);

    const reprocessed = queueInspector.reprocessItem(pending.id);
    expect(reprocessed.status).toBe("resolved");

    const report = await reportService.submitReport("instance-1", "worker-1", "done", [], {}, {});
    expect(report.status).toBe("submitted");
    const approved = await reportService.reviewReport(report.id, "admin-1", "approved", "ok");
    expect(approved.status).toBe("approved");

    const pdf = await pdfService.generateJobReportPdf(report.id);
    expect(pdf.pdfPath).toContain(report.id);

    const audits = superAdminService.getAuditLog();
    expect(audits.length).toBeGreaterThan(0);
  });
});
