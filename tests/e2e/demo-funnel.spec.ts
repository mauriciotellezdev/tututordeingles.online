import { expect, test } from "@playwright/test";

// The free-demo funnel — the conversion path for cold QR traffic:
// quiz progress persists server-side (resume), and booking the free intro
// class reaches the confirmation page.

const BASE = "http://127.0.0.1:7777";

async function seedWithCookie(
  ctx: {
    request: {
      post: (
        url: string,
        opts: { data: Record<string, unknown> }
      ) => Promise<{ ok(): boolean; json(): Promise<unknown> }>;
    };
    addCookies: (
      cookies: {
        name: string;
        value: string;
        url: string;
        httpOnly: boolean;
      }[]
    ) => Promise<void>;
  },
  email: string,
  quizScore?: number
) {
  await ctx.request.post("/api/e2e/reset", { data: { email } });
  const res = await ctx.request.post("/api/e2e/seed-student", {
    data: { email, ...(quizScore !== undefined ? { quizScore } : {}) },
  });
  expect(res.ok()).toBeTruthy();
  const { studentId } = (await res.json()) as { studentId: string };
  await ctx.addCookies([
    { name: "student_id", value: studentId, url: BASE, httpOnly: true },
  ]);
  return studentId;
}

test("quiz progress persists server-side and resumes in a fresh browser", async ({
  browser,
  request,
}) => {
  const email = "e2e-quiz@example.com";
  const context = await browser.newContext({
    extraHTTPHeaders: process.env.E2E_TEST_SECRET
      ? { "x-e2e-secret": process.env.E2E_TEST_SECRET }
      : {},
  });
  const studentId = await seedWithCookie(
    { request: context.request, addCookies: (c) => context.addCookies(c) },
    email
  );
  const page = await context.newPage();

  // Answer question 1 → saveQuizProgressAction persists progress.
  await page.goto("/quiz/placement/question/1");
  await page.getByTestId("quiz-answer-option").first().click();
  await page.getByTestId("quiz-next-button").click();
  await expect(page).toHaveURL(/\/quiz\/placement\/question\/2/, {
    timeout: 15000,
  });
  await context.close();

  // Fresh context (no localStorage) — resume must come from the SERVER.
  // Before the quizProgress validator fix, the $set failed and this landed on
  // question 1 again.
  const fresh = await browser.newContext({
    extraHTTPHeaders: process.env.E2E_TEST_SECRET
      ? { "x-e2e-secret": process.env.E2E_TEST_SECRET }
      : {},
  });
  await fresh.addCookies([
    { name: "student_id", value: studentId, url: BASE, httpOnly: true },
  ]);
  const freshPage = await fresh.newPage();
  await freshPage.goto("/placement-quiz");
  await expect(freshPage).toHaveURL(/\/quiz\/placement\/question\/(?!1$)\d+/, {
    timeout: 15000,
  });
  await request.post("/api/e2e/reset", { data: { email } });
  await fresh.close();
});

test("student with quiz result books the free demo class", async ({
  page,
  request,
}) => {
  const email = "e2e-demo@example.com";
  await seedWithCookie(
    {
      request: page.request,
      addCookies: (c) => page.context().addCookies(c),
    },
    email,
    18
  );

  await page.goto("/quiz/placement/booking");
  // Pick the 4th available date (well past the 24h minimum) + a distinct slot
  // from other specs (paid-funnel uses 12:00) to avoid global slot clashes.
  // Date buttons live in the first grid on the page.
  await expect(
    page.locator("div.grid").first().locator("button").nth(3)
  ).toBeVisible({
    timeout: 15000,
  });
  await page.locator("div.grid").first().locator("button").nth(3).click();
  await page.getByRole("button", { name: "14:00" }).click();
  await page.getByRole("button", { name: /Agendar Clase Demo Gratis/ }).click();

  await expect(page).toHaveURL(/\/quiz\/placement\/confirmed/, {
    timeout: 20000,
  });
  await request.post("/api/e2e/reset", { data: { email } });
});
