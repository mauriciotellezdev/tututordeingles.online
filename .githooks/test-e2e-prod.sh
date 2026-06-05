#!/usr/bin/env bash
set -euo pipefail

export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-https://tututordeingles.online}"

if [[ -z "${E2E_TEST_SECRET:-}" ]]; then
  echo "Set E2E_TEST_SECRET before running prod e2e." >&2
  exit 1
fi

bunx playwright test --config=playwright.prod.config.ts
