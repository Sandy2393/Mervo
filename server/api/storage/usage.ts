import { storageManager } from "../../storage/storageManager";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const company_id = req.query?.company_id || req.headers["x-company-id"] || "demo";
    const usage = storageManager.computeCompanyUsage(String(company_id));
    return res.status(200).json(usage);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
