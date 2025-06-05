import chalk from 'chalk';
import { type RSSConfigFeed, RSS_CATEGORIES } from '../config/sources.js';
import { randomOrder } from '../lib/random.js';
import { parseRSS } from '../lib/rss.js';
import Similarity from '../lib/similarity.js';
import { handleEntry } from './entry.js';

async function handleFeed(feedConfig: RSSConfigFeed) {
	console.log(`Handling feed: ${feedConfig.name}`);

	const parsedFeed = await parseRSS(feedConfig.url, 24);

	for (const feedData of parsedFeed.items) {
		try {
			await handleEntry({ feedConfig, feedData });
		} catch (error) {
			console.error(chalk.red(`Error handling entry: ${error}`));
		}
	}
}

async function runScraper() {
	const similarity = new Similarity();

	// Initialize the similarity collection.
	await similarity.initializeCollection();

	const randomOrderedCategories = randomOrder(RSS_CATEGORIES);

	for (const category of randomOrderedCategories) {
		const randomOrderedFeeds = randomOrder(category.feeds);

		// Handle each feed in the category.
		for (const feed of randomOrderedFeeds) await handleFeed(feed);
	}

	process.exit(0);
}

runScraper();
