import { expect, test } from "@playwright/test";

// Full signup funnel: form + consent → OTP → lands on the placement quiz.
// Relies on the /api/e2e/* helpers (guarded by E2E_TEST_SECRET) — reset the
// test student, and read the OTP the server generated (mail is bypassed for
// e2e requests). All requests carry x-e2e-secret via config extraHTTPHeaders.

const EMAIL = "e2e-signup@example.com";

test.beforeEach(async ({ request }) => {
  await request.post("/api/e2e/reset", { data: { email: EMAIL } });
});

test.afterEach(async ({ request }) => {
  await request.post("/api/e2e/reset", { data: { email: EMAIL } });
});

test("signup → OTP verify → lands on the placement quiz", async ({
  page,
  request,
}) => {
  await page.goto("/signup");

  await page.getByTestId("signup-name-input").fill("E2E Alumno");
  await page.getByTestId("signup-email-input").fill(EMAIL);
  await page.getByTestId("signup-phone-input").fill("5212223339230");
  await page.getByTestId("signup-consent-checkbox").check();
  await page.getByTestId("signup-submit-button").click();

  // Step 2 (code entry) appears once the account + code are created.
  await expect(page.getByTestId("signup-code-input")).toBeVisible({
    timeout: 20000,
  });

  // Read the generated code via the e2e helper (mail is bypassed for e2e).
  const res = await request.get(
    `/api/e2e/verification-code?email=${encodeURIComponent(EMAIL)}`
  );
  expect(res.ok()).toBeTruthy();
  const { code } = (await res.json()) as { code: string };
  expect(code).toMatch(/^\d{6}$/);

  await page.getByTestId("signup-code-input").fill(code);
  await page.getByTestId("signup-verify-button").click();

  await expect(page).toHaveURL(/\/placement-quiz/, { timeout: 20000 });
});
