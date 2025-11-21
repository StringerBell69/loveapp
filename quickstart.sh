#!/bin/bash

echo "🚀 Notre Calendrier - Quick Start Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if bun or npm is available
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
    PKG_INSTALL="bun add"
    PKG_INSTALL_DEV="bun add -D"
    echo -e "${GREEN}✓${NC} Using Bun"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    PKG_INSTALL="npm install"
    PKG_INSTALL_DEV="npm install -D"
    echo -e "${GREEN}✓${NC} Using NPM"
else
    echo -e "${RED}✗${NC} Neither Bun nor NPM found. Please install Node.js or Bun first."
    exit 1
fi

echo ""
echo "📦 Step 1: Installing dependencies..."
$PKG_MANAGER install

echo ""
echo "📦 Step 2: Installing Phase 5 dependencies (PWA, Stats, Export)..."
$PKG_INSTALL recharts jspdf jspdf-autotable ics jszip web-push
$PKG_INSTALL_DEV @types/jspdf @types/jszip @types/web-push

echo ""
echo "🔐 Step 3: Setting up environment file..."
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓${NC} Created .env.local from .env.example"
        echo -e "${YELLOW}⚠${NC}  Please edit .env.local with your credentials!"
    else
        echo -e "${RED}✗${NC} .env.example not found"
    fi
else
    echo -e "${YELLOW}⚠${NC}  .env.local already exists, skipping..."
fi

echo ""
echo "🔑 Step 4: Generating VAPID keys for push notifications..."
if command -v npx &> /dev/null; then
    echo ""
    echo "Copy these keys to your .env.local file:"
    echo "----------------------------------------"
    npx web-push generate-vapid-keys
    echo "----------------------------------------"
else
    echo -e "${YELLOW}⚠${NC}  npx not found. Run manually: npx web-push generate-vapid-keys"
fi

echo ""
echo "📁 Step 5: Creating PWA asset directories..."
mkdir -p public/icons
mkdir -p public/screenshots
echo -e "${GREEN}✓${NC} Created public/icons and public/screenshots"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Supabase (see SETUP.md)"
echo "2. Configure Cloudflare R2 (see SETUP.md)"
echo "3. Edit .env.local with your credentials"
echo "4. Initialize database: $PKG_MANAGER db:init"
echo "   (This creates all tables, functions, triggers, and seeds data)"
echo "5. Generate PWA icons (see SETUP.md)"
echo "6. Run: $PKG_MANAGER dev"
echo ""
echo "📚 Full documentation: SETUP.md"
echo ""
echo "🎉 Ready to build something amazing! 💕"
