#!/usr/bin/env bash
set -euo pipefail
npm audit --audit-level=high || true
yarn audit --level high || true
npm ls --depth=0 || true
