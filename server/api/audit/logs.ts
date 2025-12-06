import { auditService } from "../../audit/auditService";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { company_id, actor, action, from, to, limit, offset } = req.query || {};
    const rows = auditService.queryAuditLogs(
      { company_id, actor, action, from, to },
      { limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined }
    );
    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
