import { expect, test } from "@playwright/test";

test("home footer exposes the interview SEO hub while the header stays clean", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("header").getByRole("link", { name: "Entrevistas" })).toHaveCount(0);
  await expect(page.locator("header").getByRole("link", { name: "Guía en español" })).toHaveCount(0);
  await expect(page.locator("footer").getByRole("link", { name: "Guía en español" })).toBeVisible();
  await expect(page.locator("footer").getByRole("link", { name: "English version" })).toBeVisible();
});

test("Spanish interview hub shows English summary and alternate language link", async ({ page }) => {
  await page.goto("/ingles-para-entrevistas-de-trabajo");

  await expect(page.getByRole("heading", { name: "Inglés para Entrevistas de Trabajo" })).toBeVisible();
  await expect(page.getByText("Quick summary in English:")).toBeVisible();
  await expect(page.getByText("Job interviews in English are different from interviews in Spanish.")).toBeVisible();
  await expect(page.getByRole("link", { name: "English for Job Interviews" })).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-interviews-es\.png$/);
});

test("English interview hub shows Spanish summary and alternate language link", async ({ page }) => {
  await page.goto("/english-for-job-interviews");

  await expect(page.getByRole("heading", { name: "English for Job Interviews" })).toBeVisible();
  await expect(page.getByText("Resumen en español:")).toBeVisible();
  await expect(page.getByText("Las entrevistas de trabajo en ingles son diferentes a las entrevistas en espanol.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Inglés para Entrevistas de Trabajo" })).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-default\.svg$/);
});
