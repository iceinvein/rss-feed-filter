import type { FeedItem, Filter } from "@/types/feed";

import { appConfig } from "@/config/app";

interface DiscordEmbed {
  title: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
}

interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
}

export class DiscordNotifier {
  private webhookUrl: string;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || appConfig.discordWebhookUrl;
  }

  async sendNotification(
    item: FeedItem,
    matchedFilters: Filter[],
  ): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log("Discord webhook URL not configured, skipping notification");

      return false;
    }

    try {
      const message = this.createMessage(item, matchedFilters);
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          `Discord notification failed: ${response.status} ${response.statusText}`,
        );
        console.error("Error details:", errorText);

        return false;
      }

      console.log(`Discord notification sent for: ${item.title}`);

      return true;
    } catch (error) {
      console.error("Error sending Discord notification:", error);

      return false;
    }
  }

  async sendBatchNotification(
    matches: Array<{ item: FeedItem; filters: Filter[] }>,
  ): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log("Discord webhook URL not configured, skipping notification");

      return false;
    }

    if (matches.length === 0) {
      return true;
    }

    try {
      // Discord allows up to 10 embeds per message
      const embeds = matches.slice(0, 10).map(({ item, filters }) => {
        return this.createEmbed(item, filters);
      });

      const message: DiscordMessage = {
        content:
          matches.length > 10
            ? `**${matches.length} new items matched your filters** (showing first 10)`
            : `**${matches.length} new item${matches.length > 1 ? "s" : ""} matched your filters**`,
        embeds,
      };

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          `Discord batch notification failed: ${response.status} ${response.statusText}`,
        );
        console.error("Error details:", errorText);

        return false;
      }

      console.log(
        `Discord batch notification sent for ${matches.length} items`,
      );

      return true;
    } catch (error) {
      console.error("Error sending Discord batch notification:", error);

      return false;
    }
  }

  private createMessage(
    item: FeedItem,
    matchedFilters: Filter[],
  ): DiscordMessage {
    return {
      embeds: [this.createEmbed(item, matchedFilters)],
    };
  }

  private createEmbed(item: FeedItem, matchedFilters: Filter[]): DiscordEmbed {
    const description = item.description || item.content || "";
    const truncatedDescription =
      description.length > 300
        ? `${this.stripHtml(description).substring(0, 300)}...`
        : this.stripHtml(description);

    const embed: DiscordEmbed = {
      title: item.title,
      url: item.link,
      color: 0x5865f2, // Discord blurple color
      description: truncatedDescription,
      fields: [
        {
          name: "Matched Filters",
          value: matchedFilters.map((f) => f.name).join(", "),
          inline: false,
        },
      ],
      timestamp: item.pubDate || new Date().toISOString(),
    };

    return embed;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}
