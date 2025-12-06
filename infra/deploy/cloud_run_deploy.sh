#!/usr/bin/env bash
# Deploy backend to Google Cloud Run
# Usage: ./cloud_run_deploy.sh <service_name> <region> <image_tag> [--confirm]
# Defaults to dry-run unless --confirm is passed
# Expected env: GCP_PROJECT_ID, GCP_SERVICE_ACCOUNT_KEY (for auth)

set -euo pipefail

SERVICE_NAME=${1:-""}
REGION=${2:-"us-central1"}
IMAGE_TAG=${3:-"latest"}
CONFIRM=false

# Parse arguments
for arg in "$@"; do
  if [[ "$arg" == "--confirm" ]]; then
    CONFIRM=true
  fi
done

if [[ -z "$SERVICE_NAME" ]]; then
  echo "Usage: ./cloud_run_deploy.sh <service_name> <region> <image_tag> [--confirm]"
  echo ""
  echo "Examples:"
  echo "  ./cloud_run_deploy.sh app-staging us-central1 v1.2.3 --confirm"
  echo "  ./cloud_run_deploy.sh app-production us-central1 v1.2.3 --confirm"
  echo ""
  echo "Defaults to dry-run. Use --confirm for live deploy."
  exit 1
fi

PROJECT_ID=${GCP_PROJECT_ID:-""}
if [[ -z "$PROJECT_ID" ]]; then
  echo "Error: GCP_PROJECT_ID env var is required"
  exit 1
fi

IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:$IMAGE_TAG"

echo "=== Cloud Run Deployment ==="
echo "Service:   $SERVICE_NAME"
echo "Region:    $REGION"
echo "Image:     $IMAGE_NAME"
echo "Mode:      $([ "$CONFIRM" = true ] && echo "LIVE" || echo "DRY-RUN")"
echo ""

if [[ "$CONFIRM" != true ]]; then
  echo "⚠️  DRY-RUN MODE: Deployment will be simulated."
  echo "   Use --confirm flag to execute live deployment."
  echo ""
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI is not installed"
  echo "Install from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Authenticate (assumes service account key is in env or configured)
# TODO: gcloud auth activate-service-account --key-file=$GCP_SERVICE_ACCOUNT_KEY

# Build and push image
echo "📦 Building and pushing image..."
if [[ "$CONFIRM" = true ]]; then
  gcloud builds submit --tag "$IMAGE_NAME" --project "$PROJECT_ID"
else
  echo "   [DRY-RUN] Would run: gcloud builds submit --tag $IMAGE_NAME"
fi

# Deploy to Cloud Run
echo ""
echo "🚀 Deploying to Cloud Run..."
DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300"

if [[ "$SERVICE_NAME" == *"production"* ]]; then
  DEPLOY_CMD="$DEPLOY_CMD --min-instances 1 --max-instances 10"
  echo "   Using production settings: min-instances=1, max-instances=10"
fi

if [[ "$CONFIRM" = true ]]; then
  eval "$DEPLOY_CMD"
else
  echo "   [DRY-RUN] Would run:"
  echo "   $DEPLOY_CMD"
fi

# Post-deploy health check
if [[ "$CONFIRM" = true ]]; then
  echo ""
  echo "✅ Deployment complete. Running health check..."
  
  SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --platform managed \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --format 'value(status.url)')
  
  echo "   Service URL: $SERVICE_URL"
  
  if curl -f "$SERVICE_URL/api/health" > /dev/null 2>&1; then
    echo "   ✅ Health check passed"
  else
    echo "   ⚠️  Health check failed - please verify manually"
  fi
else
  echo ""
  echo "✅ DRY-RUN complete. Re-run with --confirm to deploy."
fi
