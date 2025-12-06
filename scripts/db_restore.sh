#!/usr/bin/env bash
# DB restore template using pg_restore / psql
# WARNING: Ensure you restore to a non-production or isolated environment. Follow security and backup policies.

set -euo pipefail

FILE=${1:-""}
PG_CONN=${PG_CONN:-"postgres://USER:PASS@HOST:PORT/DBNAME"}

if [[ -z "$FILE" ]]; then
  echo "Usage: $0 backup-file.sql.gz"
  exit 1
fi

echo "Restoring $FILE to $PG_CONN"
# Decompress and restore
# gunzip -c "$FILE" | psql "$PG_CONN"

echo "Restore script is a template — validate target database and credentials before running. Consider running in a transaction or temporary DB for verification."
