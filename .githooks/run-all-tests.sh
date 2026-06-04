#!/usr/bin/env bash
set -euo pipefail

bun run test:unit
bun run test:integration
bun run test:e2e
