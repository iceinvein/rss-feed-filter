#!/usr/bin/env bun

import { DiscordNotifier } from "@/lib/discord-notifier";
import type { FeedItem, Filter } from "@/types/feed";

// Test notification script
async function testNotification() {
	console.log("Testing Discord notification...");

	const notifier = new DiscordNotifier();

	// Create a test feed item
	const testItem: FeedItem = {
		title: "Test RSS Feed Item - 1080p BluRay",
		link: "https://example.com/test-item",
		pubDate: new Date().toISOString(),
		description:
			"This is a test notification from the RSS Feed Filter application. If you see this, your Discord webhook is configured correctly!",
		content: "Test content",
		guid: `test-${Date.now()}`,
	};

	// Create a test filter
	const testFilter: Filter = {
		id: "test-filter",
		name: "Test Filter",
		enabled: true,
		criteria: {
			titleIncludes: ["1080p", "BluRay"],
		},
	};

	// Send notification
	const success = await notifier.sendNotification(testItem, [testFilter]);

	if (success) {
		console.log("✅ Test notification sent successfully!");
	} else {
		console.log("❌ Failed to send test notification");
		console.log(
			"Make sure DISCORD_WEBHOOK_URL is set in your .env file or Settings and is valid",
		);
	}
}

testNotification();
