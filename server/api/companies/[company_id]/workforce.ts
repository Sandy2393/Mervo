import { CompanyUserService } from "../../../corporate/companyUserService";
import { UserService } from "../../../corporate/userService";
import { CsvImportService } from "../../../corporate/csvImport";
import { requireCompanyScope, requireAdmin } from "../../commonAuth";

const userService = new UserService(logAudit);
const companyUserService = new CompanyUserService(logAudit);
const csvImportService = new CsvImportService(userService, companyUserService, logAudit);

function logAudit(entry: any) {
  console.log("[audit]", entry);
}

export default async function handler(req: any, res: any) {
  const company_id = req.params?.company_id || req.query?.company_id;
  if (!company_id) return res.status(400).json({ error: "company_id required" });

  try {
    await requireCompanyScope(req, company_id);

    if (req.method === "GET") {
      const workforce = await companyUserService.listCompanyUsers(company_id);
      return res.status(200).json(workforce);
    }

    if (req.method === "POST") {
      await requireAdmin(req);
      const contentType = req.headers["content-type"] || "";

      // CSV preview/commit
      if (contentType.includes("text/csv")) {
        const buffer = await readBuffer(req);
        const mode = req.query?.mode || "preview";
        if (mode === "preview") {
          const result = csvImportService.validateCsv(buffer);
          return res.status(200).json(result);
        }
        if (mode === "commit") {
          const preview = csvImportService.validateCsv(buffer);
          if (preview.errors.length) return res.status(400).json({ error: "validation_failed", errors: preview.errors });
          const commit = await csvImportService.commitCsv(company_id, preview.rows, req.user?.id || "actor_placeholder");
          return res.status(201).json(commit);
        }
      }

      // JSON create
      const body = await readJson(req);
      const user = await userService.createUser({ email: body.email, display_name: body.display_name, master_alias: body.master_alias || body.email });
      const cu = await companyUserService.addCompanyUser(company_id, user, body.role, body.company_alias || body.email);
      return res.status(201).json({ user, companyUser: cu });
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

async function readBuffer(req: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    req.on("data", (c: any) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
