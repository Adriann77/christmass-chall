#!/bin/bash

# Script to switch between development and production databases

if [ "$1" == "prod" ]; then
  echo "Switching to PRODUCTION database..."
  export DATABASE_URL=$DATABASE_URL_PROD
  echo "✓ Using PostgreSQL (Prisma Accelerate)"
else
  echo "Switching to DEVELOPMENT database..."
  export DATABASE_URL="file:./dev.db"
  echo "✓ Using SQLite (local)"
fi
