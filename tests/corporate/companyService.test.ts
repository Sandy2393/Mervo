import { describe, it, expect } from "vitest";
import { CompanyService } from "../../server/corporate/companyService";

describe("CompanyService", () => {
  it("creates and updates company", async () => {
    const audit: any[] = [];
    const service = new CompanyService((e) => audit.push(e));
    const company = await service.createCompany({ name: "Acme", slug: "acme" });
    expect(company.id).toBeTruthy();
    const updated = await service.updateCompany(company.id, { name: "Acme Corp" });
    expect(updated?.name).toBe("Acme Corp");
    expect(audit.length).toBeGreaterThan(0);
  });
});
