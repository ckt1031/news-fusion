import { RSS_CATEGORIES, type RSSConfigFeed } from '../config/sources';
import { parseRSS } from '../lib/rss';
import Similarity from '../lib/similarity';
import { handleEntry } from './entry';

async function handleFeed(feed: RSSConfigFeed) {
	console.log(`Handling feed: ${feed.name}`);

	const parsedFeed = await parseRSS(feed.url, 24);

	for (const entry of parsedFeed.items) {
		await handleEntry({
			feedConfig: feed,
			feedData: entry,
		});
	}
}

async function runScraper() {
	const similarity = new Similarity();

	// Initialize the similarity collection.
	await similarity.initializeCollection();

	for (const category of RSS_CATEGORIES) {
		// Handle each feed in the category.
		for (const feed of category.feeds) await handleFeed(feed);
	}
}

runScraper();
