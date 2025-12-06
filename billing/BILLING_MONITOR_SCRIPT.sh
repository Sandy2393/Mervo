#!/usr/bin/env bash
set -euo pipefail

BUDGET_CENTS=${BUDGET_CENTS:-500000}
CURRENT_SPEND_CENTS=${CURRENT_SPEND_CENTS:-0}
WEBHOOK_URL=${WEBHOOK_URL:-""}
CONFIRM=${CONFIRM:-"false"}

if (( CURRENT_SPEND_CENTS > BUDGET_CENTS )); then
  echo "Spend exceeds budget: $CURRENT_SPEND_CENTS > $BUDGET_CENTS"
  if [[ "$CONFIRM" == "true" ]]; then
    echo "TODO: post alert to webhook $WEBHOOK_URL"
  else
    echo "Dry-run: set CONFIRM=true to notify"
  fi
else
  echo "Spend within budget: $CURRENT_SPEND_CENTS / $BUDGET_CENTS"
fi
