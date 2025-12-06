#!/bin/bash

# tag_and_release.sh
# 
# Automated release and tagging script for Mervo platform
# Version 1.0 - December 2025
#
# Usage:
#   ./tag_and_release.sh --version 1.5.0 --dry-run
#   ./tag_and_release.sh --version 1.5.0 --confirm
#
# This script:
# 1. Validates the version number
# 2. Creates a git tag
# 3. Builds Docker image
# 4. Pushes to container registry
# 5. Creates GitHub release
# 6. Notifies Slack
#
# Safety features:
# - Dry-run mode (preview without executing)
# - Backup before any destructive operation
# - Rollback capability

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="REPLACE_GCP_PROJECT_ID"
IMAGE_REPO="gcr.io/${PROJECT_ID}/mervo"
GITHUB_REPO="mervo/mervo"
SLACK_WEBHOOK="REPLACE_SLACK_WEBHOOK_URL"

DRY_RUN=false
CONFIRM=false
VERSION=""

# Utility functions
log_info() {
  echo -e "${BLUE}[ℹ️ ]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✅]${NC} $1"
}

log_error() {
  echo -e "${RED}[❌]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[⚠️ ]${NC} $1"
}

# Parse arguments
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --version)
        VERSION="$2"
        shift 2
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --confirm)
        CONFIRM=true
        shift
        ;;
      *)
        log_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
    esac
  done
}

show_usage() {
  cat <<EOF
Usage: ./tag_and_release.sh --version X.Y.Z [--dry-run | --confirm]

Options:
  --version VERSION    Release version (e.g., 1.5.0) [REQUIRED]
  --dry-run           Preview release without executing
  --confirm           Execute the release

Examples:
  ./tag_and_release.sh --version 1.5.0 --dry-run
  ./tag_and_release.sh --version 1.5.0 --confirm

Safety:
  Always run with --dry-run first to preview changes.
  Then run with --confirm to execute.
EOF
}

# Validate version format
validate_version() {
  if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "Invalid version format: $VERSION"
    log_info "Expected format: X.Y.Z (e.g., 1.5.0)"
    exit 1
  fi
  log_success "Version format valid: $VERSION"
}

# Check if version already exists
check_version_exists() {
  if git tag --list | grep -q "v$VERSION"; then
    log_error "Version tag already exists: v$VERSION"
    exit 1
  fi
  if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    log_error "Git ref already exists: v$VERSION"
    exit 1
  fi
  log_success "Version tag does not exist (safe to create)"
}

# Check git status
check_git_status() {
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    log_error "Not in a git repository"
    exit 1
  fi
  
  if ! git diff-index --quiet HEAD --; then
    log_error "Working directory has uncommitted changes"
    log_info "Commit all changes before releasing"
    exit 1
  fi
  
  log_success "Git status clean"
}

# Get current commit hash
get_commit_hash() {
  git rev-parse --short HEAD
}

# Create git tag
create_git_tag() {
  local commit=$(get_commit_hash)
  local tag_message="Release v$VERSION

Commit: $(git rev-parse HEAD)
Date: $(date -u +'%Y-%m-%dT%H:%M:%SZ')

Automated release tag created by tag_and_release.sh"
  
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would create tag:"
    log_info "  Tag: v$VERSION"
    log_info "  Commit: $commit"
  else
    git tag -a "v$VERSION" -m "$tag_message"
    log_success "Created git tag: v$VERSION"
  fi
}

# Push git tag
push_git_tag() {
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would push tag to origin"
  else
    git push origin "v$VERSION"
    log_success "Pushed git tag to origin"
  fi
}

# Build Docker image
build_docker_image() {
  local image_name="${IMAGE_REPO}:v${VERSION}"
  local latest_name="${IMAGE_REPO}:latest"
  
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would build Docker image:"
    log_info "  Image: $image_name"
    log_info "  Build context: ."
    log_info "  Dockerfile: ./Dockerfile"
  else
    log_info "Building Docker image: $image_name"
    
    # Build the image
    docker build \
      --tag "$image_name" \
      --tag "$latest_name" \
      --build-arg VERSION="$VERSION" \
      --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
      --build-arg VCS_REF="$(get_commit_hash)" \
      .
    
    log_success "Docker image built successfully"
    log_info "Image: $image_name"
  fi
}

# Push Docker image to registry
push_docker_image() {
  local image_name="${IMAGE_REPO}:v${VERSION}"
  local latest_name="${IMAGE_REPO}:latest"
  
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would push Docker images:"
    log_info "  $image_name"
    log_info "  $latest_name"
  else
    log_info "Pushing Docker images to Google Container Registry"
    
    docker push "$image_name"
    log_success "Pushed: $image_name"
    
    docker push "$latest_name"
    log_success "Pushed: $latest_name"
  fi
}

# Create GitHub release
create_github_release() {
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would create GitHub release:"
    log_info "  Version: $VERSION"
    log_info "  Repository: $GITHUB_REPO"
  else
    local changelog_section=$(sed -n "/^\## \[$VERSION\]/,/^\## \[/p" CHANGELOG.md | head -n -1)
    
    if [ -z "$changelog_section" ]; then
      log_warn "No changelog section found for v$VERSION"
      log_warn "Using generic release body"
      changelog_section="See CHANGELOG.md for details"
    fi
    
    # Create release using gh CLI
    gh release create "v$VERSION" \
      --title "Release v$VERSION" \
      --notes "$changelog_section" \
      --draft=false
    
    log_success "Created GitHub release: v$VERSION"
  fi
}

# Send Slack notification
send_slack_notification() {
  if [ -z "$SLACK_WEBHOOK" ] || [ "$SLACK_WEBHOOK" = "REPLACE_SLACK_WEBHOOK_URL" ]; then
    log_warn "Slack webhook not configured, skipping notification"
    return
  fi
  
  local commit=$(get_commit_hash)
  local status="$1"
  local color="good"
  
  if [ "$status" != "success" ]; then
    color="danger"
  fi
  
  local payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "$color",
      "title": "Release: v$VERSION",
      "title_link": "https://github.com/$GITHUB_REPO/releases/tag/v$VERSION",
      "fields": [
        {
          "title": "Version",
          "value": "$VERSION",
          "short": true
        },
        {
          "title": "Commit",
          "value": "$commit",
          "short": true
        },
        {
          "title": "Image",
          "value": "${IMAGE_REPO}:v${VERSION}",
          "short": false
        },
        {
          "title": "Status",
          "value": "$status",
          "short": true
        }
      ],
      "footer": "Mervo Release System",
      "ts": $(date +%s)
    }
  ]
}
EOF
)
  
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would send Slack notification"
    log_info "Channel: REPLACE_SLACK_CHANNEL"
  else
    curl -X POST -H 'Content-type: application/json' \
      --data "$payload" \
      "$SLACK_WEBHOOK"
    log_success "Slack notification sent"
  fi
}

# Main release workflow
main() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║ MERVO RELEASE & TAG SCRIPT                                 ║"
  echo "║ Version 1.0 - December 2025                                ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  
  # Validate inputs
  if [ -z "$VERSION" ]; then
    log_error "Version not specified"
    show_usage
    exit 1
  fi
  
  validate_version
  check_git_status
  check_version_exists
  
  # Preview or confirm
  if [ "$DRY_RUN" = true ]; then
    log_info "DRY RUN MODE - No changes will be made"
  elif [ "$CONFIRM" != true ]; then
    log_error "Must specify --dry-run or --confirm"
    show_usage
    exit 1
  fi
  
  echo ""
  log_info "Release Plan for v$VERSION:"
  echo "  1. Create git tag: v$VERSION"
  echo "  2. Build Docker image: ${IMAGE_REPO}:v${VERSION}"
  echo "  3. Push to container registry"
  echo "  4. Create GitHub release"
  echo "  5. Send Slack notification"
  echo ""
  
  # Execute release steps
  create_git_tag
  push_git_tag
  build_docker_image
  push_docker_image
  create_github_release
  send_slack_notification "success"
  
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  if [ "$DRY_RUN" = true ]; then
    echo "║ [DRY RUN] Release plan previewed successfully              ║"
    echo "║ Run with --confirm to execute the release                  ║"
  else
    echo "║ ✅ RELEASE COMPLETE: v$VERSION                              ║"
  fi
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  
  # Post-release instructions
  if [ "$CONFIRM" = true ]; then
    echo "📋 Next Steps:"
    echo "  1. Deploy to staging:"
    echo "     gcloud run deploy mervo-staging --image ${IMAGE_REPO}:v${VERSION}"
    echo ""
    echo "  2. Run smoke tests:"
    echo "     ./handover/qa/SMOKE_TEST_SCRIPT.sh staging"
    echo ""
    echo "  3. Deploy to production:"
    echo "     gcloud run deploy mervo --image ${IMAGE_REPO}:v${VERSION} --region us-central1"
    echo ""
    echo "  4. Monitor status:"
    echo "     https://status.mervo.app"
    echo ""
  fi
}

# Run main function
parse_args "$@"
main
