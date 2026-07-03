export const E2E_SECRET_HEADER = "x-e2e-secret";

export function isAuthorizedE2ERequest(request: Request) {
  const secret = process.env.E2E_TEST_SECRET;
  if (!secret) return false;
  return request.headers.get(E2E_SECRET_HEADER) === secret;
}

/**
 * Stricter gate for helpers that MUTATE state or grant sessions (seed a
 * verified student, credits, teacher session, campaigns). These must never be
 * reachable on production/preview (both run NODE_ENV=production) even though
 * E2E_TEST_SECRET exists there — e2e runs against a local dev server.
 */
export function isE2ELocalRequest(request: Request) {
  if (process.env.NODE_ENV === "production") return false;
  return isAuthorizedE2ERequest(request);
}
