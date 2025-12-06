import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.E2E_BASE_URL || "http://localhost:3000";

test.describe("a11y", () => {
  test("login page", async ({ page }) => {
    await page.goto(`${base}/login`);
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });
});
