import { superAdminService } from "../../superadmin/superAdminService";

function ensureSuperAdmin(req: any) {
  const role = req.user?.role || req.headers["x-role"];
  if (role && ["superadmin", "super_admin"].includes(String(role))) return;
  throw Object.assign(new Error("Superadmin required"), { status: 403 });
}

export default async function handler(req: any, res: any) {
  try {
    ensureSuperAdmin(req);
    if (req.method === "GET") {
      const status = req.query?.status as any;
      const q = (req.query?.q as string) || undefined;
      const limit = req.query?.limit ? Number(req.query.limit) : undefined;
      const offset = req.query?.offset ? Number(req.query.offset) : undefined;
      const all = superAdminService.listCompanies({ status, q });
      const paged = superAdminService.listCompanies({ status, q, limit, offset });
      return res.status(200).json({ items: paged, total: all.length });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Server error" });
  }
}
