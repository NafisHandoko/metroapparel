#!/bin/sh
set -e

echo "Running database migrations..."
pnpm medusa db:migrate

echo "Seeding database..."
pnpm seed || echo "Seeding failed, continuing..."

echo "Starting Medusa server in production mode..."
pnpm start
