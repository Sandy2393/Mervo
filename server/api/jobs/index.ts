import { JobService } from "../../jobs/jobService";
import { requireAdmin } from "../commonAuth";

const jobService = new JobService(logAudit);

function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  const company_id = req.headers["x-company-id"] || req.query?.company_id;
  if (!company_id) return res.status(400).json({ error: "company_id required" });
  try {
    await requireAdmin(req);
    if (req.method === "GET") {
      const jobs = await jobService.listJobs(String(company_id));
      return res.status(200).json(jobs);
    }
    if (req.method === "POST") {
      const body = await readJson(req);
      const job = await jobService.createJob({ ...body, company_id: String(company_id) });
      return res.status(201).json(job);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
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
