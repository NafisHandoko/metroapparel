#!/bin/sh
set -e

cd /server/apps/backend
echo "Running database migrations..."
pnpm exec medusa db:migrate

echo "Starting Medusa (production build)..."
cd /server/apps/backend/.medusa/server
exec pnpm start