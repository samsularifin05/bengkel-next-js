#!/bin/bash

# This script ensures environment variables are properly set for Prisma

# Log current environment settings
echo "Current environment:"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL exists: $(test -n "$DATABASE_URL" && echo YES || echo NO)"

# Set DATABASE_URL if not defined
if [ -z "$DATABASE_URL" ]; then
    echo "Setting DATABASE_URL..."
    export DATABASE_URL="postgres://27f91cda97116c5c750e8bb46f085615bf165e9e3eb9e3eae566b59f09536cc9:sk_BGOJ2HjrGU4R70JpQAK1D@db.prisma.io:5432/postgres?sslmode=require"
    echo "DATABASE_URL now exists: $(test -n "$DATABASE_URL" && echo YES || echo NO)"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Continue with Next.js build
echo "Running Next.js build..."
next build
