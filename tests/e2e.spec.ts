import { expect, test } from "@playwright/test";

function unique(prefix = "e2e") {
  return `${prefix}-${Date.now().toString(36).slice(-6)}`;
}

test.describe("PPDB → Approve → Invoice → Payment flow", () => {
  test("should register applicant, approve, create invoice and record payment", async ({
    page,
  }) => {
    test.setTimeout(120000);
    const childName = unique("child");
    const parentName = unique("parent");

    // Login first because protected routes now require RBAC
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin123");
    await Promise.all([
      page.waitForURL("**/dashboard", {
        waitUntil: "commit",
        timeout: 15000,
      }),
      page.click('button:has-text("Masuk")'),
    ]);

    // PPDB: submit registration (open modal then submit)
    await page.goto("/ppdb", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator('button:has-text("Buat Pendaftaran")'),
    ).toBeVisible();
    await page.click('button:has-text("Buat Pendaftaran")');
    await page.fill('div[role="dialog"] input[name="childName"]', childName);
    await page.fill('div[role="dialog"] input[name="birthDate"]', "2018-01-01");
    await page.fill('div[role="dialog"] input[name="parentName"]', parentName);
    await page.fill(
      'div[role="dialog"] input[name="parentPhone"]',
      "081234567890",
    );
    await page.click(
      'div[role="dialog"] button:has-text("Simpan Pendaftaran")',
    );
    await page.waitForTimeout(1500);

    // Wait and check admission appears in list
    await page.goto("/ppdb", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`table >> text=${childName}`, {
      timeout: 10000,
    });
    const row = page
      .locator("table")
      .locator("tr", { hasText: childName })
      .first();
    await expect(row).toBeVisible();

    // Approve the admission (click Terima)
    const terimaBtn = row.locator('button:has-text("Terima")');
    await terimaBtn.click();
    await page.waitForTimeout(1500);

    // Verify student appears in student list
    await page.waitForTimeout(800);
    await page.goto("/siswa", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h2", { hasText: "Data Siswa" })).toBeVisible();
    await page.waitForSelector(`table >> text=${childName}`, {
      timeout: 10000,
    });
    await expect(
      page.locator("table").locator("tr", { hasText: childName }),
    ).toBeVisible();

    // Create invoice for the student
    await page.goto("/keuangan", { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Input Pembayaran SPP")).toBeVisible();

    // Open invoice modal, select student and submit
    await page.click('button:has-text("Buat Invoice Baru")');
    await page.selectOption('div[role="dialog"] select[name="studentId"]', {
      label: childName,
    });
    await page.fill('div[role="dialog"] input[name="amount"]', "50000");
    await page.click('div[role="dialog"] button:has-text("Simpan Invoice")');

    // Record payment using the first invoice in the list
    await page.waitForTimeout(800);
    // Open payment modal (modal moves server-rendered select into the portal)
    await page.click('button:has-text("Rekam Pembayaran")');
    const invoiceValue = await page
      .locator('div[role="dialog"] select[name="invoiceId"] option')
      .nth(1)
      .getAttribute("value");
    if (!invoiceValue) throw new Error("Invoice option not found");
    await page.selectOption(
      'div[role="dialog"] select[name="invoiceId"]',
      invoiceValue,
    );
    // Submit payment
    await page.fill('div[role="dialog"] input[name="amount"]', "50000");
    await page.click('div[role="dialog"] button:has-text("Simpan Pembayaran")');

    // Confirm invoice status updated on page
    await page.waitForTimeout(800);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.locator("table").locator("tr", { hasText: childName }),
    ).toContainText("Lunas");
  });
});
