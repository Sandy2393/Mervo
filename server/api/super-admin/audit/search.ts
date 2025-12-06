import { auditService } from "../../../audit/auditService";

function ensureSuperAdmin(req: any) {
  const role = req.user?.role || req.headers["x-role"];
  if (role && ["superadmin", "super_admin"].includes(String(role))) return;
  throw Object.assign(new Error("Superadmin required"), { status: 403 });
}

export default async function handler(req: any, res: any) {
  try {
    ensureSuperAdmin(req);
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const { q, actor, company_id, date_from, date_to, limit, offset } = req.query || {};
    const rows = auditService.queryAuditLogs(
      { company_id, actor, action: q, from: date_from, to: date_to },
      { limit: limit ? Number(limit) : 50, offset: offset ? Number(offset) : 0 }
    );
    return res.status(200).json({ items: rows, total: rows.length });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Server error" });
  }
}