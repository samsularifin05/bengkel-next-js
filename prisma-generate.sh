#!/bin/bash

# This script ensures Prisma client is generated during Vercel build

# Gunakan DATABASE_URL dari environment variables Vercel
echo "Checking environment for PostgreSQL..."
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not found in environment, setting default..."
    export DATABASE_URL="postgres://27f91cda97116c5c750e8bb46f085615bf165e9e3eb9e3eae566b59f09536cc9:sk_BGOJ2HjrGU4R70JpQAK1D@db.prisma.io:5432/postgres?sslmode=require"
else
    echo "Using DATABASE_URL from environment"
fi
export NODE_ENV="production"

# Log environment
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Continue with the build process
echo "Continuing with build process..."
