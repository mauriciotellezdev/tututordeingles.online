#!/usr/bin/env bash
set -euo pipefail

staging_url="${PLAYWRIGHT_BASE_URL:-${STAGING_URL:-}}"

if [[ -z "${staging_url}" ]]; then
  echo "Set STAGING_URL or PLAYWRIGHT_BASE_URL to your staging deployment URL." >&2
  exit 1
fi

export PLAYWRIGHT_BASE_URL="${staging_url}"
bun run test:e2e
