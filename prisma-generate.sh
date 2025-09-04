#!/bin/bash

# This script ensures Prisma client is generated during Vercel build

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Continue with the build process
echo "Continuing with build process..."
