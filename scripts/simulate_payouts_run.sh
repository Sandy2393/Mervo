#!/usr/bin/env zsh
# Simulate payout batch processing. Defaults to dry-run. Use --confirm to actually process.
# Expected env: API_BASE (optional)

set -euo pipefail
API_BASE=${API_BASE:-"http://localhost:3000/api/payments"}
CONFIRM=false

for arg in "$@"; do
  if [[ "$arg" == "--confirm" ]]; then
    CONFIRM=true
  fi
done

echo "Running payout batch processing (dry-run=$([[ "$CONFIRM" == true ]] && echo false || echo true))"

# TODO: fetch pending batch IDs from backend; placeholder uses env BATCH_ID
if [[ -z "${BATCH_ID:-}" ]]; then
  echo "Set BATCH_ID env to target a batch. Exiting."
  exit 1
fi

DRY_RUN_FLAG=$([[ "$CONFIRM" == true ]] && echo "false" || echo "true")

curl -s -X POST "$API_BASE/payout-batches/$BATCH_ID/process" \
  -H 'Content-Type: application/json' \
  -d "{\"confirm\": $CONFIRM, \"dryRun\": $DRY_RUN_FLAG}" | jq .

if [[ "$CONFIRM" != true ]]; then
  echo "NOTE: This was a dry-run. Re-run with --confirm to execute live payouts."
fi
