#!/bin/bash

# SMOKE_TEST_SCRIPT.sh
# Lightweight post-deploy smoke tests. Requires curl and jq.
# Usage: BASE_URL=https://api.mervo.app TOKEN=... ./SMOKE_TEST_SCRIPT.sh

set -euo pipefail

BASE_URL=${BASE_URL:-}
TOKEN=${TOKEN:-}

if [[ -z "$BASE_URL" ]]; then
  echo "BASE_URL is required" >&2; exit 1; fi
if [[ -z "$TOKEN" ]]; then
  echo "TOKEN (Bearer) is required" >&2; exit 1; fi

pass=0; fail=0
check() {
  local name="$1"; shift
  if "$@"; then
    echo "[PASS] $name"; pass=$((pass+1))
  else
    echo "[FAIL] $name"; fail=$((fail+1))
  fi
}

api_get() { curl -sSf -H "Authorization: Bearer $TOKEN" "$BASE_URL$1"; }
api_post() { curl -sSf -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$2" "$BASE_URL$1"; }

check "health" api_get "/health"
check "list jobs" api_get "/v2/jobs"
check "list contractors" api_get "/v2/contractors"

# create a tiny job
job_payload='{"title":"Smoke Test Job","status":"open","companyId":"00000000-0000-0000-0000-000000000000"}'
check "create job" api_post "/v2/jobs" "$job_payload"

# summary
if [[ $fail -eq 0 ]]; then
  echo "Smoke tests passed ($pass)"; exit 0
else
  echo "Smoke tests failed ($fail failures, $pass passed)"; exit 1
fi
