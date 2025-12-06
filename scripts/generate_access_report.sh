#!/bin/bash

# generate_access_report.sh
# Generates a placeholder access review CSV at reports/access_review_<date>.csv.
# Usage: ./scripts/generate_access_report.sh

set -euo pipefail

DATE=$(date -I)
REPORT_DIR="reports"
FILE="$REPORT_DIR/access_review_${DATE}.csv"

mkdir -p "$REPORT_DIR"

cat > "$FILE" <<'EOF'
user_account_id,email,company_id,role,last_login,active,reviewed,notes
u-1,admin@example.com,company-1,admin,2025-12-01T00:00:00Z,true,false,
u-2,ops@example.com,company-1,ops,2025-12-02T00:00:00Z,true,false,
EOF

echo "Wrote $FILE"
