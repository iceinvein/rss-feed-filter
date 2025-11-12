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

- [Next.js 16](https://nextjs.org/) - Full-stack React framework
- [React 19](https://react.dev/) - UI library
- [HeroUI v2](https://heroui.com/) - UI component library
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite database with WAL mode
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

- **Settings** - Configure feed URL, cron schedule, Discord webhook, and toggles
- **Filters** - Create and manage filter rules
- **Feed Items** - View filtered feed items in real-time
- **Notifications** - View history of sent notifications
- **Scheduler Control** - Manually trigger feed checks and monitor status

### Managing Settings

Click the **"Settings"** button in the navbar to configure:

- **RSS Feed URL** - The feed to monitor
- **Cron Schedule** - How often to check (e.g., `*/5 * * * *` for every 5 minutes)
- **Discord Webhook URL** - Where to send notifications
- **Enable Notifications** - Toggle Discord messages on/off
- **Enable Scheduler** - Toggle automatic checking on/off

Settings are saved to the SQLite database and take effect immediately (scheduler may need restart for cron changes).

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
4. **Sends Discord notification** for items that match
5. **Tracks processed items** to prevent duplicate notifications
6. **Cleans up old data** (keeps last 30 days)

## Data Storage

All data is stored in a SQLite database in the `./data` directory:

- `rss-filter.db` - SQLite database containing:
  - **settings** - Application settings (feed URL, cron schedule, webhook, etc.)
  - **filters** - Your filter configurations
  - **processed_items** - Tracking of notified items to prevent duplicates
  - **notifications** - History of sent notifications
- `rss-filter.db-shm` - Shared memory file (SQLite WAL mode)
- `rss-filter.db-wal` - Write-ahead log file (SQLite WAL mode)

The database is created automatically on first run with default settings. All configuration is managed through the web UI.

## Deployment

### Docker (Recommended)

The application includes a production-ready Dockerfile and docker-compose.yml:

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

See [DOCKER.md](./DOCKER.md) for detailed Docker deployment instructions.

### Vercel / Netlify / Railway

1. Push your code to GitHub
2. Connect your repository to your hosting platform
3. Deploy!

**Note:** The SQLite database requires a persistent volume. For cloud deployments without persistent storage, consider:
- Using a mounted volume or persistent disk
- Migrating to a cloud database (requires code modifications)
- Using Docker-based hosting with volume support (e.g., Railway, Fly.io)

## API Endpoints

### Onboarding

- `GET /api/onboarding` - Check onboarding status
- `POST /api/onboarding` - Complete onboarding and save initial settings

### Settings

- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings

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

### Notifications

- `GET /api/notifications` - Get notification history
- `DELETE /api/notifications` - Clear all notifications

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

1. Check Discord webhook URL is correct in Settings
2. Verify "Enable Notifications" is toggled on in Settings
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
