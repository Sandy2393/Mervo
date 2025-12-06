import { SettingsService } from "../../settings/settingsService";
import { permissionService } from "../../permissions/permissionService";
import { runSoftSweep } from "../../retention/executor";

const settingsService = new SettingsService();

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const company_id = req.query?.company_id || req.headers["x-company-id"];
  const user_id = req.user?.id || req.headers["x-user-id"];
  const role = req.user?.role || req.headers["x-role"] || "owner";
  if (!company_id || !user_id) return res.status(400).json({ error: "company_id and user_id required" });

  try {
    const body = await readJson(req);
    const confirm = body.confirm === true || String(body.confirm).toLowerCase() === "true" || req.query?.confirm === "true";
    permissionService.addCompanyUser(user_id, company_id, role as any);
    permissionService.canPerform(user_id, company_id, "retention.execute");

    const settings = await settingsService.getSettings(String(company_id));
    const result = await runSoftSweep(String(company_id), settings, { confirm, initiated_by: user_id });
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err?.status || (err?.message?.includes("confirm") ? 400 : 500);
    return res.status(status).json({ error: err?.message || "Server error" });
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
