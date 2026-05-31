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
    await page.goto("/guru/presensi", { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Absensi Kehadiran Guru")).toBeVisible();
    
    // Check in if button exists
    const checkInBtn = page.locator('button:has-text("Check In Sekarang")');
    if (await checkInBtn.isVisible()) {
      await checkInBtn.click();
      await expect(page.locator('button:has-text("Check Out")')).toBeVisible();
    }

    // Navigate to raport
    await page.goto("/guru/raport", { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Penilaian E-Raport")).toBeVisible();

    // Check if there are any students to grade
    const isiRaportBtn = page.locator('button:has-text("Isi Raport")').first();
    if (await isiRaportBtn.isVisible()) {
      await isiRaportBtn.click();
      await expect(page.locator('div[role="dialog"]')).toBeVisible();
      await expect(page.locator("text=Formulir E-Raport PAUD")).toBeVisible();
      
      // Try to select an indicator
      await page.selectOption('div[role="dialog"] select[name="agamaMoral"]', "BSH");
      await page.fill('div[role="dialog"] textarea[name="narasiAgamaMoral"]', "Anak sangat baik dalam mengingat doa harian.");
      
      // We cancel or escape to not clutter DB in tests unless we want to submit
      await page.keyboard.press("Escape");
    }
  });
});
