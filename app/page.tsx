"use client";

import type { FeedItem, Filter } from "@/types/feed";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";

import { FilterList } from "@/components/filter-list";
import { FilterForm } from "@/components/filter-form";
import { FeedDisplay } from "@/components/feed-display";
import { SchedulerControl } from "@/components/scheduler-control";
import { OnboardingModal } from "@/components/onboarding-modal";
import { applyFilters } from "@/lib/filter";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function Home() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [editingFilter, setEditingFilter] = useState<Filter | undefined>();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const response = await fetch("/api/feed");
      const data = await response.json();

      if (data.items) {
        setFeedItems(data.items);
        setLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const response = await fetch("/api/onboarding");
        const data = await response.json();

        if (!data.onboardingComplete) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  // Load filters from server on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await fetch("/api/filters");
        const data = await response.json();

        if (data.filters) {
          setFilters(data.filters);
        }
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };

    loadFilters();
  }, []);

  // Fetch feed on mount and set up periodic refresh
  useEffect(() => {
    fetchFeed();

    const interval = setInterval(fetchFeed, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchFeed]);

  // Apply filters whenever filters or feed items change
  useEffect(() => {
    const filtered = applyFilters(feedItems, filters);

    setFilteredItems(filtered);
  }, [feedItems, filters]);

  const handleSaveFilter = async (filter: Filter) => {
    try {
      const action = editingFilter ? "update" : "add";
      const body =
        action === "update"
          ? { action, id: filter.id, updates: filter }
          : { action, filter };

      const response = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.filters) {
        setFilters(data.filters);
      }
    } catch (error) {
      console.error("Error saving filter:", error);
    }

    setShowFilterForm(false);
    setEditingFilter(undefined);
  };

  const handleToggleFilter = async (id: string) => {
    try {
      const response = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id }),
      });

      const data = await response.json();

      if (data.filters) {
        setFilters(data.filters);
      }
    } catch (error) {
      console.error("Error toggling filter:", error);
    }
  };

  const handleEditFilter = (filter: Filter) => {
    setEditingFilter(filter);
    setShowFilterForm(true);
  };

  const handleDeleteFilter = async (id: string) => {
    try {
      const response = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });

      const data = await response.json();

      if (data.filters) {
        setFilters(data.filters);
      }
    } catch (error) {
      console.error("Error deleting filter:", error);
    }
  };

  const handleAddFilter = () => {
    setEditingFilter(undefined);
    setShowFilterForm(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchFeed();
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Reload the page to fetch settings and start scheduler
    window.location.reload();
  };

  if (checkingOnboarding) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loading && feedItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const enabledFiltersCount = filters.filter((f) => f.enabled).length;
  const matchRate =
    feedItems.length > 0
      ? ((filteredItems.length / feedItems.length) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RSS Feed Monitor
            </h1>
            <p className="text-default-500 mt-2">
              Real-time filtering and Discord notifications
            </p>
          </div>
          <Button
            color="primary"
            isLoading={loading}
            size="lg"
            variant="shadow"
            onPress={handleRefresh}
          >
            Refresh Feed
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-none">
            <CardBody className="gap-1">
              <p className="text-sm text-default-600">Total Items</p>
              <p className="text-3xl font-bold text-primary">
                {feedItems.length}
              </p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-none">
            <CardBody className="gap-1">
              <p className="text-sm text-default-600">Matched Items</p>
              <p className="text-3xl font-bold text-success">
                {filteredItems.length}
              </p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border-none">
            <CardBody className="gap-1">
              <p className="text-sm text-default-600">Active Filters</p>
              <p className="text-3xl font-bold text-secondary">
                {enabledFiltersCount}
              </p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-none">
            <CardBody className="gap-1">
              <p className="text-sm text-default-600">Match Rate</p>
              <p className="text-3xl font-bold text-warning">{matchRate}%</p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <SchedulerControl />
          <FilterList
            filters={filters}
            onAdd={handleAddFilter}
            onDelete={handleDeleteFilter}
            onEdit={handleEditFilter}
            onToggle={handleToggleFilter}
          />
        </div>

        {/* Feed Display */}
        <div className="lg:col-span-2">
          <FeedDisplay
            items={filteredItems}
            lastUpdated={lastUpdated}
            totalItems={feedItems.length}
          />
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* Filter Form Modal */}
      <Modal
        isOpen={showFilterForm}
        size="2xl"
        onClose={() => {
          setShowFilterForm(false);
          setEditingFilter(undefined);
        }}
      >
        <ModalContent>
          <ModalBody className="py-6">
            <FilterForm
              initialFilter={editingFilter}
              onCancel={() => {
                setShowFilterForm(false);
                setEditingFilter(undefined);
              }}
              onSave={handleSaveFilter}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
