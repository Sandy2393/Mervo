#!/usr/bin/env bash
# DB backup to local file and optional upload to cloud storage (placeholder)
# Requires: pg_dump, aws CLI or gcloud (commented)

set -euo pipefail

PG_CONN=${PG_CONN:-"postgres://USER:PASS@HOST:PORT/DBNAME"}
OUT_DIR=${OUT_DIR:-"./backups"}
mkdir -p "$OUT_DIR"

DATE=$(date +%F_%H%M)
FILENAME="mervo_backup_${DATE}.sql.gz"

echo "Running pg_dump to $OUT_DIR/$FILENAME"
# Uncomment and configure secure method to fetch credentials in CI/Server
# pg_dump "$PG_CONN" | gzip > "$OUT_DIR/$FILENAME"

# Example: upload to S3 or GCS (requires proper auth & bucket)
# aws s3 cp "$OUT_DIR/$FILENAME" s3://your-backup-bucket/$FILENAME
# or
# gcloud auth activate-service-account --key-file=/path/to/key.json
# gsutil cp "$OUT_DIR/$FILENAME" gs://your-backup-bucket/$FILENAME

echo "Backup script is a template; replace PG_CONN and uncomment actual pg_dump lines after verifying credentials and storage destination."
