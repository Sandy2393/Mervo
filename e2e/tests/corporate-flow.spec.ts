import { test, expect } from "@playwright/test";

const base = process.env.E2E_BASE_URL || "http://localhost:3000";

test.describe("corporate flow", () => {
  test("create job, assign, approve", async ({ page }) => {
    await page.goto(`${base}/login`);
    await page.fill("input[name=email]", "admin@example.com");
    await page.fill("input[name=password]", "password");
    await page.click("button[type=submit]");

    await page.goto(`${base}/jobs/create`);
    await page.fill("input[name=title]", "Test Job");
    await page.click("button:has-text('Create')");

    await page.click("text=Assign contractor");
    await page.click("text=Approve report");

    await expect(page.locator("text=Approved")) .toBeVisible();
  });
});
