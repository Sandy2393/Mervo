#!/usr/bin/env bash
# Setup local dev environment: create .env from example, install deps
set -euo pipefail

if [ -f .env ]; then
  echo ".env already exists — skipping"
else
  cp .env.example .env
  echo "Copied .env.example -> .env. Edit .env with local values (never commit)."
fi

npm install

# TODO: Run migrations or seed data if available
# npm run migrate

echo "Dev environment set up. Run npm run dev to start the app."
