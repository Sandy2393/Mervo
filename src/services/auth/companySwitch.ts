const ACTIVE_COMPANY_KEY = 'mervo_active_company_id';

export function loadCompaniesForUser(): Promise<{ company_id: string; company_alias?: string; role?: string }[]> {
  // This is a client placeholder. The AuthContext uses authService.getUserCompanies directly.
  return Promise.resolve([]);
}

export function setActiveCompany(companyId: string | null) {
  if (companyId === null) {
    localStorage.removeItem(ACTIVE_COMPANY_KEY);
  } else {
    localStorage.setItem(ACTIVE_COMPANY_KEY, companyId);
  }
}

export function getActiveCompany(): string | null {
  return localStorage.getItem(ACTIVE_COMPANY_KEY);
}
