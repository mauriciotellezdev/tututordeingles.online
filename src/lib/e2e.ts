export const E2E_SECRET_HEADER = "x-e2e-secret";

export function isAuthorizedE2ERequest(request: Request) {
  const secret = process.env.E2E_TEST_SECRET;
  if (!secret) return false;
  return request.headers.get(E2E_SECRET_HEADER) === secret;
}
