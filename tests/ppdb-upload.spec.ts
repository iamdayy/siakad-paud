import { expect, test } from "@playwright/test";

function unique(prefix = "e2e") {
  return `${prefix}-${Date.now().toString(36).slice(-6)}`;
}

test("PPDB public upload flow (stubbed presign)", async ({ page }) => {
  test.setTimeout(120000);

  const childName = unique("child");
  const parentName = unique("parent");

  // stub upload-url to return fake signed PUT URL and key
  await page.route("**/api/ppdb/upload-url", async (route) => {
    const body = {
      ok: true,
      urls: [
        {
          url: "https://fake-signed.example/put1",
          key: `ppdb/test-${Date.now()}-file.pdf`,
          publicUrl: "https://r2.example/bucket/ppdb/test-file.pdf",
        },
      ],
    };
    await route.fulfill({
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  });

  // stub the actual PUT to the signed url
  await page.route("https://fake-signed.example/put1", async (route) => {
    await route.fulfill({ status: 200 });
  });

  // Visit public form
  await page.goto("/ppdb-public", { waitUntil: "domcontentloaded" });
  await page.fill('input[name="childName"]', childName);
  await page.fill('input[name="birthDate"]', "2019-05-01");
  await page.fill('input[name="parentName"]', parentName);
  await page.fill('input[name="parentPhone"]', "081234567890");

  // attach a small fake PDF
  const pdf = Buffer.from(
    "%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n",
  );
  await page.setInputFiles('input[name="documents"]', {
    name: "test.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });

  await Promise.all([
    page.waitForURL("**/ppdb-public/thanks", { timeout: 10000 }),
    page.click('button:has-text("Kirim Pendaftaran")'),
  ]);

  // Now login as admin and check admission appears
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await Promise.all([
    page.waitForURL("**/dashboard", { timeout: 15000 }),
    page.click('button:has-text("Masuk")'),
  ]);

  await page.goto("/ppdb", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(`table >> text=${childName}`, { timeout: 10000 });
  const row = page
    .locator("table")
    .locator("tr", { hasText: childName })
    .first();
  await expect(row).toBeVisible();
});
