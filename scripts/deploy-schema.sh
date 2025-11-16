#!/bin/bash

# Production Database Push Script
# This script pushes the schema to the production PostgreSQL database

echo "🚀 Deploying schema to production database..."
echo ""

# Check if DATABASE_URL_PROD is set
if [ -z "$DATABASE_URL_PROD" ]; then
  echo "❌ ERROR: DATABASE_URL_PROD is not set"
  echo "Please set it in your .env file"
  exit 1
fi

# Temporarily set DATABASE_URL to production
export DATABASE_URL=$DATABASE_URL_PROD

echo "📋 Current configuration:"
echo "  Provider: PostgreSQL (Prisma Accelerate)"
echo "  Schema: prisma/schema.prod.prisma"
echo ""

read -p "⚠️  This will modify the PRODUCTION database. Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

echo ""
echo "🔄 Pushing schema to production..."

# Push schema to production database
pnpm prisma db push --schema=prisma/schema.prod.prisma

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Schema successfully deployed to production!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify the schema in Prisma Studio: pnpm prisma studio"
  echo "  2. Test your application with the production database"
  echo "  3. Deploy your application to production"
else
  echo ""
  echo "❌ Failed to deploy schema"
  exit 1
fi
