import { test, expect } from "@playwright/test";

const base = process.env.E2E_BASE_URL || "http://localhost:3000";

test.describe("contractor happy path", () => {
  test("clock in, upload photo, submit", async ({ page }) => {
    await page.goto(`${base}/login`);
    // TODO: replace selectors with data-test-id
    await page.fill("input[name=email]", "contractor@example.com");
    await page.fill("input[name=password]", "password");
    await page.click("button[type=submit]");

    await page.goto(`${base}/jobs/today`);
    await page.click("text=Clock in");
    await page.click("text=Upload photo");
    // TODO: attach file via setInputFiles
    await page.click("text=Submit report");

    await expect(page.locator("text=Report submitted")) .toBeVisible();
  });
});
