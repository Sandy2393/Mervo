import { v4 as uuid } from "uuid";

export class PdfService {
  constructor(private audit: (entry: any) => void = () => {}) {}

  async generateJobReportPdf(reportId: string) {
    const pdfPath = `reports/report_${reportId}.pdf`;
    // TODO: render HTML -> PDF via headless (puppeteer) and store in bucket
    this.audit({ action: "pdf.generate", reportId, pdfPath });
    return { pdfPath, url: `https://storage.example.com/${pdfPath}` };
  }

  async bulkGenerateReports(company_id: string, dateRange: { start: string; end: string }) {
    const zipId = uuid();
    const zipPath = `company/${company_id}/${dateRange.start}-${dateRange.end}/reports_${zipId}.zip`;
    const manifest = { company_id, dateRange, reports: [], zipPath };
    // TODO: iterate reports, generate PDFs, add to zip, upload zip
    this.audit({ action: "pdf.bulk_generate", company_id, zipPath });
    return { zipPath, manifest };
  }
}
