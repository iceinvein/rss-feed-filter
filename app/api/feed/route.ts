import type { FeedItem } from "@/types/feed";

import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();
const FEED_URL = "https://hdencode.org/feed/";

export async function GET() {
  try {
    const feed = await parser.parseURL(FEED_URL);

    const items: FeedItem[] = feed.items.map((item) => ({
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      description: item.contentSnippet || item.content || "",
      content: item.content || item.contentSnippet || "",
      guid: item.guid || item.link || "",
    }));

    return NextResponse.json({
      items,
      lastUpdated: new Date().toISOString(),
      totalItems: items.length,
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);

    return NextResponse.json(
      { error: "Failed to fetch RSS feed" },
      { status: 500 },
    );
  }
}
