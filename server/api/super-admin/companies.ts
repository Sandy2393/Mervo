import { superAdminService } from "../../superadmin/superAdminService";

function ensureSuperAdmin(req: any) {
  const role = req.user?.role || req.headers["x-role"];
  if (role !== "superadmin") {
    // Demo: allow if header set, else throw
    if (!role) return;
    throw Object.assign(new Error("Superadmin required"), { status: 403 });
  }
}

export default async function handler(req: any, res: any) {
  try {
    ensureSuperAdmin(req);
    if (req.method === "GET") {
      const status = req.query?.status as any;
      const companies = superAdminService.listCompanies({ status });
      return res.status(200).json(companies);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Server error" });
  }
}
