import { CompanyService } from "../../corporate/companyService";
import { requireAdmin, requireCompanyScope } from "../commonAuth";

const companyService = new CompanyService(logAudit);

function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  const company_id = req.params?.company_id || req.query?.company_id;
  if (!company_id) return res.status(400).json({ error: "company_id required" });

  try {
    await requireCompanyScope(req, company_id);

    if (req.method === "GET") {
      const company = await companyService.getCompany(company_id);
      return company ? res.status(200).json(company) : res.status(404).json({ error: "not found" });
    }

    if (req.method === "PATCH") {
      await requireAdmin(req);
      const body = await readJson(req);
      const updated = await companyService.updateCompany(company_id, body);
      return updated ? res.status(200).json(updated) : res.status(404).json({ error: "not found" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
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
