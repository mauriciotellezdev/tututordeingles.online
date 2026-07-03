import { expect, test } from "@playwright/test";

// The full referral loop against the REAL database + validators:
// referrer's link → referred signs up via the UI → referred pays (real
// processCompletedPayment pipeline, Stripe simulated) → referrer earns the
// bonus credit and sees the conversion on their dashboard.

const REFERRER = "e2e-referrer@example.com";
const REFERRED = "e2e-referred@example.com";
const BASE = "http://127.0.0.1:7777";

test.afterEach(async ({ request }) => {
  await request.post("/api/e2e/reset", { data: { email: REFERRED } });
  await request.post("/api/e2e/reset", { data: { email: REFERRER } });
});

test("referral: signup via link + first payment awards the referrer", async ({
  page,
  browser,
  request,
}) => {
  await request.post("/api/e2e/reset", { data: { email: REFERRED } });
  await request.post("/api/e2e/reset", { data: { email: REFERRER } });

  // Seed the referrer and grab their code.
  const seed = await request.post("/api/e2e/seed-student", {
    data: { email: REFERRER, name: "E2E Referrer", quizScore: 20 },
  });
  expect(seed.ok()).toBeTruthy();
  const { studentId: referrerId, referralCode } = (await seed.json()) as {
    studentId: string;
    referralCode: string;
  };
  expect(referralCode).toBeTruthy();

  // Referred student signs up through the real UI with ?ref=<code>.
  await page.goto(`/signup?ref=${referralCode}`);
  await page.getByTestId("signup-name-input").fill("E2E Referred");
  await page.getByTestId("signup-email-input").fill(REFERRED);
  await page.getByTestId("signup-phone-input").fill("5210001112223");
  await page.getByTestId("signup-consent-checkbox").check();
  await page.getByTestId("signup-submit-button").click();
  await expect(page.getByTestId("signup-code-input")).toBeVisible({
    timeout: 20000,
  });
  const codeRes = await request.get(
    `/api/e2e/verification-code?email=${encodeURIComponent(REFERRED)}`
  );
  const { code } = (await codeRes.json()) as { code: string };
  await page.getByTestId("signup-code-input").fill(code);
  await page.getByTestId("signup-verify-button").click();
  await expect(page).toHaveURL(/\/placement-quiz/, { timeout: 20000 });

  // First payment for the referred student — real pipeline, unique intent id.
  const pay = await request.post("/api/e2e/simulate-payment", {
    data: {
      email: REFERRED,
      planType: "single",
      paymentIntentId: `pi_e2e_${Date.now()}`,
    },
  });
  expect(pay.ok()).toBeTruthy();
  expect(((await pay.json()) as { success: boolean }).success).toBe(true);

  // Referred student got their purchased credit.
  await page.goto("/student");
  await expect(
    page.getByTestId("credits-card").locator("p.text-3xl")
  ).toHaveText("1", { timeout: 15000 });

  // Referrer sees 1 invite, 1 paid conversion, 1 bonus credit.
  const referrerCtx = await browser.newContext({
    extraHTTPHeaders: process.env.E2E_TEST_SECRET
      ? { "x-e2e-secret": process.env.E2E_TEST_SECRET }
      : {},
  });
  await referrerCtx.addCookies([
    { name: "student_id", value: referrerId, url: BASE, httpOnly: true },
  ]);
  const referrerPage = await referrerCtx.newPage();
  await referrerPage.goto("/student");
  const stats = referrerPage.getByTestId("referral-card").locator("p.text-2xl");
  await expect(stats).toHaveText(["1", "1", "1"], { timeout: 15000 });
  await referrerCtx.close();
});
