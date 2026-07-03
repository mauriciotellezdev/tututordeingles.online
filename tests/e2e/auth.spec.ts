import { expect, test } from "@playwright/test";

// Login OTP for a returning student. Uses the `request` fixture (isolated from
// the page's cookies) to seed a verified student, so the page starts logged out.
const EMAIL = "e2e-login@example.com";

test.afterEach(async ({ request }) => {
  await request.post("/api/e2e/reset", { data: { email: EMAIL } });
});

test("returning student logs in via OTP and lands on the dashboard", async ({
  page,
  request,
}) => {
  await request.post("/api/e2e/reset", { data: { email: EMAIL } });
  await request.post("/api/e2e/seed-student", {
    data: { email: EMAIL, quizScore: 15 },
  });

  await page.goto("/login");
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.getByRole("button", { name: /Recibir Código/i }).click();

  const codeInput = page.locator('input[inputmode="numeric"]');
  await expect(codeInput).toBeVisible({ timeout: 15000 });

  const res = await request.get(
    `/api/e2e/verification-code?email=${encodeURIComponent(EMAIL)}`
  );
  expect(res.ok()).toBeTruthy();
  const { code } = (await res.json()) as { code: string };
  await codeInput.fill(code);
  await page.getByRole("button", { name: /Ingresar a mi Cuenta/i }).click();

  await expect(page).toHaveURL(/\/student/, { timeout: 15000 });
});
