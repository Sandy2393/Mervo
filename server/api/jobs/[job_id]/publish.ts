import { JobService } from "../../../jobs/jobService";
import { requireAdmin } from "../../commonAuth";

const jobService = new JobService(logAudit);
function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const job_id = req.params?.job_id || req.query?.job_id;
  if (!job_id) return res.status(400).json({ error: "job_id required" });
  try {
    await requireAdmin(req);
    const job = await jobService.publishJob(job_id);
    return job ? res.status(200).json(job) : res.status(404).json({ error: "not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
