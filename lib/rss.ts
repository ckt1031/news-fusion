import Parser from 'rss-parser';

export interface FeedItem {
	title: string;
	link: string;
	pubDate: string;
	creator: string;
	content: string;
	contentSnippet: string;
	guid: string;
	categories: string[];
	isoDate: string;
}

export interface FeedData {
	feedUrl: string;
	title: string;
	description: string;
	link: string;
	items: FeedItem[];
}

function filterHours(item: FeedItem, hours?: number) {
	const now = new Date();
	const publishedAt = new Date(item.pubDate);
	const diffTime = Math.abs(now.getTime() - publishedAt.getTime());
	const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
	return hours ? diffHours <= hours : true;
}

/**
 * Parse an RSS feed and return the feed data.
 * @param url - The URL of the RSS feed.
 * @param hours - The number of hours to filter the feed by.
 * @returns The feed data.
 */
export async function parseRSS(url: string, hours?: number) {
	const parser = new Parser();
	const feed = (await parser.parseURL(url)) as FeedData;

	// Filter the feed items by the number of hours.
	feed.items = feed.items.filter((item) => !hours || filterHours(item, hours));

	return feed;
}
