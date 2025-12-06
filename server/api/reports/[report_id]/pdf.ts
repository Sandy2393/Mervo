import { PdfService } from "../../jobs/pdfService";

const pdfService = new PdfService(logAudit);
function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const report_id = req.params?.report_id || req.query?.report_id;
  if (!report_id) return res.status(400).json({ error: "report_id required" });
  try {
    const pdf = await pdfService.generateJobReportPdf(report_id);
    return res.status(200).json(pdf);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "PDF generation failed" });
  }
}
