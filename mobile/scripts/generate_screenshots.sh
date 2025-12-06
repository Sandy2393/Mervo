#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm" ]]; then
  echo "This script only runs when invoked with --confirm to avoid accidental builds." >&2
  exit 0
fi

# Placeholder: update bundle identifiers and assets before running.

cd "$(dirname "$0")/../expo-app"
expo export --platform android --public-url https://example.com --non-interactive || true
# TODO: replace with `expo export --platform ios` and real CDN once configured

echo "Screenshot generation stub complete. Use Expo preview or simulator captures for store assets."
