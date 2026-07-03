import { expect, test } from "@playwright/test";

test("health endpoint reports ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect((await res.json()).status).toBe("ok");
});

test("experiences landing page renders", async ({ page }) => {
  await page.goto("/clases-de-ingles-experiencias");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "experiencias"
  );
});

test("cookie consent banner appears, accepts, and persists", async ({
  page,
}) => {
  await page.goto("/");
  const accept = page.getByRole("button", { name: "Aceptar" });
  await expect(accept).toBeVisible();
  await accept.click();
  await expect(accept).toBeHidden();

  await page.reload();
  await expect(page.getByRole("button", { name: "Aceptar" })).toBeHidden();
});
