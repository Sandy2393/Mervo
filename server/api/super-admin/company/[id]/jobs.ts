function ensureSuperAdmin(req: any) {
  const role = req.user?.role || req.headers["x-role"];
  if (role && ["superadmin", "super_admin"].includes(String(role))) return;
  throw Object.assign(new Error("Superadmin required"), { status: 403 });
}

export default async function handler(req: any, res: any) {
  try {
    ensureSuperAdmin(req);
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const limit = req.query?.limit ? Number(req.query.limit) : 10;
    const offset = req.query?.offset ? Number(req.query.offset) : 0;
    const company_id = req.params?.id || req.query?.id;
    if (!company_id) return res.status(400).json({ error: "company id required" });
    const { items, total } = superAdminService.listCompanyJobs(String(company_id), limit, offset);
    return res.status(200).json({ items, total, limit, offset });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Server error" });
  }
}