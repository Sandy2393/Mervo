export type CompanyStatus = "active" | "suspended";

export interface Company {
  id: string;
  name: string;
  slug?: string;
  status: CompanyStatus;
  created_at?: string;
  updated_at?: string;
}

// Placeholder data store; replace with DB calls using queries
const companies: Company[] = [];

function nowIso() {
  return new Date().toISOString();
}

export class CompanyService {
  constructor(private audit: (entry: any) => void = () => {}) {}

  async createCompany(payload: Pick<Company, "name" | "slug">): Promise<Company> {
    const company: Company = {
      id: crypto.randomUUID(),
      name: payload.name,
      slug: payload.slug?.toLowerCase(),
      status: "active",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    companies.push(company);
    this.audit({ action: "company.create", target: company.id, payload: company });
    return company;
  }

  async updateCompany(id: string, payload: Partial<Company>): Promise<Company | null> {
    const c = companies.find((x) => x.id === id);
    if (!c) return null;
    Object.assign(c, payload, { updated_at: nowIso() });
    this.audit({ action: "company.update", target: id, payload });
    return c;
  }

  async getCompany(id: string): Promise<Company | null> {
    return companies.find((c) => c.id === id) || null;
  }

  async listCompanies(): Promise<Company[]> {
    return companies.slice();
  }

  async suspendCompany(id: string): Promise<Company | null> {
    const c = companies.find((x) => x.id === id);
    if (!c) return null;
    c.status = "suspended";
    c.updated_at = nowIso();
    this.audit({ action: "company.suspend", target: id });
    return c;
  }
}
