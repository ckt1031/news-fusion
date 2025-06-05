import { type RSSConfigFeed, RSS_CATEGORIES } from '../config/sources.js';
import { parseRSS } from '../lib/rss.js';
import Similarity from '../lib/similarity.js';
import { handleEntry } from './entry.js';

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

	process.exit(0);
}

runScraper();
