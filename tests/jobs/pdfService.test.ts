import { describe, it, expect } from "vitest";
import { PdfService } from "../../server/jobs/pdfService";

describe("PdfService", () => {
  it("generates single pdf placeholder", async () => {
    const svc = new PdfService();
    const pdf = await svc.generateJobReportPdf("rep1");
    expect(pdf.pdfPath).toContain("rep1");
  });

  it("generates bulk zip placeholder", async () => {
    const svc = new PdfService();
    const bulk = await svc.bulkGenerateReports("comp1", { start: "2024-01-01", end: "2024-01-31" });
    expect(bulk.zipPath).toContain("comp1");
  });
});
