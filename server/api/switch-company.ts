import { permissionService } from "../permissions/permissionService";
import { switchCompanyContext, linkMasterToCompany } from "../switcher/switchService";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const user_id = req.user?.id || req.headers["x-user-id"];
  const role = req.user?.role || req.headers["x-role"] || "owner";

  try {
    const body = await readJson(req);
    const targetCompanyId = body.target_company_id;
    if (!user_id || !targetCompanyId) return res.status(400).json({ error: "user_id and target_company_id required" });

    // Assume linking already done elsewhere; in demo allow caller to seed link
    linkMasterToCompany(user_id, targetCompanyId);
    permissionService.addCompanyUser(user_id, targetCompanyId, role as any);
    permissionService.canPerform(user_id, targetCompanyId, "switch.company");

    const result = await switchCompanyContext(user_id, targetCompanyId);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err?.status || 500;
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
