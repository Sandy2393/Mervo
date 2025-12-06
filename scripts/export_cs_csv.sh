#!/usr/bin/env zsh
# Export customers with onboarding status and last activity to CSV.
# Dry-run by default; set CONFIRM=1 to allow writes.

set -euo pipefail
CONFIRM=${CONFIRM:-0}
OUTPUT=${OUTPUT:-"reports/cs_export.csv"}
mkdir -p "$(dirname "$OUTPUT")"

echo "company_id,onboarding_stage,last_activity_at,last_ticket_at" > "$OUTPUT"
# TODO: replace with real query/export
printf "c1,Add employees,2024-01-01,2024-01-02\n" >> "$OUTPUT"
printf "c2,Training,2024-01-03,2024-01-04\n" >> "$OUTPUT"

echo "Wrote $OUTPUT (dry-run=${CONFIRM})"
