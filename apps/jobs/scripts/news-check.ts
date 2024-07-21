/**
 * This is script to run news fetchinng in full and filter with AI, only find out important news.
 */

import { exit } from 'node:process';
import { ALL_RSS_CATAGORIES, type RSSCatacory } from '@ckt1031/config';
import { checkRSS } from '@ckt1031/news';
import { envSchema } from '@ckt1031/types';
import { logging } from '@ckt1031/utils';

logging.info('News Bot Background Checking Started');

const env = await envSchema.parseAsync(process.env);

/**
 * Run this script with specific RSS URL to check only that RSS
 * Format: CATAGORY_NAME RSS_URL
 * Example: node scripts/news-check.ts 'Technology' 'https://rss.com/technology'
 */

const [specificCatagoryName, specificRSS] = [process.argv[2], process.argv[3]];

if (specificRSS && !specificCatagoryName) {
	logging.error('Please provide the RSS URL and Catagory Name');
	exit(1);
}

logging.success('Environment variables are correctly configured');

const allCatagories = specificRSS
	? ([
			{
				name: specificCatagoryName as RSSCatacory['name'],
				channels: [specificRSS as string],
			},
		] satisfies RSSCatacory[])
	: ALL_RSS_CATAGORIES;

for (const catagory of allCatagories) {
	await checkRSS({
		env,
		catagory,
	});
}

logging.success('All RSS checked');

logging.success('Langfuse shutdown');

exit(0);
