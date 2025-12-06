#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-"http://localhost:3000"}
ENDPOINT="${API_BASE%/}/api/tests/prelaunch"
CONFIRM=false

for arg in "$@"; do
  if [[ "$arg" == "--confirm" ]]; then
    CONFIRM=true
  fi
done

echo "Running prelaunch readiness via ${ENDPOINT}"
RESULT=$(curl -sS "$ENDPOINT")
STATUS=$(echo "$RESULT" | jq -r '.status // "UNKNOWN"')

echo "Raw result: $RESULT"

if [[ "$STATUS" == "FAIL" ]]; then
  echo "FAIL: readiness suite failed"
  exit 1
fi

if [[ "$CONFIRM" == "true" ]]; then
  echo "READY: suite status=$STATUS with confirm flag"
else
  echo "WARN: suite status=$STATUS but --confirm not provided; not marking ready"
  exit 1
fi
