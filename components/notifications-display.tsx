"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { MailX, Trash2 } from "lucide-react";

interface Notification {
  id: number;
  guid: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  matchedFilters: string[];
  sentAt: number;
}

interface NotificationsDisplayProps {
  notifications: Notification[];
  onLoadMore?: () => void;
  onDelete?: (id: number) => void;
  onClearAll?: () => void;
  onSearch?: (query: string) => void;
  hasMore?: boolean;
  loading?: boolean;
  searchQuery?: string;
}

export function NotificationsDisplay({
  notifications,
  onLoadMore,
  onDelete,
  onClearAll,
  onSearch,
  hasMore = false,
  loading = false,
  searchQuery = "",
}: NotificationsDisplayProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearch?.(value);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearch?.("");
  };

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          className="flex-1"
          placeholder="Search notifications by title, description, or filter..."
          size="lg"
          type="text"
          value={localSearch}
          onClear={handleClearSearch}
          onValueChange={handleSearchChange}
          isClearable
        />
        {onClearAll && (
          <Button
            color="danger"
            size="lg"
            variant="flat"
            onPress={onClearAll}
          >
            Clear All
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/20 dark:to-default-800/20">
          <CardBody className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <MailX className="w-16 h-16 text-default-400" />
              <h3 className="text-xl font-semibold text-default-700">
                {localSearch
                  ? "No Matching Notifications"
                  : "No Notifications Yet"}
              </h3>
              <p className="text-default-500 max-w-md">
                {localSearch
                  ? "Try a different search term or clear the search to see all notifications."
                  : "When items match your filters, notifications will appear here. Make sure your scheduler is running and filters are enabled."}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className="bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/20 dark:to-default-800/20 hover:shadow-lg transition-shadow"
          >
            <CardHeader className="flex flex-col items-start gap-2 pb-2">
              <div className="flex justify-between items-start w-full gap-2">
                <Link
                  className="text-lg font-semibold text-foreground hover:text-primary transition-colors flex-1"
                  href={notification.link}
                  isExternal
                >
                  {notification.title}
                </Link>
                <div className="flex items-center gap-2">
                  <Chip color="success" size="sm" variant="flat">
                    Sent
                  </Chip>
                  {onDelete && (
                    <Button
                      color="danger"
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => onDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {notification.matchedFilters.map((filter) => (
                  <Chip
                    key={filter}
                    color="primary"
                    size="sm"
                    variant="bordered"
                  >
                    {filter}
                  </Chip>
                ))}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-default-600 text-sm line-clamp-3 mb-3">
                {notification.description}
              </p>
              <div className="flex justify-between items-center text-xs text-default-400">
                <span>
                  Published: {new Date(notification.pubDate).toLocaleString()}
                </span>
                <span>
                  Sent: {new Date(notification.sentAt * 1000).toLocaleString()}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            color="primary"
            isLoading={loading}
            variant="flat"
            onPress={onLoadMore}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

