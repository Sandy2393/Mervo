#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FLAGS_FILE="$ROOT/flags/flags.json"

if ! command -v jq >/dev/null; then
  echo "jq required" >&2
  exit 1
fi

declare -A defined
while read -r key; do
  defined["$key"]=1
done < <(jq -r '.flags[].key' "$FLAGS_FILE")

missing=0
while read -r ref; do
  if [[ -z "$ref" ]]; then continue; fi
  if [[ -z "${defined[$ref]:-}" ]]; then
    echo "Referenced flag not defined: $ref"
    missing=1
  fi
done < <(grep -Rho "getFeatureVariant\\(['\"]\([a-zA-Z0-9_-]*\)" "$ROOT/src" | sed -E "s/.*getFeatureVariant['\"]([a-zA-Z0-9_-]*)/\1/")

if [[ $missing -ne 0 ]]; then
  echo "Undefined flags detected." >&2
  exit 2
fi

echo "All referenced flags are defined."
