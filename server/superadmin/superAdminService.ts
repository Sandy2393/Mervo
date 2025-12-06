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
  offset?: number;
  q?: string;
}

interface AuditSink {
  (entry: { action: string; actor?: string; target?: string; meta?: any }): void;
}

const companies: Company[] = [];
const auditLog: any[] = [];

// Seed a few demo companies so the super-admin UI is not empty in development/demo
if (companies.length === 0) {
  companies.push(
    {
      id: "acme-co",
      name: "Acme Co",
      status: "active",
      owner_email: "owner@acme.test",
      owner_phone: "+61400000001",
      created_at: nowIso(),
      storage_bytes: 7_500_000,
      workforce_count: 42,
      retention_media_days: 180,
    },
    {
      id: "globex",
      name: "Globex",
      status: "suspended",
      owner_email: "ops@globex.test",
      owner_phone: "+61400000002",
      created_at: nowIso(),
      storage_bytes: 2_100_000,
      workforce_count: 15,
      retention_media_days: 90,
    },
    {
      id: "initech",
      name: "Initech",
      status: "active",
      owner_email: "founder@initech.test",
      owner_phone: "+61400000003",
      created_at: nowIso(),
      storage_bytes: 4_400_000,
      workforce_count: 23,
      retention_media_days: 365,
    }
  );
}

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
    let filtered = opts.status ? companies.filter((c) => c.status === opts.status) : companies;
    if (opts.q) {
      const q = opts.q.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.owner_email.toLowerCase().includes(q));
    }
    const start = opts.offset || 0;
    const end = opts.limit ? start + opts.limit : undefined;
    const sliced = filtered.slice(start, end);
    return sliced.map((c) => ({ ...c, owner_email: maskEmail(c.owner_email), owner_phone: maskPhone(c.owner_phone) }));
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

  listCompanyJobs(company_id: string, limit = 20, offset = 0) {
    // Placeholder jobs list for demo; replace with real jobs service when available
    const samples = Array.from({ length: 10 }).map((_, idx) => ({
      id: `${company_id}-job-${idx + 1}`,
      title: `Job ${idx + 1}`,
      status: idx % 3 === 0 ? "completed" : idx % 3 === 1 ? "in_progress" : "pending",
      created_at: nowIso(),
    }));
    const items = samples.slice(offset, offset + limit);
    return { items, total: samples.length };
  }
}

export const superAdminService = new SuperAdminService();
