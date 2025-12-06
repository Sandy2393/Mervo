import { CompanyUserService, CompanyRole } from "./companyUserService";
import { UserService } from "./userService";

export interface CsvPreviewRow {
  row: number;
  email: string;
  role: CompanyRole;
  company_alias: string;
  display_name?: string;
  error?: string;
}

export class CsvImportService {
  constructor(
    private userService = new UserService(),
    private companyUserService = new CompanyUserService(),
    private audit: (entry: any) => void = () => {},
  ) {}

  validateCsv(fileBuffer: Buffer): { rows: CsvPreviewRow[]; errors: CsvPreviewRow[] } {
    const content = fileBuffer.toString("utf8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const rows: CsvPreviewRow[] = [];
    const errors: CsvPreviewRow[] = [];

    lines.forEach((line, idx) => {
      const [emailRaw, roleRaw, aliasRaw, display] = line.split(",").map((p) => p?.trim());
      const row: CsvPreviewRow = {
        row: idx + 1,
        email: (emailRaw || "").toLowerCase(),
        role: (roleRaw as CompanyRole) || "employee",
        company_alias: (aliasRaw || "").toLowerCase(),
        display_name: display,
      };

      if (!row.email || !row.email.includes("@")) {
        row.error = "invalid email";
      } else if (!row.company_alias) {
        row.error = "missing company alias";
      } else if (!row.role || !["owner", "admin", "manager", "employee", "contractor", "viewer"].includes(row.role)) {
        row.error = "invalid role";
      }

      if (row.error) {
        errors.push(row);
      } else {
        rows.push(row);
      }
    });

    return { rows, errors };
  }

  async commitCsv(company_id: string, csvRows: CsvPreviewRow[], actorId: string) {
    const created: Array<{ user_id: string; company_alias: string }> = [];

    for (const row of csvRows) {
      const user = await this.userService.createUser({ email: row.email, display_name: row.display_name, master_alias: row.email });
      await this.companyUserService.addCompanyUser(company_id, user, row.role, row.company_alias);
      created.push({ user_id: user.id, company_alias: row.company_alias });
    }

    this.audit({ action: "csv_import.commit", company_id, actor: actorId, count: created.length });
    return { created }; 
  }
}
