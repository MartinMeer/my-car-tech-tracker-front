# **Quick Docker MVP Deployment for Investor Demo**

## **Overview**
We'll create a Docker setup that serves both applications from one container for a fast investor demo.

## **Step 1: Project Structure Setup**

```bash
# Create deployment directory
mkdir fleetmaster-mvp-deploy
cd fleetmaster-mvp-deploy

# Copy your applications
cp -r "../FleetMaster Pro" ./marketing-site
cp -r "../" ./main-app  # Copy your main car tracker app
```

**Final structure:**
```
fleetmaster-mvp-deploy/
├── marketing-site/          # FleetMaster Pro
├── main-app/               # Your existing car tracker
├── docker-compose.yml
├── Dockerfile.marketing
├── Dockerfile.main-app
├── nginx.conf
└── deploy.sh
```

## **Step 2: Create Docker Files**

### **2.1: Marketing Site Dockerfile**

**File**: `Dockerfile.marketing`
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY marketing-site/package*.json ./
RUN npm ci

COPY marketing-site/ ./
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY marketing-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **2.2: Main App Dockerfile**

**File**: `Dockerfile.main-app`
```dockerfile
FROM nginx:alpine

# Copy your existing app
COPY main-app/public/ /usr/share/nginx/html/
COPY main-app/src/ /usr/share/nginx/html/src/
COPY main-app/img/ /usr/share/nginx/html/img/
COPY main-app/manifest.json /usr/share/nginx/html/

# Copy nginx config
COPY main-app-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## **Step 3: Nginx Configuration Files**

### **3.1: Marketing Site Nginx**

**File**: `marketing-nginx.conf`
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **3.2: Main App Nginx**

**File**: `main-app-nginx.conf`
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Handle API calls (if you have backend)
    location /api/ {
        # proxy_pass http://your-backend:8080;
        # For demo, return 404 or mock data
        return 404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

## **Step 4: Gateway Nginx (Combines Both Apps)**

### **4.1: Gateway Configuration**

**File**: `nginx.conf`
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Upstream services
    upstream marketing {
        server marketing-site:80;
    }

    upstream mainapp {
        server main-app:80;
    }

    # Main gateway server
    server {
        listen 80;
        server_name _;

        # Marketing site (root)
        location / {
            proxy_pass http://marketing;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Main application
        location /app/ {
            rewrite ^/app/(.*) /$1 break;
            proxy_pass http://mainapp;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## **Step 5: Docker Compose Configuration**

### **5.1: Main Compose File**

**File**: `docker-compose.yml`
```yaml
version: '3.8'

services:
  # Marketing site (FleetMaster Pro)
  marketing-site:
    build:
      context: .
      dockerfile: Dockerfile.marketing
    container_name: fleetmaster-marketing
    restart: unless-stopped
    networks:
      - fleetmaster-network

  # Main application (Car Tracker)
    main-app:
    build:
      context: .
      dockerfile: Dockerfile.main-app
    container_name: fleetmaster-main
    restart: unless-stopped
    networks:
      - fleetmaster-network

  # Gateway/Load balancer
  gateway:
    image: nginx:alpine
    container_name: fleetmaster-gateway
    ports:
      - "80:80"
      - "443:443"  # For SSL if needed
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - marketing-site
      - main-app
    restart: unless-stopped
    networks:
      - fleetmaster-network

networks:
  fleetmaster-network:
    driver: bridge
```

## **Step 6: Update FleetMaster Pro CTAs**

### **6.1: Quick CTA Updates**

**File**: `marketing-site/src/pages/Home.tsx`

**Replace CTA onClick handlers:**
```typescript
// Update all CTA buttons to link to /app/
const handleStartFree = () => {
  window.location.href = '/app/auth/register.html';
};

const handleLogin = () => {
  window.location.href = '/app/auth/login.html';
};

const handleScheduleDemo = () => {
  window.location.href = '/app/info/contacts.html';
};

// Apply to all buttons:
<Button onClick={handleStartFree}>
  {t.startFree}
</Button>
```

## **Step 7: Quick Deployment Script**

### **7.1: Automated Deploy Script**

**File**: `deploy.sh`
```bash
#!/bin/bash

echo "🚀 Starting FleetMaster MVP Deployment..."

# Build and start services
echo "📦 Building Docker images..."
docker-compose build --no-cache

echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
docker-compose ps

# Test the deployment
echo "🧪 Testing deployment..."
curl -f http://localhost/health || echo "❌ Health check failed"

echo "✅ Deployment complete!"
echo "📱 Marketing site: http://your-server-ip/"
echo "🚗 Main app: http://your-server-ip/app/"

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20
```

**Make it executable:**
```bash
chmod +x deploy.sh
```

## **Step 8: Server Deployment**

### **8.1: Upload to Your Cloud Server**

```bash
# Compress the deployment package
tar -czf fleetmaster-mvp.tar.gz fleetmaster-mvp-deploy/

# Upload to your server
scp fleetmaster-mvp.tar.gz user@your-server:/home/user/

# SSH to server and deploy
ssh user@your-server
cd /home/user/
tar -xzf fleetmaster-mvp.tar.gz
cd fleetmaster-mvp-deploy/
```

### **8.2: Server Setup Commands**

```bash
# Install Docker if not installed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy
./deploy.sh
```

## **Step 9: Quick Demo Preparation**

### **9.1: Demo URLs**
- **Marketing Landing**: `http://your-server-ip/`
- **Live Application**: `http://your-server-ip/app/`
- **Registration**: `http://your-server-ip/app/auth/register.html`

### **9.2: Demo Script for Investors**

**Create**: `DEMO_SCRIPT.md`
```markdown
# FleetMaster MVP Demo Script

## 1. Landing Page Demo (2 minutes)
- Show professional marketing site: http://your-server-ip/
- Highlight three tiers: Free, Pro, Enterprise
- Show bilingual support (RU/EN toggle)
- Click through pricing and features

## 2. Application Demo (3 minutes)
- Click "Start Free Today" → Goes to registration
- Show main application: http://your-server-ip/app/
- Demo key features:
  - Vehicle management
  - Maintenance tracking
  - Cost tracking
  - Service history

## 3. Value Proposition (1 minute)
- Professional marketing presence
- Working application
- Tiered business model
- Scalable architecture
```

## **Step 10: Production Optimizations (Optional)**

### **10.1: SSL Setup (Quick)**

**File**: `docker-compose.ssl.yml`
```yaml
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --force-renewal --email your@email.com -d your-domain.com --agree-tos

  gateway:
    # ... existing config
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
```

## **Step 11: Monitoring & Logs**

### **11.1: Quick Monitoring**

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats

# Restart if needed
docker-compose restart
```

### **11.2: Backup Script**

**File**: `backup.sh`
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec main-app tar -czf /tmp/backup_$DATE.tar.gz /usr/share/nginx/html/
docker cp fleetmaster-main:/tmp/backup_$DATE.tar.gz ./backups/
```

---

## **Quick Start Commands**

```bash
# Clone and prepare
git clone your-repo
cd fleetmaster-mvp-deploy

# Deploy immediately
./deploy.sh

# Check status
docker-compose ps
curl http://localhost/health
```

## **Investor Demo URLs**
- **🏠 Homepage**: `http://your-server-ip/`
- **🚗 App**: `http://your-server-ip/app/`
- **📊 Health**: `http://your-server-ip/health`

## **Expected Timeline**
- **Setup**: 30 minutes
- **Upload**: 10 minutes  
- **Deploy**: 5 minutes
- **Total**: 45 minutes to live demo

This Docker setup gives you a professional, investor-ready demo with both the marketing site and functional application running together on your cloud server!