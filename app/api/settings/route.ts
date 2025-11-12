import { NextResponse } from "next/server";
import { reloadSettings } from "@/config/app";
import { settingsDb } from "@/lib/db";
import type { AppSettings } from "@/types/settings";

export async function GET() {
	try {
		const allSettings = settingsDb.getAll();
		const settings: AppSettings = {
			feedUrl: allSettings.feedUrl || "https://hdencode.org/feed/",
			cronSchedule: allSettings.cronSchedule || "*/5 * * * *",
			discordWebhookUrl: allSettings.discordWebhookUrl || "",
			enableNotifications: allSettings.enableNotifications !== "false",
			enableScheduler: allSettings.enableScheduler !== "false",
		};

		return NextResponse.json({ settings });
	} catch (error) {
		console.error("Error getting settings:", error);

		return NextResponse.json(
			{ error: "Failed to get settings" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const updates = body.updates as Partial<AppSettings>;

		if (!updates) {
			return NextResponse.json(
				{ error: "Updates are required" },
				{ status: 400 },
			);
		}

		// Convert AppSettings to database format
		const dbUpdates: Record<string, string> = {};

		if (updates.feedUrl !== undefined) dbUpdates.feedUrl = updates.feedUrl;
		if (updates.cronSchedule !== undefined)
			dbUpdates.cronSchedule = updates.cronSchedule;
		if (updates.discordWebhookUrl !== undefined)
			dbUpdates.discordWebhookUrl = updates.discordWebhookUrl;
		if (updates.enableNotifications !== undefined)
			dbUpdates.enableNotifications = String(updates.enableNotifications);
		if (updates.enableScheduler !== undefined)
			dbUpdates.enableScheduler = String(updates.enableScheduler);

		settingsDb.setMultiple(dbUpdates);

		// Reload config cache
		reloadSettings();

		// Return updated settings
		const allSettings = settingsDb.getAll();
		const settings: AppSettings = {
			feedUrl: allSettings.feedUrl || "https://hdencode.org/feed/",
			cronSchedule: allSettings.cronSchedule || "*/5 * * * *",
			discordWebhookUrl: allSettings.discordWebhookUrl || "",
			enableNotifications: allSettings.enableNotifications !== "false",
			enableScheduler: allSettings.enableScheduler !== "false",
		};

		return NextResponse.json({ success: true, settings });
	} catch (error) {
		console.error("Error updating settings:", error);

		return NextResponse.json(
			{ error: "Failed to update settings" },
			{ status: 500 },
		);
	}
}
