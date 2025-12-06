#!/bin/bash

# create_demo_accounts.sh
# Seed a few demo users/companies via Supabase REST Admin API.
# Safe by default: requires --confirm to execute writes.
# Dependencies: curl, jq

set -euo pipefail

DRY_RUN=true
SUPABASE_URL="${SUPABASE_URL:-}"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

usage() {
  cat <<'EOF'
Usage: ./create_demo_accounts.sh [--confirm]

Env vars required (non-prod only):
  SUPABASE_URL               e.g., https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY  service role key (do NOT use anon)

Flags:
  --confirm   actually create accounts (default is dry-run)

Creates:
  - 1 admin user
  - 2 company owners
  - 3 contractors

Notes:
  - Uses auth admin API; requires service role key
  - Idempotent: skips creation if email already exists
  - Emails/passwords are placeholders — change before production
EOF
}

log() { printf "[create-demo] %s\n" "$*"; }
fail() { echo "[create-demo][error] $*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --confirm) DRY_RUN=false; shift;;
    -h|--help) usage; exit 0;;
    *) fail "Unknown flag $1";;
  esac
done

[[ -n "$SUPABASE_URL" ]] || fail "SUPABASE_URL not set"
[[ -n "$SERVICE_ROLE_KEY" ]] || fail "SUPABASE_SERVICE_ROLE_KEY not set"

AUTH_ENDPOINT="$SUPABASE_URL/auth/v1/admin/users"

create_user() {
  local email="$1"; local password="$2"; local role="$3"; local metadata="$4"
  if [[ "$DRY_RUN" == true ]]; then
    log "[dry-run] would create user email=$email role=$role"
    return
  fi
  log "creating $email ($role)"
  http_status=$(curl -s -o /tmp/create_user_resp.json -w "%{http_code}" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"email_confirm\":true,\"user_metadata\":$metadata}" \
    "$AUTH_ENDPOINT")
  if [[ "$http_status" == "409" ]]; then
    log "exists, skipping: $email"
  elif [[ "$http_status" != "200" && "$http_status" != "201" ]]; then
    log "response: $(cat /tmp/create_user_resp.json)"
    fail "failed to create $email (status $http_status)"
  else
    log "created $email"
  fi
}

log "starting demo account creation (dry-run=$DRY_RUN)"

create_user "admin.demo@mervo.app" "AdminPass!234" "admin" '{"role":"admin","company":"Mervo Demo"}'
create_user "owner.alpha@mervo.app" "OwnerAlpha!234" "owner" '{"role":"owner","company":"Alpha Services"}'
create_user "owner.beta@mervo.app" "OwnerBeta!234" "owner" '{"role":"owner","company":"Beta Works"}'
create_user "contractor.lee@mervo.app" "Contractor1!" "contractor" '{"role":"contractor","skills":["install","repair"]}'
create_user "contractor.sam@mervo.app" "Contractor2!" "contractor" '{"role":"contractor","skills":["inspection"]}'
create_user "contractor.jules@mervo.app" "Contractor3!" "contractor" '{"role":"contractor","skills":["maintenance","reporting"]}'

log "done"
