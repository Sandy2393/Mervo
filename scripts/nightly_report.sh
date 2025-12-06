#!/bin/bash

# nightly_report.sh
# Generates reports/nightly_<date>.md with key counts. Non-destructive. Exits non-zero on critical fetch failures.
# Usage: BASE_URL=https://api.mervo.app API_TOKEN=REPLACE ./scripts/nightly_report.sh

set -euo pipefail

BASE_URL=${BASE_URL:-}
API_TOKEN=${API_TOKEN:-}
DATE=$(date -I)
REPORT_DIR="reports"
REPORT_FILE="$REPORT_DIR/nightly_${DATE}.md"

if [[ -z "$BASE_URL" || -z "$API_TOKEN" ]]; then
  echo "BASE_URL and API_TOKEN are required" >&2
  exit 1
fi

mkdir -p "$REPORT_DIR"
rm -f "$REPORT_FILE"
echo "# Nightly Report ($DATE)" >> "$REPORT_FILE"

fetch_count() {
  local name="$1" path="$2"
  local status
  status=$(curl -s -o /tmp/${name}_resp.json -w "%{http_code}" -H "Authorization: Bearer $API_TOKEN" "$BASE_URL$path" || true)
  if [[ "$status" != "200" ]]; then
    echo "[crit] $name fetch failed status=$status" >&2
    return 1
  fi
  echo "- $name: TODO parse count" >> "$REPORT_FILE"
}

fetch_count "new_users" "/metrics/new_users?range=1d"
fetch_count "jobs_created" "/metrics/jobs_created?range=1d"
fetch_count "jobs_completed" "/metrics/jobs_completed?range=1d"
fetch_count "storage_bytes" "/metrics/storage_bytes"

echo "\n## Notes" >> "$REPORT_FILE"
echo "- TODO: replace with parsed counts from API" >> "$REPORT_FILE"

echo "Report written to $REPORT_FILE"
