#!/usr/bin/env bash
# Compare current DB schema to checked-in supabase_schema.sql
# Requires: pg_dump and a checked-in supabase_schema.sql file

set -euo pipefail

PG_CONN=${PG_CONN:-"postgres://USER:PASS@HOST:PORT/DBNAME"}

echo "Exporting live schema..."
# pg_dump -s --no-owner --no-privileges "$PG_CONN" | sed -e 's/OWNER TO .*;//g' > /tmp/current_schema.sql

# diff -u supabase_schema.sql /tmp/current_schema.sql || (echo "Schema mismatch" && exit 1)

echo "This script is a template. Uncomment pg_dump lines after setting PG_CONN and verifying environment and permissions."
