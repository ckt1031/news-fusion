import chalk from 'chalk';
import { type RSSConfigFeed, RSS_CATEGORIES } from '../config/sources.js';
import { parseRSS } from '../lib/rss.js';
import Similarity from '../lib/similarity.js';
import { handleEntry } from './entry.js';

async function handleFeed(feedConfig: RSSConfigFeed) {
	console.log(`Handling feed: ${feedConfig.name}`);

	const parsedFeed = await parseRSS(feedConfig.url, 24);

	for (const feedData of parsedFeed.items) {
		// try {
		await handleEntry({ feedConfig, feedData });
		// } catch (error) {
		// 	console.error(chalk.red(`Error handling entry: ${error}`));
		// }
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
