import Parser from "rss-parser";
import { appConfig } from "@/config/app";
import { filtersDb, notificationsDb, processedItemsDb } from "@/lib/db";
import { DiscordNotifier } from "@/lib/discord-notifier";
import { applyFilters } from "@/lib/filter";
import type { FeedItem, Filter } from "@/types/feed";

const parser = new Parser();

export class FeedChecker {
	private notifier: DiscordNotifier;

	constructor() {
		this.notifier = new DiscordNotifier();
	}

	async checkFeed(): Promise<void> {
		console.log(`[${new Date().toISOString()}] Checking RSS feed...`);

		try {
			// Fetch RSS feed
			const feed = await parser.parseURL(appConfig.feedUrl);
			const items: FeedItem[] = feed.items.map((item) => ({
				title: item.title || "",
				link: item.link || "",
				pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
				description: item.contentSnippet || item.content || "",
				content: item.content || item.contentSnippet || "",
				guid: item.guid || item.link || "",
			}));

			console.log(`Fetched ${items.length} items from feed`);

			// Get filters
			const filters = filtersDb.getAll();
			const enabledFilters = filters.filter((f: Filter) => f.enabled);

			console.log(`Found ${enabledFilters.length} enabled filters`);

			if (enabledFilters.length === 0) {
				console.log("No enabled filters, skipping processing");

				return;
			}

			// Filter out already processed items
			const newItems = items.filter(
				(item) => item.guid && !processedItemsDb.has(item.guid),
			);

			console.log(`Found ${newItems.length} new items`);

			if (newItems.length === 0) {
				console.log("No new items to process");

				return;
			}

			// Apply filters and collect matches
			const matches: Array<{ item: FeedItem; filters: Filter[] }> = [];

			for (const item of newItems) {
				const matchedFilters = enabledFilters.filter((filter: Filter) => {
					const filtered = applyFilters([item], [filter]);

					return filtered.length > 0;
				});

				if (matchedFilters.length > 0) {
					matches.push({ item, filters: matchedFilters });
					console.log(
						`Item "${item.title}" matched ${matchedFilters.length} filter(s)`,
					);
				}

				// Mark as processed regardless of match
				if (item.guid) {
					processedItemsDb.add(item.guid, item.title || "");
				}
			}

			// Send notifications
			if (matches.length > 0) {
				console.log(`Sending notification for ${matches.length} matched items`);

				// Send batch notification
				const success = await this.notifier.sendBatchNotification(matches);

				// Save notifications to database if sent successfully
				if (success) {
					for (const { item, filters } of matches) {
						notificationsDb.add(
							item.guid,
							item.title,
							item.link,
							item.description || item.content || "",
							item.pubDate,
							filters.map((f) => f.name),
						);
					}
					console.log(`Saved ${matches.length} notifications to database`);

					// Cleanup old notifications (older than 7 days)
					const deleted = notificationsDb.cleanup(7);

					if (deleted > 0) {
						console.log(`Cleaned up ${deleted} old notifications (>7 days)`);
					}
				}
			} else {
				console.log("No items matched filters");
			}

			// Cleanup old processed items (keep last 30 days)
			processedItemsDb.cleanup(30);

			console.log("Feed check completed");
		} catch (error) {
			console.error("Error checking feed:", error);
		}
	}

	async checkFeedOnce(): Promise<void> {
		await this.checkFeed();
	}
}
