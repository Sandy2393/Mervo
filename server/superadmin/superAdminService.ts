import { v4 as uuid } from "uuid";

export interface Company {
  id: string;
  name: string;
  status: "active" | "suspended";
  owner_email: string;
  owner_phone?: string;
  created_at: string;
  storage_bytes?: number;
  workforce_count?: number;
  retention_media_days?: number;
}

export interface ListCompaniesOptions {
  status?: "active" | "suspended";
  limit?: number;
}

interface AuditSink {
  (entry: { action: string; actor?: string; target?: string; meta?: any }): void;
}

const companies: Company[] = [];
const auditLog: any[] = [];

function nowIso() {
  return new Date().toISOString();
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  const maskedUser = user ? `${user[0]}***` : "***";
  const domainParts = (domain || "").split(".");
  if (domainParts.length < 2) return `${maskedUser}@***`;
  const maskedDomain = `${domainParts[0]?.[0] || "*"}***.${domainParts.slice(1).join(".")}`;
  return `${maskedUser}@${maskedDomain}`;
}

function maskPhone(phone?: string) {
  if (!phone) return undefined;
  if (phone.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`;
}

function log(entry: any) {
  auditLog.push({ ...entry, at: nowIso() });
}

export class SuperAdminService {
  constructor(private audit: AuditSink = log) {}

  listCompanies(opts: ListCompaniesOptions = {}): Company[] {
    const filtered = opts.status ? companies.filter((c) => c.status === opts.status) : companies;
    const limited = opts.limit ? filtered.slice(0, opts.limit) : filtered;
    return limited.map((c) => ({ ...c, owner_email: maskEmail(c.owner_email), owner_phone: maskPhone(c.owner_phone) }));
  }

  viewCompanyDetails(company_id: string): Company | null {
    const c = companies.find((c) => c.id === company_id);
    if (!c) return null;
    return { ...c, owner_email: maskEmail(c.owner_email), owner_phone: maskPhone(c.owner_phone) };
  }

  suspendCompany(company_id: string, actor?: string) {
    const c = companies.find((c) => c.id === company_id);
    if (!c) throw new Error("Company not found");
    c.status = "suspended";
    this.audit({ action: "company.suspend", actor, target: company_id });
    return c;
  }

  reactivateCompany(company_id: string, actor?: string) {
    const c = companies.find((c) => c.id === company_id);
    if (!c) throw new Error("Company not found");
    c.status = "active";
    this.audit({ action: "company.reactivate", actor, target: company_id });
    return c;
  }

  createTempPassword(company_id: string, user_email: string, actor?: string) {
    const tempPass = `temp-${uuid().slice(0, 8)}`;
    this.audit({ action: "company.temp_password", actor, target: company_id, meta: { user_email: maskEmail(user_email) } });
    return { company_id, user_email: maskEmail(user_email), temp_password: tempPass, expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() };
  }

  createCompany(name: string, owner_email: string): Company {
    const company: Company = {
      id: uuid(),
      name,
      status: "active",
      owner_email,
      created_at: nowIso(),
      storage_bytes: 0,
      workforce_count: 0,
      retention_media_days: 365,
    };
    companies.push(company);
    this.audit({ action: "company.create", target: company.id, meta: { name: company.name } });
    return company;
  }

  getAuditLog() {
    return auditLog;
  }
}

export const superAdminService = new SuperAdminService();
