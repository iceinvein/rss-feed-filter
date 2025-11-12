import { NextResponse } from "next/server";
import { reloadSettings } from "@/config/app";
import { settingsDb } from "@/lib/db";

export async function GET() {
	try {
		const onboardingComplete = settingsDb.get("onboardingComplete");
		return NextResponse.json({
			onboardingComplete: onboardingComplete === "true",
		});
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		return NextResponse.json(
			{ error: "Failed to check onboarding status" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			discordWebhookUrl,
			feedUrl,
			cronSchedule,
			enableNotifications,
			enableScheduler,
		} = body;

		// Validate required fields
		if (!discordWebhookUrl || !discordWebhookUrl.trim()) {
			return NextResponse.json(
				{ error: "Discord webhook URL is required" },
				{ status: 400 },
			);
		}

		// Save settings
		settingsDb.setMultiple({
			discordWebhookUrl: discordWebhookUrl.trim(),
			feedUrl: feedUrl || "https://hdencode.org/feed/",
			cronSchedule: cronSchedule || "*/5 * * * *",
			enableNotifications: String(enableNotifications !== false),
			enableScheduler: String(enableScheduler !== false),
			onboardingComplete: "true",
		});

		// Reload settings cache
		reloadSettings();

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error saving onboarding settings:", error);
		return NextResponse.json(
			{ error: "Failed to save settings" },
			{ status: 500 },
		);
	}
}
