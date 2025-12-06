const ACTIVE_COMPANY_KEY = 'mervo_active_company_id';
export function loadCompaniesForUser() {
    // This is a client placeholder. The AuthContext uses authService.getUserCompanies directly.
    return Promise.resolve([]);
}
export function setActiveCompany(companyId) {
    if (companyId === null) {
        localStorage.removeItem(ACTIVE_COMPANY_KEY);
    }
    else {
        localStorage.setItem(ACTIVE_COMPANY_KEY, companyId);
    }
}
export function getActiveCompany() {
    return localStorage.getItem(ACTIVE_COMPANY_KEY);
}
