#!/usr/bin/env bash
set -euo pipefail
npm run dev &
DEV_PID=$!
trap "kill $DEV_PID" EXIT
npm run seed:test || true
npx playwright test --config e2e/playwright.config.ts "$@"
