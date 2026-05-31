import { expect, test } from "@playwright/test";

test.describe("Parent Portal E2E", () => {
  test("should login as parent, view dashboard, and logout", async ({ page }) => {
    test.setTimeout(60000);

    // Login as orang tua
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[name="username"]', "ortu");
    await page.fill('input[name="password"]', "ortu123");

    await Promise.all([
      page.waitForURL("**/portal", {
        waitUntil: "commit",
        timeout: 15000,
      }),
      page.click('button:has-text("Masuk")'),
    ]);

    // Check header and content
    await expect(page.locator("text=PORTAL WALI MURID")).toBeVisible();
    await expect(page.locator("text=Laporan E-Raport (Semester)")).toBeVisible();

    // Open a report
    const lihatRaportBtn = page.locator('button:has-text("Lihat Raport")').first();
    if (await lihatRaportBtn.isVisible()) {
      await lihatRaportBtn.click();
      await expect(page.locator('div[role="dialog"]')).toBeVisible();
      await expect(page.locator("text=Laporan Perkembangan Anak")).toBeVisible();
      await page.keyboard.press("Escape");
    }

    // Test logout
    await page.click('button:has-text("Keluar")');
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page.locator('button:has-text("Masuk")')).toBeVisible();
  });
});
