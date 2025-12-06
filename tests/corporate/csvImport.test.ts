import { describe, it, expect } from "vitest";
import { CsvImportService } from "../../server/corporate/csvImport";

const sampleCsv = Buffer.from("user@example.com,employee,alias1\nuser2@example.com,admin,alias2\ninvalid,role,alias3");

describe("CsvImportService", () => {
  it("validates csv and finds errors", () => {
    const svc = new CsvImportService();
    const result = svc.validateCsv(sampleCsv);
    expect(result.rows.length).toBe(2);
    expect(result.errors.length).toBe(1);
  });
});
