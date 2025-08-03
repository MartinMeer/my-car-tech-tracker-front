# FleetMaster Monorepo 🚗

A complete fleet management solution with independent CI/CD pipelines for marketing site and main application.

## 🏗️ Project Structure

```
fleetmaster-monorepo/
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── marketing-site-ci.yml
│       └── main-app-ci.yml
├── apps/
│   ├── marketing-site/      # React marketing website
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   └── main-app/           # Vanilla JS car tracker
│       ├── src/
│       ├── public/
│       ├── Dockerfile
│       ├── nginx.conf
│       └── package.json
├── packages/
│   └── shared/             # Shared resources
│       ├── img/           # Common images
│       └── constants/     # Shared constants
├── backend-demo/           # 🚧 Future Java Spring Boot API
│   ├── src/               # (Partial implementation)
│   ├── pom.xml
│   └── FUTURE_DEVELOPMENT.md
├── infrastructure/
│   ├── docker-compose.yml
│   ├── nginx/
│   │   └── nginx.conf     # Gateway configuration
│   └── Dockerfile.backend
├── scripts/
│   ├── deploy-staging.sh
│   └── deploy-production.sh
└── package.json           # Root workspace config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git
- Java 17+ (for future backend development)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd fleetmaster-monorepo

# Install all dependencies
npm run install:all
```

### Development

```bash
# Start both applications in development
npm run dev

# Start individual applications
npm run dev:marketing      # Marketing site on port 8000/8002
npm run dev:main-app      # Main app on port 3000

# Build all applications
npm run build
```

### Docker Development

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## 🏃‍♂️ Available Scripts

### Root Scripts
- `npm run dev` - Start both apps in development
- `npm run build` - Build all applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all applications
- `npm run clean` - Clean all build artifacts and node_modules

### Docker Scripts
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start all services
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View service logs

### Deployment Scripts
- `npm run deploy:staging` - Deploy to staging environment
- `PRODUCTION_CONFIRMED=true npm run deploy:production` - Deploy to production

## 🔧 Applications

### Marketing Site (`apps/marketing-site/`)
- **Technology**: React + TypeScript + Tailwind CSS
- **Build System**: Custom esbuild configuration
- **Ports**: 8000, 8002 (development)
- **Features**: Landing page, pricing, multilingual support

### Main Application (`apps/main-app/`)
- **Technology**: Vanilla JavaScript + HTML + CSS
- **Serving**: Static files with nginx
- **Port**: 3000 (development)
- **Features**: Fleet management, maintenance tracking, service records

### Backend (Future) (`backend-demo/`)
- **Technology**: Java 17 + Spring Boot
- **Status**: 🚧 Partial implementation for future development
- **Port**: 8080 (when implemented)
- **Documentation**: See `backend-demo/FUTURE_DEVELOPMENT.md`

## 🐳 Docker Configuration

### Individual Applications
Each app has its own optimized Dockerfile:
- **Marketing Site**: Multi-stage build with React optimization
- **Main App**: Simple nginx static file serving
- **Backend**: Ready for Spring Boot deployment (when implemented)

### Infrastructure
- **Gateway**: Nginx reverse proxy routing traffic
- **Networking**: Custom bridge network with health checks
- **Backend**: Commented out until implementation ready

## 🔄 CI/CD Pipeline

### Triggers
- **Marketing Site**: Changes to `apps/marketing-site/**` or `packages/shared/**`
- **Main App**: Changes to `apps/main-app/**` or `packages/shared/**`
- **Backend**: Will be added when moved to `apps/backend/`

### Pipeline Stages
1. **Test**: Lint, test, and validate applications
2. **Build**: Create Docker images and push to registry
3. **Deploy**: 
   - Staging: Auto-deploy on `develop` branch
   - Production: Auto-deploy on `main` branch

### Container Registry
Images are pushed to GitHub Container Registry:
- `ghcr.io/fleetmaster/marketing-site`
- `ghcr.io/fleetmaster/main-app`

## 🌐 Deployment

### Environment URLs
- **Development**: `http://localhost:3000` (main), `http://localhost:8000` (marketing)
- **Production**: `http://localhost:80/` (marketing), `http://localhost:80/app/` (main)

### Routing
- `/` → Marketing site (React app)
- `/app/` → Main application (Car tracker)
- `/api/` → Backend API (503 until implemented)
- `/health` → Health check endpoint

### Staging Deployment
```bash
# Automatic via GitHub Actions on develop branch push
# Or manually:
npm run deploy:staging
```

### Production Deployment
```bash
# Requires confirmation flag for safety
PRODUCTION_CONFIRMED=true npm run deploy:production
```

## 🔒 Security Features

### Nginx Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Rate Limiting
- API endpoints: 10 requests/second
- General endpoints: 5 requests/second

### Health Checks
- Application-level health endpoints
- Container health checks with retries
- Load balancer health monitoring

## 🧪 Testing & Quality

### Automated Testing
- JavaScript syntax validation
- Docker image builds
- Health check verification
- Smoke tests for critical paths

### Code Quality
- ESLint configuration
- Prettier formatting
- Docker security scanning
- Dependency vulnerability checking

## 📊 Monitoring

### Health Endpoints
- `/health` - Overall system health
- `/app/health` - Main application health
- `/api/health` - Backend health (when implemented)

### Logging
- Nginx access logs
- Application logs via Docker
- Deployment status tracking

## 🛠️ Development Workflow

### Feature Development
1. Create feature branch from `develop`
2. Make changes in appropriate `apps/` directory
3. Test locally with `npm run dev`
4. Push to trigger CI pipeline
5. Create PR to `develop` for staging deployment
6. Merge to `main` for production deployment

### Independent Development
- Marketing and main app can be developed independently
- Shared resources in `packages/shared/`
- CI/CD only runs for changed applications
- Zero downtime deployments

### Future Backend Development
1. See `backend-demo/FUTURE_DEVELOPMENT.md`
2. Move to `apps/backend/` when ready
3. Enable in Docker Compose and CI/CD
4. Integrate with frontend applications

## 🚨 Troubleshooting

### Common Issues

**Docker build fails:**
```bash
# Clean and rebuild
npm run clean
npm run docker:build
```

**Health checks fail:**
```bash
# Check service logs
npm run docker:logs

# Check individual service status
docker-compose ps
```

**Port conflicts:**
```bash
# Stop existing services
npm run docker:down

# Check for port usage
lsof -i :80 -i :3000 -i :8000
```

### Debug Commands
```bash
# Check service status
docker-compose ps

# View logs for specific service
docker-compose logs marketing-site
docker-compose logs main-app

# Execute commands in container
docker-compose exec marketing-site sh
```

## 🎯 Benefits of This Structure

### Independent Development ✅
- Separate CI/CD pipelines
- Independent deployment schedules
- Technology stack flexibility
- Team isolation capabilities

### Performance Optimizations ✅
- Cached Docker layers
- Optimized nginx configuration
- Health check monitoring
- Rate limiting protection

### Production Readiness ✅
- Blue-green deployment strategy
- Comprehensive health checks
- Security headers and CORS
- Monitoring and logging

### Developer Experience ✅
- Simple workspace commands
- Hot reload in development
- Clear project structure
- Automated deployment scripts

## 📈 Next Steps

1. **Backend Implementation**: Follow `backend-demo/FUTURE_DEVELOPMENT.md`
2. **Testing**: Implement unit and integration tests
3. **Monitoring**: Add Prometheus/Grafana monitoring
4. **SSL**: Configure SSL certificates for production
5. **CDN**: Add CloudFlare or AWS CloudFront
6. **Database**: Integrate PostgreSQL for backend
7. **Secrets**: Implement proper secrets management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for FleetMaster** 