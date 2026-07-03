import { expect, test } from "@playwright/test";

test("QR code redirects to its target and sets the attribution cookie", async ({
  browser,
}) => {
  // Real mobile UA — the /q route skips bots, and Playwright's default UA
  // contains "HeadlessChrome" which our bot filter treats as a bot.
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    extraHTTPHeaders: process.env.E2E_TEST_SECRET
      ? { "x-e2e-secret": process.env.E2E_TEST_SECRET }
      : {},
  });
  const page = await context.newPage();
  const seed = await page.request.post("/api/e2e/seed-campaign", {
    data: { code: "e2e-combi", target: "/clases-de-ingles-experiencias" },
  });
  expect(seed.ok()).toBeTruthy();

  await page.goto("/q/e2e-combi");
  await expect(page).toHaveURL(/\/clases-de-ingles-experiencias$/);

  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "tu_campaign")?.value).toBe(
    "e2e-combi"
  );
  await context.close();
});

test("teacher opens the campaigns dashboard and creates a code", async ({
  page,
}) => {
  await page.context().addCookies([
    {
      name: "teacher_session",
      value: "true",
      url: "http://127.0.0.1:7777",
      httpOnly: true,
    },
  ]);
  await page.goto("/teacher/campaigns");
  await expect(page.getByRole("heading", { name: /Campañas/ })).toBeVisible();

  await page.getByPlaceholder("combi-01").fill("e2e-flyer");
  await page.getByRole("button", { name: "Crear campaña" }).click();
  await expect(page.getByText("/q/e2e-flyer")).toBeVisible({ timeout: 15000 });
});
