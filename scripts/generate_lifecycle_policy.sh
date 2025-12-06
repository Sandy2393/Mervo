#!/bin/bash

# generate_lifecycle_policy.sh
# Prints lifecycle JSON for GCS/S3 based on retention days. Does NOT apply unless --apply is set.
# Usage: RETENTION_DAYS=180 ./scripts/generate_lifecycle_policy.sh [--apply]

set -euo pipefail

RETENTION_DAYS=${RETENTION_DAYS:-180}
APPLY=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) APPLY=true; shift ;;
    -h|--help) echo "Usage: RETENTION_DAYS=180 $0 [--apply]"; exit 0 ;;
    *) echo "Unknown arg $1"; exit 1 ;;
  esac
done

POLICY=$(cat <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {"age": 60}
      },
      {
        "action": {"type": "Delete"},
        "condition": {"age": ${RETENTION_DAYS}}
      }
    ]
  }
}
EOF
)

echo "$POLICY"

if [[ "$APPLY" == true ]]; then
  echo "[warn] APPLY requested but no provider specified. TODO: add gcloud/aws cli commands guarded with creds." >&2
  # TODO: gcloud storage buckets update gs://BUCKET --lifecycle-file=...
fi
