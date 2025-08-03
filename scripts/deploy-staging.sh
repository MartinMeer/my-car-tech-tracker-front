#!/bin/bash

set -e

echo "🚀 Deploying FleetMaster to Staging Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_REGISTRY="ghcr.io"
IMAGE_TAG="${GITHUB_SHA:-$(git rev-parse HEAD)}"
STAGING_HOST="${STAGING_HOST:-localhost}"

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "Registry: $DOCKER_REGISTRY"
echo "Image Tag: $IMAGE_TAG"
echo "Target Host: $STAGING_HOST"
echo "Environment: Staging"

# Build applications
echo -e "${YELLOW}📦 Building applications...${NC}"
npm run build

# Build Docker images
echo -e "${YELLOW}🐳 Building Docker images...${NC}"
cd infrastructure

# Build with specific tag
docker-compose build
docker tag fleetmaster/marketing-site:latest $DOCKER_REGISTRY/fleetmaster/marketing-site:$IMAGE_TAG
docker tag fleetmaster/main-app:latest $DOCKER_REGISTRY/fleetmaster/main-app:$IMAGE_TAG

# Push to registry (if configured)
if [ ! -z "$DOCKER_REGISTRY_TOKEN" ]; then
    echo -e "${YELLOW}📤 Pushing to registry...${NC}"
    echo $DOCKER_REGISTRY_TOKEN | docker login $DOCKER_REGISTRY -u $DOCKER_REGISTRY_USER --password-stdin
    docker push $DOCKER_REGISTRY/fleetmaster/marketing-site:$IMAGE_TAG
    docker push $DOCKER_REGISTRY/fleetmaster/main-app:$IMAGE_TAG
fi

# Deploy to staging
echo -e "${YELLOW}🚀 Deploying to staging...${NC}"

# Stop existing services
docker-compose down || true

# Start new services
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Health checks
echo -e "${YELLOW}🔍 Running health checks...${NC}"
HEALTH_CHECK_FAILED=0

# Check marketing site
if curl -f "http://$STAGING_HOST/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Marketing site health check passed${NC}"
else
    echo -e "${RED}❌ Marketing site health check failed${NC}"
    HEALTH_CHECK_FAILED=1
fi

# Check main app
if curl -f "http://$STAGING_HOST/app/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Main app health check passed${NC}"
else
    echo -e "${RED}❌ Main app health check failed${NC}"
    HEALTH_CHECK_FAILED=1
fi

# Show service status
echo -e "${YELLOW}📊 Service Status:${NC}"
docker-compose ps

# Show recent logs
echo -e "${YELLOW}📋 Recent logs:${NC}"
docker-compose logs --tail=10

if [ $HEALTH_CHECK_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Staging deployment successful!${NC}"
    echo -e "${GREEN}🌐 Marketing site: http://$STAGING_HOST/${NC}"
    echo -e "${GREEN}🚗 Main app: http://$STAGING_HOST/app/${NC}"
    exit 0
else
    echo -e "${RED}❌ Staging deployment failed!${NC}"
    echo -e "${YELLOW}📋 Debug logs:${NC}"
    docker-compose logs --tail=50
    exit 1
fi 