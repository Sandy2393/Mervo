#!/usr/bin/env bash
# Deploy frontend to Vercel or Cloud Run static hosting
# Usage: ./frontend_deploy.sh <environment> [--confirm]
# Environments: preview, staging, production
# Defaults to dry-run unless --confirm is passed
# Expected env: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

set -euo pipefail

ENVIRONMENT=${1:-"preview"}
CONFIRM=false

for arg in "$@"; do
  if [[ "$arg" == "--confirm" ]]; then
    CONFIRM=true
  fi
done

if [[ ! "$ENVIRONMENT" =~ ^(preview|staging|production)$ ]]; then
  echo "Usage: ./frontend_deploy.sh <environment> [--confirm]"
  echo ""
  echo "Environments: preview, staging, production"
  echo "Defaults to dry-run. Use --confirm for live deploy."
  exit 1
fi

echo "=== Frontend Deployment ==="
echo "Environment: $ENVIRONMENT"
echo "Mode:        $([ "$CONFIRM" = true ] && echo "LIVE" || echo "DRY-RUN")"
echo ""

if [[ "$CONFIRM" != true ]]; then
  echo "⚠️  DRY-RUN MODE: Deployment will be simulated."
  echo "   Use --confirm flag to execute live deployment."
  echo ""
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "⚠️  Vercel CLI not found. Installing globally..."
  npm install -g vercel
fi

# Set Vercel env vars
VERCEL_TOKEN=${VERCEL_TOKEN:-""}
VERCEL_ORG_ID=${VERCEL_ORG_ID:-""}
VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID:-""}

if [[ -z "$VERCEL_TOKEN" ]]; then
  echo "Error: VERCEL_TOKEN env var is required"
  exit 1
fi

# Build frontend
echo "📦 Building frontend..."
if [[ "$CONFIRM" = true ]]; then
  npm run build
else
  echo "   [DRY-RUN] Would run: npm run build"
fi

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel ($ENVIRONMENT)..."

VERCEL_CMD="vercel deploy --token=$VERCEL_TOKEN --yes"

if [[ "$ENVIRONMENT" == "production" ]]; then
  VERCEL_CMD="$VERCEL_CMD --prod"
  echo "   Deploying to production domain"
else
  echo "   Deploying to preview URL"
fi

if [[ "$CONFIRM" = true ]]; then
  DEPLOYMENT_URL=$(eval "$VERCEL_CMD")
  echo ""
  echo "✅ Deployment complete!"
  echo "   URL: $DEPLOYMENT_URL"
  
  # Run smoke test
  echo ""
  echo "Running smoke test..."
  if curl -f "$DEPLOYMENT_URL" > /dev/null 2>&1; then
    echo "   ✅ Smoke test passed"
  else
    echo "   ⚠️  Smoke test failed - please verify manually"
  fi
else
  echo "   [DRY-RUN] Would run: $VERCEL_CMD"
  echo ""
  echo "✅ DRY-RUN complete. Re-run with --confirm to deploy."
fi

# Alternative: Deploy to Cloud Run static hosting
# Uncomment if using Cloud Run instead of Vercel
#
# echo "🚀 Deploying to Cloud Run static hosting..."
# GCP_PROJECT_ID=${GCP_PROJECT_ID:-""}
# if [[ -z "$GCP_PROJECT_ID" ]]; then
#   echo "Error: GCP_PROJECT_ID env var is required"
#   exit 1
# fi
#
# IMAGE_NAME="gcr.io/$GCP_PROJECT_ID/frontend-$ENVIRONMENT:latest"
# 
# if [[ "$CONFIRM" = true ]]; then
#   gcloud builds submit --tag "$IMAGE_NAME"
#   gcloud run deploy "frontend-$ENVIRONMENT" \
#     --image "$IMAGE_NAME" \
#     --platform managed \
#     --region us-central1 \
#     --allow-unauthenticated
# else
#   echo "   [DRY-RUN] Would deploy to Cloud Run"
# fi
