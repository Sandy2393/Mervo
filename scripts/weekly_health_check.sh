#!/bin/bash

# weekly_health_check.sh
# Non-destructive health probe. Requires BASE_URL and API_TOKEN. Writes reports/weekly_health_<date>.md.
# Usage: BASE_URL=https://api.mervo.app API_TOKEN=REPLACE ./scripts/weekly_health_check.sh

set -euo pipefail

BASE_URL=${BASE_URL:-}
API_TOKEN=${API_TOKEN:-}
DATE=$(date -I)
REPORT_DIR="reports"
REPORT_FILE="$REPORT_DIR/weekly_health_${DATE}.md"

if [[ -z "$BASE_URL" || -z "$API_TOKEN" ]]; then
  echo "BASE_URL and API_TOKEN are required" >&2
  exit 1
fi

mkdir -p "$REPORT_DIR"

header() { echo "## $1" >> "$REPORT_FILE"; }
kv() { echo "- $1: $2" >> "$REPORT_FILE"; }

rm -f "$REPORT_FILE"
echo "# Weekly Health Check ($DATE)" >> "$REPORT_FILE"

check_endpoint() {
  local name="$1" path="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $API_TOKEN" "$BASE_URL$path" || true)
  echo "$name status=$status" >> "$REPORT_FILE"
}

header "Endpoints"
check_endpoint "health" "/health"
check_endpoint "auth" "/v2/auth/token"
check_endpoint "jobs" "/v2/jobs"
check_endpoint "uploads" "/v2/uploads"

echo "" >> "$REPORT_FILE"
header "Error Budget Snapshot"
kv "Last 24h errors (placeholder)" "TODO: replace with monitoring API query"
kv "Burn rate (1h/6h)" "TODO"

echo "" >> "$REPORT_FILE"
header "Notes"
kv "Alerts triggered" "TODO: paste alerts from monitoring"
kv "Next actions" "TODO"

echo "Report written to $REPORT_FILE"
