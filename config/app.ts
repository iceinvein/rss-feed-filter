import type { AppSettings } from "@/types/settings";

// Dynamic config that reads from database
let cachedSettings: AppSettings | null = null;

function getSettings(): AppSettings {
	// Only import on server-side
	if (typeof window === "undefined" && !cachedSettings) {
		try {
			// Dynamic import to avoid bundling issues
			const { settingsDb } = require("@/lib/db");

			cachedSettings = {
				feedUrl: settingsDb.get("feedUrl") || "https://hdencode.org/feed/",
				cronSchedule: settingsDb.get("cronSchedule") || "*/5 * * * *",
				discordWebhookUrl: settingsDb.get("discordWebhookUrl") || "",
				enableNotifications: settingsDb.get("enableNotifications") !== "false",
				enableScheduler: settingsDb.get("enableScheduler") !== "false",
			};
		} catch (error) {
			console.error("Error loading settings:", error);
			// Fallback to defaults
			cachedSettings = {
				feedUrl: "https://hdencode.org/feed/",
				cronSchedule: "*/5 * * * *",
				discordWebhookUrl: "",
				enableNotifications: true,
				enableScheduler: true,
			};
		}
	}

	return (
		cachedSettings || {
			feedUrl: "https://hdencode.org/feed/",
			cronSchedule: "*/5 * * * *",
			discordWebhookUrl: "",
			enableNotifications: true,
			enableScheduler: true,
		}
	);
}

// Clear cache to force reload from database
export function reloadSettings(): void {
	cachedSettings = null;
}

export const appConfig = {
	get feedUrl() {
		return getSettings().feedUrl;
	},
	get cronSchedule() {
		return getSettings().cronSchedule;
	},
	get discordWebhookUrl() {
		return getSettings().discordWebhookUrl;
	},
	get enableNotifications() {
		return getSettings().enableNotifications;
	},
	get enableScheduler() {
		return getSettings().enableScheduler;
	},
};
