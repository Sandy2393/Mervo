#!/bin/bash

# daily_cost_report.sh
# Aggregates usage summary and writes reports/cost_YYYYMMDD.md. Non-destructive; use --confirm to send notifications.
# Usage: ./scripts/daily_cost_report.sh [--confirm]

set -euo pipefail

CONFIRM=false
DATE=$(date +%Y%m%d)
REPORT_DIR="reports"
REPORT_FILE="$REPORT_DIR/cost_${DATE}.md"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --confirm) CONFIRM=true; shift;;
    -h|--help) echo "Usage: $0 [--confirm]"; exit 0;;
    *) echo "Unknown arg $1"; exit 1;;
  esac
done

mkdir -p "$REPORT_DIR"
cat > "$REPORT_FILE" <<EOF
# Daily Cost Report ($DATE)

## Summary
- TODO: insert totals from usageService / billing export

## Top Spenders
- TODO: list top companies by cost

## Anomalies
- TODO: detected spikes or drops

## Actions
- TODO: recommended optimizations
EOF

echo "Report written to $REPORT_FILE"

if [[ "$CONFIRM" == true ]]; then
  echo "[notify] TODO: send report to Slack/webhook"
else
  echo "Dry-run; not notifying"
fi
