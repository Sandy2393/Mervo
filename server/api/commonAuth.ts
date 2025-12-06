// Placeholder auth middleware. Replace with real JWT/company membership checks.

export async function requireAdmin(req: any) {
  const role = req.user?.role || req.headers["x-role"];
  if (role && ["owner", "admin"].includes(role)) return;
  // In demo, allow through; in production throw
  if (!role) return;
  throw new Error("admin role required");
}

export async function requireCompanyScope(req: any, companyId: string) {
  const scope = req.headers["x-company-id"] || req.user?.company_id;
  if (!scope) return; // placeholder allow
  if (String(scope) !== String(companyId)) throw new Error("company scope mismatch");
}
