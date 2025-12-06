#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm" ]]; then
  echo "Usage: $0 --confirm <flagKey>" >&2
  exit 1
fi

flagKey="${2:-}"
if [[ -z "$flagKey" ]]; then
  echo "Provide flag key" >&2
  exit 1
fi

# Placeholder: integrate with persistence (Supabase/Edge Function) to set rollout to 0% and disable flag.
echo "TODO: call admin endpoint to disable $flagKey and record audit."
