import { expect, test } from "@playwright/test";

test.describe("Teacher Role E2E", () => {
  test("should login as teacher, check in, and open raport form", async ({ page }) => {
    test.setTimeout(60000);

    // Login as guru
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[name="username"]', "guru");
    await page.fill('input[name="password"]', "guru123");
    
    await Promise.all([
      page.waitForURL("**/dashboard", {
        waitUntil: "commit",
        timeout: 15000,
      }),
      page.click('button:has-text("Masuk")'),
    ]);

    // Navigate to presensi
    await page.goto("/presensi", { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Manajemen Presensi")).toBeVisible();
    
    // Check in if button exists
    const checkInBtn = page.locator('button:has-text("Hadir")').first();
    if (await checkInBtn.isVisible()) {
      await checkInBtn.click();
    }

    // Navigate to raport (Laporan)
    await page.goto("/laporan", { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Laporan Perkembangan Anak (E-Raport)")).toBeVisible();

    // Check if there are any students to grade by opening the Daily Report Dialog
    const isiDailyReportBtn = page.locator('button:has-text("Isi Daily Report")').first();
    if (await isiDailyReportBtn.isVisible()) {
      await isiDailyReportBtn.click();
      await expect(page.locator('div[role="dialog"]')).toBeVisible();
      await expect(page.locator("text=Buku Penghubung")).toBeVisible();
      
      // Try to select an indicator
      await page.selectOption('div[role="dialog"] select[name="foodPortion"]', "HABIS");
      await page.fill('div[role="dialog"] textarea[name="notes"]', "Anak sangat baik dalam mengingat doa harian.");
      
      // We cancel or escape to not clutter DB in tests unless we want to submit
      await page.keyboard.press("Escape");
    }
  });
});
