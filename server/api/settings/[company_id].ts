import { SettingsService } from "../../settings/settingsService";
import { permissionService } from "../../permissions/permissionService";

const settingsService = new SettingsService();

export default async function handler(req: any, res: any) {
  const company_id = req.params?.company_id || req.query?.company_id || req.headers["x-company-id"];
  const user_id = req.user?.id || req.headers["x-user-id"];
  const role = req.user?.role || req.headers["x-role"] || "owner";
  if (!company_id || !user_id) return res.status(400).json({ error: "company_id and user_id required" });

  try {
    ensureMembership(user_id, company_id, role);
    if (req.method === "GET") {
      permissionService.canPerform(user_id, company_id, "settings.view");
      const settings = await settingsService.getSettings(String(company_id));
      return res.status(200).json(settings);
    }
    if (req.method === "PATCH") {
      permissionService.canPerform(user_id, company_id, "settings.edit");
      const body = await readJson(req);
      const updated = await settingsService.updateSettings(String(company_id), body || {});
      return res.status(200).json(updated);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Server error" });
  }
}

function ensureMembership(userId: string, companyId: string, role: string) {
  const safeRole = (role as any) || "owner";
  permissionService.addCompanyUser(userId, companyId, safeRole as any);
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
