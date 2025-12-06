#!/usr/bin/env bash
set -euo pipefail
cat <<'EOF'
{
  "node_versions": ["18", "20"],
  "browsers": ["chromium", "webkit"],
  "locales": ["en-US", "fr-FR"]
}
EOF
