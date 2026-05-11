#!/bin/sh
set -e
cd /server/apps/backend
echo "Running database migrations..."
pnpm exec medusa db:migrate
echo "Starting Medusa (production)..."
exec pnpm start
