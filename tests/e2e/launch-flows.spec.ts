import { expect, test } from "@playwright/test";

test("legal pages render (aviso, términos, reembolsos)", async ({ page }) => {
  await page.goto("/aviso-de-privacidad");
  await expect(
    page.getByRole("heading", { level: 1, name: "Aviso de Privacidad" })
  ).toBeVisible();

  await page.goto("/terminos");
  await expect(
    page.getByRole("heading", { level: 1, name: "Términos y Condiciones" })
  ).toBeVisible();

  await page.goto("/reembolsos");
  await expect(
    page.getByRole("heading", { level: 1, name: /Reembolsos/ })
  ).toBeVisible();
});

test("Tehuacán landing renders and routes its CTA to signup", async ({
  page,
}) => {
  await page.goto("/clases-de-ingles-en-tehuacan");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Tehuacán"
  );
  await page.locator('a[href="/signup"]').first().click();
  await expect(page).toHaveURL(/\/signup$/);
});

test("QR redirect sends an unknown code to the Tehuacán landing", async ({
  page,
}) => {
  await page.goto("/q/nonexistent-code-xyz");
  await expect(page).toHaveURL(/\/clases-de-ingles-en-tehuacan$/);
});

test("signup submit is blocked until the consent box is checked", async ({
  page,
}) => {
  await page.goto("/signup");
  await page.getByTestId("signup-name-input").fill("Test Alumno");
  await page
    .getByTestId("signup-email-input")
    .fill("consent-check@example.com");
  await page.getByTestId("signup-phone-input").fill("5212223339230");

  await expect(page.getByTestId("signup-submit-button")).toBeDisabled();
  await page.getByTestId("signup-consent-checkbox").check();
  await expect(page.getByTestId("signup-submit-button")).toBeEnabled();
});
