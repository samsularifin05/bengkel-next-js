#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Building Bengkel App for Shared Hosting ===${NC}"
echo "This script will build your Next.js application for deployment to shared hosting."
echo ""

# Check if the user wants to proceed with static export
echo -e "${YELLOW}WARNING:${NC} Static export (output: 'export') does not support API routes."
echo "Your application has API routes in src/app/api/ that will not work with static export."
echo ""
echo -e "Options:"
echo -e "1. Continue with static export (${RED}API routes won't work${NC})"
echo -e "2. Build for Node.js hosting (${GREEN}API routes will work${NC})"
echo ""
read -p "Please select an option (1/2): " option

if [ "$option" = "1" ]; then
    echo -e "${YELLOW}Building for static export...${NC}"
    
    # Make sure output: 'export' is in next.config.ts
    if ! grep -q "output: \"export\"" next.config.ts; then
        echo -e "${RED}Error: 'output: \"export\"' not found in next.config.ts${NC}"
        echo "Please make sure you have this setting in your next.config.ts"
        exit 1
    fi
    
    # Run the build
    npm run build
    
    echo -e "${GREEN}Build completed!${NC}"
    echo ""
    echo -e "${YELLOW}Files to upload:${NC}"
    echo "- out/ directory (all files and subdirectories)"
    echo "- public/.htaccess"
    echo ""
    echo -e "${YELLOW}Upload instructions:${NC}"
    echo "1. Upload all contents of the 'out' directory to your hosting root directory"
    echo "2. Make sure to include the .htaccess file from public/ directory"
    echo "3. Configure your domain to point to the directory where you uploaded the files"
    
elif [ "$option" = "2" ]; then
    echo -e "${YELLOW}Building for Node.js hosting...${NC}"
    
    # Remove output: 'export' from next.config.ts if it exists
    sed -i '' -e 's/output: "export",/\/\/ output: "export", \/\/ Commented out for Node.js hosting/' next.config.ts
    
    # Run the build
    npm run build
    
    echo -e "${GREEN}Build completed!${NC}"
    echo ""
    echo -e "${YELLOW}Files to upload:${NC}"
    echo "- .next/ directory"
    echo "- node_modules/ directory"
    echo "- public/ directory"
    echo "- package.json"
    echo "- package-lock.json"
    echo "- next.config.ts"
    echo ""
    echo -e "${YELLOW}Upload instructions:${NC}"
    echo "1. Upload all required files to your hosting Node.js environment"
    echo "2. Run 'npm start' on your hosting to start the server"
    echo "3. Configure your hosting to run the Next.js server at startup"
    echo ""
    echo -e "${RED}Note: Not all shared hosting supports Node.js.${NC}"
    echo "You may need a specialized hosting service like Vercel, Netlify, or a VPS."
    
else
    echo -e "${RED}Invalid option. Please run the script again and select 1 or 2.${NC}"
    exit 1
fi
