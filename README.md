# RSS Feed Filter

A long-running server application that periodically checks RSS feeds, applies custom filters, and sends Discord notifications when new items match your criteria.

## Features

- 🔄 **Automatic Feed Checking**: Runs on a configurable schedule (default: every 5 minutes)
- 🎯 **Flexible Filtering**: Filter by title/description keywords (include/exclude)
- 📢 **Discord Notifications**: Sends formatted embeds to Discord via webhooks
- 💾 **SQLite Database**: Reliable, ACID-compliant storage for all data
- 🌐 **Web UI**: Manage filters and settings through a clean, responsive interface
- 🚫 **Duplicate Prevention**: Tracks processed items to avoid repeat notifications
- 🐳 **Docker Ready**: Easy deployment with Docker and Docker Compose
- 🎨 **First-Run Wizard**: Guided onboarding for initial setup

## Technologies Used

- [Next.js 15](https://nextjs.org/) - Full-stack React framework
- [HeroUI v2](https://heroui.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [node-cron](https://github.com/node-cron/node-cron) - Job scheduling
- [rss-parser](https://github.com/rbren/rss-parser) - RSS feed parsing

## Quick Start

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker:

```bash
# 1. Start the application
docker-compose up -d

# 2. Access the web interface
open http://localhost:3000

# 3. Complete the onboarding wizard
# - Enter your Discord webhook URL
# - Configure RSS feed and schedule
# - Start monitoring!
```

See [QUICKSTART.md](./QUICKSTART.md) for a detailed step-by-step guide.

### Option 2: Local Development

#### 1. Install dependencies

```bash
bun install
```

#### 2. Run the application

**Development:**

```bash
bun run dev
```

**Production:**

```bash
bun run build
bun run start
```

#### 3. Complete onboarding

1. Open http://localhost:3000
2. Follow the onboarding wizard to configure:
   - Discord webhook URL
   - RSS feed URL
   - Check schedule
3. Start creating filters!

The scheduler will start automatically when the server starts.

## Usage

### Web Interface

Open [http://localhost:3000](http://localhost:3000) to:

- **Settings** - Configure feed URL, cron schedule, Teams webhook, and toggles
- **Filters** - Create and manage filter rules
- **Feed Items** - View filtered feed items in real-time
- **Scheduler Control** - Manually trigger feed checks and monitor status

### Managing Settings

Click the **"Settings"** button in the navbar to configure:

- **RSS Feed URL** - The feed to monitor
- **Cron Schedule** - How often to check (e.g., `*/5 * * * *` for every 5 minutes)
- **Discord Webhook URL** - Where to send notifications
- **Enable Notifications** - Toggle Discord messages on/off
- **Enable Scheduler** - Toggle automatic checking on/off

Settings are saved to `./data/settings.json` and take effect immediately (scheduler may need restart for cron changes).

### Creating Filters

1. Click **"Add Filter"**
2. Give your filter a name (e.g., "1080p Movies")
3. Add keywords:
   - **Title Must Include**: Items must contain these keywords
   - **Title Must Exclude**: Items must NOT contain these keywords
   - **Description filters**: Same logic for descriptions
4. Save the filter

**Example Filter:**
- Name: "High Quality Movies"
- Title includes: `1080p`, `BluRay`
- Title excludes: `CAM`, `TS`, `HDCAM`

### How It Works

1. **Scheduler runs** at the configured interval (default: every 5 minutes)
2. **Fetches RSS feed** from the configured URL
3. **Filters new items** using your enabled filters
4. **Sends Teams notification** for items that match
5. **Tracks processed items** to prevent duplicate notifications
6. **Cleans up old data** (keeps last 30 days)

## Data Storage

All data is stored in the `./data` directory:

- `settings.json` - Application settings (feed URL, cron schedule, webhook, etc.)
- `filters.json` - Your filter configurations
- `processed-items.json` - Tracking of notified items

These files are created automatically on first run.

**Priority:** Settings UI > `settings.json` > `.env` file > defaults

## Deployment

### Vercel / Netlify / Railway

1. Push your code to GitHub
2. Connect your repository to your hosting platform
3. Add environment variables in the platform's dashboard
4. Deploy!

The scheduler will start automatically on deployment.

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

Build and run:

```bash
docker build -t rss-feed-filter .
docker run -p 3000:3000 --env-file .env rss-feed-filter
```

## API Endpoints

### Filters Management

- `GET /api/filters` - Get all filters
- `POST /api/filters` - Manage filters (add/update/delete/toggle)

### Scheduler Control

- `POST /api/scheduler` - Control scheduler
  - `{ "action": "start" }` - Start scheduler
  - `{ "action": "stop" }` - Stop scheduler
  - `{ "action": "runOnce" }` - Run feed check immediately

### Feed

- `GET /api/feed` - Fetch current RSS feed

## Configuration

### Cron Schedule Format

The `CRON_SCHEDULE` uses standard cron syntax:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Examples:**
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 */2 * * *` - Every 2 hours
- `0 9 * * *` - Every day at 9 AM

## Troubleshooting

### Notifications not sending

1. Check `TEAMS_WEBHOOK_URL` is correct
2. Verify `ENABLE_NOTIFICATIONS=true`
3. Check server logs for errors
4. Test webhook manually using the "Check Feed Now" button

### Scheduler not running

1. Check Settings UI - verify "Enable Scheduler" is toggled on
2. Check server logs for initialization messages
3. Use the "Restart Scheduler" button in the UI

### Duplicate notifications

The app tracks processed items automatically in the SQLite database. If you're getting duplicates:

1. Check the database: `sqlite3 data/rss-filter.db "SELECT * FROM processed_items LIMIT 10;"`
2. Ensure the feed items have unique GUIDs
3. Clear the database if needed: `rm data/rss-filter.db` (will trigger onboarding again)

## License

Licensed under the [MIT license](LICENSE).
