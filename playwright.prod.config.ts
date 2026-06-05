import { defineConfig } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || "https://tututordeingles.online";
const automationBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const e2eSecret = process.env.E2E_TEST_SECRET;

const extraHTTPHeaders = {
  ...(automationBypassSecret
    ? {
        "x-vercel-protection-bypass": automationBypassSecret,
        "x-vercel-set-bypass-cookie": "true",
      }
    : {}),
  ...(e2eSecret ? { "x-e2e-secret": e2eSecret } : {}),
};

export default defineConfig({
  testDir: "./tests/prod-e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    ...(Object.keys(extraHTTPHeaders).length > 0 ? { extraHTTPHeaders } : {}),
  },
});
