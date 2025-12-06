#!/usr/bin/env bash
# Quick vulnerability scan template using nikto and nmap
# Requires: nikto, nmap installed locally or in CI image

set -euo pipefail

TARGET_URL=${1:-"REPLACE_BASE_URL"}

echo "Running quick scans against $TARGET_URL"

# Example nikto command (uncomment to run):
# nikto -h $TARGET_URL -output reports/nikto_report_$(date +%F).html

# Example nmap command (uncomment to run):
# nmap -sV -p- $TARGET_URL -oN reports/nmap_$(date +%F).txt

# For CI: parse results, fail on high severity findings

echo "This script is a template — install nikto/nmap and run commands above with the target URL."
exit 0
