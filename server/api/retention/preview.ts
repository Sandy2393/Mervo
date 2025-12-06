import { SettingsService } from "../../settings/settingsService";
import { permissionService } from "../../permissions/permissionService";

const settingsService = new SettingsService();

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const company_id = req.query?.company_id || req.headers["x-company-id"];
  const user_id = req.user?.id || req.headers["x-user-id"];
  const role = req.user?.role || req.headers["x-role"] || "owner";
  if (!company_id || !user_id) return res.status(400).json({ error: "company_id and user_id required" });

  try {
    permissionService.addCompanyUser(user_id, company_id, role as any);
    permissionService.canPerform(user_id, company_id, "retention.preview");
    const preview = await settingsService.previewRetentionCounts(String(company_id));
    return res.status(200).json(preview);
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Server error" });
  }
}
