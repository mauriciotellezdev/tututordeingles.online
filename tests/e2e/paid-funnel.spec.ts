import { expect, test, type Page } from "@playwright/test";

// Serial: these book real slots against the local DB; running in parallel could
// race on the same hour. Each test reseeds (which resets the student's sessions).
test.describe.configure({ mode: "serial" });

const EMAIL = "e2e-paid@example.com";

async function seedLoggedIn(page: Page, credits: number) {
  await page.request.post("/api/e2e/reset", { data: { email: EMAIL } });
  const res = await page.request.post("/api/e2e/seed-student", {
    data: { email: EMAIL, credits, quizScore: 15 },
  });
  expect(res.ok()).toBeTruthy();
  const { studentId } = (await res.json()) as { studentId: string };
  await page.context().addCookies([
    {
      name: "student_id",
      value: studentId,
      url: "http://127.0.0.1:7777",
      httpOnly: true,
    },
  ]);
}

test.afterAll(async ({ request }) => {
  await request.post("/api/e2e/reset", { data: { email: EMAIL } });
});

test("book a paid class with credits, then cancel it", async ({ page }) => {
  await seedLoggedIn(page, 3);
  await page.goto("/student");

  const card = page.getByTestId("booking-card");
  await expect(card).toBeVisible();
  // 3rd available date (comfortably >24h out) + a midday slot.
  await card.locator("button").nth(2).click();
  await card.getByRole("button", { name: "12:00" }).click();
  await card.getByRole("button", { name: /Agendar clase/ }).click();

  await expect(page.getByText("¡Clase agendada!")).toBeVisible({
    timeout: 15000,
  });
  const sessions = page.getByTestId("sessions-card");
  await expect(sessions).toBeVisible();

  page.on("dialog", (d) => d.accept());
  await sessions.getByRole("button", { name: "Cancelar" }).first().click();
  await expect(page.getByText(/Clase cancelada/)).toBeVisible({
    timeout: 15000,
  });
});

test("dashboard shows buy options for a student with no credits", async ({
  page,
}) => {
  await seedLoggedIn(page, 0);
  await page.goto("/student");

  // Checkout itself is validated via the owner "Pagos de prueba" tool — a real
  // Stripe call is an external dependency we don't want in the commit hook, and
  // local .env.local blanks the Stripe key. Here we just verify the buy UI
  // renders and gates booking behind credits.
  const credits = page.getByTestId("credits-card");
  await expect(credits.getByRole("button", { name: /Comprar/ })).toHaveCount(2);
  await expect(page.getByText("Necesitas créditos para agendar")).toBeVisible();
});
