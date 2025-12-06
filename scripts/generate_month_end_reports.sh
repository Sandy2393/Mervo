#!/usr/bin/env zsh
# Generate month-end financial report (payments, payouts, invoices)
# Writes to reports/monthly_financial_YYYYMM.md

set -euo pipefail
MONTH=${MONTH:-$(date +%Y%m)}
REPORT_DIR="reports"
REPORT_FILE="$REPORT_DIR/monthly_financial_${MONTH}.md"
mkdir -p "$REPORT_DIR"

cat > "$REPORT_FILE" <<'EOF'
# Monthly Financial Report (placeholder)

- Month: ${MONTH}
- Generated at: $(date -Iseconds)

## Payments
TODO: Insert payments summary CSV or table.

## Payouts
TODO: Insert payouts summary and status breakdown.

## Invoices
TODO: Insert issued/paid invoices summary.

## Notes
- Replace placeholders by calling backend export endpoints.
- Ensure data pulled from production replica.
EOF

echo "Wrote $REPORT_FILE"
