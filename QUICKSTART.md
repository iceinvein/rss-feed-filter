# Quick Start Guide

Get the RSS Feed Filter up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Discord webhook URL (you'll enter this during setup)

## Step-by-Step

### 1. Clone and Start

```bash
# Clone the repository
git clone <repository-url>
cd rss-feed-filter

# Start with Docker Compose
docker-compose up -d

# View logs to confirm it's running
docker-compose logs -f
```

You should see:
```
✓ Starting...
✓ Ready in XXXms
```

Press Ctrl+C to exit logs.

### 2. Access the Web Interface

Open your browser and go to:
```
http://localhost:3000
```

### 3. Complete Onboarding

On first launch, you'll see a **Setup Wizard** with 3 steps:

#### Step 1: Discord Webhook
1. Open Discord and go to your server
2. Right-click the channel where you want notifications
3. Click **Edit Channel** → **Integrations** → **Webhooks**
4. Click **New Webhook** or **Create Webhook**
5. Give it a name (e.g., "RSS Feed Alerts")
6. Click **Copy Webhook URL**
7. Paste the URL into the wizard
8. Click **Next**

#### Step 2: RSS Feed Configuration
1. Enter the RSS feed URL (default: https://hdencode.org/feed/)
2. Set the check frequency using cron syntax (default: every 5 minutes)
3. Click **Next**

#### Step 3: Review & Complete
1. Review your settings
2. Click **Complete Setup**
3. The app will reload and start monitoring!

### 4. Create Your First Filter

1. Click **"+ Add New Filter"** button
2. Give it a name (e.g., "High Quality Movies")
3. Add keywords to **Title Must Include**:
   - Type `1080p` and press Enter
   - Type `BluRay` and press Enter
4. Add keywords to **Title Must Exclude** (optional):
   - Type `CAM` and press Enter
   - Type `TS` and press Enter
5. Click **Save Filter**
6. Make sure the filter is **enabled** (toggle should be green)

### 6. Test It Out

Click the **"Check Now"** button in the Scheduler Control panel.

The app will:
1. Fetch the RSS feed
2. Apply your filters
3. Send Discord notifications for any matches

Check your Discord channel - you should see notifications! 🎉

## What's Next?

### Customize Settings

Click **Settings** in the navbar to update:
- RSS feed URL
- Check frequency (cron schedule)
- Discord webhook URL
- Enable/disable notifications
- Enable/disable scheduler

### Add More Filters

Create multiple filters for different types of content:
- TV shows by name and quality
- Movies by genre and format
- Specific release groups

### Monitor the Feed

The main page shows:
- **Total Items** - All items in the feed
- **Matched Items** - Items passing your filters
- **Active Filters** - Number of enabled filters
- **Match Rate** - Percentage of matches

## Common Commands

```bash
# View logs
docker-compose logs -f

# Restart the application
docker-compose restart

# Stop the application
docker-compose down

# Update and restart
git pull
docker-compose up -d --build

# View container status
docker-compose ps
```

## Using the Makefile

If you prefer, use the Makefile for easier commands:

```bash
# Start
make up

# View logs
make logs

# Restart
make restart

# Stop
make down

# Access shell
make shell
```

## Troubleshooting

### No notifications received?

1. **Check Discord webhook URL is correct**
   - Go to Settings in the web UI
   - Verify the webhook URL is correct
   - Test by clicking "Check Now" in the Scheduler Control

2. **Verify notifications are enabled**
   - Check Settings in the web UI
   - Make sure "Enable Notifications" is toggled on

3. **Make sure filters are enabled**
   - Filters have a toggle switch - it should be green
   - At least one filter must be enabled

4. **Check the logs**
   ```bash
   docker-compose logs -f
   ```

   Look for errors or "No matches found" messages

### Application won't start?

1. **Check if port 3000 is already in use**
   ```bash
   # On macOS/Linux
   lsof -i :3000
   
   # Kill the process using port 3000
   kill -9 <PID>
   ```

2. **View detailed logs**
   ```bash
   docker-compose logs
   ```

3. **Rebuild from scratch**
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```

### Can't access web interface?

1. **Verify container is running**
   ```bash
   docker-compose ps
   ```
   Status should be "Up"

2. **Check if you can access the API**
   ```bash
   curl http://localhost:3000/api/feed
   ```

3. **Try a different port**
   Edit `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```
   Then access: `http://localhost:3001`

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 🐳 Check [DOCKER.md](./DOCKER.md) for Docker details
- 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment options
- 🐛 Open an issue on GitHub

## Tips

1. **Start with broad filters** - You can always make them more specific
2. **Use the "Check Now" button** - Test filters immediately
3. **Monitor the match rate** - Adjust filters if too many/few matches
4. **Check logs regularly** - Catch any issues early
5. **Backup your data** - The `data/` directory contains all your settings

Enjoy your automated RSS feed monitoring! 🎉

