import { ReportService } from "../../jobs/reportService";
import { requireAdmin } from "../commonAuth";

const reportService = new ReportService(logAudit);
function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const report_id = req.params?.report_id || req.query?.report_id;
  if (!report_id) return res.status(400).json({ error: "report_id required" });
  try {
    await requireAdmin(req);
    const body = await readJson(req);
    const result = await reportService.reviewReport(report_id, req.user?.id || body.approver_id, body.status, body.comment);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Review failed" });
  }
}

async function readJson(req: any) {
  const raw = await new Promise<string>((resolve, reject) => {
    let data = "";
    req.on("data", (c: any) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
  return raw ? JSON.parse(raw) : {};
}
