#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm" ]]; then
  echo "Usage: $0 --confirm" >&2
  exit 1
fi

# Sample data: 10 reports, 3 photos per report
REPORTS=10
PHOTOS_PER=3
TOKENS_PER_REPORT=2000
COST_PER_1K_TOKENS=0.05
COST_PER_IMAGE=0.01

TOTAL_TOKENS=$((REPORTS * TOKENS_PER_REPORT))
TOTAL_IMAGES=$((REPORTS * PHOTOS_PER))
TOTAL_COST_TOKENS=$(echo "scale=2; $TOTAL_TOKENS / 1000 * $COST_PER_1K_TOKENS" | bc)
TOTAL_COST_IMAGES=$(echo "scale=2; $TOTAL_IMAGES * $COST_PER_IMAGE" | bc)
TOTAL_COST=$(echo "scale=2; $TOTAL_COST_TOKENS + $TOTAL_COST_IMAGES" | bc)

echo "AI Cost Estimate"
echo "==============="
echo "Reports: $REPORTS"
echo "Photos per report: $PHOTOS_PER"
echo "Total tokens: $TOTAL_TOKENS (~\$$TOTAL_COST_TOKENS)"
echo "Total images: $TOTAL_IMAGES (~\$$TOTAL_COST_IMAGES)"
echo "Total estimated cost: \$$TOTAL_COST"
