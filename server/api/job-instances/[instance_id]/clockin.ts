import { InstanceService } from "../../../jobs/instanceService";

const instanceService = new InstanceService(logAudit);
function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const instance_id = req.params?.instance_id || req.query?.instance_id;
  if (!instance_id) return res.status(400).json({ error: "instance_id required" });
  try {
    const body = await readJson(req);
    const result = await instanceService.recordClockIn(req.user?.id || body.user_id, instance_id, body.geo, body.deviceMeta);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Clock-in failed" });
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
