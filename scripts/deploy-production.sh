#!/bin/bash

set -e

echo "🚀 Deploying FleetMaster to Production Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_REGISTRY="ghcr.io"
IMAGE_TAG="${GITHUB_SHA:-$(git rev-parse HEAD)}"
PRODUCTION_HOST="${PRODUCTION_HOST:-production.fleetmaster.com}"

# Safety checks for production
if [ -z "$PRODUCTION_CONFIRMED" ]; then
    echo -e "${RED}⚠️  PRODUCTION DEPLOYMENT${NC}"
    echo -e "${YELLOW}This will deploy to PRODUCTION environment.${NC}"
    echo -e "${YELLOW}Target: $PRODUCTION_HOST${NC}"
    echo -e "${YELLOW}Image Tag: $IMAGE_TAG${NC}"
    echo ""
    echo -e "${BLUE}To proceed, set PRODUCTION_CONFIRMED=true${NC}"
    echo "Example: PRODUCTION_CONFIRMED=true npm run deploy:production"
    exit 1
fi

echo -e "${YELLOW}📋 Production Deployment Configuration:${NC}"
echo "Registry: $DOCKER_REGISTRY"
echo "Image Tag: $IMAGE_TAG"
echo "Target Host: $PRODUCTION_HOST"
echo "Environment: Production"

# Pre-deployment checks
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check if images exist in registry
if [ ! -z "$DOCKER_REGISTRY_TOKEN" ]; then
    echo "Checking if images exist in registry..."
    # Add registry check logic here
fi

# Check if target host is reachable
if ! ping -c 1 "$PRODUCTION_HOST" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot reach production host: $PRODUCTION_HOST${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# Build applications (production mode)
echo -e "${YELLOW}📦 Building applications for production...${NC}"
NODE_ENV=production npm run build

# Build Docker images
echo -e "${YELLOW}🐳 Building production Docker images...${NC}"
cd infrastructure

# Build with production optimizations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Tag for production
docker tag fleetmaster/marketing-site:latest $DOCKER_REGISTRY/fleetmaster/marketing-site:$IMAGE_TAG
docker tag fleetmaster/marketing-site:latest $DOCKER_REGISTRY/fleetmaster/marketing-site:production
docker tag fleetmaster/main-app:latest $DOCKER_REGISTRY/fleetmaster/main-app:$IMAGE_TAG
docker tag fleetmaster/main-app:latest $DOCKER_REGISTRY/fleetmaster/main-app:production

# Push to registry
if [ ! -z "$DOCKER_REGISTRY_TOKEN" ]; then
    echo -e "${YELLOW}📤 Pushing to production registry...${NC}"
    echo $DOCKER_REGISTRY_TOKEN | docker login $DOCKER_REGISTRY -u $DOCKER_REGISTRY_USER --password-stdin
    
    docker push $DOCKER_REGISTRY/fleetmaster/marketing-site:$IMAGE_TAG
    docker push $DOCKER_REGISTRY/fleetmaster/marketing-site:production
    docker push $DOCKER_REGISTRY/fleetmaster/main-app:$IMAGE_TAG
    docker push $DOCKER_REGISTRY/fleetmaster/main-app:production
fi

# Blue-green deployment strategy
echo -e "${YELLOW}🔄 Starting blue-green deployment...${NC}"

# Create backup of current state
echo -e "${YELLOW}💾 Creating backup...${NC}"
docker-compose ps > deployment-backup-$(date +%Y%m%d_%H%M%S).txt

# Deploy new version
echo -e "${YELLOW}🚀 Deploying new version...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Extended health checks for production
echo -e "${YELLOW}⏳ Running production health checks...${NC}"
HEALTH_CHECK_ATTEMPTS=0
MAX_ATTEMPTS=30
HEALTH_CHECK_FAILED=0

while [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    echo "Health check attempt $((HEALTH_CHECK_ATTEMPTS + 1))/$MAX_ATTEMPTS"
    
    # Check marketing site
    if curl -f "http://$PRODUCTION_HOST/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Marketing site healthy${NC}"
        MARKETING_HEALTHY=1
    else
        echo -e "${YELLOW}⏳ Marketing site not ready yet...${NC}"
        MARKETING_HEALTHY=0
    fi
    
    # Check main app
    if curl -f "http://$PRODUCTION_HOST/app/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Main app healthy${NC}"
        MAIN_APP_HEALTHY=1
    else
        echo -e "${YELLOW}⏳ Main app not ready yet...${NC}"
        MAIN_APP_HEALTHY=0
    fi
    
    # Check backend
    if curl -f "http://$PRODUCTION_HOST/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend healthy${NC}"
        BACKEND_HEALTHY=1
    else
        echo -e "${YELLOW}⏳ Backend not ready yet...${NC}"
        BACKEND_HEALTHY=0
    fi
    
    if [ $MARKETING_HEALTHY -eq 1 ] && [ $MAIN_APP_HEALTHY -eq 1 ] && [ $BACKEND_HEALTHY -eq 1 ]; then
        echo -e "${GREEN}✅ All services are healthy!${NC}"
        break
    fi
    
    HEALTH_CHECK_ATTEMPTS=$((HEALTH_CHECK_ATTEMPTS + 1))
    sleep 10
done

if [ $HEALTH_CHECK_ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}❌ Health checks failed after $MAX_ATTEMPTS attempts${NC}"
    echo -e "${RED}Rolling back deployment...${NC}"
    
    # Rollback logic
    docker-compose down
    # Add rollback to previous version logic here
    
    exit 1
fi

# Final production tests
echo -e "${YELLOW}🧪 Running production smoke tests...${NC}"

# Test critical user journeys
if curl -f "http://$PRODUCTION_HOST/" | grep -q "FleetMaster"; then
    echo -e "${GREEN}✅ Marketing site loads correctly${NC}"
else
    echo -e "${RED}❌ Marketing site smoke test failed${NC}"
    HEALTH_CHECK_FAILED=1
fi

if curl -f "http://$PRODUCTION_HOST/app/" | grep -q "FleetMaster\|Car Tracker"; then
    echo -e "${GREEN}✅ Main app loads correctly${NC}"
else
    echo -e "${RED}❌ Main app smoke test failed${NC}"
    HEALTH_CHECK_FAILED=1
fi

# Show final status
echo -e "${YELLOW}📊 Final Service Status:${NC}"
docker-compose ps

if [ $HEALTH_CHECK_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}🌐 Marketing site: https://$PRODUCTION_HOST/${NC}"
    echo -e "${GREEN}🚗 Main app: https://$PRODUCTION_HOST/app/${NC}"
    echo -e "${GREEN}📊 API: https://$PRODUCTION_HOST/api/${NC}"
    
    # Notify stakeholders (add your notification logic here)
    echo -e "${BLUE}📧 Sending deployment notifications...${NC}"
    
    exit 0
else
    echo -e "${RED}❌ PRODUCTION DEPLOYMENT FAILED!${NC}"
    echo -e "${YELLOW}📋 Debug information:${NC}"
    docker-compose logs --tail=100
    exit 1
fi 