#!/bin/bash
# ============================================
# وفاء (Wafa) — Deployment Script
# Deploys:
#   1. Backend API → Railway
#   2. Worker → Railway
#   3. Frontend → Vercel
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}💊 وفاء (Wafa) — Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ===== Check prerequisites =====
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}❌ $1 is not installed${NC}"
    echo -e "   Install: $2"
    exit 1
  fi
}

check_command "node" "https://nodejs.org/"
check_command "npm" "https://nodejs.org/"
check_command "vercel" "npm install -g vercel"
check_command "railway" "npm install -g @railway/cli"

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# ===== Configuration =====
RAILWAY_PROJECT_NAME="wafa"
VERCEL_PROJECT_NAME="wafa"

# ===== Step 1: Deploy Backend to Railway =====
echo -e "${YELLOW}📋 Step 1: Deploy Backend API to Railway${NC}"
echo ""

cd backend

# Check if Railway is linked
if [ ! -f ".railway" ] && ! railway status &> /dev/null; then
  echo -e "${YELLOW}   Linking to Railway project...${NC}"
  railway link --project "$RAILWAY_PROJECT_NAME" --service "api" || {
    echo -e "${RED}❌ Failed to link Railway project${NC}"
    echo -e "   Create a project at https://railway.app first"
    exit 1
  }
fi

# Deploy
echo -e "${YELLOW}   Deploying backend...${NC}"
railway up --detach

# Get backend URL
BACKEND_URL=$(railway domain 2>/dev/null || echo "")
if [ -z "$BACKEND_URL" ]; then
  echo -e "${YELLOW}   ⚠️  Backend URL not yet available${NC}"
  echo -e "   Set it manually after deployment:"
  echo -e "   railway domain"
  BACKEND_URL="https://wafa-api.up.railway.app"
fi

echo -e "${GREEN}✅ Backend deployed to: $BACKEND_URL${NC}"
echo ""

# ===== Step 2: Deploy Worker to Railway =====
echo -e "${YELLOW}📋 Step 2: Deploy Worker to Railway${NC}"
echo ""

cd ../worker

if ! railway status &> /dev/null; then
  echo -e "${YELLOW}   Linking worker to Railway project...${NC}"
  railway link --project "$RAILWAY_PROJECT_NAME" --service "worker" || {
    echo -e "${RED}❌ Failed to link worker${NC}"
    exit 1
  }
fi

echo -e "${YELLOW}   Deploying worker...${NC}"
railway up --detach

echo -e "${GREEN}✅ Worker deployed${NC}"
echo ""

# ===== Step 3: Set Vercel environment variables =====
echo -e "${YELLOW}📋 Step 3: Configure Vercel environment variables${NC}"
echo ""

cd ../frontend

# Set NEXT_PUBLIC_API_URL
echo -e "${YELLOW}   Setting NEXT_PUBLIC_API_URL=$BACKEND_URL/api/v1${NC}"
vercel env add NEXT_PUBLIC_API_URL production <<< "$BACKEND_URL/api/v1" 2>/dev/null || true

# Set NEXT_PUBLIC_SOCKET_URL (for Socket.IO)
echo -e "${YELLOW}   Setting NEXT_PUBLIC_SOCKET_URL=$BACKEND_URL${NC}"
vercel env add NEXT_PUBLIC_SOCKET_URL production <<< "$BACKEND_URL" 2>/dev/null || true

echo -e "${GREEN}✅ Vercel environment variables configured${NC}"
echo ""

# ===== Step 4: Deploy Frontend to Vercel =====
echo -e "${YELLOW}📋 Step 4: Deploy Frontend to Vercel${NC}"
echo ""

echo -e "${YELLOW}   Deploying to Vercel (preview)...${NC}"
PREVIEW_URL=$(vercel --yes 2>/dev/null | tail -1)

echo -e "${GREEN}✅ Frontend preview deployed: $PREVIEW_URL${NC}"
echo ""

echo -e "${YELLOW}   To deploy to production:${NC}"
echo -e "   cd frontend && vercel --prod"
echo ""

# ===== Summary =====
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "📋 Services:"
echo -e "   Backend API:  ${GREEN}$BACKEND_URL${NC}"
echo -e "   Health check: ${GREEN}$BACKEND_URL/api/v1/health${NC}"
echo -e "   Worker:       ${GREEN}Running on Railway${NC}"
echo -e "   Frontend:     ${GREEN}$PREVIEW_URL${NC}"
echo ""
echo -e "⚠️  Don't forget to set these environment variables in Railway:"
echo -e "   • MONGO_URI (MongoDB Atlas connection string)"
echo -e "   • REDIS_URL (Redis connection string)"
echo -e "   • JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET"
echo -e "   • VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY"
echo -e "   • WHATSAPP_* (for WhatsApp Business API)"
echo -e "   • AWS_* (for S3 + SNS)"
echo -e ""
echo -e "📚 Full docs: ./DEPLOYMENT.md"
