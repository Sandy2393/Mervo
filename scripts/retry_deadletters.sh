#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm" ]]; then
  echo "Usage: $0 --confirm" >&2
  exit 1
fi

# Placeholder: would query DB for dead-letter deliveries and re-enqueue
node server/integrations/webhookWorker.ts --run-once || true
