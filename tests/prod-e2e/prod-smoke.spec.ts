import { expect, test, type APIRequestContext } from "@playwright/test";

const TEST_EMAIL =
  process.env.E2E_TEST_STUDENT_EMAIL || "e2e+prod@tututordeingles.online";
const TEST_NAME = process.env.E2E_TEST_STUDENT_NAME || "E2E Prod Student";
const TEST_PHONE = process.env.E2E_TEST_STUDENT_PHONE || "+52 55 5555 5555";

async function resetProdStudent(request: APIRequestContext) {
  await request.post("/api/e2e/reset", {
    data: {
      email: TEST_EMAIL,
    },
  });
}

async function fetchVerificationCode(request: APIRequestContext) {
  const response = await request.get(
    `/api/e2e/verification-code?email=${encodeURIComponent(TEST_EMAIL)}`
  );
  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as {
    success: boolean;
    code?: string;
  };
  expect(payload.success).toBeTruthy();
  expect(payload.code).toMatch(/^\d{6}$/);
  return payload.code as string;
}

test.describe.configure({ mode: "serial" });

test("production smoke: signup, quiz completion, and student dashboard", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await resetProdStudent(page.request);

  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: /Regístrate/ })).toBeVisible();

  await page.getByTestId("signup-name-input").fill(TEST_NAME);
  await page.getByTestId("signup-email-input").fill(TEST_EMAIL);
  await page.getByTestId("signup-phone-input").fill(TEST_PHONE);
  await page.getByTestId("signup-submit-button").click();

  await expect(page.getByTestId("signup-verify-form")).toBeVisible();

  const code = await fetchVerificationCode(page.request);
  await page.getByTestId("signup-code-input").fill(code);
  await page.getByTestId("signup-verify-button").click();

  await expect(page).toHaveURL(/\/placement-quiz$/);

  let questionCount = 0;
  while (true) {
    await expect(page.getByTestId("quiz-question-page")).toBeVisible();
    await expect(page.getByTestId("quiz-question-text")).toBeVisible();
    await page.getByTestId("quiz-answer-option").first().click();
    questionCount += 1;

    const nextButton = page.getByTestId("quiz-next-button");
    const buttonText = await nextButton.textContent();
    await nextButton.click();

    if (buttonText?.includes("Finalizar")) {
      break;
    }

    await expect(page).toHaveURL(/\/quiz\/placement\/question\/\d+$/);
  }

  expect(questionCount).toBeGreaterThan(0);
  await expect(page).toHaveURL(/\/quiz\/placement\/booking$/);
  await expect(page.getByText("Agenda tu Clase Demo Gratis")).toBeVisible();

  await page.goto("/student");
  await expect(page.getByTestId("student-dashboard")).toBeVisible();
  await expect(page.getByTestId("referral-card")).toBeVisible();
  await expect(page.getByTestId("quiz-result-card")).toBeVisible();
});
