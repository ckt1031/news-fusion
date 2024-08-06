/**
 * This is script to run news fetchinng in full and filter with AI, only find out important news.
 */

import { exit } from 'node:process';
import { ALL_RSS_CATEGORIES, type RSSCategory } from '@ckt1031/config';
import { checkRSS } from '@ckt1031/news';
import { envSchema } from '@ckt1031/types';
import { logging } from '@ckt1031/utils';

logging.info('News Bot Background Checking Started');

const env = await envSchema.parseAsync(process.env);

/**
 * Run this script with specific RSS URL to check only that RSS
 * Format: CATEGORY_NAME RSS_URL
 * Example: node scripts/news-check.ts 'Technology' 'https://rss.com/technology'
 */

const [specificCategoryName, specificRSS] = [process.argv[2], process.argv[3]];

if (specificRSS && !specificCategoryName) {
	logging.error('Please provide the RSS URL and Category Name');
	exit(1);
}

logging.success('Environment variables are correctly configured');

const allCatagories = specificRSS
	? ([
			{
				name: specificCategoryName as RSSCategory['name'],
				channels: [specificRSS as string],
			},
		] satisfies RSSCategory[])
	: ALL_RSS_CATEGORIES;

for (const category of allCatagories) {
	await checkRSS({
		env,
		category,
	});
}

logging.success('All RSS checked');

logging.success('Langfuse shutdown');

exit(0);
