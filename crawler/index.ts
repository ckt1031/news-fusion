import { RSS_CATEGORIES, type RSSFeed } from '../config/sources';
import { parseRSS } from '../lib/rss';
import { handleEntry } from './entry';

async function handleFeed(feed: RSSFeed) {
	console.log(`Handling feed: ${feed.name}`);

	const parsedFeed = await parseRSS(feed.url, 24);

	for (const entry of parsedFeed.items) {
		handleEntry(entry);
	}
}

async function runScraper() {
	for (const category of RSS_CATEGORIES) {
		// Handle each feed in the category.
		for (const feed of category.feeds) handleFeed(feed);
	}
}

runScraper();
