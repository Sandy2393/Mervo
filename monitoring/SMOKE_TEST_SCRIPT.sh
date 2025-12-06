#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-"https://app.example.com"}
TOKEN=${TOKEN:-"REPLACE_TOKEN"}
ADMIN_TOKEN=${ADMIN_TOKEN:-"REPLACE_ADMIN_TOKEN"}
CONFIRM=${CONFIRM:-"false"}
RESULTS_FILE=${RESULTS_FILE:-"reports/smoke_results.json"}

mkdir -p "$(dirname "$RESULTS_FILE")"

fail() { echo "$1"; exit 1; }

run() {
  name=$1
  shift
  if "$@"; then echo "PASS $name"; else echo "FAIL $name"; return 1; fi
}

run "health" curl -fsS "$BASE_URL/health"
run "whoami_expected_401" bash -c "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/api/auth/whoami | grep -q '^401'$"
run "job_create" curl -fsS -X POST "$BASE_URL/api/jobs" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"Launch job"}'
run "admin_reports" curl -fsS "$BASE_URL/api/admin/reports" -H "Authorization: Bearer $ADMIN_TOKEN"

STATUS=$?

cat > "$RESULTS_FILE" <<EOF
{
  "base_url": "$BASE_URL",
  "status": $STATUS,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "Results written to $RESULTS_FILE"

if [[ "$CONFIRM" == "true" ]]; then
  echo "TODO: upload $RESULTS_FILE to remote storage"
else
  echo "Dry-run: skipping upload (set CONFIRM=true to upload)"
fi

exit $STATUS
