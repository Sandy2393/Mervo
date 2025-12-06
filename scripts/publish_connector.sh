#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm" ]]; then
  echo "Usage: $0 --confirm <connector_dir>" >&2
  exit 1
fi

DIR="$2"
if [[ -z "$DIR" ]]; then
  echo "Provide connector directory" >&2
  exit 1
fi

if ! command -v jq >/dev/null; then
  echo "jq required" >&2
  exit 1
fi

MANIFEST="$DIR/manifest.json"
if [[ ! -f "$MANIFEST" ]]; then
  echo "manifest.json missing" >&2
  exit 1
fi

jq . "$MANIFEST" >/dev/null

OUTDIR="$(cd "$(dirname "$0")/.." && pwd)/dist"
mkdir -p "$OUTDIR"
ZIP="$OUTDIR/$(basename "$DIR").zip"
rm -f "$ZIP"
(cd "$DIR" && zip -r "$ZIP" .)

echo "Packaged to $ZIP (no publish)."
