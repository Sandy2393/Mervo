import { ReportService } from "../../../jobs/reportService";

const reportService = new ReportService(logAudit);
function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const instance_id = req.params?.instance_id || req.query?.instance_id;
  if (!instance_id) return res.status(400).json({ error: "instance_id required" });
  try {
    const body = await readJson(req);
    const report = await reportService.submitReport(instance_id, req.user?.id || body.reporter_id, body.description, body.photos || [], body.checklist, body.answers);
    return res.status(201).json(report);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Submit failed" });
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
