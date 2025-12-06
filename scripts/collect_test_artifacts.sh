#!/usr/bin/env bash
set -euo pipefail
mkdir -p artifacts
cp -r test-results artifacts/ || true
cp -r coverage artifacts/ || true
cp -r playwright-report artifacts/ || true
echo "Artifacts collected in ./artifacts"
