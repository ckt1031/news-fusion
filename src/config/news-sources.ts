export enum RSS_CATEGORY {
	TECH = 'tech',
}

export const RSS_LINKS = {
	[RSS_CATEGORY.TECH]: [
		// The Verge
		'https://www.theverge.com/tech/rss/index.xml',
		// TechCrunch
		'https://techcrunch.com/feed/',
	],
};

/** Formal RSS */
export const MUST_READ_RSS_LIST: Record<RSS_CATEGORY, string[]> = {
	[RSS_CATEGORY.TECH]: [
		'https://weekly.tw93.fun/rss.xml',
		'https://feeds.feedburner.com/ruanyifeng',
	],
};

export const NEWS_MINIMALIST_API =
	'https://www.newsminimalist.com/api/get-all-stories';

export const EARLIEST_DAYS = 3;
