import type { FeedItem, Filter, FilterCriteria } from "@/types/feed";

export function applyFilters(items: FeedItem[], filters: Filter[]): FeedItem[] {
	const enabledFilters = filters.filter((f) => f.enabled);

	if (enabledFilters.length === 0) {
		return items;
	}

	return items.filter((item) => {
		// Item must match ALL enabled filters (AND logic)
		return enabledFilters.every((filter) =>
			matchesCriteria(item, filter.criteria),
		);
	});
}

function matchesCriteria(item: FeedItem, criteria: FilterCriteria): boolean {
	// Check title includes - ALL keywords must be present (AND logic)
	if (criteria.titleIncludes && criteria.titleIncludes.length > 0) {
		const hasAllMatches = criteria.titleIncludes.every((keyword) =>
			item.title.toLowerCase().includes(keyword.toLowerCase()),
		);

		if (!hasAllMatches) return false;
	}

	// Check title excludes - if ANY keyword is present, reject (OR logic for exclusions)
	if (criteria.titleExcludes && criteria.titleExcludes.length > 0) {
		const hasExcluded = criteria.titleExcludes.some((keyword) =>
			item.title.toLowerCase().includes(keyword.toLowerCase()),
		);

		if (hasExcluded) return false;
	}

	// Check description includes - ALL keywords must be present (AND logic)
	if (criteria.descriptionIncludes && criteria.descriptionIncludes.length > 0) {
		const description = item.description || item.content || "";
		const hasAllMatches = criteria.descriptionIncludes.every((keyword) =>
			description.toLowerCase().includes(keyword.toLowerCase()),
		);

		if (!hasAllMatches) return false;
	}

	// Check description excludes - if ANY keyword is present, reject (OR logic for exclusions)
	if (criteria.descriptionExcludes && criteria.descriptionExcludes.length > 0) {
		const description = item.description || item.content || "";
		const hasExcluded = criteria.descriptionExcludes.some((keyword) =>
			description.toLowerCase().includes(keyword.toLowerCase()),
		);

		if (hasExcluded) return false;
	}

	// Check date range
	if (criteria.minDate) {
		const itemDate = new Date(item.pubDate);
		const minDate = new Date(criteria.minDate);

		if (itemDate < minDate) return false;
	}

	if (criteria.maxDate) {
		const itemDate = new Date(item.pubDate);
		const maxDate = new Date(criteria.maxDate);

		if (itemDate > maxDate) return false;
	}

	return true;
}
