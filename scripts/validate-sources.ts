import chalk from 'chalk';
import { RSS_CATEGORIES } from '../config/sources.js';
import { parseRSS } from '../lib/rss.js';

async function validateSources() {
	for (const category of RSS_CATEGORIES) {
		for (const feed of category.feeds) {
			const parsed = await parseRSS(feed.url);

			if (!parsed) {
				console.error(chalk.red(`Failed to parse RSS feed for ${feed.name}`));
				continue;
			}

			console.log(
				chalk.green(`Parsed ${parsed.items.length} items from ${feed.name}`),
			);
		}
	}
}

validateSources();
