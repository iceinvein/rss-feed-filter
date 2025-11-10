import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";

const DB_PATH = process.env.DATABASE_PATH || "./data/rss-filter.db";

// Ensure data directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");
    // Set busy timeout to 5 seconds
    db.pragma("busy_timeout = 5000");
  }

  return db;
}

// Initialize schema
function initializeSchema() {
  const database = getDb();

  database.exec(`
    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    -- Filters table
    CREATE TABLE IF NOT EXISTS filters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      title_includes TEXT NOT NULL DEFAULT '[]',
      title_excludes TEXT NOT NULL DEFAULT '[]',
      description_includes TEXT NOT NULL DEFAULT '[]',
      description_excludes TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    -- Processed items table
    CREATE TABLE IF NOT EXISTS processed_items (
      guid TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      processed_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_filters_enabled ON filters(enabled);
    CREATE INDEX IF NOT EXISTS idx_processed_items_processed_at ON processed_items(processed_at);
  `);

  // Insert default settings if not exists
  const settingsCount = database
    .prepare("SELECT COUNT(*) as count FROM settings")
    .get() as { count: number };

  if (settingsCount.count === 0) {
    const defaultSettings = {
      feedUrl: "https://hdencode.org/feed/",
      cronSchedule: "*/5 * * * *",
      discordWebhookUrl: "",
      enableNotifications: "true",
      enableScheduler: "true",
      onboardingComplete: "false",
    };

    const insert = database.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?)",
    );

    for (const [key, value] of Object.entries(defaultSettings)) {
      insert.run(key, value);
    }
  }
}

// Initialize on import
initializeSchema();

// Settings operations
export const settingsDb = {
  get(key: string): string | null {
    const row = getDb()
      .prepare("SELECT value FROM settings WHERE key = ?")
      .get(key) as { value: string } | undefined;

    return row?.value || null;
  },

  set(key: string, value: string): void {
    getDb()
      .prepare(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, unixepoch())",
      )
      .run(key, value);
  },

  getAll(): Record<string, string> {
    const rows = getDb().prepare("SELECT key, value FROM settings").all() as {
      key: string;
      value: string;
    }[];

    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },

  setMultiple(settings: Record<string, string>): void {
    const database = getDb();
    const insert = database.prepare(
      "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, unixepoch())",
    );

    const transaction = database.transaction((entries: [string, string][]) => {
      for (const [key, value] of entries) {
        insert.run(key, value);
      }
    });

    transaction(Object.entries(settings));
  },
};

// Filters operations
export const filtersDb = {
  getAll() {
    const rows = getDb()
      .prepare("SELECT * FROM filters ORDER BY created_at")
      .all() as {
      id: string;
      name: string;
      enabled: number;
      title_includes: string;
      title_excludes: string;
      description_includes: string;
      description_excludes: string;
    }[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      enabled: Boolean(row.enabled),
      criteria: {
        titleIncludes: JSON.parse(row.title_includes),
        titleExcludes: JSON.parse(row.title_excludes),
        descriptionIncludes: JSON.parse(row.description_includes),
        descriptionExcludes: JSON.parse(row.description_excludes),
      },
    }));
  },

  get(id: string) {
    const row = getDb()
      .prepare("SELECT * FROM filters WHERE id = ?")
      .get(id) as
      | {
          id: string;
          name: string;
          enabled: number;
          title_includes: string;
          title_excludes: string;
          description_includes: string;
          description_excludes: string;
        }
      | undefined;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      enabled: Boolean(row.enabled),
      criteria: {
        titleIncludes: JSON.parse(row.title_includes),
        titleExcludes: JSON.parse(row.title_excludes),
        descriptionIncludes: JSON.parse(row.description_includes),
        descriptionExcludes: JSON.parse(row.description_excludes),
      },
    };
  },

  create(filter: {
    id: string;
    name: string;
    enabled: boolean;
    criteria: {
      titleIncludes: string[];
      titleExcludes: string[];
      descriptionIncludes: string[];
      descriptionExcludes: string[];
    };
  }) {
    getDb()
      .prepare(
        `INSERT INTO filters (id, name, enabled, title_includes, title_excludes, description_includes, description_excludes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        filter.id,
        filter.name,
        filter.enabled ? 1 : 0,
        JSON.stringify(filter.criteria.titleIncludes),
        JSON.stringify(filter.criteria.titleExcludes),
        JSON.stringify(filter.criteria.descriptionIncludes),
        JSON.stringify(filter.criteria.descriptionExcludes),
      );
  },

  update(
    id: string,
    filter: {
      name: string;
      enabled: boolean;
      criteria: {
        titleIncludes: string[];
        titleExcludes: string[];
        descriptionIncludes: string[];
        descriptionExcludes: string[];
      };
    },
  ) {
    getDb()
      .prepare(
        `UPDATE filters
       SET name = ?, enabled = ?, title_includes = ?, title_excludes = ?,
           description_includes = ?, description_excludes = ?, updated_at = unixepoch()
       WHERE id = ?`,
      )
      .run(
        filter.name,
        filter.enabled ? 1 : 0,
        JSON.stringify(filter.criteria.titleIncludes),
        JSON.stringify(filter.criteria.titleExcludes),
        JSON.stringify(filter.criteria.descriptionIncludes),
        JSON.stringify(filter.criteria.descriptionExcludes),
        id,
      );
  },

  delete(id: string) {
    getDb().prepare("DELETE FROM filters WHERE id = ?").run(id);
  },
};

// Processed items operations
export const processedItemsDb = {
  has(guid: string): boolean {
    const row = getDb()
      .prepare("SELECT 1 FROM processed_items WHERE guid = ?")
      .get(guid);

    return Boolean(row);
  },

  add(guid: string, title: string) {
    getDb()
      .prepare(
        "INSERT OR IGNORE INTO processed_items (guid, title) VALUES (?, ?)",
      )
      .run(guid, title);
  },

  getAll() {
    return getDb()
      .prepare("SELECT * FROM processed_items ORDER BY processed_at DESC")
      .all() as {
      guid: string;
      title: string;
      processed_at: number;
    }[];
  },

  cleanup(daysToKeep: number = 30) {
    const cutoffTime =
      Math.floor(Date.now() / 1000) - daysToKeep * 24 * 60 * 60;
    const result = getDb()
      .prepare("DELETE FROM processed_items WHERE processed_at < ?")
      .run(cutoffTime);

    return result.changes;
  },
};

export default getDb();

