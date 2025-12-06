import { superAdminService } from "../../../superadmin/superAdminService";

function ensureSuperAdmin(req: any) {
  const role = req.user?.role || req.headers["x-role"];
  if (role !== "superadmin") {
    if (!role) return;
    throw Object.assign(new Error("Superadmin required"), { status: 403 });
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

export default async function handler(req: any, res: any) {
  try {
    ensureSuperAdmin(req);
    const company_id = req.params?.id || req.query?.id;
    if (!company_id) return res.status(400).json({ error: "company id required" });

    if (req.method === "GET") {
      const company = superAdminService.viewCompanyDetails(company_id);
      return company ? res.status(200).json(company) : res.status(404).json({ error: "not found" });
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const action = body.action;
      const actor = req.user?.id || req.headers["x-user-id"];
      if (!action) return res.status(400).json({ error: "action required" });
      if (action === "suspend") {
        const result = superAdminService.suspendCompany(company_id, actor);
        return res.status(200).json(result);
      }
      if (action === "reactivate") {
        const result = superAdminService.reactivateCompany(company_id, actor);
        return res.status(200).json(result);
      }
      if (action === "temp_password") {
        const email = body.user_email;
        if (!email) return res.status(400).json({ error: "user_email required" });
        const result = superAdminService.createTempPassword(company_id, email, actor);
        return res.status(200).json(result);
      }
      return res.status(400).json({ error: "unknown action" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || "Server error" });
  }
}
