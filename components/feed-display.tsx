"use client";

import type { FeedItem } from "@/types/feed";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";

interface FeedDisplayProps {
  items: FeedItem[];
  totalItems: number;
  lastUpdated: string | null;
}

export function FeedDisplay({
  items,
  totalItems,
  lastUpdated,
}: FeedDisplayProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-3 pb-4">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-2xl font-bold">Matched Feed Items</h2>
          <Chip
            color={items.length > 0 ? "success" : "default"}
            size="lg"
            variant="flat"
          >
            {items.length} / {totalItems}
          </Chip>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-default-500 w-full">
            <span className="font-medium">Last updated:</span>
            <span>{formatDate(lastUpdated)}</span>
          </div>
        )}
      </CardHeader>

      <CardBody className="gap-3 overflow-y-auto max-h-[calc(100vh-300px)]">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium text-default-700 mb-2">
              No matches found
            </p>
            <p className="text-sm text-default-500">
              Try adjusting your filter criteria or add new filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card
                key={item.guid || index}
                className="border-l-4 border-l-primary hover:shadow-lg transition-shadow"
                shadow="sm"
              >
                <CardBody className="gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <Link
                      isExternal
                      showAnchorIcon
                      className="text-lg font-semibold hover:text-primary transition-colors flex-1"
                      href={item.link}
                    >
                      {item.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-default-500">
                    <Chip size="sm" variant="flat">
                      {formatDate(item.pubDate)}
                    </Chip>
                  </div>

                  {item.description && (
                    <p className="text-sm text-default-600 line-clamp-2">
                      {stripHtml(item.description)}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
