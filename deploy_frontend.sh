#!/bin/bash
set -e

# Configuration
REGION="us-east-1"
SERVICE_NAME="medi-assist-backend"

echo "=== 1. Resolving Backend URL ==="
# Retrieve App Runner Service URL
SERVICE_URL=$(aws apprunner list-services --region $REGION --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceUrl" --output text)

if [ -z "$SERVICE_URL" ] || [ "$SERVICE_URL" = "None" ]; then
    echo "ERROR: Could not find AWS App Runner service '$SERVICE_NAME'."
    echo "Please deploy the backend first by running ./deploy_backend.sh"
    exit 1
fi

BACKEND_URL="https://$SERVICE_URL"
echo "Found Backend URL: $BACKEND_URL"

echo "=== 2. Configuring Vercel Environment Variables ==="
# Navigate to frontend directory where the Vercel project is linked
cd frontend

echo "Setting NEXT_PUBLIC_API_BASE_URL on Vercel..."
npx vercel env rm NEXT_PUBLIC_API_BASE_URL production --yes >/dev/null 2>&1 || true
echo "$BACKEND_URL" | npx vercel env add NEXT_PUBLIC_API_BASE_URL production

echo "Setting FASTAPI_URL on Vercel..."
npx vercel env rm FASTAPI_URL production --yes >/dev/null 2>&1 || true
echo "$BACKEND_URL" | npx vercel env add FASTAPI_URL production

# Set local/dev environments to fall back to localhost
echo "Setting development environment variables..."
npx vercel env rm NEXT_PUBLIC_API_BASE_URL development --yes >/dev/null 2>&1 || true
echo "http://localhost:8000" | npx vercel env add NEXT_PUBLIC_API_BASE_URL development

npx vercel env rm FASTAPI_URL development --yes >/dev/null 2>&1 || true
echo "http://localhost:8000" | npx vercel env add FASTAPI_URL development

echo "=== 3. Deploying to Vercel ==="
# Deploy frontend using Vercel CLI (production build)
npx vercel --prod --yes --archive=tgz

echo "=== 4. Deployment Complete ==="
echo "Your frontend has been successfully deployed to Vercel!"
