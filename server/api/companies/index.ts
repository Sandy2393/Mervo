import { CompanyService } from "../../corporate/companyService";
import { requireAdmin } from "../commonAuth";

const companyService = new CompanyService(logAudit);

function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  try {
    await requireAdmin(req);

    if (req.method === "GET") {
      const companies = await companyService.listCompanies();
      return res.status(200).json(companies);
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const company = await companyService.createCompany({ name: body.name, slug: body.slug });
      return res.status(201).json(company);
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
