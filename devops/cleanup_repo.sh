#!/bin/bash

##############################################################################
# Mervo Repository Cleanup Script
# Purpose: Remove development artifacts, sensitive files, and unused code
#          from the repository before client handoff.
# Usage:   ./cleanup_repo.sh [--dry-run] [--force]
# Safety:  Requires explicit confirmation unless --force flag used
##############################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
FORCE=false
ERRORS=0

##############################################################################
# Helper Functions
##############################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[✗]${NC} $1"
  ERRORS=$((ERRORS + 1))
}

log_action() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN]${NC} Would: $1"
  else
    echo -e "${GREEN}[ACTION]${NC} Executing: $1"
  fi
}

confirm() {
  if [ "$FORCE" = true ]; then
    return 0
  fi
  
  read -p "$(echo -e ${YELLOW}$1${NC}) (y/N): " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

##############################################################################
# Cleanup Functions
##############################################################################

cleanup_env_files() {
  log_info "Checking for .env files that should not be committed..."
  
  local env_files=()
  env_files+=($(find . -maxdepth 2 -name ".env" -type f 2>/dev/null || true))
  env_files+=($(find . -maxdepth 2 -name ".env.local" -type f 2>/dev/null || true))
  env_files+=($(find . -maxdepth 2 -name ".env.*.local" -type f 2>/dev/null || true))
  
  if [ ${#env_files[@]} -eq 0 ]; then
    log_success "No .env files found in committed code ✓"
    return 0
  fi
  
  log_warning "Found ${#env_files[@]} .env file(s) that should NOT be committed:"
  for file in "${env_files[@]}"; do
    echo "  - $file"
  done
  
  if confirm "Remove these files from working directory? (Note: .gitignore already excludes them)"; then
    for file in "${env_files[@]}"; do
      log_action "rm $file"
      if [ "$DRY_RUN" = false ]; then
        rm -f "$file"
        log_success "Removed $file"
      fi
    done
  fi
}

cleanup_node_modules() {
  log_info "Checking for node_modules directories..."
  
  local node_modules_count=$(find . -maxdepth 3 -type d -name "node_modules" 2>/dev/null | wc -l)
  
  if [ "$node_modules_count" -eq 0 ]; then
    log_success "No node_modules directories found ✓"
    return 0
  fi
  
  log_warning "Found $node_modules_count node_modules director(ies)"
  
  if confirm "Remove all node_modules? (Safe—will reinstall with npm install)"; then
    log_action "find . -type d -name node_modules -exec rm -rf {} +"
    if [ "$DRY_RUN" = false ]; then
      find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
      log_success "Removed all node_modules"
    fi
  fi
}

cleanup_build_artifacts() {
  log_info "Checking for build artifacts..."
  
  local build_dirs=("dist" "build" ".next" "out" "coverage" ".turbo")
  local found_dirs=()
  
  for dir in "${build_dirs[@]}"; do
    if [ -d "$dir" ]; then
      found_dirs+=("$dir")
    fi
  done
  
  if [ ${#found_dirs[@]} -eq 0 ]; then
    log_success "No build artifacts found ✓"
    return 0
  fi
  
  log_warning "Found build artifact directories: ${found_dirs[@]}"
  
  if confirm "Remove build artifacts? (Safe—will regenerate with npm run build)"; then
    for dir in "${found_dirs[@]}"; do
      log_action "rm -rf $dir"
      if [ "$DRY_RUN" = false ]; then
        rm -rf "$dir"
        log_success "Removed $dir"
      fi
    done
  fi
}

cleanup_secrets_in_history() {
  log_info "Scanning commit history for potential secrets..."
  
  if ! command -v git-secrets &> /dev/null; then
    log_warning "git-secrets not installed. Install with: brew install git-secrets"
    return 0
  fi
  
  if git secrets --scan-history 2>/dev/null; then
    log_success "No secrets detected in commit history ✓"
  else
    log_error "Potential secrets found in commit history!"
    log_warning "Review manually: git log -p | grep -i 'password\|api_key\|secret'"
    if confirm "Do you want to continue anyway? (RISKY)"; then
      log_warning "Continuing despite secret detection..."
    else
      log_error "Cleanup aborted due to security concerns"
      return 1
    fi
  fi
}

cleanup_cache_files() {
  log_info "Checking for cache and temporary files..."
  
  local cache_files=()
  cache_files+=($(find . -maxdepth 3 -name ".cache" -o -name ".eslintcache" -o -name ".stylelintcache" 2>/dev/null || true))
  cache_files+=($(find . -maxdepth 3 -name "*.log" -path "*/node_modules" -prune -o -type f -name "*.log" -print 2>/dev/null || true))
  cache_files+=($(find . -maxdepth 3 -name ".DS_Store" -o -name "Thumbs.db" 2>/dev/null || true))
  
  if [ ${#cache_files[@]} -eq 0 ]; then
    log_success "No cache files found ✓"
    return 0
  fi
  
  log_warning "Found ${#cache_files[@]} cache/temp file(s)"
  
  if confirm "Remove cache files?"; then
    for file in "${cache_files[@]}"; do
      [ -e "$file" ] && log_action "rm $file"
      if [ "$DRY_RUN" = false ] && [ -e "$file" ]; then
        rm -f "$file"
      fi
    done
  fi
}

verify_gitignore() {
  log_info "Verifying .gitignore configuration..."
  
  if [ ! -f ".gitignore" ]; then
    log_error ".gitignore file not found!"
    return 1
  fi
  
  local required_patterns=("node_modules" ".env" ".env.local" "dist" "build" ".cache")
  local missing=()
  
  for pattern in "${required_patterns[@]}"; do
    if ! grep -q "^${pattern}$" .gitignore 2>/dev/null; then
      missing+=("$pattern")
    fi
  done
  
  if [ ${#missing[@]} -eq 0 ]; then
    log_success ".gitignore contains all required patterns ✓"
    return 0
  fi
  
  log_warning "Missing patterns in .gitignore: ${missing[@]}"
  
  if confirm "Add missing patterns to .gitignore?"; then
    for pattern in "${missing[@]}"; do
      log_action "echo '$pattern' >> .gitignore"
      if [ "$DRY_RUN" = false ]; then
        echo "$pattern" >> .gitignore
        log_success "Added $pattern to .gitignore"
      fi
    done
  fi
}

verify_no_credentials() {
  log_info "Scanning for hardcoded credentials in source files..."
  
  local suspicious_files=()
  
  # Search for common credential patterns in source files (not node_modules)
  suspicious_files+=($(grep -r "password\|api_key\|secret\|token" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git \
    . 2>/dev/null | grep -v "TODO\|FIXME\|placeholder\|REPLACE_" | cut -d: -f1 | sort -u || true))
  
  if [ ${#suspicious_files[@]} -eq 0 ]; then
    log_success "No apparent hardcoded credentials found ✓"
    return 0
  fi
  
  log_warning "Found potential credential matches in:"
  for file in "${suspicious_files[@]}"; do
    echo "  - $file"
  done
  
  log_warning "Please review these files manually to ensure no real credentials are committed"
  if ! confirm "Continue despite potential credential matches?"; then
    log_error "Cleanup aborted for security review"
    return 1
  fi
}

run_linting() {
  log_info "Running linting checks..."
  
  if ! command -v npm &> /dev/null; then
    log_warning "npm not available, skipping lint check"
    return 0
  fi
  
  if grep -q "\"lint\"" package.json 2>/dev/null; then
    log_action "npm run lint"
    if [ "$DRY_RUN" = false ]; then
      if npm run lint 2>/dev/null; then
        log_success "Linting passed ✓"
      else
        log_warning "Linting found issues (non-blocking)"
      fi
    fi
  fi
}

run_tests() {
  log_info "Running test suite..."
  
  if ! command -v npm &> /dev/null; then
    log_warning "npm not available, skipping tests"
    return 0
  fi
  
  if grep -q "\"test\"" package.json 2>/dev/null; then
    log_action "npm run test"
    if [ "$DRY_RUN" = false ]; then
      if npm run test 2>/dev/null; then
        log_success "Tests passed ✓"
      else
        log_error "Tests failed! Please fix before handoff"
        return 1
      fi
    fi
  fi
}

verify_git_status() {
  log_info "Checking git status..."
  
  if [ "$(git status --porcelain | wc -l)" -gt 0 ]; then
    log_warning "Repository has uncommitted changes:"
    git status --short
    
    if confirm "Stash changes and continue?"; then
      log_action "git stash"
      if [ "$DRY_RUN" = false ]; then
        git stash
      fi
    fi
  else
    log_success "Repository clean ✓"
  fi
}

##############################################################################
# Main Execution
##############################################################################

main() {
  echo -e "\n${BLUE}=== Mervo Repository Cleanup ===${NC}\n"
  
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --force)
        FORCE=true
        shift
        ;;
      -h|--help)
        echo "Usage: $0 [--dry-run] [--force]"
        echo ""
        echo "Options:"
        echo "  --dry-run   Show what would be cleaned without making changes"
        echo "  --force     Skip confirmation prompts (use with caution)"
        echo "  -h, --help  Show this help message"
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        exit 1
        ;;
    esac
  done
  
  if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
  fi
  
  # Verify we're in a git repository
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not in a git repository!"
    exit 1
  fi
  
  # Run cleanup checks
  verify_git_status
  cleanup_env_files
  cleanup_node_modules
  cleanup_build_artifacts
  cleanup_cache_files
  verify_gitignore
  verify_no_credentials
  cleanup_secrets_in_history
  
  # Run validation
  run_linting
  run_tests
  
  # Summary
  echo ""
  echo -e "${BLUE}=== Cleanup Summary ===${NC}"
  
  if [ "$ERRORS" -eq 0 ]; then
    log_success "No errors detected! Repository is clean and ready for handoff."
  else
    log_error "Found $ERRORS issue(s). Please review above."
  fi
  
  if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}DRY RUN COMPLETE${NC} - No changes were made."
    echo "To apply these changes, run: ./cleanup_repo.sh [--force]"
  else
    echo -e "\n${GREEN}CLEANUP COMPLETE${NC}"
  fi
  
  exit $ERRORS
}

# Run main function
main "$@"
