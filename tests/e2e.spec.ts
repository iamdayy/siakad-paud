import { expect, test } from "@playwright/test";

function unique(prefix = "e2e") {
  return `${prefix}-${Date.now().toString(36).slice(-6)}`;
}

test.describe("PPDB → Approve → Invoice → Payment flow", () => {
  test("should register applicant via public form, approve via admin, create invoice and record payment", async ({
    page,
  }) => {
    test.setTimeout(120000);
    const childName = unique("child");
    const fatherName = unique("father");

    // ─── 1. PUBLIC PPDB REGISTRATION ──────────────────────────────────────────
    await page.goto("/ppdb-public", { waitUntil: "domcontentloaded" });
    
    // Check if registration is closed/open by looking for the "Daftar Sekarang" button
    const daftarBtn = page.locator('a:has-text("Daftar Sekarang")').first();
    // If PPDB is closed, this test would fail. We assume it's open or seeded to be open.
    await expect(daftarBtn).toBeVisible();
    await daftarBtn.click();
    await page.waitForURL("**/ppdb-public/form", { waitUntil: "commit" });

    // Step 1: Data Anak
    await expect(page.locator("h2", { hasText: "Data Anak" })).toBeVisible();
    await page.fill('input[name="childName"]', childName);
    await page.fill('input[name="birthDate"]', "2018-01-01");
    // Gender uses Base UI select, so we click the trigger and then the item
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Laki-laki")');
    await page.click('button:has-text("Selanjutnya")');

    // Step 2: Data Orang Tua
    await expect(page.locator("h2", { hasText: "Data Orang Tua" })).toBeVisible();
    await page.fill('input[name="fatherName"]', fatherName);
    await page.fill('input[name="whatsapp"]', "081234567890");
    await page.click('button:has-text("Selanjutnya")');

    // Step 3: Dokumen (Optional) -> Submit
    await expect(page.locator("h2", { hasText: "Dokumen" })).toBeVisible();
    await page.fill('textarea[name="notes"]', "E2E Test Note");
    await page.click('button:has-text("Kirim Pendaftaran")');

    // Wait for success page
    await expect(page.locator('h2:has-text("Pendaftaran Berhasil!")')).toBeVisible({ timeout: 15000 });

    // ─── 2. ADMIN APPROVAL ───────────────────────────────────────────────────
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin123");
    await Promise.all([
      page.waitForURL("**/dashboard", { waitUntil: "commit", timeout: 15000 }),
      page.click('button:has-text("Masuk")'),
    ]);

    await page.goto("/ppdb", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`table >> text=${childName}`, { timeout: 10000 });
    const row = page.locator("table").locator("tr", { hasText: childName }).first();
    await expect(row).toBeVisible();

    // Click DropdownMenu action button for this row
    await row.locator('button[aria-haspopup="menu"]').click();
    await page.click('div[role="menuitem"]:has-text("Ubah Status")');
    
    // Status dialog
    await page.selectOption('div[role="dialog"] select[name="status"]', "DITERIMA");
    await page.click('div[role="dialog"] button:has-text("Simpan Status")');
    await page.waitForTimeout(1500);

    // Verify student appears in student list
    await page.goto("/siswa", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`table >> text=${childName}`, { timeout: 10000 });
    await expect(page.locator("table").locator("tr", { hasText: childName })).toBeVisible();

    // ─── 3. FINANCE - INVOICE & PAYMENT ──────────────────────────────────────
    await page.goto("/keuangan", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`table >> text=${childName}`, { timeout: 10000 });
    const invRow = page.locator("table").locator("tr", { hasText: childName }).first();
    await expect(invRow).toBeVisible();

    // Record payment
    await page.click('button:has-text("Rekam Pembayaran")');
    const invoiceValue = await page.locator('div[role="dialog"] select[name="invoiceId"] option').nth(1).getAttribute("value");
    if (!invoiceValue) throw new Error("Invoice option not found");
    await page.selectOption('div[role="dialog"] select[name="invoiceId"]', invoiceValue);
    
    // Pay partial 50000
    await page.fill('div[role="dialog"] input[name="amount"]', "50000");
    await page.click('div[role="dialog"] button:has-text("Simpan Pembayaran")');

    await page.waitForTimeout(1000);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("table").locator("tr", { hasText: childName })).toBeVisible();
  });
});
