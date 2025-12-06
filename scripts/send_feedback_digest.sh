#!/bin/bash

# send_feedback_digest.sh
# Compiles unresolved feedback into reports/feedback_digest_<date>.md and optionally posts to a webhook.
# Usage: BASE_URL=https://api.mervo.app API_TOKEN=REPLACE_WEBHOOK ./scripts/send_feedback_digest.sh [--confirm]

set -euo pipefail

BASE_URL=${BASE_URL:-}
API_TOKEN=${API_TOKEN:-}
WEBHOOK_URL=${WEBHOOK_URL:-REPLACE_WEBHOOK_URL}
CONFIRM=false
DATE=$(date -I)
REPORT_DIR="reports"
REPORT_FILE="$REPORT_DIR/feedback_digest_${DATE}.md"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --confirm) CONFIRM=true; shift ;;
    -h|--help)
      echo "Usage: BASE_URL=... API_TOKEN=... ./send_feedback_digest.sh [--confirm]"; exit 0 ;;
    *) echo "Unknown arg $1"; exit 1 ;;
  esac
done

if [[ -z "$BASE_URL" || -z "$API_TOKEN" ]]; then
  echo "BASE_URL and API_TOKEN required" >&2; exit 1; fi

mkdir -p "$REPORT_DIR"
rm -f "$REPORT_FILE"
echo "# Feedback Digest ($DATE)" >> "$REPORT_FILE"
echo "- TODO: fetch unresolved feedback via API" >> "$REPORT_FILE"
echo "- Placeholder items; replace once API available" >> "$REPORT_FILE"

echo "Report written to $REPORT_FILE"

if [[ "$CONFIRM" == true ]]; then
  if [[ "$WEBHOOK_URL" == "REPLACE_WEBHOOK_URL" ]]; then
    echo "Webhook URL placeholder; skipping send" >&2; exit 0
  fi
  echo "Sending digest to webhook..."
  curl -s -X POST -H "Content-Type: text/plain" --data-binary @"$REPORT_FILE" "$WEBHOOK_URL" || true
else
  echo "Dry-run (no send). Pass --confirm to post.";
fi
