export interface FeedItem {
	title: string;
	link: string;
	pubDate: string;
	description?: string;
	content?: string;
	guid?: string;
}

export interface Filter {
	id: string;
	name: string;
	enabled: boolean;
	criteria: FilterCriteria;
}

export interface FilterCriteria {
	titleIncludes?: string[];
	titleExcludes?: string[];
	descriptionIncludes?: string[];
	descriptionExcludes?: string[];
	minDate?: string;
	maxDate?: string;
}

export interface FilteredFeed {
	items: FeedItem[];
	lastUpdated: string;
	totalItems: number;
	filteredItems: number;
}
