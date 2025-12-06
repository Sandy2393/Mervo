import { JobService } from "../../jobs/jobService";
import { requireAdmin } from "../commonAuth";

const jobService = new JobService(logAudit);
function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  const job_id = req.params?.job_id || req.query?.job_id;
  if (!job_id) return res.status(400).json({ error: "job_id required" });

  try {
    await requireAdmin(req);
    if (req.method === "GET") {
      const job = await jobService.getJob(job_id);
      return job ? res.status(200).json(job) : res.status(404).json({ error: "not found" });
    }
    if (req.method === "PATCH") {
      const body = await readJson(req);
      const job = await jobService.updateJob(job_id, body);
      return job ? res.status(200).json(job) : res.status(404).json({ error: "not found" });
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
