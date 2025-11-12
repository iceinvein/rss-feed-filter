import type { Filter } from "@/types/feed";

const STORAGE_KEY = "rss-feed-filters";

// Client-side storage (localStorage) - safe for browser use
export const clientStorage = {
	getFilters: (): Filter[] => {
		if (typeof window === "undefined") return [];

		try {
			const stored = localStorage.getItem(STORAGE_KEY);

			return stored ? JSON.parse(stored) : [];
		} catch (error) {
			console.error("Error loading filters:", error);

			return [];
		}
	},

	saveFilters: (filters: Filter[]): void => {
		if (typeof window === "undefined") return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
		} catch (error) {
			console.error("Error saving filters:", error);
		}
	},

	addFilter: (filter: Filter): void => {
		const filters = clientStorage.getFilters();

		filters.push(filter);
		clientStorage.saveFilters(filters);
	},

	updateFilter: (id: string, updates: Partial<Filter>): void => {
		const filters = clientStorage.getFilters();
		const index = filters.findIndex((f) => f.id === id);

		if (index !== -1) {
			filters[index] = { ...filters[index], ...updates };
			clientStorage.saveFilters(filters);
		}
	},

	deleteFilter: (id: string): void => {
		const filters = clientStorage.getFilters();
		const updated = filters.filter((f) => f.id !== id);

		clientStorage.saveFilters(updated);
	},

	toggleFilter: (id: string): void => {
		const filters = clientStorage.getFilters();
		const filter = filters.find((f) => f.id === id);

		if (filter) {
			filter.enabled = !filter.enabled;
			clientStorage.saveFilters(filters);
		}
	},
};
