/**
 * This is script to run news fetchinng in full and filter with AI, only find out important news.
 */

import { exit } from 'node:process';
import { ALL_RSS_CATAGORIES, type RSSCatacory } from '@/config/news-sources';
import checkRSS from '@/lib/news/check-rss';
import { envSchema } from '@/types/env';
import consola from 'consola';

consola.box('News Bot Background Checking Started');

const env = await envSchema.parseAsync(process.env);

/**
 * Run this script with specific RSS URL to check only that RSS
 * Format: CATAGORY_NAME RSS_URL
 * Example: node scripts/news-check.ts 'Technology' 'https://rss.com/technology'
 */

const [specificCatagoryName, specificRSS] = [process.argv[2], process.argv[3]];

if (specificRSS && !specificCatagoryName) {
	consola.error('Please provide the RSS URL and Catagory Name');
	exit(1);
}

consola.success('Environment variables are correctly configured');

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

consola.success('All RSS checked');

consola.success('Langfuse shutdown');

exit(0);
