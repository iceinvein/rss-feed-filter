# Docker Deployment Guide

This guide covers deploying the RSS Feed Filter application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd rss-feed-filter
```

### 2. Start the application

```bash
docker-compose up -d
```

### 3. Complete onboarding

Open `http://localhost:3000` in your browser and follow the setup wizard:

1. **Discord Webhook** - Enter your Discord webhook URL
2. **RSS Feed** - Configure feed URL and check schedule
3. **Complete** - Start monitoring!

The application will be available at `http://localhost:3000`

## Docker Compose Configuration

### Basic Usage

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart the application
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### Configuration

All configuration is managed through the web UI:

1. **First-time setup** - Complete the onboarding wizard
2. **Settings panel** - Access via the navbar to update:
   - Discord webhook URL
   - RSS feed URL
   - Check schedule (cron syntax)
   - Enable/disable notifications
   - Enable/disable scheduler

All settings are stored in the SQLite database (`data/rss-filter.db`).

### Data Persistence

The application uses a Docker volume to persist data:

```yaml
volumes:
  - ./data:/app/data
```

This ensures your SQLite database, filters, and settings are preserved across container restarts.

**Important:** The `data/` directory contains:

- `rss-filter.db` - SQLite database with all settings, filters, and processed items
- `rss-filter.db-shm` - Shared memory file (SQLite WAL mode)
- `rss-filter.db-wal` - Write-ahead log file (SQLite WAL mode)

## Building the Docker Image

### Build locally

```bash
docker build -t rss-feed-filter .
```

### Run the container manually

```bash
docker run -d \
  --name rss-feed-filter \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  rss-feed-filter
```

No environment variables needed - configure everything through the web UI!

## Health Checks

The container includes a health check that verifies the application is responding:

```bash
# Check container health
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' rss-feed-filter
```

## Logs and Debugging

### View application logs

```bash
# Follow logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View logs for specific service
docker-compose logs -f rss-feed-filter
```

### Access container shell

```bash
docker-compose exec rss-feed-filter sh
```

## Production Deployment

### Using Docker Compose

1. **Set production environment variables**

```bash
cp .env.docker .env
# Edit .env with production values
```

2. **Start with production settings**

```bash
docker-compose up -d
```

3. **Set up automatic restarts**

The `docker-compose.yml` already includes `restart: unless-stopped` which ensures the container restarts automatically.

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml rss-feed-filter

# View services
docker service ls

# View logs
docker service logs -f rss-feed-filter_rss-feed-filter
```

### Using Kubernetes

Create a deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rss-feed-filter
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rss-feed-filter
  template:
    metadata:
      labels:
        app: rss-feed-filter
    spec:
      containers:
      - name: rss-feed-filter
        image: rss-feed-filter:latest
        ports:
        - containerPort: 3000
        env:
        - name: DISCORD_WEBHOOK_URL
          valueFrom:
            secretKeyRef:
              name: rss-secrets
              key: discord-webhook-url
        volumeMounts:
        - name: data
          mountPath: /app/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: rss-data-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: rss-feed-filter
spec:
  selector:
    app: rss-feed-filter
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Updating the Application

### Pull latest changes and rebuild

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Update without downtime

```bash
# Build new image
docker-compose build

# Recreate containers
docker-compose up -d --no-deps --build rss-feed-filter
```

## Backup and Restore

### Backup data

```bash
# Create backup of data directory
tar -czf rss-backup-$(date +%Y%m%d).tar.gz data/
```

### Restore data

```bash
# Stop the application
docker-compose down

# Restore backup
tar -xzf rss-backup-YYYYMMDD.tar.gz

# Start the application
docker-compose up -d
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Permission issues with data directory

```bash
# Fix permissions
sudo chown -R 1001:1001 data/
```

### High memory usage

The Next.js application is optimized for production. If you experience high memory usage:

1. Limit container memory:

```yaml
services:
  rss-feed-filter:
    deploy:
      resources:
        limits:
          memory: 512M
```

2. Restart the container periodically using a cron job.

## Security Best Practices

1. **Use secrets for sensitive data**

Instead of environment variables, use Docker secrets:

```bash
echo "your-webhook-url" | docker secret create discord_webhook -
```

2. **Run as non-root user**

The Dockerfile already creates and uses a non-root user (`nextjs`).

3. **Keep images updated**

```bash
# Update base images
docker-compose pull
docker-compose up -d --build
```

4. **Use read-only filesystem**

Add to `docker-compose.yml`:

```yaml
read_only: true
tmpfs:
  - /tmp
  - /app/.next/cache
```

## Monitoring

### Prometheus metrics

Add a metrics endpoint and configure Prometheus to scrape:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'rss-feed-filter'
    static_configs:
      - targets: ['rss-feed-filter:3000']
```

### Container stats

```bash
# Real-time stats
docker stats rss-feed-filter

# Export stats
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## Support

For issues and questions:
- Check the logs: `docker-compose logs -f`
- Review the main README.md
- Open an issue on GitHub

