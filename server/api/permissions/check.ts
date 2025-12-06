import { permissionService, PermissionName } from "../../permissions/permissionService";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const user_id = req.user?.id || req.headers["x-user-id"];
  const role = req.user?.role || req.headers["x-role"] || "owner";

  try {
    const body = await readJson(req);
    const company_id = body.company_id || req.headers["x-company-id"];
    const permission: PermissionName = body.permission;
    if (!company_id || !permission || !user_id) {
      return res.status(400).json({ error: "company_id, permission, and user_id are required" });
    }
    permissionService.addCompanyUser(user_id, company_id, role as any);
    const allowed = permissionService.canPerform(user_id, company_id, permission);
    return res.status(200).json({ allowed });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ allowed: false, error: err?.message || "Server error" });
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
